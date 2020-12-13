// const assert = require('assert').strict;
// const assert = require('assert');

// client.getApps().set("tokenContractLoc", { "contractId": tokenContractId });  // may change dynamic, not needed as apps object since CW submits

let documents = [];
let identityBalance = 0n;
let identityBalanceHistory = [];
let indWithdrawals = [];
let indDeposits = [];
let validDocList = [];


// NOTE: Sender and Owner redundant to $ownerId. Check if perhaps needed for transferFrom ERC-20 Method.
// Balance and ValidIndexes not needed for processing (could be removed), but kept for now (may be used for runtime optimisation)
// type string for amount and balance with 78 decimals like uint256 has
const dataContractJson = {
    token: {
        indices: [
            // {
            //   "properties": [{ "txnr": "asc" }], "unique": true
            // },
            {
                "properties": [{ "$ownerId": "asc" }], "unique": false
            },
            {
                "properties": [{ "$createdAt": "asc" }], "unique": false
            },
            {
                "properties": [{ "sender": "asc" }], "unique": false
            },
            {
                "properties": [{ "recipient": "asc" }], "unique": false
            },
        ],
        properties: {
            version: {
                type: "integer"
            },
            name: {
                type: "string",
                minLength: 1,
                maxLength: 20,
                pattern: "^[a-zA-Z0-9 ]+$"
            },
            symbol: {
                type: "string",
                minLength: 1,
                maxLength: 5,
                pattern: "^[a-zA-Z0-9]+$"

            },
            decimals: {
                type: "integer"
            },
            // totalSupply: {
            //     type: "integer"
            // },
            sender: {
                type: "string",
                minLength: 42,
                maxLength: 44,
                pattern: "^[123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz]+$"
            },
            recipient: {
                type: "string",
                minLength: 42,
                maxLength: 44,
                pattern: "^[123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz]+$"

            },
            amount: {
                type: "string",
                minLength: 1,
                maxLength: 78,
                pattern: "^[0123456789]+$"
            },
            owner: {
                type: "string",
                minLength: 42,
                maxLength: 44,
                pattern: "^[123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz]+$"
            },
            // txnr: {
            //     type: "integer",
            //     "maxLength": 20
            // },
            balance: {
                type: "string",
                minLength: 1,
                maxLength: 78,
                pattern: "^[0123456789]+$"
            },
            data: {
                type: "string",
            },
            lastValIndTransfer: {
                type: "integer",
                // minLength: 1,
                maxLength: 5
            },
            lastValIndTransferFrom: {
                type: "integer",
                // minLength: 1,
                maxLength: 5
            },
        },
        required: ["$createdAt", "$updatedAt", "name", "symbol", "decimals", "sender", "recipient", "amount"],
        additionalProperties: false
    }
};


const createTokenContract = async function (dappname, username) {

    await submitDataContractCreationMessage(dappname, username, dataContractJson);

}

const mintTokenDocument = async function (dappname, username, contractId, documentJson) {

    if (documentJson.sender == '1'.repeat(42) && documentJson.recipient != '1'.repeat(42)) {
        await submitDocumentCreationMessage(dappname, username, contractId, documentJson);
    } else {
        console.log("ERROR: not a valid mint Token document")
    }
}

const burnTokenDocument = async function (dappname, username, contractId, documentJson) {

    if (documentJson.sender != '1'.repeat(42) && documentJson.recipient == '1'.repeat(42)) {
        await submitDocumentCreationMessage(dappname, username, contractId, documentJson);
    } else {
        console.log("ERROR: not a valid burn Token document")
    }
}

// TODO: refac to transfer(address, amount, data)
const sendTokenDocument = async function (dappname, username, contractId, documentJson) {

    await submitDocumentCreationMessage(dappname, username, contractId, documentJson);

}

// token attributes
let tokenName = '';
let tokenSymbol = '';
let tokenInitSupply = 0n;
let tokenDecimal = '';

const name = function () {
    return tokenName;
}
const symbol = function () {
    return tokenSymbol;
}
const decimals = function () {
    return tokenDecimal;
}
const totalSupply = function() {
    return tokenInitSupply;    // ignoring zero address and without further minting, TODO add logic to validate balance on-chain
}

const initialSupply = function () {
    return tokenInitSupply;
}
const getUserBalance = function () {
    return identityBalance;
}

// TODO: check - added for token-ui-lib
const getDocuments = function() {
    return documents;
}
const getValidDocList = function() {
    return validDocList;
}
const getIdentityBalanceHistory = function() {
    return identityBalanceHistory;
}


// const transfer = function (recipient, amount) {
// }
// const allowance = function (owner, spender) {
// }
// const approve = function (spender, amount) {
// }
// const transferFrom = function (sender, recipient, amount) {
// }


const getDocumentChain = async function (tokenContractId) {

    client.getApps().set("tokenContractLoc", { "contractId": tokenContractId });
    documents = [];

    try {
        const identity = await client.platform.identities.get(dappIdentityId);  // dapp identity to read documents

        // read in 100 document steps (limit) until all collected
        let nStart = 0;
        let len = 100;
        while (len == 100) {
            let queryBasic = { startAt: nStart };
            let tmpDocuments = await client.platform.documents.get('tokenContractLoc.token', queryBasic);
            len = tmpDocuments.length;
            nStart += len;
            Array.prototype.push.apply(documents, tmpDocuments)
        }

    } catch (e) {
        console.error('Something went wrong:', e);
        if (e.code == 3) console.log("Invalid contract ID");
        return;
    }

    // Check token contract initialized and save token attributes
    if (documents.length == 0) {
        console.log("ERROR: Token Contract not Initialized! Contract Owner needs to mint initial supply")
        return; // will jump to "finally section"
    }

    // validate contract owner minted initial supply
    const contractJson = await client.platform.contracts.get(tokenContractId);
    if (documents[0].ownerId.toString() != contractJson.ownerId.toString()) {
        console.log("ERROR: Token Contract Broken! Someone different then the contract owner minted initial supply")
    } else if (documents[0].data.sender != '1'.repeat(42)) {
        console.log("ERROR: Token Contract Broken! Token Sender is not zero address in Token Contract genesis document")
    } else if (documents[0].data.name == undefined) {
        console.log("ERROR: Token Contract Broken! Token Name is undefined in Token Contract genesis document")
    } else if (documents[0].data.symbol == undefined) {
        console.log("ERROR: Token Contract Broken! Token Symbol is undefined in Token Contract genesis document")
    } else if (documents[0].data.decimals == undefined) {
        console.log("ERROR: Token Contract Broken! Token Decimal is undefined in Token Contract genesis document")
    } else if (documents[0].data.amount == undefined || BigInt(documents[0].data.amount) == 0n ) {
        console.log("ERROR: Token Contract Broken! Token Amount is undefined or equals zero in Token Contract genesis document")
    } else {
        tokenName = documents[0].data.name;
        tokenSymbol = documents[0].data.symbol
        tokenInitSupply = BigInt(documents[0].data.amount)
        tokenDecimal = documents[0].data.decimals
    }

    console.log("contract document length: " + documents.length)

    return documents;
}

const getValidDocumentChain = function (documents) {

    let docslen = documents.length;

    // init boolean array with true
    let validDocList = [];
    for (let i = 0; i < docslen; i++) {
        validDocList.push(true);
    }

    // TODO: could check for correct symbol, name, decimals also in each tx - currently all derived from genesis document

    // validate all documents, skip genesis
    for (let i = 1; i < docslen; i++) {

        // json-schema pattern for amount denies negative, empty and non-numeric amount!
        // validate amount >= zero
        if (BigInt(documents[i].data.amount) >= 0n) {
            // console.log("Validate: amount >= 0 " + i)
        } else {
            console.log("Validate: FALSE (amount >= 0) at index " + i)
            validDocList[i] = false;
            continue;
        }

        // validate balance >= amount
        if (BigInt(documents[i].data.balance) >= BigInt(documents[i].data.amount)) {
            // console.log("Validate: balance >= amount " + i)
        } else {
            console.log("Validate: FALSE (balance >= amount) at index " + i)
            validDocList[i] = false;
            continue;
        }

        // validate document owner id == sender
        if (documents[i].ownerId.toString() == documents[i].data.sender) {
            // console.log("Validate: sender == document ownerId " + i)
            console.log("Syntax Validation successful: document " + i)
        } else {
            console.log("Validate: FALSE sender == document ownerId " + i)
            validDocList[i] = false;
            continue;
        }
    }

    let processedIdentList = [];

    // Validate given balance in document tx with summed up balance from the genesis document until current document height
    // for N transactions in the doc-chain and M users it iterates through M*N entries and writing N entries (no duplicates).
    const recursiveBalanceValidation = function (identityId, userBalance) {

        // process user balance and invalidate validDocs Array if found
        console.log("Start processing document for identity " + identityId)
        for (let i = 0; i < docslen; i++) {

            let procIdentityId = documents[i].ownerId.toString();   // processing document owner id

            // console.log("index " + i + " document owner is " + procIdentityId)   // uncomment to see where optimisation potential
            // if document is owned by own identity
            if (procIdentityId == identityId) {    // if withdrawal or approval (TODO)
                if (userBalance == BigInt(documents[i].data.balance)) {
                    // console.log("index " + i + " Validate: TRUE (balance validated " + userBalance + " tokens)")
                } else {
                    validDocList[i] = false;
                    // console.log("index " + i + " Validate: FALSE (invalid balance)")
                }

                if (processedIdentList.indexOf(identityId) == -1) {
                    processedIdentList.push(identityId);
                }
            // else document is from other identity
            } else if (processedIdentList.indexOf(procIdentityId) == -1) {
                recursiveBalanceValidation(procIdentityId, 0n);    // start processing for this identity before continuing (bc need to validate this one first)
                processedIdentList.push(procIdentityId);
            }

            // Could sum up withdrawal above, but for deposit need to run recusiveBalanceValidation for sender first to (in-)validate documents
            // Sum up Balance after Withdrawal  - skip genesis document
            if (documents[i].ownerId.toString() == identityId && validDocList[i] == true && i != 0) {
                userBalance += -(BigInt(documents[i].data.amount));
                console.log("index " + i + ": Withdrawal - Balance for " + identityId + " is " + userBalance)
            }

            // Sum up Balance after Deposit
            if (documents[i].data.recipient == identityId && validDocList[i] == true) {
                userBalance += BigInt(documents[i].data.amount);
                console.log("index " + i + ": Deposit - Balance for " + identityId + " is " + userBalance)
            }
        }
    }
    recursiveBalanceValidation(documents[0].ownerId.toString(), 0n);   // process all balance attributes and set (in-)validate isValidDoc
    console.log("finish recursion")

    return validDocList;
}

const balanceOf = function (identityId) {

    let userBalance = 0n;   // BigInt
    identityBalanceHistory = [];    // BigInt list
    let docslen = documents.length;
    for (let i = 0; i < docslen; i++) {

        // withdrawal - skip genesis document
        if (documents[i].ownerId.toString() == identityId && validDocList[i] == true && i != 0) {
            userBalance += -(BigInt(documents[i].data.amount));
            identityBalanceHistory[i] = userBalance;
            console.log("index " + i + ": Balance after Withdrawal " + userBalance)
        }

        // deposit
        if (documents[i].data.recipient == identityId && validDocList[i] == true) {
            userBalance += BigInt(documents[i].data.amount);
            identityBalanceHistory[i] = userBalance;
            console.log("index " + i + ": Balance after Deposit " + userBalance)
        }

    }
    return userBalance;
}

// NOT USED YET - optimised approach for index processing.
// Probably just remove all index processing since its not adding extra security (as planned)
const processIndexesOptimized = function (identityId) {

    let docslen = documents.length;

    // search last withdraw from identityId
    for (let i = docslen - 1; i >= 0; i--) {

        if (documents[i].ownerId.toString() == identityId && validDocList[i] == true) {
            console.log("index " + i + ": Found last withdrawal from this identityId")
            indWithdrawals.push(i);
            // break;   // dont break, calc all withdrawals for transfer history
        }
    }

    // search last deposits to this identityId 
    for (let i = docslen - 1; i > indWithdrawals[0]; i--) {  // process only since last withdraw (optimization)
        console.log(i)
        console.log(documents[i].data.recipient)
        if (documents[i].data.recipient == identityId && validDocList[i] == true) {
            indDeposits.push(i);
            console.log("index " + i + ": Found last valid deposit since last withdraw for this identityId")
        }
        // last withdrawal reached, set lastDeposit value from prev document (optimization)
        if (i == indWithdrawals[0]) {
            indDeposits.push(documents[i].data.lastValIndTransferFrom);
            console.log("Adding last valid deposit value from last withdraw document " + documents[i].data.lastValIndTransferFrom)
        };
    }

    // TODO: check, probably redundant and no idea what i was planning here!? only valid document indexes are pushed to indWithdrawals
    // perhaps got to do with the optimisation algo ... but only withdrawals are checked -> doesnt make sense atm
    // search through indexes for invalid docTX
    // let curLastDocTX = indWithdrawals[0];
    // console.log(curLastDocTX)
    // for (let i = docslen - 1; i >= 0; i--) {
    //     if (i == curLastDocTX) {
    //         if (!isValidDoc[i]) {
    //             console.log("invalid docTX found at index " + i)
    //             console.dir(documents[i])
    //             break;
    //         }
    //         curLastDocTX = documents[i].data.lastValIndTransfer;
    //     }
    //     if (i == 0) {
    //         console.log("finished searching for invalid docTX - no results found!")
    //     }
    // }
}

// Probably just remove all index processing since its not adding extra security (as planned)
// not used for validation, could be removed (keep until sure)
const processAllIndexes = function (identityId) {

    let docslen = documents.length;

    // search last withdraw from identityId
    for (let i = docslen - 1; i >= 1; i--) {    // skip genesis document

        if (documents[i].ownerId.toString() == identityId && validDocList[i] == true) {
            console.log("index " + i + ": Found last valid withdrawal from this identityId")
            indWithdrawals.push(i);
        }
    }

    // search last deposits to this identityId 
    for (let i = docslen - 1; i >= 0; i--) { // process all deposits (including genesis document)

        if (documents[i].data.recipient == identityId && validDocList[i] == true) {
            indDeposits.push(i);
            console.log("index " + i + ": Found last valid deposit for this identityId");
        }
    }
}


const processDocumentChain = async function (tokenContractId, identityId) {

    if(tokenContractId == "") {
        console.log("ERROR: Insert contract id")
        return;
    }
    if(identityId == "") {
        console.log("ERROR: Insert Identity id")
        return;
    }

    console.log("++++ Fetching all Documents:")
    documents = await getDocumentChain(tokenContractId);
    console.log("++++ Fetched " + documents.length + " documents")

    console.log("++++ Processing valid Documents:")
    validDocList = getValidDocumentChain(documents);
    console.log("++++ Valid document amount is " + validDocList.filter(x => x==true).length );    // TODO: comment for production

    console.log("++++ Processing Account Balance for " + identityId)
    identityBalance = balanceOf(identityId);
    console.log("++++ Account Balance is " + identityBalance)

    console.log("++++ Processing withdraw/deposit indexes")
    indWithdrawals = [];
    indDeposits = [];
    processAllIndexes(identityId);

}

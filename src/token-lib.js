
// client.getApps().set("tokenContract", { "contractId": tokenContract });  // may change dynamic, not needed as apps object since CW submits

let documents = null;
let localUserBalance = 0.0;
let indWithdrawals = [];
let indDeposits = [];
let isValidDoc = [];

const dataContractJson = {
    token: {
        indices: [
            // {
            //   "properties": [{ "txnr": "asc" }], "unique": true
            // },
            // {
            //     "properties": [{ "sender": "asc" }], "unique": false
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
                type: "string"
            },
            symbol: {
                type: "string"
            },
            decimals: {
                type: "integer"
            },
            // totalSupply: {
            //     type: "integer"
            // },
            sender: {
                type: "string",
                maxLength: 44
            },
            recipient: {
                type: "string",
                maxLength: 44
            },
            amount: {
                type: "number"
            },
            owner: {
                type: "string"
            },
            // txnr: {
            //     type: "integer",
            //     "maxLength": 100000
            // },
            // depositAddress: {
            //     type: "string",
            //     "maxLength": 50
            // },
            balance: {
                type: "number"
            },
            lastValIndTransfer: {
                type: "integer",
                maxLength: 5
            },
            lastValIndTransferFrom: {
                type: "integer",
                maxLength: 5
            },
        },
        required: ["$createdAt", "$updatedAt"],
        additionalProperties: false
    }
};

const getUserBalance = function () {
    return localUserBalance;
}

const initTokenContract = async function (dappname, username) {

    await submitDataContractCreationMessage(dappname, username, dataContractJson);

}

const initTokenDocument = async function (dappname, username, contractId, documentJson) {

    if (documentJson.sender == 'genesis document' && documentJson.balance == 0.0) {
        await submitDocumentCreationMessage(dappname, username, contractId, documentJson);
    } else {
        console.log("ERROR: not a valid init Token document")
    }

}

const sendTokenDocument = async function (dappname, username, contractId, documentJson) {

    await submitDocumentCreationMessage(dappname, username, contractId, documentJson);

}

// token attributes
let tokenName = '';
let tokenSymbol = '';
let tokenAmount = '';
let tokenDecimal = '';

const getTokenName = function () {
    return tokenName;
}
const getTokenSymbol = function () {
    return tokenSymbol;
}
const getTokenAmount = function () {
    return tokenAmount;
}
const getTokenDecimal = function () {
    return tokenDecimal;
}


const getDocumentChain = async function (tokenContract) {

    client.getApps().set("tokenContract", { "contractId": tokenContract });
    documents = null;

    try {
        const identity = await client.platform.identities.get(dappIdentityId);  // dapp identity to read documents

        let queryBasic = { startAt: 0 };
        documents = await client.platform.documents.get('tokenContract.token', queryBasic);
    } catch (e) {
        console.error('Something went wrong:', e);
        if (e.code == 3) console.log("Invalid contract ID");
        return;
    }

    // Check token contract initialized and save token attributes
    if (documents.length == 0) {
        console.log("ERROR: Empty Token Contract, needs to get initialized")
        return; // will jump to "finally section"
    }
    if (documents[0].data.name == undefined) {
        console.log("ERROR: Token Name is undefined in Token Contract genesis document")
    } else {
        tokenName = documents[0].data.name;
        tokenSymbol = documents[0].data.symbol
        tokenAmount = documents[0].data.amount
        tokenDecimal = documents[0].data.decimals

    }

    console.log("contract document length: " + documents.length)

    // Validate genesis document
    if (documents[0].data.sender == "genesis document") {
        console.log("Validate: genesis document found");
    } else {
        console.log("Validate: FALSE (genesis document found)");
    }

    return documents;
}

const processValidDocs = function (documents) {

    let docslen = documents.length;

    // init boolean array with true
    let isValidDoc = [];
    for (let i = 0; i < docslen; i++) {
        isValidDoc.push(true);
    }

    // validate all documents, skip genesis
    for (let i = 1; i < docslen; i++) {

        // validate amount >= zero
        if (documents[i].data.amount >= 0) {
            // console.log("Validate: amount >= 0 " + i)
        } else {
            console.log("Validate: FALSE (amount >= 0) at index " + i)
            isValidDoc[i] = false;
            continue;
        }

        // validate balance >= amount
        if (documents[i].data.balance >= documents[i].data.amount) {
            // console.log("Validate: balance >= amount " + i)
        } else {
            console.log("Validate: FALSE (balance >= amount) at index " + i)
            isValidDoc[i] = false;
            continue;
        }

        // validate document owner id == sender
        if (documents[i].ownerId.toString() == documents[i].data.sender) {
            console.log("Validate: sender == document ownerId " + i)
        } else {
            console.log("Validate: FALSE sender == document ownerId " + i)
            isValidDoc[i] = false;
            continue;
        }
    }

    let processedIdentList = [];

    const recursiveBalanceValidation = function (identityId, userBalance) {

        // process user balance and invalidate validDocs Array if found
        console.log("Start processing document for identity " + identityId)
        for (let i = 0; i < docslen; i++) {
            
            let procIdentityId = documents[i].ownerId.toString();   // processing document owner id

            // console.log("index " + i + " document owner is " + procIdentityId)   // uncomment to see where optimisation potential
            // if document is owned by own identity
            if (procIdentityId == identityId) {    // if withdrawal or approval (TODO)
                if (userBalance == documents[i].data.balance) {
                    // console.log("index " + i + " Validate: TRUE (balance validated " + userBalance + " tokens)")
                } else {
                    isValidDoc[i] = false;
                    // console.log("index " + i + " Validate: FALSE (invalid balance)")
                }

                if (processedIdentList.indexOf(identityId) == -1) {
                    processedIdentList.push(identityId);
                }   
            // else document is from other identity
            } else {
                if (processedIdentList.indexOf(procIdentityId) == -1) {                                    
                    recursiveBalanceValidation(procIdentityId, 0.0);    // start processing for this identity before continuing (bc need to validate this one first)
                    processedIdentList.push(procIdentityId);
                }
            }

            // Could sum up withdrawal above, but for deposit need to run recusiveBalanceValidation for sender first to (in-)validate documents
            // Sum up Balance after Withdrawal  - skip genesis docTX
            if (documents[i].ownerId.toString() == identityId && isValidDoc[i] == true && i != 0) {
                userBalance += -(documents[i].data.amount);
                console.log("index " + i + ": Withdrawal - Balance for " + identityId + " is " + userBalance)
            }

            // Sum up Balance after Deposit
            if (documents[i].data.recipient == identityId && isValidDoc[i] == true) {
                userBalance += documents[i].data.amount;
                console.log("index " + i + ": Deposit - Balance for " + identityId + " is " + userBalance)
            }
        }
    }
    recursiveBalanceValidation(documents[0].ownerId.toString(), 0.0);   // process all balance attributes and set (in-)validate isValidDoc
    console.log("finish recursion")

    return isValidDoc;
}

const getIdentityBalance = function (identityId) {

    let userBalance = 0.0;
    let docslen = documents.length;
    for (let i = 0; i < docslen; i++) {

        // withdrawal - skip genesis docTX
        if (documents[i].ownerId.toString() == identityId && isValidDoc[i] == true && i != 0) {
            userBalance += -(documents[i].data.amount);
            console.log("index " + i + ": Balance after Withdrawal " + userBalance)
        }

        // deposit
        if (documents[i].data.recipient == identityId && isValidDoc[i] == true) {
            userBalance += documents[i].data.amount;
            console.log("index " + i + ": Balance after Deposit " + userBalance)
        }

    }
    return userBalance;
}

const processIndexesOptimized = function (identityId) {

    let docslen = documents.length;

    // search last withdraw from identityId
    for (let i = docslen - 1; i >= 0; i--) {

        if (documents[i].ownerId.toString() == identityId && isValidDoc[i] == true) {
            console.log("index " + i + ": Found last withdrawal from this identityId")
            indWithdrawals.push(i);
            // break;   // dont break, calc all withdrawals for transfer history
        }
    }

    // search last deposits to this identityId 
    for (let i = docslen - 1; i > indWithdrawals[0]; i--) {  // process only since last withdraw (optimization)
        console.log(i)
        console.log(documents[i].data.recipient)
        if (documents[i].data.recipient == identityId && isValidDoc[i] == true) {
            indDeposits.push(i);
            console.log("index " + i + ": Found last valid deposit since last withdraw for this identityId")
        }
        // last withdrawal reached, set lastDeposit value from prev docTX (optimization)
        if (i == indWithdrawals[0]) {
            indDeposits.push(documents[i].data.lastValIndTransferFrom);
            console.log("Adding last valid deposit value from last withdraw docTX " + documents[i].data.lastValIndTransferFrom)
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


const processAllIndexes = function (identityId) {

    let docslen = documents.length;

    // search last withdraw from identityId
    for (let i = docslen - 1; i >= 1; i--) {    // skip genesis document

        if (documents[i].ownerId.toString() == identityId && isValidDoc[i] == true) {
            console.log("index " + i + ": Found last valid withdrawal from this identityId")
            indWithdrawals.push(i);
        }
    }

    // search last deposits to this identityId 
    for (let i = docslen - 1; i >= 0; i--) { // process all deposits (including genesis document)

        if (documents[i].data.recipient == identityId && isValidDoc[i] == true) {
            indDeposits.push(i);
            console.log("index " + i + ": Found last valid deposit for this identityId");
        }
    }
}


const validateTokenBalance = async function (tokenContract, identityId) {

    console.log("++++ Fetching all Documents:")
    documents = await getDocumentChain(tokenContract);

    console.log("++++ Start (in-)validating all Documents:")
    isValidDoc = processValidDocs(documents);
    

    console.log("++++ Start processing Identity Balance for " + identityId)
    localUserBalance = getIdentityBalance(identityId);

    console.log("++++ Start processing withdraw/deposit indexes")
    indWithdrawals = [];
    indDeposits = [];
    processAllIndexes(identityId);

}

// TODO can only be run after validDocs was processed
const getTxHistory = async function (identityId) {

    // write tx history
    let historyTx = [];
    let historyType = [];
    let historyValid = [];
    let historyOutput = '';

    // let queryTxHistory = {
    //     "where": [
    //         ["$ownerId", "==", identityId]
    //         // ["sender", "==", identityId]
    //     ],
    //     "startAt": 1
    // }
    // docsHistory = await client.platform.documents.get('tokenContract.token', queryTxHistory);
    // docsHistoryLen = docsHistory.length;

    for (let i = 0; i < documents.length; i++) {
        // check for sender documents
        if (documents[i].data.sender == identityId) {
            historyTx.push(documents[i].data)
            historyType.push("Withdraw")
            if (isValidDoc[i]) {
                historyValid.push(true);
            } else {
                historyValid.push(false);
            }
        }
        // check for recipient documents
        if (documents[i].data.recipient == identityId) {
            historyTx.push(documents[i].data)
            historyType.push("Deposit")
            if (isValidDoc[i]) {
                historyValid.push(true);
            } else {
                historyValid.push(false);
            }
        }

    }

    // write history output
    historyOutput += "Nr:    Type     |                                       Sender                                        |                                     Recipient                                     | Amount | Valid TX \n"
    for (let i = historyTx.length - 1; i >= 0; i--) {
        historyOutput += i + ":  " + (historyType[i] + " | " + historyTx[i].sender + " | " + historyTx[i].recipient + " | " + historyTx[i].amount + " | " + historyValid[i].toString() + '\n')
    }

    // let lenHist = indexesDeposits.length + indexesWithdrawals.length;
    // for (let i = 0; i < lenHist; i++) {
    //     history.append("blub")
    // }

    return historyOutput;
}




const testMass = async function () {

    // test mass documents in browser, result: 3sec for 100M values
    let massLen = 100000000;
    console.log("creating data set with " + massLen + " values")
    let start = new Date().getTime();   // Remember when we started
    let mass = [];
    let result = [];
    let rand = 0;
    for (let i = 0; i < massLen; i++) {
        rand = Math.floor(Math.random() * 10);
        mass.push(rand);
        // console.log(rand)
    }
    console.log("finish creating dataset, processing now")
    for (let i = 0; i < massLen; i++) {
        if (mass[i] == 1) result.push(mass[i]);
    }
    let end = new Date().getTime(); // Remember when we finished
    console.log(end - start);   // Now calculate and output the difference
    console.log("finish processing, found " + result.length + " matching values")

}
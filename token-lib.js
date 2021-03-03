"use strict"

let documents = [];
let accBalance = 0n;   // BigInt
let accBalanceHistory = [];
let mapDocuments = [];    // boolean list mapping

// processed and saved but not used for validation (optional runtime optimization and security enhancement)
let mapWithdraw = [];
let mapDeposit = [];


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

const initialSupply = function () {
    return tokenInitSupply;
}
const getAccBalance = function () {
    return accBalance;
}

const getDocuments = function () {
    return documents;
}
const getMapDocuments = function () {
    return mapDocuments;
}
const getAccBalanceHistory = function () {
    return accBalanceHistory;
}

const totalSupply = function () {

    console.log("Start processing Total Supply for Data Token Contract")

    // fetch all identities on the chain
    let accounts = [];
    let totalSupply = 0n;
    let lenDocs = documents.length;
    for (let i = 0; i < lenDocs; i++) {

        let sender = documents[i].data.sender;
        let recipient = documents[i].data.recipient;

        if (accounts.indexOf(sender) == -1) {
            accounts.push(sender);
        }
        if (accounts.indexOf(recipient) == -1) {
            accounts.push(recipient);
        }
    }

    // fetch balance for each identity and sum up
    for (let i = 0; i < accounts.length; i++) {
        let balance = balanceOf(accounts[i]);
        totalSupply += balance;
        console.log("Account " + accounts[i] + " balance is " + balance)
    }

    console.log("Total Supply: " + totalSupply);
    return totalSupply;
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

    client.getApps().set("tokenContract", { "contractId": tokenContractId });
    documents = [];

    try {
        const identity = await client.platform.identities.get(dappIdentityId);  // dapp identity to read documents

        // read in 100 document steps (limit) until all collected
        let nStart = 0;
        let len = 100;
        // while (len == 100 && nStart <= 999) {    // evaluation
        while (len == 100) {
            let queryBasic = { startAt: nStart };
            let tmpDocuments = await client.platform.documents.get('tokenContract.token', queryBasic);
            len = tmpDocuments.length;
            nStart += len;
            Array.prototype.push.apply(documents, tmpDocuments)
        }

    } catch (e) {
        console.error('Something went wrong:', e);
        if (e.code == 3) console.log("Invalid contract ID");
        return;
    }

    // validate token contract attributes
    const contractJson = await client.platform.contracts.get(tokenContractId);
    if (documents.length == 0) {
        console.log("ERROR: Token Contract not Initialized! Contract Owner needs to mint initial supply")
        return;
    } else if (documents[0].ownerId.toString() != contractJson.ownerId.toString()) {
        console.log("ERROR: Token Contract Broken! Someone different then the contract owner minted initial supply")
        return;
    } else if (documents[0].data.sender != '1'.repeat(42)) {
        console.log("ERROR: Token Contract Broken! Token Sender is not zero address in Token Contract genesis document")
        return;
    } else if (documents[0].data.name == undefined) {
        console.log("ERROR: Token Contract Broken! Token Name is undefined in Token Contract genesis document")
        return;
    } else if (documents[0].data.symbol == undefined) {
        console.log("ERROR: Token Contract Broken! Token Symbol is undefined in Token Contract genesis document")
        return;
    } else if (documents[0].data.decimals == undefined) {
        console.log("ERROR: Token Contract Broken! Token Decimal is undefined in Token Contract genesis document")
        return;
    } else if (documents[0].data.amount == undefined || BigInt(documents[0].data.amount) == 0n) {
        console.log("ERROR: Token Contract Broken! Token Amount is undefined or equals zero in Token Contract genesis document")
        return;
    } else {
        tokenName = documents[0].data.name;
        tokenSymbol = documents[0].data.symbol
        tokenInitSupply = BigInt(documents[0].data.amount)
        tokenDecimal = documents[0].data.decimals
    }

    console.log("contract document length: " + documents.length)

    return documents;
}

const getDocumentChainMap = function (documents) {

    mapDocuments = [];

    let lenDocs = documents.length;

    // init boolean array with true
    for (let i = 0; i < lenDocs; i++) {
        mapDocuments.push(true);
    }

    // NOTE: could check for correct symbol, name, decimals also in each tx - currently all derived from genesis document

    // validate all documents, skip genesis
    for (let i = 1; i < lenDocs; i++) {

        // json-schema pattern for amount denies negative, empty and non-numeric amount!
        // validate amount >= zero (allow 0-value transfer)
        if (BigInt(documents[i].data.amount) >= 0n) {
            // console.log("Validate: amount >= 0 " + i)
        } else {
            console.log("Validate: FALSE (amount >= 0) at index " + i);
            mapDocuments[i] = false;
            continue;
        }

        // validate balance >= amount
        if (BigInt(documents[i].data.balance) >= BigInt(documents[i].data.amount)) {
            // console.log("Validate: balance >= amount " + i)
        } else {
            console.log("Validate: FALSE (balance >= amount) at index " + i)
            mapDocuments[i] = false;
            continue;
        }

        // validate document owner id == sender
        if (documents[i].ownerId.toString() == documents[i].data.sender) {
            // console.log("Validate: sender == document ownerId " + i)
            console.log("Syntax Validation successful: document " + i)
        } else {
            console.log("Validate: FALSE sender == document ownerId " + i)
            mapDocuments[i] = false;
            continue;
        }
    }

    // process documents balance property, starting from genesis. (in-)validate mapDocuments
    let procAccounts = [];
    balanceValidation(documents[0].ownerId.toString(), 0n, procAccounts);
    console.log("Finish balance validation")

    return mapDocuments;
}


// recursive method. process accounts that are connected (deposit/withdraw) with the given identity-account and (in-)validate
const balanceValidation = function (identityId, userBalance, procAccounts) {

    let lenDocs = documents.length;

    // process user balance and (in)validate
    console.log("Start processing document for identity " + identityId)
    for (let i = 0; i < lenDocs; i++) {

        let procIdentityId = documents[i].ownerId.toString();

        // console.log("index " + i + " document owner is " + procIdentityId)   // uncomment for debug (opt potential)
        // if document is owned by user identity
        if (procIdentityId == identityId) {    // if withdrawal (or TODO approval)
            if (userBalance == BigInt(documents[i].data.balance)) { // if user balance matches sumed up history
                // console.log("index " + i + " Validate: TRUE (balance validated " + userBalance + " tokens)")
            } else {
                mapDocuments[i] = false;
                // console.log("index " + i + " Validate: FALSE (invalid balance)")
            }

            if (procAccounts.indexOf(identityId) == -1) {
                procAccounts.push(identityId);
            }
        // else document is from other identity
        } else if (procAccounts.indexOf(procIdentityId) == -1) {
            balanceValidation(procIdentityId, 0n, procAccounts);    // start processing for this identity before continuing (bc need to validate this one first)
            procAccounts.push(procIdentityId);
        }

        // NOTE: Could sum up withdrawal above, but for deposit need to run balanceValidation for sender first to (in-)validate documents
        // Sum up Balance after Withdrawal - skip genesis document
        if (documents[i].ownerId.toString() == identityId && mapDocuments[i] == true && i != 0) {
            userBalance -= BigInt(documents[i].data.amount);
            console.log("index " + i + ": Withdrawal - Balance for " + identityId + " is " + userBalance)
        }

        // Sum up Balance after Deposit
        if (documents[i].data.recipient == identityId && mapDocuments[i] == true) {
            userBalance += BigInt(documents[i].data.amount);
            console.log("index " + i + ": Deposit - Balance for " + identityId + " is " + userBalance)
        }
    }
}

const balanceOf = function (identityId) {

    let userBalance = 0n;   // BigInt
    accBalanceHistory = [];    // BigInt list
    let lenDocs = documents.length;
    for (let i = 0; i < lenDocs; i++) {

        // withdrawal - skip genesis document
        if (documents[i].ownerId.toString() == identityId && mapDocuments[i] == true && i != 0) {
            userBalance += -(BigInt(documents[i].data.amount));
            accBalanceHistory[i] = userBalance;
            console.log("index " + i + ": Balance after Withdrawal " + userBalance)
        }

        // deposit
        if (documents[i].data.recipient == identityId && mapDocuments[i] == true) {
            userBalance += BigInt(documents[i].data.amount);
            accBalanceHistory[i] = userBalance;
            console.log("index " + i + ": Balance after Deposit " + userBalance)
        }

    }
    return userBalance;
}


// not used for validation, could be removed
const processIndex = function (identityId) {

    let lenDocs = documents.length;

    // search last withdraw from identityId
    for (let i = lenDocs - 1; i >= 1; i--) {    // skip genesis document

        if (documents[i].ownerId.toString() == identityId && mapDocuments[i] == true) {
            console.log("index " + i + ": Found last valid withdrawal from this identityId")
            mapWithdraw.push(i);
        }
    }

    // search last deposits to this identityId 
    for (let i = lenDocs - 1; i >= 0; i--) { // process all deposits (including genesis document)

        if (documents[i].data.recipient == identityId && mapDocuments[i] == true) {
            mapDeposit.push(i);
            console.log("index " + i + ": Found last valid deposit for this identityId");
        }
    }
}


const processDocumentChain = async function (tokenContractId, identityId) {

    if (tokenContractId == "") {
        console.log("ERROR: Insert Contract id")
        return;
    }
    if (identityId == "") {
        console.log("ERROR: Insert Identity id")
        return;
    }

    // let start, end;
    console.log("++++ Fetching Token Documents:")
    // start = recordTime();    //evaluation
    documents = await getDocumentChain(tokenContractId);
    if (documents == null) { return }
    // end = recordTime();
    // console.log("TIME fetch: " + deltaTime(start,end))
    console.log("++++ Fetched " + documents.length + " documents")

    console.log("++++ Processing valid Documents:")
    // start = recordTime();
    mapDocuments = getDocumentChainMap(documents);
    // end = recordTime();
    // console.log("TIME map: " + deltaTime(start,end))
    console.log("++++ Valid document amount is " + mapDocuments.filter(x => x == true).length);    // TODO: comment for production

    console.log("++++ Processing Account Balance for " + identityId)
    accBalance = balanceOf(identityId);
    console.log("++++ Account Balance is " + accBalance)

    console.log("++++ Processing withdraw/deposit indexes")
    mapWithdraw = [];
    mapDeposit = [];
    processIndex(identityId);
    console.log("++++ Finish Processing")
}

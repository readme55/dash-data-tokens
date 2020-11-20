
// client.getApps().set("tokenContract", { "contractId": tokenContract });  // may change dynamic, not needed as apps object since CW submits

var docs = null;
var localUserBalance = 0.0;
var indexesWithdrawals = [];
var indexesDeposits = [];
var validDocs = [];

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

var tokenName = '';
var tokenSymbol = '';
var tokenAmount = '';
var tokenDecimal = '';

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

const validateTokenBalance = async function (tokenContract, identityId) {

    client.getApps().set("tokenContract", { "contractId": tokenContract });

    indexesWithdrawals = [];
    indexesDeposits = [];
    localUserBalance = 0.0;
    
    docs = null;
    var docslen = null;

    try {
        const identity = await client.platform.identities.get(dappIdentityId);  // dapp identity to read documents

        // get txnr height
        var queryBasic = { startAt: 0 };
        docs = await client.platform.documents.get('tokenContract.token', queryBasic);
        docslen = docs.length;
    } catch (e) {
        console.error('Something went wrong:', e);
        if (e.code == 3) console.log("Invalid contract ID");
        return;
    }

    if (docslen == 0) {
        console.log("ERROR: Empty Token Contract, needs to get initialized")
        return; // will jump to "finally section"
    }
    if (docs[0].data.name == undefined) {
        console.log("ERROR: Token Name is undefined in Token Contract genesis document")
    } else {
        tokenName = docs[0].data.name;
        tokenSymbol = docs[0].data.symbol
        tokenAmount = docs[0].data.amount
        tokenDecimal = docs[0].data.decimals
        
    }

    console.log("contract document length: " + docslen)

    // TODO: Validate genesis document
    if (docs[0].data.sender == "genesis document") {
        console.log("Validate: genesis document found");
    } else {
        console.log("Validate: FALSE (genesis document found)");
    }

    // const initAmount = docs[0].data.amount;
    validDocs = [];
    for (var i = 0; i < docslen; i++) {
        validDocs.push(true);
    }

    // validate all documents, skip genesis
    for (var i = 1; i < docslen; i++) {

        // validate amount >= zero
        if (docs[i].data.amount >= 0) {
            // console.log("Validate: amount >= 0 " + i)
        } else {
            console.log("Validate: FALSE (amount >= 0) at index " + i)
            validDocs[i] = false;
            continue;
        }

        // validate balance >= amount
        if (docs[i].data.balance >= docs[i].data.amount) {
            // console.log("Validate: balance >= amount " + i)
        } else {
            console.log("Validate: FALSE (balance >= amount) at index " + i)
            validDocs[i] = false;
            continue;
        }

        // validate document owner id == sender
        if (docs[i].ownerId.toString() == docs[i].data.sender) {
            console.log("Validate: sender == document ownerId " + i)
        } else {
            console.log("Validate: FALSE sender == document ownerId " + i)
            validDocs[i] = false;
            continue;
        }

    }


    // TODO: make this method iterative with input identityID 

    // iterative test
    // const myMethod = function (ind) {
    //     console.log(ind)
    //     if (ind == 10) return true;
    //     if (ind == 20) return false;
    //     var fdsa = myMethod(ind+1)
    //     console.log("returned")
    //     return fdsa;
    // }
    // var fdsa = myMethod(0);
    // console.log(fdsa)


    // process user balance and invalidate validDocs Array if found
    // for (var i = 0; i < docslen; i++) {

    //     if (docs[i].ownerId.toString() == identityId) { // if documents from user identityId
    //         if (localUserBalance == docs[i].data.balance) {
    //             console.log("Validate: TRUE (balance validated " + localUserBalance + " tokens) at index " + i)
    //         } else {
    //             validDocs[i] = false;
    //             console.log("Validate: FALSE (invalid balance) at index " + i)
    //         }
    //     } else {
    //         console.log("Skip document not owned by identity " + identityId)
    //     }

    //     // withdrawal - skip genesis docTX
    //     if (docs[i].ownerId.toString() == identityId && validDocs[i] == true && i != 0) {
    //         localUserBalance += -(docs[i].data.amount);
    //         console.log("-- New Balance after Withdrawal " + localUserBalance + " at index " + i)
    //     }

    //     // deposit
    //     if (docs[i].data.recipient == identityId && validDocs[i] == true) {
    //         localUserBalance += docs[i].data.amount;
    //         console.log("-- New Balance after Deposit " + localUserBalance + " at index " + i)
    //     }
    // }
    // console.log("Finished processing user balance: " + localUserBalance)
    // $("#formBalance").val(localUserBalance);

    var processedIdentList = [];

    const recursiveValidation = function (identId, userBalance) {

        // process user balance and invalidate validDocs Array if found
        for (var i = 0; i < docslen; i++) {

            if (docs[i].ownerId.toString() == identId) { // if documents from user identityId
                if (userBalance == docs[i].data.balance) {
                    console.log("Validate: TRUE (balance validated " + userBalance + " tokens) at index " + i)
                } else {
                    validDocs[i] = false;
                    console.log("Validate: FALSE (invalid balance) at index " + i)
                }
            } else {
                // console.log("Skip document not owned by identity " + identId)
                someIdentId = docs[i].ownerId.toString();
                console.log("Process document from identity " + someIdentId)

                var skip = false;
                for (x of processedIdentList) {
                    if (someIdentId == x) skip = true; // skip if identId already processed before (bc documents already got invalidated)
                }

                // only skip invalidating part, but keep processing balance processing below
                if (!skip) {
                    recursiveValidation(someIdentId, 0.0);
                    processedIdentList.push(someIdentId);
                }
            }

            // withdrawal - skip genesis docTX
            if (docs[i].ownerId.toString() == identId && validDocs[i] == true && i != 0) {
                userBalance += -(docs[i].data.amount);
                console.log("-- New Balance after Withdrawal " + userBalance + " at index " + i)
            }

            // deposit
            if (docs[i].data.recipient == identId && validDocs[i] == true) {
                userBalance += docs[i].data.amount;
                console.log("-- New Balance after Deposit " + userBalance + " at index " + i)
            }
        }
        return userBalance;
    }
    // mark invalid docs for all users who deposited?? to this user before
    // myMethod(identityId, 0);

    // then calculate local user balance
    localUserBalance = recursiveValidation(identityId, localUserBalance);
    console.log("Finished processing user balance: " + localUserBalance)
    // $("#formBalance").val(localUserBalance);


    // search last withdraw from identityId
    for (var i = docslen - 1; i > 0; i--) { // make > 0 so it doesnt go -1

        if (docs[i].ownerId.toString() == identityId && validDocs[i] == true) {
            console.log("Found last withdrawal tx from this identityId at index " + i)
            indexesWithdrawals.push(i);
            // break;   // dont break, calc all withdrawals for transfer history
        }
    }

    // search last deposits to this identityId TODO: only process since last withdraw or set to same as prev docTX document
    for (var i = docslen - 1; i > indexesWithdrawals[0]; i--) {
        console.log(i)
        console.log(docs[i].data.recipient)
        if (docs[i].data.recipient == identityId && validDocs[i] == true) {
            indexesDeposits.push(i);
            console.log("Found last valid deposit since last withdraw for this identityId at index " + i)
        }
        // set lastDeposit value from prev docTX
        if (i == indexesWithdrawals) {
            indexesDeposits.push(docs[i].data.lastValIndTransferFrom);
            console.log("Adding last valid deposit value from last withdraw docTX " + docs[i].data.lastValIndTransferFrom)
        };
    }

    // search through indexes for invalid docTX
    var curLastDocTX = indexesWithdrawals;
    for (var i = docslen - 1; i > 0; i--) {

        if (i == curLastDocTX) {
            if (!validDocs[i]) {
                console.log("invalid docTX found at index " + i)
                console.dir(docs[i])
                break;
            }
            curLastDocTX = docs[i].data.lastValIndTransfer;
        }

        if (i == 0) {
            console.log("finished searching for invalid docTX - no results found!")
        }
    }

}

// TODO can only be run after validDocs was processed
const getTxHistory = async function (identityId) {

    // write tx history
    var historyTx = [];
    var historyType = [];
    var historyValid = [];
    var historyOutput = '';

    // var queryTxHistory = {
    //     "where": [
    //         ["$ownerId", "==", identityId]
    //         // ["sender", "==", identityId]
    //     ],
    //     "startAt": 1
    // }
    // docsHistory = await client.platform.documents.get('tokenContract.token', queryTxHistory);
    // docsHistoryLen = docsHistory.length;

    for (var i = 0; i < docslen; i++) {
        // check for sender documents
        if (docs[i].data.sender == identityId) {
            historyTx.push(docs[i])
            historyType.push("Withdraw")
            if (validDocs[i]) {
                historyValid.push(true);
            } else {
                historyValid.push(false);
            }
        }
        // check for recipient documents
        if (docs[i].data.recipient == identityId) {
            historyTx.push(docs[i])
            historyType.push("Deposit")
            if (validDocs[i]) {
                historyValid.push(true);
            } else {
                historyValid.push(false);
            }
        }

    }

    // write history output
    for (var i = 0; i < historyTx.length; i++) {
        historyOutput.append(historyType[i] + " " + historyTx[i].sender + " " + historyTx[i].recipient + " " + historyTx[i].amount + " " + historyValid[i].toString() + "\n")
    }

    // var lenHist = indexesDeposits.length + indexesWithdrawals.length;
    // for (var i = 0; i < lenHist; i++) {
    //     history.append("blub")
    // }

    return historyOutput;
}




const testMass = async function () {

    // test mass documents in browser, result: 3sec for 100M values
    var massLen = 100000000;
    console.log("creating data set with " + massLen + " values")
    var start = new Date().getTime();   // Remember when we started
    var mass = [];
    var result = [];
    var rand = 0;
    for (var i = 0; i < massLen; i++) {
        rand =  Math.floor(Math.random() * 10);
        mass.push(rand);
        // console.log(rand)
    }
    console.log("finish creating dataset, processing now")
    for (var i = 0; i < massLen; i++) {
        if (mass[i] == 1) result.push(mass[i]);
    }
    var end = new Date().getTime(); // Remember when we finished
    console.log(end - start);   // Now calculate and output the difference
    console.log("finish processing, found " + result.length + " matching values")

}
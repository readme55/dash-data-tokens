"use strict"

const getTxHistory = async function (identityId, documents, mapDocuments, accBalanceHistory, decimals) {

    if (documents == null) return;

    // write tx history
    let historyTx = [];         // list of documents.data
    let historyType = [];       // list of string - "deposit" or "withdraw" 
    let historyValid = [];      // list of booleans
    let historyBalance = [];    // list of strings - balance converted to user representation
    let historyOutput = '';     // result - html output string

    // TODO: optimise with query instead of iterating through all documents
    // let queryTxHistory = {
    //     "where": [
    //         ["$ownerId", "==", identityId]
    //         // ["sender", "==", identityId]
    //     ],
    //     "startAt": 1
    // }
    // docsHistory = await client.platform.documents.get('tokenContractLoc.token', queryTxHistory);
    // docsHistoryLen = docsHistory.length;

    for (let i = 0; i < documents.length; i++) {
        // check for sender documents
        if (documents[i].data.sender == identityId) {
            historyTx.push(documents[i].data);
            historyType.push("Withdraw");
            historyBalance.push( toUserRep(accBalanceHistory[i], decimals) );
            if (mapDocuments[i]) {
                historyValid.push(true);
            } else {
                historyValid.push(false);
            }
        }
        // check for recipient documents
        if (documents[i].data.recipient == identityId) {
            historyTx.push(documents[i].data);
            historyType.push("Deposit");
            historyBalance.push( toUserRep(accBalanceHistory[i], decimals) );
            if (mapDocuments[i]) {
                historyValid.push(true);
            } else {
                historyValid.push(false);
            }
        }
    }

    // write history output
    historyOutput += "Nr:    Type     |    Amount    |    Balance    | Valid |                                Sender                                 |                                  Recipient                                |   Message         \n"
    for (let i = historyTx.length - 1; i >= 0; i--) {
        historyOutput += i + ":  " + (historyType[i] + " |   " + toUserRep(historyTx[i].amount, decimals) + "   |   " + historyBalance[i] + "   | " + historyValid[i].toString() + " | " + historyTx[i].sender + " | " + historyTx[i].recipient + " | " + historyTx[i].data + '\n')
    }

    return historyOutput;
}

// from BigInt(value) to String with decimal shifted and set
const toUserRep = function(bigInt, decimals) {

    // Tests if value is truthy - using strict equality
    // assert.ok(typeof bigInt === 'bigint');
    // assert.ok(typeof decimals === 'integer');

    if (bigInt == undefined) return undefined;

    let strBigInt = bigInt.toString();

    let part1 = strBigInt.substring(0,strBigInt.length-decimals);
    let part2 = strBigInt.substring(strBigInt.length-decimals);

    if(part2.length < decimals) {
        part2 = "0".repeat(decimals - strBigInt.length) + part2;
    }
    
    let resStr= part1 + "." + part2;

    return resStr;
}

// from String(value) to BigInt with decimal shifted and removed
const fromUserRep = function(strNumber, decimals) {

    // Tests if value is truthy - using strict equality
    // assert.ok(typeof bigInt === 'bigint');
    // assert.ok(typeof decimals === 'integer');

    if (strNumber == undefined) return undefined;
    let parts = strNumber.split(".");

    if(parts[1] == undefined) {
        parts[1] = '';
    }
    let decimalLen = parts[1].length;
    
    let resBigInt = BigInt( parts[0] + parts[1] + "0".repeat(8-decimalLen) );

    return resBigInt;
}

const resolveIdentity = async function(username) {
    let doc;
    try {
        doc = await client.platform.names.resolve(username.toLowerCase() + '.dash');
    } catch (e) {
        console.error('Something went wrong:', e);
    }
    return doc.data.records.dashUniqueIdentityId.toString();
}

const resolveUsername = async function(identityId) {
    let doc;
    try {
        doc = await client.platform.names.resolveByRecord('dashUniqueIdentityId', identityId);
    } catch (e) {
        console.error('Something went wrong:', e);
    }
    return doc.data.label;

}

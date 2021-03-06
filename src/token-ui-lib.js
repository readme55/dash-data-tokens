"use strict"

const getTxHistory = async function (identityId, documents, mapDocuments, accBalanceHistory, decimals) {

    console.log('++++ Resolve Data for Transfer History Output')

    if (documents == null) return;

    // write tx history
    let historyTx = [];         // list of documents.data
    let historyType = [];       // list of string - "deposit" or "withdraw" 
    let historyValid = [];      // list of booleans
    let historyBalance = [];    // list of strings - balance converted to user representation
    let historyOutput = '';     // result - html output string
    let mapIdentity = [];
    let mapUsername = [];

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
            historyBalance.push( bigInt2strNum(accBalanceHistory[i], decimals) );
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
            historyBalance.push( bigInt2strNum(accBalanceHistory[i], decimals) );
            if (mapDocuments[i]) {
                historyValid.push(true);
            } else {
                historyValid.push(false);
            }
        }
    }

    //create mapping and resolve username for all account interactions
    mapIdentity.push('1'.repeat(42))
    mapUsername.push('zeroAddress')
    for (let i=0; i<historyTx.length; i++) {
        let indSender = mapIdentity.indexOf(historyTx[i].sender);
        let indRecipient = mapIdentity.indexOf(historyTx[i].recipient);
        if (indSender == -1) {
            mapIdentity.push(historyTx[i].sender)
            mapUsername.push(await resolveUsername(historyTx[i].sender))
        }
        if (indRecipient == -1) {
            mapIdentity.push(historyTx[i].recipient)
            mapUsername.push(await resolveUsername(historyTx[i].recipient))
        }

    }

    // translate identity to username and add entry to historyTx
    for (let i=0; i<historyTx.length; i++) {
        historyTx[i].senderUser = mapUsername[mapIdentity.indexOf(historyTx[i].sender)];
        historyTx[i].recipientUser = mapUsername[mapIdentity.indexOf(historyTx[i].recipient)];
    }

    // write history output
    historyOutput += "Nr:    Type     |        Amount        |        Balance        |   Valid   |      Sender      |      Recipient      |   Message         \n"
    for (let i = historyTx.length - 1; i >= 0; i--) {
        // historyOutput += i + ":  " + (historyType[i] + " |   " + toUserRep(historyTx[i].amount, decimals) + "   |   " + historyBalance[i] + "   | " + historyValid[i].toString() + " | " + historyTx[i].sender + " | " + historyTx[i].recipient + " | " + historyTx[i].data + '\n')
        historyOutput += i + ":  " + (historyType[i] + " |   " + bigInt2strNum(historyTx[i].amount, decimals) + "   |   " + historyBalance[i] + "   | " + historyValid[i].toString() + " |   " + historyTx[i].senderUser + "   |   " + historyTx[i].recipientUser + "   | " + historyTx[i].data + '\n')
    }

    return historyOutput;
}


const bigInt2str = function(bigInt) {
    return bigInt.toString();
}

// from BigInt(value) to String with decimal shifted and set
const bigInt2strNum = function(bigInt, decimals) {

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
const str2bigInt = function(strNumber, decimals) {

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
    return doc[0].data.label;
}

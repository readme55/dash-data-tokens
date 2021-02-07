// Not used atm - optimised approach for index processing.
const processIndexOpt = function (identityId) {

    let lenDocs = documents.length;

    // search last withdraw from identityId
    for (let i = lenDocs - 1; i >= 0; i--) {

        if (documents[i].ownerId.toString() == identityId && mapDocuments[i] == true) {
            console.log("index " + i + ": Found last withdrawal from this identityId")
            mapWithdraw.push(i);
            // break;   // dont break, calc all withdrawals for transfer history
        }
    }

    // search last deposits to this identityId 
    for (let i = lenDocs - 1; i > mapWithdraw[0]; i--) {  // process only since last withdraw (optimization)
        console.log(i)
        console.log(documents[i].data.recipient)
        if (documents[i].data.recipient == identityId && mapDocuments[i] == true) {
            mapDeposit.push(i);
            console.log("index " + i + ": Found last valid deposit since last withdraw for this identityId")
        }
        // last withdrawal reached, set lastDeposit value from prev document (optimization)
        if (i == mapWithdraw[0]) {
            mapDeposit.push(documents[i].data.lastValIndTransferFrom);
            console.log("Adding last valid deposit value from last withdraw document " + documents[i].data.lastValIndTransferFrom)
        };
    }

    // TODO: check, probably redundant - only valid document indexes are pushed to mapWithdraw
    // perhaps got to do with the optimisation algo ... but only withdrawals are checked -> doesnt make sense atm
    // search through indexes for invalid docTX
    // let curLastDocTX = mapWithdraw[0];
    // console.log(curLastDocTX)
    // for (let i = lenDocs - 1; i >= 0; i--) {
    //     if (i == curLastDocTX) {
    //         if (!mapDocuments[i]) {
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
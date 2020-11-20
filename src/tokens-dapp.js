// v1 4th: 946mB3VPhRCBNhJbXGvuR9YqpHaXPbUr3GvpqsKTnSN7
// v2 5th: 3jLjo5FGFQVauSVYTSFqMozrUxjBENzFXciFQSY4AQQG

// cloud identID: AfZxsSWVKxDpHkXHQDqhEbyZYmfNcAgKq76TLCab4ZiD
// dappuser identID: 72xw6JyFKeRjMBNJpEU6vaq9oCpmTMi5dEF7jenN3Btp

$(document).ready(function () {

    var username = sessionStorage.getItem('dash_username');
    var identityId = sessionStorage.getItem('dash_identityID');
    // var identityId = "AfZxsSWVKxDpHkXHQDqhEbyZYmfNcAgKq76TLCab4ZiD"
    if (username != null) {
        $("#signinbutton").removeClass('btn-success').addClass('btn-info');
        $("#signinbutton").val(username)
    }
    var indexesWithdrawals = [];
    var indexesDeposits = [];
    var localUserBalance = 0.0;

    // set buttons after load
    $("#receiveBtn").prop('disabled', true);
    $("#sendBtn").prop('disabled', true);

    // $("#formTokenContract").val("946mB3VPhRCBNhJbXGvuR9YqpHaXPbUr3GvpqsKTnSN7");
    $("#formTokenContract").change(function () {
        if ($("#formTokenContract").val() == "") {  // if contract input field is empty
            $("#createBtn").prop('disabled', false);
            $("#initBtn").prop('disabled', false);
            $("#receiveBtn").prop('disabled', true);
            $("#sendBtn").prop('disabled', true);
            $("#formTokenName").prop('readonly', false);
            $("#formTokenSymbol").prop('readonly', false);
            $("#formTokenAmount").prop('readonly', false);
            $("#formTokenDecimals").prop('readonly', false);
        } else {    // if filled
            $("#createBtn").prop('disabled', true);
            // $("#initBtn").prop('disabled', true);
            $("#receiveBtn").prop('disabled', false);
            $("#sendBtn").prop('disabled', true);
            $("#formTokenName").prop('readonly', true);
            $("#formTokenSymbol").prop('readonly', true);
            // $("#formTokenAmount").prop('readonly', true);
            $("#formTokenDecimals").prop('readonly', true);
        }
    });


    $("#exampleFormControlUser").val(dappAddress)

    $("#createBtn").click(async function () {

        console.log("click create data contract")
        $("#createBtn").prop('disabled', true);

        await initTokenContract('Token Dapp', username);

        $("#createBtn").prop('disabled', false);
        console.log("done")

    });


    $("#initBtn").click(async function () {
        console.log("click init token amount")
        $("#initBtn").prop('disabled', true);

        const tokenContractId = $("#formTokenContract").val();
        const tokenVersion = 1;
        const tokenName = $("#formTokenName").val();
        const tokenSymbol = $("#formTokenSymbol").val();
        const tokenDecimals = $("#formTokenDecimals").val();
        const tokenSender = 'genesis document';    // could force check same identityId then dataContract creator and initiator...
        const tokenRecipient = identityId,    // dapp login user identityId
        const tokenAmount = Number($("#formTokenAmount").val());    // Init token amount value (not send amount)
        const tokenOwner = identityId;
        const tokenBalance = 0.0;

        const initDocumentTxJson = {
            version: tokenVersion,
            name: tokenName,
            symbol: tokenSymbol,
            decimals: tokenDecimals,
            sender: tokenSender,   
            recipient: tokenRecipient,    // dapp login user identityId
            amount: tokenAmount,
            owner: tokenOwner,
            balance: tokenBalance,
            lastValIndTransfer: -1,
            lastValIndTransferFrom: -1
        }

        await initTokenDocument('Token Dapp', username, tokenContractId, initDocumentTxJson);

        $("#initBtn").prop('disabled', false);
        console.log("done")

    });


    $("#sendBtn").click(async function () {

        console.log("click send token")
        $("#sendBtn").prop('disabled', true);

        const tokenContractId = $("#formTokenContract").val();
        const tokenVersion = 1;
        const tokenName = $("#formTokenName").val();
        const tokenSymbol = $("#formTokenSymbol").val();
        const tokenDecimals = $("#formTokenDecimals").val();
        const tokenSender = identityId;    // dappuser identityId TODO: fetch auto
        const tokenRecipient = $("#formWithdrawUser").val();
        const tokenAmount = Number($("#formSendAmount").val());
        const tokenOwner = identityId;
        const tokenBalance = Number($("#formBalance").val());

        console.log(tokenRecipient)

        const contractTxJson = {
            version: tokenVersion,
            name: tokenName,
            symbol: tokenSymbol,
            decimals: tokenDecimals,
            sender: tokenSender,   
            recipient: tokenRecipient,    // dapp login user identityId
            amount: tokenAmount,
            owner: tokenOwner,
            balance: tokenBalance,
            lastValIndTransfer: indexesWithdrawals[0],
            lastValIndTransferFrom: indexesDeposits[0]
        }
        
        await sendTokenDocument('Token Dapp', username, tokenContractId, contractTxJson);

        // $("#sendBtn").prop('disabled', false);   // leave disabled until validate balance is called again
        console.log("done")

    });


    $("#receiveBtn").click(async function () {

        console.log("click validate balance")
        $("#receiveBtn").prop('disabled', true);

        localUserBalance = 0;
        const tokenContract = $("#formTokenContract").val();


        const validateTokenBalance = async function () {

            var docs = null;
            var docslen = null;

            try {
                const identity = await client.platform.identities.get(dappIdentityId);  // dapp identity

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
                $("#formTokenName").val(docs[0].data.name)
                $("#formTokenSymbol").val(docs[0].data.symbol)
                $("#formTokenAmount").val(docs[0].data.amount)
                $("#formTokenDecimals").val(docs[0].data.decimals)
            }

            console.log("contract document length: " + docslen)

            // TODO: Validate genesis document
            if (docs[0].data.sender == "genesis document") {
                console.log("Validate: genesis document found");
            } else {
                console.log("Validate: FALSE (genesis document found)");
            }

            // const initAmount = docs[0].data.amount;
            var validDocs = [];
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

            var listUserProc = [];

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
                        for (x of listUserProc) {
                            if (someIdentId == x) skip = true; // skip if identId already processed before (bc documents already got invalidated)
                        }

                        // only skip invalidating part, but keep processing balance processing below
                        if (!skip) {
                            recursiveValidation(someIdentId, 0.0);
                            listUserProc.push(someIdentId);
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
            $("#formBalance").val(localUserBalance);


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

            $("#sendBtn").prop('disabled', false);  // activate sendBtn when validated successfully

        }
        await validateTokenBalance();
        $("#receiveBtn").prop('disabled', false);

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

        $("#signinbutton").val(historyOutput)



        console.log("done")

    });

});
// 4th 946mB3VPhRCBNhJbXGvuR9YqpHaXPbUr3GvpqsKTnSN7

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
    var localLastDocTX = -1;
    var localLastDeposits = [];
    var localUserBalance = 0;

    // $("#formTokenContract").val("946mB3VPhRCBNhJbXGvuR9YqpHaXPbUr3GvpqsKTnSN7");
    $("#formTokenContract").change(function () {
        if ($("#formTokenContract").val() != "") {  // if contract id input field is empty
            $("#createBtn").prop('disabled', true);
            $("#initBtn").prop('disabled', true);
            $("#sendBtn").prop('disabled', true);
        } else {
            $("#createBtn").prop('disabled', false);
            $("#initBtn").prop('disabled', false);
            $("#sendBtn").prop('disabled', true);
        }
    });


    $("#exampleFormControlUser").val(dappAddress)

    $("#createBtn").click(async function () {
        console.log("click create data contract")
        $("#createBtn").prop('disabled', true);

        var clientOpts = {};
        clientOpts.network = 'evonet';
        clientOpts.wallet = {};
        clientOpts.wallet.mnemonic = dappMnemonic;

        const client = new Dash.Client(clientOpts);
        client.getApps().set("messageContract", { "contractId": messageContractId });

        const dappContract = {
            token: {
                indices: [
                    // {
                    //   "properties": [{ "txnr": "asc" }], "unique": true
                    // },
                    {
                        "properties": [{ "depositAddress": "asc" }], "unique": false
                    },
                    {
                        "properties": [{ "withdrawAddress": "asc" }], "unique": false
                    },
                ],
                properties: {
                    tokenName: {
                        type: "string"
                    },
                    balance: {
                        type: "number"
                    },
                    withdrawAmount: {
                        type: "number"
                    },
                    // txnr: {
                    //     type: "integer",
                    //     "maxLength": 100000
                    // },
                    depositAddress: {
                        type: "string",
                        "maxLength": 50
                    },
                    withdrawAddress: {
                        type: "string",
                        "maxLength": 50
                    },
                    lastValidWithdrawIndex: {
                        type: "integer",
                        "maxLength": 50
                    },
                    lastValidDepositIndex: {
                        type: "integer",
                        "maxLength": 50
                    },
                },
                additionalProperties: false
            }
        };

        const submitDataContractCreationDocument = async function () {

            const strDappContract = JSON.stringify(dappContract);
            try {
                const identity = await client.platform.identities.get(dappIdentityId);  // dapp identity

                //// dapp signing simple
                docProperties = {
                    header: 'Request ContractCreation ST',
                    dappname: 'Simple Browser Dapp',
                    reference: username,
                    status: '0',
                    timestamp: new Date().toUTCString(),
                    STcontract: strDappContract
                }

                // Create the note document
                const noteDocument = await client.platform.documents.create(
                    'messageContract.message',
                    identity,
                    docProperties,
                );

                const documentBatch = {
                    create: [noteDocument],
                    replace: [],
                    delete: [],
                }

                // Sign and submit the document
                await client.platform.documents.broadcast(documentBatch, identity);
            } catch (e) {
                console.error('Something went wrong:', e);
            } finally {
                console.log("Send DS-Request: Create Contract: " + strDappContract)
                // client.disconnect();
            }
        };
        await submitDataContractCreationDocument();
        $("#createBtn").prop('disabled', false);
        console.log("done")

    });


    $("#initBtn").click(async function () {
        console.log("click init token amount")
        $("#initBtn").prop('disabled', true);

        var clientOpts = {};
        clientOpts.network = 'evonet';
        clientOpts.wallet = {};
        clientOpts.wallet.mnemonic = dappMnemonic;
        var curApps = '{ "messageContract" : { "contractId" : "' + messageContractId + '" } }';
        curApps = JSON.parse(curApps);
        clientOpts.apps = curApps;

        const client = new Dash.Client(clientOpts);

        const submitInitTokenDocument = async function () {

            try {
                const identity = await client.platform.identities.get(dappIdentityId);  // dapp identity

                var jsonInitTX = {
                    tokenName: $("#formTokenName").val(),
                    balance: 0,
                    withdrawAmount: Number($("#formTokenAmount").val()),
                    depositAddress: 'genesis document', // could use same identityId then dataContract creator and initiator...
                    withdrawAddress: '72xw6JyFKeRjMBNJpEU6vaq9oCpmTMi5dEF7jenN3Btp',    // dappuser identityId TODO: fetch auto
                    lastValidWithdrawIndex: -1,
                    lastValidDepositIndex: -1
                }

                var strInitTx = JSON.stringify(jsonInitTX);

                //// dapp signing simple
                docProperties = {
                    header: 'Request Document ST',
                    dappname: 'Simple Browser Dapp',
                    reference: username,
                    status: '0',
                    timestamp: new Date().toUTCString(),
                    STcontract: $("#formTokenContract").val(),
                    STdocument: 'token',
                    STcontent: strInitTx
                }

                // Create the note document
                const noteDocument = await client.platform.documents.create(
                    'messageContract.message',
                    identity,
                    docProperties,
                );

                const documentBatch = {
                    create: [noteDocument],
                    replace: [],
                    delete: [],
                }

                // Sign and submit the document
                await client.platform.documents.broadcast(documentBatch, identity);
            } catch (e) {
                console.error('Something went wrong:', e);
            } finally {
                console.log("Send DS-Request: Init Token " + $("#formTokenName").val() + " with amount " + $("#formTokenAmount").val() + " to contract " + $("#formTokenContract").val())
                // client.disconnect();
            }
        };
        await submitInitTokenDocument();
        $("#initBtn").prop('disabled', false);
        console.log("done")

    });


    $("#sendBtn").click(async function () {

        console.log("click send token")
        $("#sendBtn").prop('disabled', true);

        const tokenContract = $("#formTokenContract").val();
        const tokenName = $("#formTokenName").val();
        const tokenAmount = Number($("#formSendAmount").val());
        const tokenWithdraw = $("#formWithdrawUser").val();
        const tokenDeposit = identityId;    // dappuser identityId TODO: fetch auto
        const tokenBalance = Number($("#formBalance").val());

        console.log(tokenWithdraw)

        var clientOpts = {};
        clientOpts.network = 'evonet';
        clientOpts.wallet = {};
        clientOpts.wallet.mnemonic = dappMnemonic;

        const client = new Dash.Client(clientOpts);
        client.getApps().set("messageContract", { "contractId": messageContractId });
        client.getApps().set("tokenContract", { "contractId": tokenContract });

        const submitSendTokenDocument = async function () {

            try {
                const identity = await client.platform.identities.get(dappIdentityId);  // dapp identity

                var jsonInitTX = {
                    tokenName: tokenName,
                    balance: tokenBalance,
                    withdrawAmount: tokenAmount,
                    depositAddress: tokenDeposit,
                    withdrawAddress: tokenWithdraw,
                    lastValidWithdrawIndex: localLastDocTX,
                    lastValidDepositIndex: localLastDeposits[0]
                }

                var strInitTx = JSON.stringify(jsonInitTX);

                // dapp signing simple
                docProperties = {
                    header: 'Request Document ST',
                    dappname: 'Simple Browser Dapp',
                    reference: username,
                    status: '0',
                    timestamp: new Date().toUTCString(),
                    STcontract: tokenContract,
                    STdocument: 'token',
                    // STcontent: '{ "tokenName" : "' + tokenName + '", "balance" : ' + tokenBalance + ', "withdrawAmount" : ' + tokenAmount + ', "withdrawAddress" : "' + tokenWithdraw + '", "depositAddress" : "' + tokenDeposit + '"}'
                    STcontent: strInitTx
                }

                // Create the note document
                const noteDocument = await client.platform.documents.create(
                    'messageContract.message',
                    identity,
                    docProperties,
                );

                const documentBatch = {
                    create: [noteDocument],
                    replace: [],
                    delete: [],
                }

                // Sign and submit the document
                await client.platform.documents.broadcast(documentBatch, identity);
            } catch (e) {
                console.error('Something went wrong:', e);
                return;
            } finally {
                console.log("Send DS-Request: Send Token Amount " + tokenAmount + " from address " + tokenDeposit + " to address " + tokenWithdraw)
                // client.disconnect();
            }

        }
        await submitSendTokenDocument();
        // $("#sendBtn").prop('disabled', false);   // leave disabled until validate balance is called again
        console.log("done")


    });


    $("#receiveBtn").click(async function () {

        console.log("click validate balance")
        $("#receiveBtn").prop('disabled', true);

        localUserBalance = 0;
        const tokenContract = $("#formTokenContract").val();
        const tokenName = "";

        var clientOpts = {};
        clientOpts.network = 'evonet';
        clientOpts.wallet = {};
        clientOpts.wallet.mnemonic = dappMnemonic;

        const client = new Dash.Client(clientOpts);
        client.getApps().set("messageContract", { "contractId": messageContractId });
        client.getApps().set("tokenContract", { "contractId": tokenContract });


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
            if (docs[0].data.tokenName == undefined) {
                console.log("ERROR: Token Name is undefined in Token Contract")
            } else {
                $("#formTokenName").val(docs[0].data.tokenName)
                $("#formTokenAmount").val(docs[0].data.withdrawAmount)
            }

            console.log("contract document length: " + docslen)

            if (docs[0].data.depositAddress == "genesis document") {
                console.log("Validate: genesis document found");
            } else {
                console.log("Validate: FALSE (genesis document found)");
            }

            // const initAmount = docs[0].data.withdrawAmount;
            var validDocs = [];
            for (var i = 0; i < docslen; i++) {
                validDocs.push(true);
            }

            // validate all documents, skip genesis
            for (var i = 1; i < docslen; i++) {

                // validate withdrawAmount >= zero
                if (docs[i].data.withdrawAmount >= 0) {
                    // console.log("Validate: withdrawAmount >= 0 " + i)
                } else {
                    console.log("Validate: FALSE (withdrawAmount >= 0) at index " + i)
                    validDocs[i] = false;
                    continue;
                }

                // validate balance >= withdrawAmount
                if (docs[i].data.balance >= docs[i].data.withdrawAmount) {
                    // console.log("Validate: balance >= withdrawAmount " + i)
                } else {
                    console.log("Validate: FALSE (balance >= withdrawAmount) at index " + i)
                    validDocs[i] = false;
                    continue;
                }

                // validate document owner id == depositAddress // TODO remove depositAddress
                if (docs[i].ownerId.toString() == docs[i].data.depositAddress) {
                    // console.log("Validate: depositAddress == document ownerId " + i)
                } else {
                    console.log("Validate: FALSE depositAddress == document ownerId " + i)
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
            //         localUserBalance += -(docs[i].data.withdrawAmount);
            //         console.log("-- New Balance after Withdrawal " + localUserBalance + " at index " + i)
            //     }

            //     // deposit
            //     if (docs[i].data.withdrawAddress == identityId && validDocs[i] == true) {
            //         localUserBalance += docs[i].data.withdrawAmount;
            //         console.log("-- New Balance after Deposit " + localUserBalance + " at index " + i)
            //     }
            // }
            // console.log("Finished processing user balance: " + localUserBalance)
            // $("#formBalance").val(localUserBalance);

            var listUserProc = [];

            const myMethod = function (myIdentId, myUserBalance) {

                // process user balance and invalidate validDocs Array if found
                for (var i = 0; i < docslen; i++) {

                    if (docs[i].ownerId.toString() == myIdentId) { // if documents from user identityId
                        if (myUserBalance == docs[i].data.balance) {
                            console.log("Validate: TRUE (balance validated " + myUserBalance + " tokens) at index " + i)
                        } else {
                            validDocs[i] = false;
                            console.log("Validate: FALSE (invalid balance) at index " + i)
                        }
                    } else {
                        // console.log("Skip document not owned by identity " + myIdentId)
                        someIdentId = docs[i].ownerId.toString();
                        console.log("Process document from identity " + someIdentId)
                        
                        var skip = false;
                        for (x of listUserProc) {
                            if (someIdentId == x) skip = true; // skip if identId already processed before (bc documents already got invalidated)
                        }
                        
                        // only skip invalidating part, but keep processing balance processing below
                        if (!skip) {
                            myMethod(someIdentId, 0);
                            listUserProc.push(someIdentId);
                        }
                    }

                    // withdrawal - skip genesis docTX
                    if (docs[i].ownerId.toString() == myIdentId && validDocs[i] == true && i != 0) {
                        myUserBalance += -(docs[i].data.withdrawAmount);
                        console.log("-- New Balance after Withdrawal " + myUserBalance + " at index " + i)
                    }

                    // deposit
                    if (docs[i].data.withdrawAddress == myIdentId && validDocs[i] == true) {
                        myUserBalance += docs[i].data.withdrawAmount;
                        console.log("-- New Balance after Deposit " + myUserBalance + " at index " + i)
                    }
                }
                return myUserBalance;
            }
            // mark invalid docs for all users who deposited?? to this user before
            // myMethod(identityId, 0);

            // then calculate local user balance
            localUserBalance = myMethod(identityId, localUserBalance);
            console.log("Finished processing user balance: " + localUserBalance)
            $("#formBalance").val(localUserBalance);


            // search last withdraw from identityId
            for (var i = docslen - 1; i > 0; i--) { // make > 0 so it doesnt go -1

                if (docs[i].ownerId.toString() == identityId && validDocs[i] == true) {
                    console.log("Found last withdrawal tx from this identityId at index " + i)
                    localLastDocTX = i;
                    break;
                }
            }

            // search last deposits to this identityId TODO: only process since last withdraw or set to same as prev docTX document
            for (var i = docslen - 1; i > localLastDocTX; i--) {
                console.log(i)
                console.log(docs[i].data.withdrawAddress)
                if (docs[i].data.withdrawAddress == identityId && validDocs[i] == true) {
                    localLastDeposits.push(i);
                    console.log("Found last valid deposit since last withdraw for this identityId at index " + i)
                }
                // set lastDeposit value from prev docTX
                if (i == localLastDocTX) {
                    localLastDeposits.push(docs[i].data.lastValidDepositIndex);
                    console.log("Adding last valid deposit value from last withdraw docTX " + docs[i].data.lastValidDepositIndex)
                };
            }

            // search through indexes for invalid docTX
            var curLastDocTX = localLastDocTX;
            for (var i = docslen - 1; i > 0; i--) {

                if (i == curLastDocTX) {
                    if (!validDocs[i]) {
                        console.log("invalid docTX found at index " + i)
                        console.dir(docs[i])
                        break;
                    }
                    curLastDocTX = docs[i].data.lastValidWithdrawIndex;
                }

                if (i == 0) {
                    console.log("finished searching for invalid docTX - no results found!")
                }
            }

            $("#sendBtn").prop('disabled', false);  // activate sendBtn when validated successfully

        }
        await validateTokenBalance();
        $("#receiveBtn").prop('disabled', false);
        console.log("done")

    });

});
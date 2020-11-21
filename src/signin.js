// todo, fetch identity from mnemonic when dashjs support
// static "message contract", can be exchanged with Push-Notification-service later
var client = null;
var docID = '';
var identityID = '';
var clientOpts = {};

$(document).ready(function () {
    console.log("doc ready")

    var storageUsername = sessionStorage.getItem('dash_username');
    if (storageUsername != null) {
        $("#inputUsername").val(storageUsername)
    }

    $("#submitBtn").click(async function () {

        console.log("click")

        var inputUsername = $("#inputUsername").val();
        $("#submitBtn").prop('disabled', true);

        // Submit a document ("Request Document ST") to the Users Wallet
        clientOpts = {};
        clientOpts.network = 'evonet';
        clientOpts.wallet = {};
        clientOpts.wallet.mnemonic = dappMnemonic;

        client = new Dash.Client(clientOpts);
        client.getApps().set("msgContract", { "contractId": messageContractId })


        // get identity ID for user
        console.log("fetch identity ID from username")
        async function getIdentityID() {

            var recordLocator = "dpns.domain";
            var queryString = '{ "where": [' +
                '["normalizedParentDomainName", "==", "dash"],' +
                '["normalizedLabel", "==", "' + inputUsername.toLowerCase() + '"]' +
                '],' +
                '"startAt": 1 }';

            try {
                var queryJson = JSON.parse(queryString);

                const documents = await client.platform.documents.get(recordLocator, queryJson);
                console.log(documents)
                if (documents[0] == null || documents[0] == undefined) {
                    console.log("Couldnt connect to network, aborting polling! Please try again in a few moments.");
                } else {
                    console.log("DocumentID for user " + inputUsername + ": " + documents[0].id)
                    console.log("Identity for user " + inputUsername + ": " + documents[0].ownerId)
                    docID = documents[0].id.toString()
                    identityID = documents[0].ownerId.toString()
                    console.log("saved Identity ID")
                }
            } catch (e) {
                console.error('Something went wrong:', e);
            } finally {
                client.disconnect()
            }
        }
        await getIdentityID();


        // submit login request to wallet
        console.log("submit Request Document for Login")
        const submitMessageDocument = async function () {

            try {
                const identity = await client.platform.identities.get(dappIdentityId);  // dapp identity

                // create document
                docProperties = {
                    header: 'Request Document ST',
                    dappname: 'Simple Browser Dapp',
                    reference: inputUsername,
                    status: '0',
                    timestamp: new Date().toUTCString(),
                    STcontract: messageContractId,
                    STdocument: 'message',
                    STcontent: '{ "header" : "Response Login", "dappname" : "Simple Browser Dapp", "reference" : "' + inputUsername + '", "STcontract" : "' + messageContractId + '", "STdocument" : "message" }',
                }

                // Create the note document
                const messageDocument = await client.platform.documents.create(
                    'msgContract.message',
                    identity,
                    docProperties,
                );

                const documentBatch = {
                    create: [messageDocument],
                    replace: [],
                    delete: [],
                }

                // Sign and submit the document
                await client.platform.documents.broadcast(documentBatch, identity);
            } catch (e) {
                console.error('Something went wrong:', e);
            } finally {
                console.log("submited Request Document ST for user: " + inputUsername)
                client.disconnect();
            }
        };
        await submitMessageDocument();


        console.log("start polling for Response Login")
        async function polling() {
            var recordLocator = "msgContract.message";

            try {
                var isHead = false;
                var nStart = 1;

                while (true) {

                    queryString = '{ "startAt" : "' + nStart + '" }';
                    queryJson = JSON.parse(queryString);
                    console.log("Poll document startAt: " + nStart)
                    let documents = await client.platform.documents.get(recordLocator, queryJson);

                    // find head document (can only poll 100 documents at once)
                    if (isHead == false) {
                        if (documents.length == 0) {
                            console.log("Found head at doc nr " + nStart)
                            isHead = true;
                            await new Promise(r => setTimeout(r, 1500));  // sleep x ms
                        }
                        nStart = nStart + documents.length;
                        continue;
                    }
                    
                    if (documents.length >= 1 && documents[0].ownerId.toString() == identityID && documents[0].data.reference == inputUsername) {
                        console.log("Received valid Response Login document")
                        return true;
                    }
                    await new Promise(r => setTimeout(r, 1500));  // sleep x ms
                    if (documents.length >= 1) nStart++;
                }
                return false;

            } catch (e) {
                console.error('Something went wrong:', e);
            } finally {
                client.disconnect()
            }
        }
        var response = await polling();
        console.log("response: " + response)

        if (response) {
            sessionStorage.setItem('dash_username', $("#inputUsername").val());
            sessionStorage.setItem('dash_identityID', identityID);
            console.log("username set: " + $("#inputUsername").val())
            window.location.href = "./index.html";
        }

        $("#submitBtn").prop('disabled', false);
        console.log("done")

    });


});
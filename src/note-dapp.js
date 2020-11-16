// const dappIdentityId = '8FDzB5kcpXtFQcWACXck2akHHG4nR9G4mP6gqPBGZVSi';    // todo, fetch from mnemonic when dashjs support
// const messageContractId = 'B5tT3N8cVjo7bC9yNh3LGKjbvQhWDN6MGHog4oinwLMn';
// const noteContractId = '8JnYfRf3hvQuA2UJksc9QtfS5mEPzUxYbjPvzmsFv6x5';

$(document).ready(function () {

    let username = sessionStorage.getItem('dash_username');
    if (username != null) {
        $("#signinbutton").removeClass('btn-success').addClass('btn-info');
        $("#signinbutton").val(username)
    }

    $("#exampleFormControlDate").val(new Date().toUTCString());

    $("#submitBtn").click(async function () {
        console.log("click")

        $("#submitBtn").prop('disabled', true);

        var clientOpts = {};
        clientOpts.network = 'evonet';
        clientOpts.wallet = {};
        clientOpts.wallet.mnemonic = dappMnemonic;
        var curApps = '{ "messageContract" : { "contractId" : "' + messageContractId + '" } }';
        curApps = JSON.parse(curApps);
        clientOpts.apps = curApps;

        const client = new Dash.Client(clientOpts);

        const submitNoteDocument = async function () {

            try {
                const identity = await client.platform.identities.get(dappIdentityId);  // dapp identity

                //// dapp signing simple
                docProperties = {
                    header: 'Request Document ST',
                    dappname: 'Simple Browser Dapp',
                    reference: username,
                    status: '0',
                    timestamp: new Date().toUTCString(),
                    STcontract: noteContractId,
                    STdocument: 'note',
                    // STcontent: '{ "date" : "' + $("#exampleFormControlDate").val() + '", "title" : "' + $("#exampleFormControlTitle").val() + '", "message" : "' + $("#exampleFormControlTextarea").val() + '", "encrypted" : "' + $("#exampleCheck").prop('checked') + '"}'
                    STcontent: '{ "date" : "' + $("#exampleFormControlDate").val() + '", "title" : "' + $("#exampleFormControlTitle").val() + '", "message" : "' + $("#exampleFormControlTextarea").val() + '"}'
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
                console.log("submited Note document with message: " + $("#exampleFormControlTextarea").val())
                client.disconnect();
            }
        };
        await submitNoteDocument();
        $("#submitBtn").prop('disabled', false);
        console.log("done")

    });
});
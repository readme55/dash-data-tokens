let clientOpts = {};
clientOpts.network = dashNetwork;
clientOpts.wallet = {};
clientOpts.wallet.mnemonic = dappMnemonic;
// clientOpts.wallet.adapter = localforage;

const client = new Dash.Client(clientOpts);
client.getApps().set("messageContract", { "contractId": messageContractId });


const submitDataContractCreationMessage = async function (dappname, username, dataContractJson) {

    const dataContractString = JSON.stringify(dataContractJson);
    try {
        let identity = await client.platform.identities.get(dappIdentityId);  // dapp identity, TODO: find solution for mainnet

        // dapp signing simple
        docProperties = {
            header: 'Request ContractCreation ST',
            dappname: dappname,
            reference: username,
            status: '0',
            timestamp: new Date().toUTCString(),
            STcontract: dataContractString
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
        console.log("Successfully send Data Contract Create Request " + dataContractString)
    }
};


const submitDocumentCreationMessage = async function (dappname, username, contractId, documentJson) {

    try {
        let identity = await client.platform.identities.get(dappIdentityId);  // dapp identity

        let documentStr = JSON.stringify(documentJson);

        //// dapp signing simple
        docProperties = {
            header: 'Request Document ST',
            dappname: dappname,
            reference: username,
            status: '0',
            timestamp: new Date().toUTCString(),
            STcontract: contractId,
            STdocument: 'token',
            STcontent: documentStr
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
        console.log("Successfully send Document Create Request for contract id " + contractId)
        // console.log(documentStr) // variable not available here
    }

}


const dappLoginAuthRequest = async function (inputUsername) {

    let identityId = '';

    try {
        const platform = client.platform;

        //const account = await client.getWalletAccount();
        // const identityId = (await account).getIdentityIds();

        let identity = await platform.identities.get(dappIdentityId); // dapp identity

        //let contents = fs.readFileSync('./plugins/DashCraftPlugin/readme1.txt', 'utf8');
        console.log("Command line argument given: " + inputUsername)

        // get identity ID for user
        console.log("fetch identity ID from username")
        async function getIdentityId() {

            try {

                const identityIdRecord = await client.platform.names.resolve(inputUsername + ".dash");
                identityId = identityIdRecord.data.records.dashUniqueIdentityId.toString()
                console.log(identityId);

            } catch (e) {
                console.error('Something went wrong:', e);
            } finally {
                // client.disconnect()
            }
        }
        await getIdentityId();


        // submit auth request to wallet
        console.log("submit Authentication Request")
        const submitAuthRequest = async function () {

            try {

                // create document
                docProperties = {
                    header: 'Request Document ST',
                    dappname: 'Dashcraft Dapp',
                    reference: inputUsername,
                    status: '0',
                    timestamp: new Date().toUTCString(),
                    STcontract: messageContractId,
                    STdocument: 'message',
                    STcontent: '{ "header" : "Response Login", "dappname" : "Dashcraft Dapp", "reference" : "' + inputUsername + '", "timestamp" : "' + new Date().toUTCString() + '", "STcontract" : "' + messageContractId + '", "STdocument" : "message" }',
                }

                // Create the note document
                const messageDocument = await client.platform.documents.create(
                    'messageContract.message',
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
                // client.disconnect();
            }
        };
        submitAuthRequest();


        console.log("start polling for Authentication Response")
        async function pollAuthResponse() {
            let recordLocator = "messageContract.message";

            try {
                let isHead = false;
                let nStart = 1;

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
                    
                    if (documents.length >= 1 && documents[0].ownerId.toString() == identityId && documents[0].data.reference == inputUsername) {
                        console.log("Received valid Authentication Response")
                        return true;
                    }
                    await new Promise(r => setTimeout(r, 1500));  // sleep x ms
                    if (documents.length >= 1) nStart++;
                }
                // return false;

            } catch (e) {
                console.error('Something went wrong:', e);
            } finally {
                // client.disconnect()
            }
        }
        let response = await pollAuthResponse();
        console.log("response: " + response)


    } catch (e) {
        console.error('Something went wrong:', e);
    } finally {
        console.log("disconnect")
        // client.disconnect();
    }
};
// dappLoginAuthRequest()


// TODO add request payment tx
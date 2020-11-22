let clientOpts = {};
clientOpts.network = 'evonet';
clientOpts.wallet = {};
clientOpts.wallet.mnemonic = dappMnemonic;

const client = new Dash.Client(clientOpts);
client.getApps().set("messageContract", { "contractId": messageContractId });


const submitDataContractCreationMessage = async function (dappname, username, dataContractJson) {

    const dataContractString = JSON.stringify(dataContractJson);
    try {
        const identity = await client.platform.identities.get(dappIdentityId);  // dapp identity, TODO: find solution for mainnet

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
        const identity = await client.platform.identities.get(dappIdentityId);  // dapp identity

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
        console.log(documentStr)
    }

}


// TODO add request payment tx
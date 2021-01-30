let submitBtn = document.getElementById('submitBtn');
let submitText = document.getElementById('submitText');
// let submitText = document.getElementById('submitText');
// let submitText = document.getElementById('submitText');
// let submitText = document.getElementById('submitText');

// Mnemonic: toddler repair print phrase crouch curve charge typical swap bachelor outer upgrade
// { user identity: 'DUxf95cCdPTor7BfWMXmr2VmHQqdKMPQv6fauecy7Wuy' }
// name: dappuser
// identityID used for the messageContract:
// { identity: '14c3vc1qdsCgfPNVkxnZuJJyibAx4aQGsQPtUhkrStVt' }
// contractID: mA1kafwtR8HGoZamz72fmUWGGXKjDFLqmirtZbJYYoT

const typeSizes = {
  "undefined": () => 0,
  "boolean": () => 4,
  "number": () => 8,
  "string": item => 2 * item.length,
  "object": item => !item ? 0 : Object
    .keys(item)
    .reduce((total, key) => sizeOf(key) + sizeOf(item[key]) + total, 0)
};

const sizeOf = value => typeSizes[typeof value](value);


submitBtn.addEventListener('click', function () {
  console.log("click")
  submitBtn.disabled = true;

  const clientOpts = {
    network: dashNetwork,
    wallet: {
      mnemonic: dappMnemonic,
      adapter: localforage
    }
  };
  const client = new Dash.Client(clientOpts);

  client.getApps().set("tokenContract", { "contractId": 'DY6KmhAsLqrkTxJWA7KAJA3vR4wHhExHqSYXLWitdxuu' });
  const platform = client.platform;
  

  const submitNoteDocument = async function () {

    try {
      // const account = await client.getWalletAccount();
      const identity = await client.platform.identities.get(dappIdentityId);

      docProperties = {
          version: 1,
          name: 'Evaluation',
          symbol: 'eva5',
          decimals: 8,
          sender: dappIdentityId,   
          recipient: dappIdentityId,    // dapp login user identityId
          amount: '1',
          data: 'test evaluation',
          owner: dappIdentityId,
          balance: '1000',
          lastValIndTransfer: 0,
          lastValIndTransferFrom: 0
      }
  
      // Create the note document
      // const noteDocument = await platform.documents.create(
      //   'tokenContract.token',
      //   identity,
      //   docProperties,
      // );

      // const noteDocument1 = await platform.documents.create(
      //   'tokenContract.token',
      //   identity,
      //   docProperties,
      // );
  
      // const documentBatch = {
      //   create: [noteDocument],
      //   replace: [],
      //   delete: [],
      // }

      var documentBatch = {
        create: [],
        replace: [],
        delete: [],
      }

      var start = new Date().getTime();

      for (m = 0; m < 20; m++) {
        console.log("ROUND " + m)

        for (i = 0; i < 3; i++) {

          let noteDocument1 = await platform.documents.create(
            'tokenContract.token',
            identity,
            docProperties,
          );

          // console.log(documentBatch['create'][0].data.symbol)
          documentBatch['create'][i] = noteDocument1;
          // documentBatch['replace'][i] = '';
          // documentBatch['delete'][i] = '';
        }

        // get size
        console.log(sizeOf(documentBatch))

        // Sign and submit the document
        await platform.documents.broadcast(documentBatch, identity);
        console.log("fin")
      }
      var end = new Date().getTime();
      var time = end - start;
      console.log("RUNTIME " + time)

    } catch (e) {
      console.error('Something went wrong:', e);
    } finally {
      console.log("submited login document with message: " + submitText.value)
      // client.disconnect();
    }
  };
  submitNoteDocument();
  submitBtn.disabled = false;
  console.log("done")

}, false);









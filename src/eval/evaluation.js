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

// get byte size of object
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
  let cnt = 1;

  const submitEvalDocuments = async function () {

    try {
      // const account = await client.getWalletAccount();
      const identity = await client.platform.identities.get(dappIdentityId);

      const docProperties = {
          version: 1,
          name: 'Evaluation',
          symbol: 'eva7',
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

      for (m = 0; m < 500; m++) {
        console.log("ROUND " + cnt)
        cnt++;

        for (i = 0; i < 3; i++) {

          let docEval = await platform.documents.create(
            'tokenContract.token',
            identity,
            docProperties,
          );
          
          // ST size test:
          // let doc = await client.platform.names.resolve('readme.dash');  // dpns doc
          // let doc = docEval; // token doc

          // console.dir(doc)
          // console.dir(doc.data)
          // console.dir(doc.toJSON())
          // // console.dir(doc[0].data)
          // console.log("size bytes dpns doc " + sizeOf(doc))
          // console.log("size bytes dpns doc .data " + sizeOf(doc.data))
          // console.log("size bytes dpns doc .toJSON() " + sizeOf(doc.toJSON()))
          // console.log("size bytes dpns doc .toBuffer()" + sizeOf(doc.toBuffer()))
          
          // console.log("size bytes dpns document " + sizeOf(doc[0].data))
          // console.log("size bytes document.toBuffer() " + sizeOf(doc[0].data.toBuffer()))

          // console.log(documentBatch['create'][0].data.symbol)
          documentBatch['create'][i] = docEval;
          // documentBatch['replace'][i] = '';
          // documentBatch['delete'][i] = '';
        }

        // get size
        console.log("Size: " + sizeOf(documentBatch))

        // Sign and submit the document
        await platform.documents.broadcast(documentBatch, identity);
        // console.log("fin")
      }
      var end = new Date().getTime();
      var time = end - start;
      console.log("RUNTIME " + time)

    } catch (e) {
      console.error('Something went wrong:', e);
    } finally {
      console.log("RESTART")
      submitEvalDocuments();

      // client.disconnect();
    }
  };
  submitEvalDocuments();
  submitBtn.disabled = false;
  console.log("done")

}, false);


let submitBtn = document.getElementById('submitBtn');
let submitText = document.getElementById('submitText');


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

      // var start = new Date().getTime();
      var start = recordTime();

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
          // console.log("size bytes doc sizeOf(doc) " + sizeOf(doc))
          // console.log("size bytes doc sizeOf(doc.data) " + sizeOf(doc.data))
          // console.log("size bytes doc sizeOf(doc.toJSON() " + sizeOf(doc.toJSON()))
          // console.log("size bytes doc sizeOf(doc.toBuffer() " + sizeOf(doc.toBuffer()))
          // fail;  

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
      // var end = new Date().getTime();
      var end = recordTime();
      var time = deltaTime(start, end)
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


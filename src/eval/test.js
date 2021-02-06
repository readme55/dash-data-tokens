"use strict"

let submitBtn = document.getElementById('submitBtn');
let submitText = document.getElementById('submitText');

// let testBigInt = 10n;
// let testString = 'test';

// assert(typeof testBigInt === "BigInt");
// assert(typeof testString === "string");

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
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

submitBtn.addEventListener('click', function () {
  console.log("click")
  submitBtn.disabled = true;

  const clientOpts = {
    network: 'testnet',
    mnemonic: 'velvet timber under input escape rich gauge final submit burst glow garage',  // vendor 
    apps: {
      messageContract: {
        contractId: 'B5tT3N8cVjo7bC9yNh3LGKjbvQhWDN6MGHog4oinwLMn'  // message contract
      }
    }
  };
  const client = new Dash.Client(clientOpts);

  const submitNoteDocument = async function () {

    await client.isReady();

    try {
      const identity = await client.platform.identities.get('8FDzB5kcpXtFQcWACXck2akHHG4nR9G4mP6gqPBGZVSi');  // vendor identity

      //// dapp signing original
      // var docProperties = {
      //   nonce: 'eyJ0eXBlIjoiQnVmZmVyIiwiZGF0YSI6WzMsNzksMjM0LDcyLDc4LDE3MywxMzgsMjA2LDM3LDIzMiwyNyw4MCwxNDksNTMsMTkzLDIxNiwyNDEsMjE0LDI0OSwxMDEsMTI2LDM1LDQ1LDQzLDE2NCw5NCw5NywyLDI0NSwyNTIsMTMyLDUyLDExNSwxMDcsMTMsMTgxLDM2LDMxLDksMjIyLDI1MiwxMjEsMTQyLDE1NSwyNDYsMTk4LDQxLDE0MywyMDgsMjQwLDEsMTAsMTA1LDI1LDksMTQ4LDE1MiwyMTQsMjM1LDI0NywxOTMsMjA2LDY1LDEwNCw1MSwyNSwyMTksNDAsMTA2LDg3LDMxLDEyMSwxMjgsMTY1LDMwLDczLDU3LDEyMCw3NSwxNzksMTkxLDE0MCwxMDcsMTI4LDE1NSwxNjksMSwyMzksMTE0LDI0NiwxODEsMjI3LDIxOSwxMzksMTA0LDE3Myw5OCwyNSwyMTAsMTE0LDUwLDg2LDcwLDE1Niw4MiwxNywxMjMsMTU3LDYzLDE4MSwyMCwxMzcsMTg5LDE3Miw3OCwyMTEsMTI5LDExMCw5NiwyNDksNzgsMjM0LDIzLDI0MCwzNiwyNDUsMTcyLDIzMSwxOTRdfQ==',
      //   reference: '3w9znscBUiz8YdPNAtnMEDpdjZcECvybdLEuVGXmBN4y',
      //   uid_pin: 'eyJ0eXBlIjoiQnVmZmVyIiwiZGF0YSI6WzMsMTkzLDE2MiwxOTMsMjEwLDIwOSwzOCwxMDAsODUsMjM1LDEyNSw4LDQ0LDg0LDU2LDQ2LDIxMywxNjYsOTUsMjAyLDIyNywzMiwxODYsMjA5LDE3NywxNTQsMTc2LDE1MCwxMzcsMTU4LDExOSwyOSw4OCwyMDksODQsMjE3LDM3LDEzLDE3OCwyNTMsMjIsNTIsMTM2LDEzNCw3MiwyMjYsMTIyLDIyOSwyMjcsMzcsMTkwLDEwMyw0OCwyMzksMTA5LDk2LDIyMCwzMCwxNjIsMjE0LDI0OCw1NCwxMDEsMTY3LDE0NiwyMTUsMTQ1LDExMCwxOTAsMywyMDAsMjQzLDI2LDY1LDE4MSwxMzMsMTQ3LDY0LDIxMSwxNjYsOTAsNTMsMjAsMjA1LDIyNSw3NSwyMCwzMSwyMDgsMTE2LDc5LDE5NCwxOTQsNTYsMjM3LDk5LDk5LDE2OSw4NywxNzIsMSwyMzcsMjE1LDcxLDIwNCwyMzEsNjgsNTIsMzAsNzAsMTcwLDYzLDU2LDUxLDI1NSwzLDE4LDY5LDI2LDM1LDU2LDQzLDE1NywzOSwxNTksODcsMjUyLDIxMCwxNTFdfQ==',
      //   temp_dappname: 'readme dapp browser sample',
      //   temp_timestamp: submitText.value + ' ' + new Date().toUTCString()
      // }

      //// dapp signing simple
      // docProperties = {
      //   header: 'Request',
      //   dappname: 'Simple Browser Dapp',
      //   reference: '3w9znscBUiz8YdPNAtnMEDpdjZcECvybdLEuVGXmBN4y', // target user docID (here readme atm, TODO change)
      //   status: '0',
      //   timestamp: new Date().toUTCString(),
      //   targetcontract: 'HeRMurhKjLvLrFTmRBQC5VSco7VURpqktoT4GVaPS2EW',
      //   targetdocument: 'note',
      //   // targetcontent: '{ "message": "test note message by readme"}'
      //   targetcontent: '{ "message" : "' + submitText.value + '"}'
      // }

      //// Create the note document
      // const noteDocument = await client.platform.documents.create(
      //   'messageContract.message',
      //   identity,
      //   docProperties,
      // );

      // const documentBatch = {
      //   create: [noteDocument],
      //   replace: [],
      //   delete: [],
      // }

      //// Sign and submit the document
      // await client.platform.documents.broadcast(documentBatch, identity);

      
    } catch (e) {
      console.error('Something went wrong:', e);
    } finally {
      console.log("submited login document with message: " + submitText.value)
      client.disconnect();
    }
  };
  submitNoteDocument();
  submitBtn.disabled = false;
  console.log("done")

}, false);









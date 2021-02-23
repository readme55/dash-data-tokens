// "use strict"

let submitBtn = document.getElementById('submitBtn');
let submitText = document.getElementById('submitText');

// let testBigInt = 10n;
// let testString = 'test';

// assert(typeof testBigInt === "BigInt");
// assert(typeof testString === "string");

submitBtn.addEventListener('click', async function () {
  console.log("click")
  submitBtn.disabled = true;

  client.getApps().set("tokenContract", { "contractId": funToken });
  const platform = client.platform;

  let tokenContractId = funToken;

  let balance;
  let tName;
  let tSymbol;
  let tDecimals;
  let tRecipient;
  let tAmount;
  let docProperties;
  let documentBatch;
  let testDoc;

  let origBalance;
  let validAmount = 100000000n;

  const submitTestDocuments = async function () {

    try {
      const identity = await client.platform.identities.get(dappIdentityId);

      // test 1
      console.log("----------run test 1: valid tx amount 1")
      await processDocumentChain(tokenContractId, dappIdentityId);

      balance = getAccBalance();
      origBalance = balance;
      tName = name();
      tSymbol = symbol();
      tDecimals = parseInt(decimals());

      console.log("Current Balance: " + balance)

      tRecipient = '5uvhMEpiCDLYA2oqTq3WHcxMb1QJQKMeYFSfFisuPFdE';  // readme
      tAmount = validAmount.toString();

      docProperties = createValidTx(tName, tSymbol, tDecimals, tRecipient, tAmount, balance.toString(), 'amount 1 token')

      documentBatch = {
        create: [],
        replace: [],
        delete: [],
      }

      testDoc = await platform.documents.create(
        'tokenContract.token',
        identity,
        docProperties,
      );

      documentBatch['create'][0] = testDoc;

      await platform.documents.broadcast(documentBatch, identity);


      // test 2
      console.log("----------run test 2: amount bigger balance")
      await processDocumentChain(tokenContractId, dappIdentityId);

      balance = getAccBalance();
      tName = name();
      tSymbol = symbol();
      tDecimals = decimals();

      console.log("Current Balance: " + balance)

      tRecipient = '5uvhMEpiCDLYA2oqTq3WHcxMb1QJQKMeYFSfFisuPFdE';  // readme
      tAmount = '100000000000000';

      docProperties = createInvalidTx(tName, tSymbol, tDecimals, dappIdentityId, tRecipient, tAmount, dappIdentityId, balance.toString(), 'amount bigger balance')

      documentBatch = {
        create: [],
        replace: [],
        delete: [],
      }

      testDoc = await platform.documents.create(
        'tokenContract.token',
        identity,
        docProperties,
      );

      documentBatch['create'][0] = testDoc;

      await platform.documents.broadcast(documentBatch, identity);


      // test 3
      // console.log("run test 3: negative amount")
      // await processDocumentChain(tokenContractId, dappIdentityId);

      // balance = getAccBalance();
      // tName = name();
      // tSymbol = symbol();
      // tDecimals = decimals();
      
      // console.log("Current Balance: " + balance)

      // // tRecipient = '5uvhMEpiCDLYA2oqTq3WHcxMb1QJQKMeYFSfFisuPFdE';  // readme
      // tAmount = '-100000000';

      // docProperties = invalidTx(tName, tSymbol, tDecimals, dappIdentityId, tRecipient, tAmount, dappIdentityId, balance.toString(), 'negative amount')

      // documentBatch = {
      //   create: [],
      //   replace: [],
      //   delete: [],
      // }

      // testDoc = await platform.documents.create(
      //   'tokenContract.token',
      //   identity,
      //   docProperties,
      // );

      // documentBatch['create'][0] = testDoc;

      // await platform.documents.broadcast(documentBatch, identity);


      // test 4
      console.log("----------run test 4: Send zero amount tx")
      await processDocumentChain(tokenContractId, dappIdentityId);

      balance = getAccBalance();
      tName = name();
      tSymbol = symbol();
      tDecimals = decimals();
      
      console.log("Current Balance: " + balance)

      tRecipient = '5uvhMEpiCDLYA2oqTq3WHcxMb1QJQKMeYFSfFisuPFdE';  // readme
      tAmount = '0';

      docProperties = createValidTx(tName, tSymbol, tDecimals, tRecipient, tAmount, balance.toString(), 'zero amount')

      documentBatch = {
        create: [],
        replace: [],
        delete: [],
      }

      testDoc = await platform.documents.create(
        'tokenContract.token',
        identity,
        docProperties,
      );

      documentBatch['create'][0] = testDoc;

      await platform.documents.broadcast(documentBatch, identity);



      // test 5
      console.log("----------run test 5: wrong sender")
      await processDocumentChain(tokenContractId, dappIdentityId);

      balance = getAccBalance();
      tName = name();
      tSymbol = symbol();
      tDecimals = decimals();
      
      console.log("Current Balance: " + balance)

      tRecipient = '5uvhMEpiCDLYA2oqTq3WHcxMb1QJQKMeYFSfFisuPFdE';  // readme
      tAmount = validAmount.toString();

      docProperties = createInvalidTx(tName, tSymbol, tDecimals, '5uvhMEpiCDLYA2oqTq3WHcxMb1QJQKMeYFSfFisuPFdE', tRecipient, tAmount, dappIdentityId, balance.toString(), 'wrong sender')

      documentBatch = {
        create: [],
        replace: [],
        delete: [],
      }

      testDoc = await platform.documents.create(
        'tokenContract.token',
        identity,
        docProperties,
      );

      documentBatch['create'][0] = testDoc;

      await platform.documents.broadcast(documentBatch, identity);


      // test 6
      console.log("----------run test 6: mint tokens from zero-address")
      await processDocumentChain(tokenContractId, dappIdentityId);

      balance = getAccBalance();
      tName = name();
      tSymbol = symbol();
      tDecimals = decimals();
      
      console.log("Current Balance: " + balance)

      // tRecipient = '5uvhMEpiCDLYA2oqTq3WHcxMb1QJQKMeYFSfFisuPFdE';  // readme
      tAmount = validAmount.toString();

      docProperties = createInvalidTx(tName, tSymbol, tDecimals, '1'.repeat(42), tRecipient, tAmount, dappIdentityId, balance.toString(), 'mint tokens')

      documentBatch = {
        create: [],
        replace: [],
        delete: [],
      }

      testDoc = await platform.documents.create(
        'tokenContract.token',
        identity,
        docProperties,
      );

      documentBatch['create'][0] = testDoc;

      await platform.documents.broadcast(documentBatch, identity);



      // test 7
      console.log("----------run test 7: duplicate tx")
      await processDocumentChain(tokenContractId, dappIdentityId);

      balance = origBalance;
      tName = name();
      tSymbol = symbol();
      tDecimals = decimals();
      
      console.log("Current Balance: " + balance)

      // tRecipient = '5uvhMEpiCDLYA2oqTq3WHcxMb1QJQKMeYFSfFisuPFdE';  // readme
      tAmount = validAmount.toString();

      docProperties = createInvalidTx(tName, tSymbol, tDecimals, dappIdentityId, tRecipient, tAmount, dappIdentityId, balance.toString(), 'duplicate')

      documentBatch = {
        create: [],
        replace: [],
        delete: [],
      }

      testDoc = await platform.documents.create(
        'tokenContract.token',
        identity,
        docProperties,
      );

      documentBatch['create'][0] = testDoc;

      await platform.documents.broadcast(documentBatch, identity);

      testComplete = true;


    } catch (e) {
      console.error('Something went wrong:', e);
      console.log('Testing aborted')
      fail;
    } finally {
      console.log("submited login document with message: " + submitText.value)
      // client.disconnect();
    }
  };
  await submitTestDocuments();
  submitBtn.disabled = false;
  console.log("done")

  balance = getAccBalance();

  console.log("Finish testing!")
  console.log("Original balance: " + origBalance)
  console.log("Final balance " + balance)
  if(origBalance - validAmount === balance) {
    console.log("Testing successful")
  } else {
    console.log("Testing un-successful! Check logs")
  }

}, false);
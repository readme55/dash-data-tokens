// v1 4th: 946mB3VPhRCBNhJbXGvuR9YqpHaXPbUr3GvpqsKTnSN7
// v2 6th: J1WMq7jEcUNitVaD4SpGM4s2FcHqbMFQ27s2dpnYnwhS

// cloud identID: AfZxsSWVKxDpHkXHQDqhEbyZYmfNcAgKq76TLCab4ZiD
// dappuser identID: 72xw6JyFKeRjMBNJpEU6vaq9oCpmTMi5dEF7jenN3Btp
// wealth recycle unit rocket milk defy alter just into inquiry universe cloth

$(document).ready(function () {

    let username = sessionStorage.getItem('dash_username');
    // let username = "readme"; // static for testing
    if (username != null) {
        $("#signinbutton").removeClass('btn-success').addClass('btn-info');
        $("#signinbutton").val(username);
    }
    let identityId = sessionStorage.getItem('dash_identityID');
    // let identityId = "5uvhMEpiCDLYA2oqTq3WHcxMb1QJQKMeYFSfFisuPFdE"  // static for testing

     $("#formTokenContract").val(funToken);    // Token Contract static for testing, comment to disable

    // set buttons after load
    $("#receiveBtn").prop('disabled', true);
    $("#sendBtn").prop('disabled', true);
    // $("#initBtn").prop('disabled', true);

    
    $("#receiveBtn").prop('disabled', false);

    $("#formTokenContract").change(function () {
        if ($("#formTokenContract").val() == "") {  // if contract input field is empty
            $("#createBtn").prop('disabled', false);
            $("#initBtn").prop('disabled', true);
            $("#receiveBtn").prop('disabled', true);
            $("#sendBtn").prop('disabled', true);
            $("#searchBtn").prop('disabled', true);
            $("#totalSupplyBtn").prop('disabled', true);
            // $("#formTokenName").prop('readonly', false);
            // $("#formTokenSymbol").prop('readonly', false);
            // $("#formTokenAmount").prop('readonly', false);
            // $("#formTokenDecimals").prop('readonly', false);
        } else {    // if filled
            $("#createBtn").prop('disabled', true);
            $("#initBtn").prop('disabled', false);
            $("#receiveBtn").prop('disabled', false);
            $("#sendBtn").prop('disabled', true);
            $("#totalSupplyBtn").prop('disabled', true);
            // $("#formTokenName").prop('readonly', true);
            // $("#formTokenSymbol").prop('readonly', true);
            // $("#formTokenAmount").prop('readonly', true);
            // $("#formTokenDecimals").prop('readonly', true);
        }
    });


    // $("#exampleFormControlUser").val(dappAddress)    // remove ? not used in html

    $("#createBtn").click(async function () {

        console.log("click create data contract")
        $("#createBtn").prop('disabled', true);

        await createTokenContract('Token Dapp', username);

        $("#createBtn").prop('disabled', false);
        console.log("done")

    });


    $("#initBtn").click(async function () {
        console.log("click init token amount")
        $("#initBtn").prop('disabled', true);
        $("#receiveBtn").prop('disabled', true);

        const tokenContractId = $("#formTokenContract").val().trim();
        const tokenVersion = 1;
        const tokenName = $("#formTokenName").val();
        const tokenSymbol = $("#formTokenSymbol").val();
        const tokenDecimals = parseInt($("#formTokenDecimals").val());
        const tokenSender = '1'.repeat(42);    // could force check same identityId then dataContract creator and initiator...
        const tokenRecipient = identityId;   // dapp login user identityId
        const tokenAmount = str2bigInt($("#formTokenAmount").val()).toString();    // Init token amount value
        const tokenOwner = identityId;  // TODO remove bc redundant with ownerId ? perhaps need for approve and transferFrom !
        const tokenBalance = "0";   // TODO: check whats standard here

        const initDocumentTxJson = {
            version: tokenVersion,
            name: tokenName,
            symbol: tokenSymbol,
            decimals: tokenDecimals,
            sender: tokenSender,   
            recipient: tokenRecipient,    // dapp login user identityId
            amount: tokenAmount,
            owner: tokenOwner,
            balance: tokenBalance,
            lastValIndTransfer: -1,
            lastValIndTransferFrom: -1
        }

        await mintTokenDocument('Token Dapp', username, tokenContractId, initDocumentTxJson);

        // $("#initBtn").prop('disabled', false);
        $("#receiveBtn").prop('disabled', false);
        console.log("done")

    });


    $("#receiveBtn").click(async function () {

        console.log("click validate balance")
        $("#receiveBtn").prop('disabled', true);

        const tokenContractId = $("#formTokenContract").val().trim();
        await processDocumentChain(tokenContractId, identityId);

        $("#formTokenName").val(name())
        $("#formTokenSymbol").val(symbol())
        $("#formTokenDecimals").val(decimals())

        // token amount and balance - divide by decimals to get user representation
        $("#formTokenAmount").val( bigInt2strNum(initialSupply(), decimals()) );
        $("#formBalance").val( bigInt2strNum(getAccBalance(), decimals()) );

        // TODO: move to "load contract" button
        document.getElementById("formAppendTokenSymbol1").innerHTML = symbol();
        document.getElementById("formAppendTokenSymbol2").innerHTML = symbol();
        document.getElementById("formAppendTokenSymbol3").innerHTML = symbol();

        document.getElementById("labelTransferHistory").innerHTML = "Transfer History for " + identityId + " (" + bigInt2strNum(getAccBalance(), decimals()) + " " + symbol() + ")";

        $("#receiveBtn").prop('disabled', false);

        $("#sendBtn").prop('disabled', false);  // activate sendBtn when validated successfully
        $("#totalSupplyBtn").prop('disabled', false);   // activate totalSupplyBtn when chain processed once

        let historyOutput = await getTxHistory(identityId, getDocuments(), getMapDocuments(), getAccBalanceHistory(), decimals());
        $("#formHistoryOutput").val(historyOutput)

        console.log("done")

    });


    $("#sendBtn").click(async function () {

        console.log("click send token")
        $("#sendBtn").prop('disabled', true);

        const tokenContractId = $("#formTokenContract").val().trim();
        const tokenVersion = 1;
        const tokenName = $("#formTokenName").val();
        const tokenSymbol = $("#formTokenSymbol").val();
        const tokenDecimals = parseInt($("#formTokenDecimals").val());
        const tokenSender = identityId;
        const tokenRecipient = await resolveIdentity($("#formWithdrawUser").val().trim());
        const tokenAmount = str2bigInt($("#formSendAmount").val()).toString();
        const tokenOwner = identityId;
        const tokenBalance = str2bigInt($("#formBalance").val()).toString();
        const tokenData = $("#formSendData").val();

        console.log("Recipient: " + tokenRecipient)

        const contractTxJson = {
            version: tokenVersion,
            name: tokenName,
            symbol: tokenSymbol,
            decimals: tokenDecimals,
            sender: tokenSender,   
            recipient: tokenRecipient,    // dapp login user identityId
            amount: tokenAmount,
            data: tokenData,
            owner: tokenOwner,
            balance: tokenBalance,
            lastValIndTransfer: mapWithdraw[0],
            lastValIndTransferFrom: mapDeposit[0]
        }
        
        await sendTokenDocument('Token Dapp', username, tokenContractId, contractTxJson);

        // $("#sendBtn").prop('disabled', false);   // leave disabled until validate balance is called again
        console.log("done")

    });


    $("#searchBtn").click(async function () {

        console.log("Identity Explorer")
        $("#searchBtn").prop('disabled', true);

        const tokenContractId = $("#formTokenContract").val().trim();
        const exploreIdentity = await resolveIdentity($("#formIdentity").val().trim());

        await processDocumentChain(tokenContractId, exploreIdentity);

        $("#formTokenName").val(name())
        $("#formTokenSymbol").val(symbol())
        $("#formTokenAmount").val( bigInt2strNum(initialSupply(), decimals()) )
        $("#formTokenDecimals").val(decimals())
        document.getElementById("labelTransferHistory").innerHTML = "Transfer History for " + exploreIdentity + " (" + bigInt2strNum(getAccBalance(), decimals()) + " " + symbol() + ")";

        let historyOutput = await getTxHistory(exploreIdentity, getDocuments(), getMapDocuments(), getAccBalanceHistory(), decimals());
        $("#formHistoryOutput").val(historyOutput)

        $("#searchBtn").prop('disabled', false);
        console.log("done")

    });


    $("#totalSupplyBtn").click(async function () {
        $("#totalSupplyBtn").prop('disabled', true);

        // const tokenContractId = $("#formTokenContract").val().trim();

        $("#formTotalSupply").val( bigInt2strNum(totalSupply(), decimals()) )
        $("#totalSupplyBtn").prop('disabled', false);
    });


});
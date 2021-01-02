// v1 4th: 946mB3VPhRCBNhJbXGvuR9YqpHaXPbUr3GvpqsKTnSN7
// v2 6th: J1WMq7jEcUNitVaD4SpGM4s2FcHqbMFQ27s2dpnYnwhS

// cloud identID: AfZxsSWVKxDpHkXHQDqhEbyZYmfNcAgKq76TLCab4ZiD
// dappuser identID: 72xw6JyFKeRjMBNJpEU6vaq9oCpmTMi5dEF7jenN3Btp
// wealth recycle unit rocket milk defy alter just into inquiry universe cloth

$(document).ready(function () {

    let username = sessionStorage.getItem('dash_username');
    if (username != null) {
        $("#signinbutton").removeClass('btn-success').addClass('btn-info');
        $("#signinbutton").val(username)
    }
    let identityId = sessionStorage.getItem('dash_identityID');
    // let identityId = "5uvhMEpiCDLYA2oqTq3WHcxMb1QJQKMeYFSfFisuPFdE"  // readme static for testing

     $("#formTokenContract").val("DY6KmhAsLqrkTxJWA7KAJA3vR4wHhExHqSYXLWitdxuu");    // Token Contract static for testing, comment to disable

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
            // $("#formTokenName").prop('readonly', false);
            // $("#formTokenSymbol").prop('readonly', false);
            // $("#formTokenAmount").prop('readonly', false);
            // $("#formTokenDecimals").prop('readonly', false);
        } else {    // if filled
            $("#createBtn").prop('disabled', true);
            $("#initBtn").prop('disabled', false);
            $("#receiveBtn").prop('disabled', false);
            $("#sendBtn").prop('disabled', true);
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
        const tokenAmount = fromUserRep($("#formTokenAmount").val()).toString();    // Init token amount value
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
        $("#formTokenAmount").val( toUserRep(initialSupply(), decimals()) );
        $("#formBalance").val( toUserRep(getUserBalance(), decimals()) );

        document.getElementById("formAppendTokenSymbol").innerHTML = symbol();
        document.getElementById("formAppendTokenSymbol2").innerHTML = symbol();

        document.getElementById("labelTransferHistory").innerHTML = "Transfer History for " + identityId + " (" + toUserRep(getUserBalance(), decimals()) + " " + symbol() + ")";

        $("#receiveBtn").prop('disabled', false);

        $("#sendBtn").prop('disabled', false);  // activate sendBtn when validated successfully

        let historyOutput = await getTxHistory(identityId, getDocuments(), getValidDocList(), getIdentityBalanceHistory(), decimals());
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
        const tokenRecipient = $("#formWithdrawUser").val().trim();
        const tokenAmount = fromUserRep($("#formSendAmount").val()).toString();
        const tokenOwner = identityId;
        const tokenBalance = fromUserRep($("#formBalance").val()).toString();
        const tokenData = $("#formSendData").val();

        console.log(tokenRecipient)

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
            lastValIndTransfer: indWithdrawals[0],
            lastValIndTransferFrom: indDeposits[0]
        }
        
        await sendTokenDocument('Token Dapp', username, tokenContractId, contractTxJson);

        // $("#sendBtn").prop('disabled', false);   // leave disabled until validate balance is called again
        console.log("done")

    });


    $("#searchBtn").click(async function () {

        console.log("Identity Explorer")
        $("#searchBtn").prop('disabled', true);

        const tokenContractId = $("#formTokenContract").val().trim();
        const exploreIdentity = $("#formIdentity").val().trim();

        await processDocumentChain(tokenContractId, exploreIdentity);

        $("#formTokenName").val(name())
        $("#formTokenSymbol").val(symbol())
        $("#formTokenAmount").val( toUserRep(initialSupply(), decimals()) )
        $("#formTokenDecimals").val(decimals())
        document.getElementById("labelTransferHistory").innerHTML = "Transfer History for " + exploreIdentity + " (" + toUserRep(getUserBalance(), decimals()) + " " + symbol() + ")";

        let historyOutput = await getTxHistory(exploreIdentity, getDocuments(), getValidDocList(), getIdentityBalanceHistory(), decimals());
        $("#formHistoryOutput").val(historyOutput)

        $("#searchBtn").prop('disabled', false);
        console.log("done")

    });

});
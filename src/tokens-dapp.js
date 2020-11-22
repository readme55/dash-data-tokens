// v1 4th: 946mB3VPhRCBNhJbXGvuR9YqpHaXPbUr3GvpqsKTnSN7
// v2 6th: J1WMq7jEcUNitVaD4SpGM4s2FcHqbMFQ27s2dpnYnwhS

// cloud identID: AfZxsSWVKxDpHkXHQDqhEbyZYmfNcAgKq76TLCab4ZiD
// dappuser identID: 72xw6JyFKeRjMBNJpEU6vaq9oCpmTMi5dEF7jenN3Btp

$(document).ready(function () {

    let username = sessionStorage.getItem('dash_username');
    if (username != null) {
        $("#signinbutton").removeClass('btn-success').addClass('btn-info');
        $("#signinbutton").val(username)
    }
    let identityId = sessionStorage.getItem('dash_identityID');
    // let identityId = "72xw6JyFKeRjMBNJpEU6vaq9oCpmTMi5dEF7jenN3Btp"  // testing without login


    // set buttons after load
    $("#receiveBtn").prop('disabled', true);
    $("#sendBtn").prop('disabled', true);
    $("#initBtn").prop('disabled', true);

    // set static for testing
    $("#formTokenContract").val("J1WMq7jEcUNitVaD4SpGM4s2FcHqbMFQ27s2dpnYnwhS");
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
        

        await initTokenContract('Token Dapp', username);

        $("#createBtn").prop('disabled', false);
        console.log("done")

    });


    $("#initBtn").click(async function () {
        console.log("click init token amount")
        $("#initBtn").prop('disabled', true);

        const tokenContractId = $("#formTokenContract").val();
        const tokenVersion = 1;
        const tokenName = $("#formTokenName").val();
        const tokenSymbol = $("#formTokenSymbol").val();
        const tokenDecimals = parseInt($("#formTokenDecimals").val());
        const tokenSender = 'genesis document';    // could force check same identityId then dataContract creator and initiator...
        const tokenRecipient = identityId;   // dapp login user identityId
        const tokenAmount = parseFloat($("#formTokenAmount").val());    // Init token amount value (not send amount)
        const tokenOwner = identityId;
        const tokenBalance = parseFloat(0.0);

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

        await initTokenDocument('Token Dapp', username, tokenContractId, initDocumentTxJson);

        // $("#initBtn").prop('disabled', false);
        console.log("done")

    });


    $("#sendBtn").click(async function () {

        console.log("click send token")
        $("#sendBtn").prop('disabled', true);

        const tokenContractId = $("#formTokenContract").val();
        const tokenVersion = 1;
        const tokenName = $("#formTokenName").val();
        const tokenSymbol = $("#formTokenSymbol").val();
        const tokenDecimals = parseInt($("#formTokenDecimals").val());
        const tokenSender = identityId;    // dappuser identityId TODO: fetch auto
        const tokenRecipient = $("#formWithdrawUser").val();
        const tokenAmount = parseFloat($("#formSendAmount").val());
        const tokenOwner = identityId;
        const tokenBalance = parseFloat($("#formBalance").val());

        console.log(tokenRecipient)

        const contractTxJson = {
            version: tokenVersion,
            name: tokenName,
            symbol: tokenSymbol,
            decimals: tokenDecimals,
            sender: tokenSender,   
            recipient: tokenRecipient,    // dapp login user identityId
            amount: tokenAmount,
            owner: tokenOwner,
            balance: tokenBalance,
            lastValIndTransfer: indWithdrawals[0],
            lastValIndTransferFrom: indDeposits[0]
        }
        
        await sendTokenDocument('Token Dapp', username, tokenContractId, contractTxJson);

        // $("#sendBtn").prop('disabled', false);   // leave disabled until validate balance is called again
        console.log("done")

    });


    $("#receiveBtn").click(async function () {

        console.log("click validate balance")
        $("#receiveBtn").prop('disabled', true);

        const tokenContract = $("#formTokenContract").val();
        await validateTokenBalance(tokenContract, identityId);
        
        $("#formBalance").val(getUserBalance());
        $("#formTokenName").val(getTokenName())
        $("#formTokenSymbol").val(getTokenSymbol())
        $("#formTokenAmount").val(getTokenAmount())
        $("#formTokenDecimals").val(getTokenDecimal())

        $("#receiveBtn").prop('disabled', false);

        $("#sendBtn").prop('disabled', false);  // activate sendBtn when validated successfully

        let historyOutput = await getTxHistory(identityId);
        $("#formHistoryOutput").val(historyOutput)

        console.log("done")

    });

});
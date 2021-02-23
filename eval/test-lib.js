const createValidTx = function (tName, tSymbol, tDecimals, tRecipient, tAmount, balance, text) {

    let docProperties = {
        version: 1,
        name: tName,
        symbol: tSymbol,
        decimals: tDecimals,
        sender: dappIdentityId,
        recipient: tRecipient,
        amount: tAmount,
        data: 'test: sending valid tx ' + text,
        owner: dappIdentityId,
        balance: balance,
        lastValIndTransfer: 0,
        lastValIndTransferFrom: 0
    }

    return docProperties;
}

const createInvalidTx = function (tName, tSymbol, tDecimals, senderIdentity, tRecipient, tAmount, ownerIdentity, balance, text) {

    let docProperties = {
        version: 1,
        name: tName,
        symbol: tSymbol,
        decimals: tDecimals,
        sender: senderIdentity,
        recipient: tRecipient,
        amount: tAmount,
        data: 'test: sending invalid tx ' + text,
        owner: ownerIdentity,
        balance: balance,
        lastValIndTransfer: 0,
        lastValIndTransferFrom: 0
    }

    return docProperties;
}

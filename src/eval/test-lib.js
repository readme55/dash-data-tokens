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

const recordTime = function() {
    return new Date().getTime();
}

const deltaTime = function(start, end) {
    return end - start;
}


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


// client.getApps().set("tokenContract", { "contractId": tokenContract });  // may change dynamic, not needed as apps object since CW submits

const dataContractJson = {
    token: {
        indices: [
            // {
            //   "properties": [{ "txnr": "asc" }], "unique": true
            // },
            // {
            //     "properties": [{ "sender": "asc" }], "unique": false
            // },
            {
                "properties": [{ "$ownerId": "asc" }], "unique": false
            },
            {
                "properties": [{ "$createdAt": "asc" }], "unique": false
            },
            {
                "properties": [{ "sender": "asc" }], "unique": false
            },
            {
                "properties": [{ "recipient": "asc" }], "unique": false
            },
        ],
        properties: {
            version: {
                type: "integer"
            },
            name: {
                type: "string"
            },
            symbol: {
                type: "string"
            },
            decimals: {
                type: "integer"
            },
            // totalSupply: {
            //     type: "integer"
            // },
            sender: {
                type: "string",
                maxLength: 44
            },
            recipient: {
                type: "string",
                maxLength: 44
            },
            amount: {
                type: "number"
            },
            owner: {
                type: "string"
            },
            // txnr: {
            //     type: "integer",
            //     "maxLength": 100000
            // },
            // depositAddress: {
            //     type: "string",
            //     "maxLength": 50
            // },
            balance: {
                type: "number"
            },
            lastValIndTransfer: {
                type: "integer",
                maxLength: 5
            },
            lastValIndTransferFrom: {
                type: "integer",
                maxLength: 5
            },
        },
        required: ["$createdAt", "$updatedAt"],
        additionalProperties: false
    }
};

const initTokenContract = async function (dappname, username) {
    
    await submitDataContractCreationMessage(dappname, username, dataContractJson);

}

const initTokenDocument = async function (dappname, username, contractId, documentJson) {

    if (documentJson.sender == 'genesis document' && documentJson.balance == 0.0) {
        await submitDocumentCreationMessage(dappname, username, contractId, documentJson);
    } else {
        console.log("ERROR: not a valid init Token document")
    }

}

const sendTokenDocument = async function (dappname, username, contractId, documentJson) {

    await submitDocumentCreationMessage(dappname, username, contractId, documentJson);

}









const testMass = async function () {

    // test mass documents in browser, result: 3sec for 100M values
    var massLen = 100000000;
    console.log("creating data set with " + massLen + " values")
    var start = new Date().getTime();   // Remember when we started
    var mass = [];
    var result = [];
    var rand = 0;
    for (var i = 0; i < massLen; i++) {
        rand =  Math.floor(Math.random() * 10);
        mass.push(rand);
        // console.log(rand)
    }
    console.log("finish creating dataset, processing now")
    for (var i = 0; i < massLen; i++) {
        if (mass[i] == 1) result.push(mass[i]);
    }
    var end = new Date().getTime(); // Remember when we finished
    console.log(end - start);   // Now calculate and output the difference
    console.log("finish processing, found " + result.length + " matching values")

}
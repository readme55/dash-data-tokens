// NOTE: Sender and Owner redundant to $ownerId. Check if perhaps needed for "transferFrom" ERC-20 method
// balance property required in this implementation, but could be removed (runtime vs. security)
// amount and balance with 78 decimals analogous to uint256

const dataContractJson = {
    token: {
        indices: [
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
                type: "string",
                minLength: 1,
                maxLength: 20,
                pattern: "^[a-zA-Z0-9 ]+$"
            },
            symbol: {
                type: "string",
                minLength: 1,
                maxLength: 5,
                pattern: "^[a-zA-Z0-9]+$"

            },
            decimals: {
                type: "integer"
            },
            sender: {
                type: "string",
                minLength: 42,
                maxLength: 44,
                pattern: "^[123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz]+$"
            },
            recipient: {
                type: "string",
                minLength: 42,
                maxLength: 44,
                pattern: "^[123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz]+$"

            },
            amount: {
                type: "string",
                minLength: 1,
                maxLength: 78,
                pattern: "^[0123456789]+$"
            },
            owner: {
                type: "string",
                minLength: 42,
                maxLength: 44,
                pattern: "^[123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz]+$"
            },
            balance: {
                type: "string",
                minLength: 1,
                maxLength: 78,
                pattern: "^[0123456789]+$"
            },
            data: {
                type: "string",
            },
            lastValIndTransfer: {
                type: "integer",
                // minLength: 1,
                maxLength: 5
            },
            lastValIndTransferFrom: {
                type: "integer",
                // minLength: 1,
                maxLength: 5
            },
        },
        required: ["$createdAt", "$updatedAt", "name", "symbol", "decimals", "sender", "recipient", "amount"],
        additionalProperties: false
    }
};
const DappToken = artifacts.require("DappToken.sol");

contract('DappToken', (accounts) => {

    it("Checks if all values are correctly assign", async () => {
        let tokenInstance = await DappToken.deployed();
        let name = await tokenInstance.name();
        assert.equal(name, "DappToken", "Assign name correctly");

        let symbol = await tokenInstance.symbol();
        assert.equal(symbol, "DAPP", "Assign symbol correctly");

        let standard = await tokenInstance.standard();
        assert.equal(standard, "Dapp Token v1.0", "Assign standard correctly");
    })

    it("Sets total supply on deployment", async () => {
        let tokenInstance = await DappToken.deployed();
        let totalSupply = await tokenInstance.totalSupply()
        assert.equal(totalSupply.toNumber(), 1000000, "Set total supply to 10,00,000")

        let adminBalance = await tokenInstance.balanceOf(accounts[0]);
        // console.log("accounts", accounts[0])
        assert.equal(adminBalance, 1000000, "allocates initial supply to admin")
    })

    it("transfers token ownership", async () => {
        let tokenInstance = await DappToken.deployed();
        tokenInstance.transfer.call(accounts[ 1 ], 9000000).then(assert.fail).catch((err) => {
            assert(err.message.indexOf('revert') >= 0, "error message must contain revert");
        });

        let result = await tokenInstance.transfer.call(accounts[ 1 ], 900);
        assert.equal(result, true, "Function completed successfully");

        // let balance = await tokenInstance.balanceOf(accounts[ 1 ]);
        // console.log("before",balance.toNumber());

        let transaction = await tokenInstance.transfer(accounts[ 1 ], 250000, {from: accounts[0]});
        
        // console.log("trns", transaction)
        assert.equal(transaction.logs.length, 1, "triggers one event");
        assert.equal(transaction.logs[0].event, "Transfer", "Event name should be 'Transfer' ");
        assert.equal(transaction.logs[0].args._from, accounts[0], "logs the account the token are transfered from");
        assert.equal(transaction.logs[0].args._to, accounts[1], "logs the account the token are transfered to");
        assert.equal(transaction.logs[0].args._value, 250000, "logs the transfered amount");



        let balance = await tokenInstance.balanceOf(accounts[ 1 ]);
        // console.log("after",balance.toNumber())
        assert.equal(balance.toNumber(), 250000, "Balance should be added to account" );

        balance = await tokenInstance.balanceOf(accounts[ 0 ]);
        assert.equal(balance.toNumber(), 750000, "Balance should be deducted from account");
    })
})

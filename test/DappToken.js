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

    it("approves token for delegate transfer", async () => {
        let tokenInstance = await DappToken.deployed();

        let approveCall = await tokenInstance.approve.call(accounts[1], 1000);
        // console.log("approveCall", approveCall)
        assert.equal(approveCall, true, "it completes the function")

        let approveFun = await tokenInstance.approve(accounts[1],1000, {from: accounts[0]});

        assert.equal(approveFun.logs.length, 1, "triggers one event");
        assert.equal(approveFun.logs[ 0 ].event, "Approval", "Event name should be 'Approval' ");
        assert.equal(approveFun.logs[ 0 ].args._owner, accounts[ 0 ], "logs the account the token are transfered from");
        assert.equal(approveFun.logs[ 0 ].args._spender, accounts[ 1 ], "logs the account the token are transfered to");
        assert.equal(approveFun.logs[ 0 ].args._value, 1000, "logs the transfered amount");

        let allowance = await tokenInstance.allowance(accounts[0], accounts[1]);
        assert.equal(allowance.toNumber(), 1000, "Stores the allowance for delegated transfer")
    })

    it("handles delegate transfer", async () => {
        let tokenInstance = await DappToken.deployed();
        tokenInstance.transferFrom.call(accounts[ 0 ], accounts[ 2 ], 10000, { from: accounts[ 1 ] }).then(assert.fail).catch((err) => {
            assert(err.message.indexOf('revert') >= 0, "cannot transfer larger than approve amount");
        });

        let transferFromCall = await tokenInstance.transferFrom.call(accounts[ 0 ], accounts[2], 1000, {from: accounts[1]});
        assert.equal(transferFromCall, true, "it completes the function");

        let transferFromFun = await tokenInstance.transferFrom(accounts[ 0 ], accounts[ 2 ], 1000, { from: accounts[ 1 ] });

        assert.equal(transferFromFun.logs.length, 1, "triggers one event");
        assert.equal(transferFromFun.logs[ 0 ].event, "Transfer", "Event name should be 'Transfer' ");
        // console.log("transferFromFun.logs[ 0 ].args", transferFromFun.logs[ 0 ].args)
        assert.equal(transferFromFun.logs[ 0 ].args._from, accounts[ 0 ], "logs the account the token are transfered from");
        assert.equal(transferFromFun.logs[ 0 ].args._to, accounts[ 2 ], "logs the account the token are transfered to");
        assert.equal(transferFromFun.logs[ 0 ].args._value, 1000, "logs the transfered amount");
    })
})

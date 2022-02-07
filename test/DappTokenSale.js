const DappTokenSale = artifacts.require("DappTokenSale.sol");
const DappToken = artifacts.require("DappToken.sol");

contract("DappTokenSale", (accounts) => {
    let price = 1000000000000000; // in wei
    let buyer = accounts[1];
    let admin = accounts[0];
    let tokensAvailable = 750000;

    it("Initializes the contract with correct values", async () => {
        let tokenInstance = await DappTokenSale.deployed();
        let address = await tokenInstance.address;
        
        // console.log("add", address);
        assert.notEqual(address, 0x0, "Has contract address");

        let tokenContract = await tokenInstance.tokenContract();
        // console.log("add", tokenContract);
        assert.notEqual(tokenContract, 0x0, "Has token contract address")

        let tokenPrice = await tokenInstance.tokenPrice();
        assert.equal(tokenPrice, price, "Token price is correct")

    })

    it("Facilates Token buying", async () => {
        let tokenInstance = await DappTokenSale.deployed();
        let DappTokenInstance = await DappToken.deployed();

        DappTokenInstance.transfer(tokenInstance.address, tokensAvailable, {from: admin})

        let numberOfToken = 10;

        tokenInstance.buyToken.call(numberOfToken, { from: buyer, value: 1 }).then(assert.fail).catch((err) => {
            assert(err.message.indexOf('revert') >= 0, "msg.value must be equal to tokens in wei");
        });

        tokenInstance.buyToken.call(800000, { from: buyer, value: 800000 * price }).then(assert.fail).catch((err) => {
            assert(err.message.indexOf('revert') >= 0, "cannot purchased more tokens than available");
        });

        let receipt = await tokenInstance.buyToken(numberOfToken, { from: buyer, value: numberOfToken * price});

        assert.equal(receipt.logs.length, 1, 'triggers one event');
        assert.equal(receipt.logs[0].event, 'Sell', 'triggers event is "Sell"');
        assert.equal(receipt.logs[0].args._buyer, buyer, 'logs the account that purchased the token');
        assert.equal(receipt.logs[0].args._amount, numberOfToken, 'logs number of token purchased');

        let amount = await tokenInstance.tokenSold();
        // console.log("amt", amount)
        assert.equal(amount.toNumber(), numberOfToken, 'increment in number of token sold')

        let balance = await DappTokenInstance.balanceOf(tokenInstance.address);
        // console.log(tokenInstance.address, admin)
        assert.equal(balance.toNumber(), tokensAvailable - numberOfToken, "token should be removed from admin")

        balance = await DappTokenInstance.balanceOf(buyer);
        assert.equal(balance.toNumber(), numberOfToken, "token should be added to buyer")
    })

    it("ends token sale", async () => {
        let tokenInstance = await DappTokenSale.deployed();
        let DappTokenInstance = await DappToken.deployed();

        try {
            await tokenInstance.endSale.call({ from: buyer });
            throw null;
        }
        catch (error) {
            assert(error, "Expected an error but did not get one");
            assert(error.message.indexOf('revert') >= 0, "must be admin to end sale");
        }

        await tokenInstance.endSale({from: admin});

        let balance = await DappTokenInstance.balanceOf(admin);
        assert.equal(balance.toNumber(), 999990, "return all unsold token to admin");

        // token price is reset when self destruct is called
        let tokenPrice = await tokenInstance.tokenPrice();
        // tokenInstance.tokenPrice().then((price) => {
        //     assert.equal(price.toNumber(), 1, "contract need to be destroyed");
        // })
        // console.log(tokenPrice)

        // assert.equal(tokenPrice.toNumber(), 0, "contract need to be destroyed");
    })
})
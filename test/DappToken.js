const DappToken = artifacts.require("DappToken.sol");

contract('DappToken', (accounts) => {

    it("Sets total supply on deployment", async () => {
        let tokenInstance = await DappToken.deployed();
        let totalSupply = await tokenInstance.totalSupply()
        assert.equal(totalSupply.toNumber(), 1000000, "Set total supply to 10,00,000")
    })
})

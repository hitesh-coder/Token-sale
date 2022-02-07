const DappToken = artifacts.require("DappToken");
const DappTokenSale = artifacts.require("DappTokenSale");

module.exports = async function (deployer) {
    await deployer.deploy(DappToken, 1000000);
    // token price is 0.001 ether
    // below value is in wei
    let tokenPrice = 1000000000000000;
    await deployer.deploy(DappTokenSale, DappToken.address, tokenPrice);
};

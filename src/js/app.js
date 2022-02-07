// import * as dappTokenSale from "../../build/contracts/DappTokenSale.json";
// const dappTokenSale = require("../../build/contracts/DappTokenSale.json")

App = {
    web3Provider: null,
    contracts: {},
    account: "0x0",
    loading: false,
    tokenPrice: 1000000000000000,
    tokensSold: 0,
    tokensAvailable: 750000,

    init: function () {
        console.log("function initilize")
        return App.initweb3();
    },

    initweb3: function () {
        if (typeof web3 !== 'undefined') {
            // If a web3 instance is already provided by Meta Mask.
            App.web3Provider = web3.currentProvider;
            web3 = new Web3(web3.currentProvider);
        } else {
            // Specify default instance if no web3 instance provided
            App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
            web3 = new Web3(App.web3Provider);
        }
        return App.initContracts();
    },

    listenForEvents: async function () {
        console.log("App.contracts.DappTokenSale", App.contracts.DappTokenSale.deployed())
        let dappTokenSaleInstance = await App.contracts.DappTokenSale.deployed();
        dappTokenSaleInstance.Sell({}, {
            fromBlock: 0,
            toBlock: "latest",
        }).watch(function (error, event) {
            console.log("event trigger", event);
            App.render();
        })
    },

    initContracts: function () {
        $.getJSON("../build/contracts/DappTokenSale.json", (dappTokenSale) => {
            App.contracts.DappTokenSale = TruffleContract(dappTokenSale);
            App.contracts.DappTokenSale.setProvider(App.web3Provider);
            App.contracts.DappTokenSale.deployed().then((Instance) => {
                console.log("instance", Instance.address)
            })
            console.log(App.contracts)
        }).done(function () {
            $.getJSON("../build/contracts/DappToken.json", (dappToken) => {
                App.contracts.DappToken = TruffleContract(dappToken);
                App.contracts.DappToken.setProvider(App.web3Provider);
                App.contracts.DappToken.deployed().then((Instance) => {
                    console.log("instance2", Instance.address)
                })
            })

            App.listenForEvents();
            return App.render();
        })
    },

    render: async function () {
        if (App.loading) {
            return;
        }

        App.loading = true;

        let loader = document.getElementById("loader");
        let content = document.getElementById("content");

        loader.style.display = "block";
        content.style.display = "none";
        // Load account data
        // console.log(web3.eth.accounts)
        web3.eth.getCoinbase(function (err, account) {
            console.log("account", err)
            if (err === null) {
                console.log("account", account)
                App.account = account;
                $("#accountAddress").html("your account: " + account)
            }
        })

        // if (web3.currentProvider.enable) {
        //     //For metamask
        //     web3.currentProvider.enable().then(function (acc) {
        //         App.account = acc[ 0 ];
        //         $("#accountAddress").html("Your Account: " + App.account);
        //         console.log("1", App.account)
        //     });
        // } else {
        //     App.account = web3.eth.accounts[ 0 ];
        //     console.log("2", App.account)
        // }

        // App.contracts.DappTokenSale.deployed().then((Instance) => {
        //     dappTokenSaleInstance = Instance;
        //     return dappTokenSaleInstance.tokenPrice();
        // }).then((tokenPrice) => {
        //     console.log("tokenPrice",tokenPrice)
        // })

        let dappTokenSaleInstance = await App.contracts.DappTokenSale.deployed();

        App.tokenPrice = await dappTokenSaleInstance.tokenPrice();
        App.tokenPrice = App.tokenPrice.toNumber();
        console.log("tokenPrice", App.tokenPrice)

        let tokenPrice = document.getElementsByClassName("token-price");
        // console.log("html", tokenPrice[0])
        tokenPrice[ 0 ].innerHTML = web3.fromWei(App.tokenPrice, "ether");


        App.tokensSold = await dappTokenSaleInstance.tokenSold();
        App.tokensSold = App.tokensSold.toNumber();
        // App.tokensSold = 600000;
        let tokensSold = document.getElementsByClassName("tokens-sold")[ 0 ];
        tokensSold.innerHTML = App.tokensSold;
        console.log("tokensSOld", App.tokensSold)

        // App
        let tokensAvailable = document.getElementsByClassName("tokens-available")[ 0 ];
        tokensAvailable.innerHTML = App.tokensAvailable
        console.log("tokensAvailable", App.tokensAvailable);

        let progressPercent = (App.tokensSold / App.tokensAvailable) * 100;
        console.log("progressPer", progressPercent)
        let progressBar = document.getElementById("progress");
        progressBar.style.width = progressPercent + "%";



        // Load Token contract

        let dappTokenInstance = await App.contracts.DappToken.deployed();

        let dappBalance = document.getElementsByClassName("dapp-balance")[ 0 ];
        let dappBalanceAmt = await dappTokenInstance.balanceOf(App.account);
        console.log("dappBalanceAmt", dappBalanceAmt.toNumber())
        dappBalance.innerHTML = dappBalanceAmt.toNumber()

        App.loading = false;
        loader.style.display = "none";
        content.style.display = "block";
    },

    buyTokens: async function () {
        if (App.loading) {
            return;
        }

        App.loading = true;

        let loader = document.getElementById("loader");
        let content = document.getElementById("content");

        loader.style.display = "block";
        content.style.display = "none";


        let numberOfTokens = document.getElementById("numberOfTokens").value;
        console.log("numberOfTokens", numberOfTokens)

        let dappTokenSaleInstance = await App.contracts.DappTokenSale.deployed();
        let tokenBought = await dappTokenSaleInstance.buyToken(numberOfTokens, {
            from: App.account,
            value: numberOfTokens * App.tokenPrice,
            gas: 500000
        })

        console.log("tokenBought", tokenBought)

        App.loading = false;
        loader.style.display = "none";
        content.style.display = "block";
    }
}

window.onload = () => {
    App.init();
}
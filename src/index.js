const Web3 = require('web3');
const webutils = require('web3-utils')
var contractsInstance = {};
const NFTContact = "0x12bF1910F53CA36Cb0455f6630eF4172f654711F";
const VerifyContact = '0x78a1c22D35c274Bc25C167DBC32d64030e635A81';
App = {
    web3Provider: null,
    erc20ABI: null,
    uniV2PairABI: null,
    enableWalletConnect: false,
    nftprice:0,
    nfttotal:0,
    init: function () {
        return App.initWeb3();
    },
    connectMetamask: function () {
        if (typeof window.ethereum != 'undefined') {
            App.initWeb3();
        } else {
            toastAlert(getString('nometamask'));
        }
    },
    initWeb3: function () {
        // Initialize web3 and set the provider to the testRPC.
        if (typeof window.ethereum != 'undefined') {
            if (printLog) console.log("Metamask is installed!");
            App.web3Provider = window.ethereum;
            web3 = new Web3(window.ethereum);
            window.ethereum.on('accountsChanged', (accounts) => {
                // Handle the new accounts, or lack thereof.
                // "accounts" will always be an array, but it can be empty.
                if (printLog) console.log("accountsChanged");
                window.location.reload();
            });

            window.ethereum.on('chainChanged', (chainId) => {
                // Handle the new chain.
                // Correctly handling chain changes can be complicated.
                // We recommend reloading the page unless you have a very good reason not to.
                if (printLog) console.log("chainChanged");
                window.location.reload();
            });
            if (printLog) console.log("chainid=" + window.ethereum.chainId);
            var chainId = window.ethereum.chainId;
            ////chainId === "0x1" main, chainId === "0x3" ropsten, chainId === "0x4" rinkey
            var chain = ChainId[0];
            if (chainId === '0x1') {
                chain = ChainId[0];
            } else if (chainId === '0x3') {
                chain = ChainId[1];
            } else if (chainId === '0x4') {
                chain = ChainId[2];
            }
            ETHENV.init(chain);
            return App.initWallet();
        }
    },

    initWallet: async function () {
        if (printLog) console.log("initWallet");
        if (web3 != null) {
            $('body').addClass('web3');
        }
        var v = web3.version;
        if (printLog) console.log("web3 version=" + v);
        let accounts = await ethereum.request(
            {
                method: 'eth_requestAccounts'
            }
        );
        if (printLog) console.log("account=" + accounts[0]);
        defaultAccount = web3.utils.toChecksumAddress(accounts[0]);
        var address = defaultAccount.substring(0,7)+"..."+defaultAccount.substring(defaultAccount.length-5,defaultAccount.length-1);
        $("#walletaddress").text(address);
        return App.initContract();
    },
    getNFTInfo(){
        contractsInstance.seven = new web3.eth.Contract(contractABI['seven'], NFTContact);
        contractsInstance.seven.methods.maxSupply().call(function (e, r) {
            if (printLog) console.log("maxSupply =" + r);
            $("#totalcount").text("Total : "+r);
            nfttotal = r;
                    //nextTokenId
            contractsInstance.seven.methods.nextTokenId().call((e,r)=>{
                //Sold : 688 / 2000
                $("#soldnum").text("Sold : "+r+" / "+nfttotal);
            });
        });

        contractsInstance.seven.methods.tokenPrice().call(function (e, r) {
            if (printLog) console.log("tokenPrice =" + r);
            r = new BigNumber(r);
            $("#tokenprice").text("Price : "+r.div(Math.pow(10,18))+"ETH");
            nftprice = r;
        });
        contractsInstance.seven.methods.balanceOf(defaultAccount).call((e,r)=>{
            $("#mytotalnft").text("My Boxes Amount : "+r);
            for (let index = 0; index < r; index++) {
                contractsInstance.seven.methods.tokenOfOwnerByIndex(defaultAccount,index).call((e,r)=>{
                    console.log("my nft token id="+r);
                    var myboxes = $("#myboxes");
                    // myboxes.load('hashunbox.html?'+r);
                    var node = $("<li></li>");
                    var divnode=$("<div class='content'></div>");
                    // var svg = 'hashunbox.html#'+r;
                    // divnode.get('hashunbox.html',{id:r});
                    // $.get("hashunbox.html?"+r,{id:r},(data,status)=>{
                        // console.log(data);
                        // divnode.html(data);
                    // });
                    divnode.load('hashunbox.html?'+r);
                    // .text(
                    // "<svg xmlns='http://www.w3.org/2000/svg' preserveAspectRatio='xMinYMin meet' viewBox='0 0 150 150'><style>.base { fill: white; font-family: serif; font-size: 14px; }.big{ fill: white; font-family: italic; font-size: 80px; }</style><rect width='100%' height='100%' fill='black' /><text x='15' y='20' class='base'>HashCommunity</text><text x='10' y='90' class='big'>?</text><text x='15' y='110' class='base'>ID: 0</text></svg>"
                    // );
                    // var svg = $("<svg xmlns='http://www.w3.org/2000/svg' preserveAspectRatio='xMinYMin meet' viewBox='0 0 150 150'></svg>");
                    // var rect = $("<rect width='100%' height='100%' fill='black' ></rect>");
                    // svg.append(rect);
                    // var text1 = $("<text x='15' y='110'>ID: 0</text>");
                    // svg.append(text1);
                    // divnode.append(svg);
                    node.append(divnode);
                    myboxes.append(node);
                });
            }
        });
    },
    verify(){
        const sig = $("#signature2").val();
        console.log("sig length="+sig.length);
        let contract = new web3.eth.Contract(contractABI['verify'],VerifyContact);

        contract.methods.verify2(parseInt($("#amount2").val()),$("#addr2").val(),'0x'+sig).call((e,r)=>{
            console.log("e="+e+",r="+r);
        });
    },
    setVerify(){
        let contract = new web3.eth.Contract(contractABI['verify'],VerifyContact);
        contract.methods.setVerifyAddress(defaultAccount).send({from:defaultAccount},(e,r)=>{
            console.log("setVerifyAddress "+e);
        });
    },
    buy(amount){
        console.log("buy "+amount);
        // var _price = 0.1 * 10 ** 18 * amount;
        var _price = nftprice * amount;
        let strvalue = Web3.utils.toHex(_price);
        contractsInstance.seven.methods.mintTokens(amount).send({ from: defaultAccount,value:strvalue }, function (e, r) {
            console.log("buy "+e+","+r);
            // afterSendTx(e, r);
        });
    },
    setPresale(){
        //function setUpPresale(
        //address whitelistSigner,
        //uint256 startTime,
        //uint256 endTime
        var timestamp = Date.parse(new Date());
        timestamp = timestamp/1000;
        contractsInstance.seven.methods.setUpPresale(defaultAccount,timestamp,timestamp+1000).send({from:defaultAccount},(e,r)=>{
            console.log("set presale "+e+r);
        });
    },
    setBaseUrl(){
        var baseurl = 'baidu.com';
        contractsInstance.seven.methods.setBaseURI(baseurl).send({from:defaultAccount},(e,r)=>{
            console.log("set base url "+e+","+r);
        });
    },
    startSale(){
        var startTime = Date.parse(new Date())/1000;
        var maxCount = 10;
        contractsInstance.seven.methods.setUpSale(startTime,maxCount).send({from:defaultAccount},(e,r)=>{
            console.log("start sale "+e+","+r);
        });
    },
    // function setUpSale(
    //     uint256 startTime,
    //     uint256 initMaxCount,
    // ) 
    check(){
        let signaddress = $("#signaddress").val();
        let signature = $("#signature").val();
        console.log("check:address="+signaddress+",signature="+signature);
        //verifyWhiteList(uint256 amount,address account,bytes calldata signature)
        if(signature&&signaddress){
            contractsInstance.seven.methods.verifyWhiteList(10,signaddress, '0x'+signature).call((e,r)=>{
                if(e){
                    console.log(e);
                }
                console.log("check presale="+r);
            });
        }
    },

    sign(){
        //domain : string name,string version,uint256 chainId,address verifyingContract
        //address buyer,uint256 maxCount
        const domain = [
            { name: "name", type: "string" },
            { name: "version", type: "string" },
            { name: "chainId", type: "uint256" },
            { name: "verifyingContract", type: "address" },
        ];
        const presale = [
            { name: "maxCount", type: "uint256" },
            { name: "buyer", type: "address" },
        ];

        // const id = parseInt(web3.version.network, 10);
        var chainId = window.ethereum.chainId;
        console.log("id="+chainId);
        const domainData = {
            name: "NFT",
            version: "1",
            chainId: chainId,
            verifyingContract: NFTContact
        };
        let signaddress = $("#signaddress").val();
        var message = {
            maxCount: 10,
            buyer: signaddress
        };
        const data = JSON.stringify({
            types: {
                EIP712Domain: domain,
                Presale: presale
            },
            domain: domainData,
            primaryType: "Presale",
            message: message
        });

        console.log("sign address="+signaddress+",signer="+defaultAccount);
        // const signer = '0x5Aaa62630EdE405D06b45650Fccb06a3B9f5D7F6';
        web3.currentProvider.sendAsync(
            {
                method:"eth_signTypedData_v3",
                params:[defaultAccount,data],
                from:defaultAccount,
            },
            (err,result)=>{
                if (err) {
                    return console.error(err);
                }
                const signature = result.result.substring(2);
                const r = "0x" + signature.substring(0, 64);
                const s = "0x" + signature.substring(64, 128);
                const v = parseInt(signature.substring(128, 130), 16);
                console.log("signature="+signature);
            }
        );
    },
    sign2(){

    //   if (web3.eth.accounts[0] == null) {
    //     return;
    //   }
  
      const domain = [
        { name: "name", type: "string" },
        { name: "version", type: "string" },
        { name: "chainId", type: "uint256" },
        { name: "verifyingContract", type: "address" },
        { name: "salt", type: "bytes32" },
      ];
  
      const bid = [
        { name: "amount", type: "uint256" },
        { name: "account", type: "address" },
      ];
  
    //   const identity = [
    //     { name: "userId", type: "uint256" },
    //     { name: "wallet", type: "address" },
    //   ];
  
      const chainId =window.ethereum.chainId;
    
      const domainData = {
        name: "My amazing dApp",
        version: "2",
        chainId: chainId,
        verifyingContract: NFTContact,
        salt: "0xf2d857f4a3edcb9b78b4d503bfe733db1e3f6cdc2b7971ee739626c97e86a558"
      };
      //verifyaddr
      //buyamount
    //   const addr = $("#verifyaddr").val();
    //   const amount=parseInt($("#buyamount").val());
      let signaddress = $("#signaddress").val();
      var message = {
        amount: 10,
        account:signaddress,
        // bidder: {
        //   userId: 323,
        //   wallet: "0x3333333333333333333333333333333333333333"
        // }
      };
      
      const data = JSON.stringify({
        types: {
          EIP712Domain: domain,
          Bid: bid
        },
        domain: domainData,
        primaryType: "Bid",
        message: message
      });
  
      const signer = webutils.toChecksumAddress(defaultAccount);
      console.error("sign="+signer);
      web3.currentProvider.sendAsync(
        {
          method: "eth_signTypedData_v3",
          params: [signer, data],
          from: signer
        }, 
        function(err, result) {
          if (err || result.error) {
            return console.error(result);
          }
          console.log("sig="+result);
          const sig2 = result.result.substring(2);
          console.log("sig2="+sig2);
          const signature = parseSignature(result.result.substring(2));
        }
      );
    },
    initContract: function () {
        $("#divloading").show();
        $.getJSON('contracts/TheSevens.json', function (data) {
            // Get the necessary contract artifact file and instantiate it with truffle-contract.
            if (printLog) console.log("Seven create");
            // contractsInstance.StakePool = new web3.eth.Contract(data.abi);
            contractABI['seven'] = data.abi;
            return App.getNFTInfo();
        });
        $.getJSON('contracts/Verifier.json', function (data) {
            // Get the necessary contract artifact file and instantiate it with truffle-contract.
            if (printLog) console.log("Verify create");
            // contractsInstance.StakePool = new web3.eth.Contract(data.abi);
            contractABI['verify'] = data.abi;
            // return App.getNFTInfo();
        });
        // $.getJSON('contracts/HotPot.json', function (data) {
        //     // Get the necessary contract artifact file and instantiate it with truffle-contract.
        //     contractsInstance.HotPot = new web3.eth.Contract(data.abi, contractAddress.hotpot);
        //     erc20ABI = data.abi;
        //     // erc20Contract = new web3.eth.Contract(data.abi,contractAddress.hotpot);
        //     // contractsInstance.HotPot = contractsInstance.HotPot.at(contractAddress.hotpot);

        //     $.getJSON('contracts/Loan.json', function (data) {
        //         // Get the necessary contract artifact file and instantiate it with truffle-contract.
        //         contractsInstance.Loan = new web3.eth.Contract(data.abi, contractAddress['loan']);
        //         // contractsInstance.Loan = contractsInstance.Loan.at(contractAddress['loan']);

        //         $.getJSON('contracts/NFTokenHotPot.json', function (data) {
        //             contractsInstance.NFTHotPot = new web3.eth.Contract(data.abi, contractAddress.nft);
        //             // contractsInstance.NFTHotPot = contractsInstance.NFTHotPot.at(contractAddress.nft);
        //             return UserNFT.getNFTBalances();
        //         });
        //         return Loan.getLoan();
        //     });
        //     return App.getBalances();
        // });

        // $.getJSON('contracts/Reward.json', function (data) {
        //     // Get the necessary contract artifact file and instantiate it with truffle-contract.
        //     contractsInstance.Reward = new web3.eth.Contract(data.abi, contractAddress.reward);
        //     // contractsInstance.Reward = contractsInstance.Reward.at(contractAddress.reward);
        //     return Reward.getRewardInfo();
        // });

        // $.getJSON('contracts/Gacha.json', function (data) {
        //     // Get the necessary contract artifact file and instantiate it with truffle-contract.
        //     contractsInstance.Gacha = new web3.eth.Contract(data.abi, contractAddress.gacha);
        //     // contractsInstance.Gacha = contractsInstance.Gacha.at(contractAddress.gacha);
        //     return Gacha.getGacha();
        // });


        // $.getJSON('contracts/NFTMarket.json', function (data) {
        //     // Get the necessary contract artifact file and instantiate it with truffle-contract.
        //     contractsInstance.NFTMarket = new web3.eth.Contract(data.abi, contractAddress['market']);
        //     // contractsInstance.NFTMarket = contractsInstance.NFTMarket.at(contractAddress['market']);
        //     return Market.initMarketInfo();
        // });

        // $.getJSON('contracts/Invite.json', function (data) {
        //     // Get the necessary contract artifact file and instantiate it with truffle-contract.
        //     contractsInstance.Invite = new web3.eth.Contract(data.abi, contractAddress['invite']);
        //     // contractsInstance.Invite = contractsInstance.Invite.at(contractAddress['invite']);
        //     return Invite.initInviteInfo();
        // });
    },
    getUniV2Pairs: function () {
        for (var i = 0; i < allPoolTokens.length; i++) {
            var token = allPoolTokens[i];
            if (printLog) console.log("getUniV2Pairs " + token);
            if (token == 'eth/usdt' || token == "hotpot/eth" || token == "wbtc/eth") {
                App.getUniV2Pair(token);
            }
            if (token != "wbtc/eth")
                App.getStakeERCInfo(token);
        }
    },
    getStakeERCInfo: function (token) {
        if (stakeERCAddress[token] == null || stakeERCAddress[token] == "") {
            return;
        }
        stakeERCContract[token] = new web3.eth.Contract(erc20ABI, stakeERCAddress[token]);
        if (printLog) console.log("getStakeERCInfo token=" + token);
        stakeERCContract[token].methods.balanceOf(defaultAccount).call(function (e, result) {
            stakeInfos[token].userBalance = new BigNumber(result);
            if (printLog) console.log("getStakeERCInfo balance=" + result + ",name=" + token);
            stakeERCContract[token].methods.decimals().call(function (e, result) {
                stakeInfos[token].decimals = parseInt(result);
                stakeERCContract[token].methods.allowance(defaultAccount, stakePoolAddress[token]).call(function (e, result) {
                    if (printLog) console.log("getStakeERCInfo allowance=" + result + ",name=" + token);
                    stakeInfos[token].allowance = new BigNumber(result);
                    if (currentPagePoolID != "") {
                        Stake.initpooldata(currentPagePoolID);
                    }
                });
            });
        });

        // watch for an event with {some: 'args'}
        stakeERCContract[token].events.Approval({ filter: { owner: defaultAccount } }, function (error, result) {
            if (!error) {
                if (result.returnValues.owner != defaultAccount) {
                    return;
                }
                if (checkSameEvent(result)) {
                    return;
                }

                result.returnValues.value = new BigNumber(result.returnValues.value);
                if (result.returnValues.value.lt(new BigNumber(10 ** 30))) {
                    if (printLog) console.log("stakeERCContract Approval less");
                    return;
                }

                if (printLog) console.log(token + ":approval " + result.returnValues);
                hideTopMsg();

                stakeInfos[token].allowance = result.returnValues.value;
                if (currentPagePoolID != "") {
                    Stake.initpooldata(currentPagePoolID);
                }
                var spender = result.returnValues.spender.toLowerCase();
                var gacha = contractAddress.gacha.toLowerCase();
                if (spender == gacha) {
                    $("#pull1").show();
                    $("#pull10").show();
                    $("#approvegacha").hide();
                }
            }
        });
    },
    updateUserBalance: function () {
        var b = (defaultBalance.div(Math.pow(10, 18)).toFixed(2));
        if (printLog) console.log("updateUserBalance " + b);
        $('.mybalance').text(b);
    },
    getUniV2Pair: function (pair) {
        if (printLog) console.log("getUniV2Pair=" + pair);
        univ2PairInfo[pair] = createPairInfo(pair);
        if (stakeERCAddress[pair] == null || stakeERCAddress[pair] == "") {
            return;
        }
        univ2PairInfo[pair].contractInstance = new web3.eth.Contract(App.uniV2PairABI, stakeERCAddress[pair]);
        univ2PairInfo[pair].contractInstance.methods.token0().call(function (e, r) {
            univ2PairInfo[pair].token0 = r;
            if (printLog) console.log("getUniV2Pair pair=" + pair + ", token0=" + r);
        });
        univ2PairInfo[pair].contractInstance.methods.token1().call(function (e, r) {
            univ2PairInfo[pair].token1 = r;
            if (printLog) console.log("getUniV2Pair pair=" + pair + ",token1=" + r);
        });
        univ2PairInfo[pair].contractInstance.methods.decimals().call(function (e, result) {
            if (printLog) console.log("getUniV2Pair decimals=" + result + ",name=" + pair);
            univ2PairInfo[pair].decimals = parseInt(result);
            univ2PairInfo[pair].contractInstance.methods.getReserves().call(function (e, result) {
                if (printLog) console.log("getUniV2Pair getReserves=" + result + ",name=" + pair);
                var reserve0 = new BigNumber(result[0]);
                var reserve1 = new BigNumber(result[1]);
                if (reserve0 == 0) {
                    reserve0 = reserve0.plus(1);
                }
                if (reserve1 == 0) {
                    reserve1 = reserve1.plus(1);
                }
                univ2PairInfo[pair].reserve0 = reserve0;
                univ2PairInfo[pair].reserve1 = reserve1;

                univ2PairInfo[pair].contractInstance.methods.totalSupply().call(function (e, result) {
                    if (printLog) console.log("getUniV2Pair totalSupply=" + result + ",name=" + pair);
                    result = new BigNumber(result);
                    if (result == 0) {
                        result = result.plus(1);
                    }
                    univ2PairInfo[pair].totalSupply = result;
                    univ2PairInfo[pair].lpPrice = univ2PairInfo[pair].reserve1.div(Math.pow(10, 18)).times(2).div(univ2PairInfo[pair].totalSupply.div(Math.pow(10, univ2PairInfo[pair].decimals)));
                    if (printLog) console.log("pair=" + pair + ",lp price=" + univ2PairInfo[pair].lpPrice);
                    App.checkAllUni();
                });
            });
        });
    },
    checkAllUni: function () {
        for (var i = 0; i < allPoolTokens.length; i++) {
            var token = allPoolTokens[i];
            if (token == 'eth/usdt' || token == "hotpot/eth" || token == "wbtc/eth") {
                if (univ2PairInfo[token].lpPrice == 0) {
                    return
                }
            }
        }
        App.calTokenPrice();
    },
    calTokenPrice: function () {
        if (printLog) console.log("calTokenPrice");
        var ethusdt = univ2PairInfo["eth/usdt"];
        var vEth = ethusdt.reserve0.div(Math.pow(10, 18));
        var vUsdt = ethusdt.reserve1.div(Math.pow(10, 6));
        if (ETHENV.chainId == ChainId[1] || ETHENV.chainId == ChainId[2]) {
            vEth = ethusdt.reserve1.div(Math.pow(10, 18));
            vUsdt = ethusdt.reserve0.div(Math.pow(10, 6));
        }

        var priceEth = vUsdt.div(vEth);
        if (printLog) console.log("calTokenPrice price eth=" + priceEth);


        var hotpoteth = univ2PairInfo["hotpot/eth"];
        var vHot = hotpoteth.reserve0.div(Math.pow(10, 18));
        var vE = hotpoteth.reserve1.div(Math.pow(10, 18));

        var priceHot = vE.div(vHot).times(priceEth);
        if (printLog) console.log("calTokenPrice eth price=" + priceEth + ",hot price=" + priceHot);


        var btceth = univ2PairInfo["wbtc/eth"];
        var vbtc = btceth.reserve0.div(Math.pow(10, 8));
        var vE2 = btceth.reserve1.div(Math.pow(10, 18));

        var pricebtc = vE2.div(vbtc).times(priceEth);
        if (printLog) console.log("calTokenPrice eth price=" + priceEth + ",btc price=" + pricebtc);

        //usdt
        stakeInfos["usdt"].price = 1;
        stakeInfos["usdc"].price = 1;
        stakeInfos["hotpot"].price = priceHot;
        stakeInfos['wbtc'].price = pricebtc;

        for (var i = 0; i < allPoolTokens.length; i++) {
            var name = allPoolTokens[i];
            if (name == 'eth/usdt' || name == "hotpot/eth" || name == "wbtc/eth") {
                stakeInfos[name].price = univ2PairInfo[name].lpPrice.times(priceEth);
            }
            if (printLog) console.log("calTokenPrice stake token price name:" + name + ",price=" + stakeInfos[name].price);
        }
        delete allPoolTokens[allPoolTokens.length - 1];
        Stake.initStakePool();
    },
    // getStakePools: function () {
        // allPoolTokens
        // for (var i = 0; i < allPoolTokens.length; i++) {
        //     var poolToken = allPoolTokens[i];
        //     var poolAddress = stakePoolAddress[poolToken];
        //     var lpAddress = stakeERCAddress[poolToken];
        //     stakeInfos[poolToken] = createToken(poolToken, lpAddress, poolAddress);
        // }

        // $.getJSON('contracts/UniV2Pair.json', function (data) {
        //     // Get the necessary contract artifact file and instantiate it with truffle-contract.
        //     // contractsInstance.UniV2Pair = new Web3.eth.contract(data.abi);
        //     App.uniV2PairABI = data.abi;
        //     return App.getUniV2Pairs();
        // });

    // },
    refreshBalances: function () {
        contractsInstance.HotPot.methods.balanceOf(defaultAccount).call(function (e, result) {
            if (e) {
                if (printLog) console.log("HotPot.balanceOf error : " + e);
                return;
            }
            defaultBalance = new BigNumber(result);
            if (printLog) console.log("balanceOf " + result / 10 ** 18);
            App.updateUserBalance();
        });
    },
    getBalances: async function () {
        if (printLog) console.log('Getting balances...');

        // watch for an event with {some: 'args'}
        contractsInstance.HotPot.events.Approval({ filter: { owner: defaultAccount }, fromBlock: 'latest', toBlock: 'latest' }, function (error, result) {
            if (!error) {
                if (result.returnValues.owner != defaultAccount) {
                    return;
                }
                // toastAlert("Approve success!");
                if (checkSameEvent(result)) {
                    return;
                }
                if (printLog) console.log("approval spender=" + result.returnValues.spender);
                result.returnValues.value = new BigNumber(result.returnValues.value);
                if (result.returnValues.value.lt(new BigNumber(10 ** 30))) {
                    if (printLog) console.log("approval less");
                    return;
                }

                hideTopMsg();
                var spender = result.returnValues.spender.toLowerCase();
                var gacha = contractAddress.gacha.toLowerCase();
                if (spender === gacha) {
                    $("#pull1").show();
                    $("#pull10").show();
                    $("#approvegacha").hide();
                }
            }
        });

        // watch for an event with {some: 'args'}
        contractsInstance.HotPot.events.Transfer({ filter: { to: defaultAccount }, fromBlock: 'latest', toBlock: 'latest' }, function (error, result) {
            if (!error) {
                if (result.returnValues.to != defaultAccount) {
                    return;
                }
                if (checkSameEvent(result)) {
                    return;
                }
                // toastAlert("Approve success!");
                if (printLog) console.log("Transfer in=" + result.returnValues.value);
                if (printLog) console.log("to =" + result.returnValues.to + ",default=" + defaultAccount + ",from=" + result.returnValues.from);

                defaultBalance = defaultBalance.plus(new BigNumber(result.returnValues.value));
                stakeInfos['hotpot'].userBalance = defaultBalance;
                App.updateUserBalance();
            }
        });

        // watch for an event with {some: 'args'}
        contractsInstance.HotPot.events.Transfer({ filter: { from: defaultAccount }, fromBlock: 'latest', toBlock: 'latest' }, function (error, result) {
            if (!error) {
                if (result.returnValues.from != defaultAccount) {
                    return;
                }
                if (checkSameEvent(result)) {
                    return;
                }
                // toastAlert("Approve success!");
                // if(printLog)console.log("Transfer out=" + result.returnValues.value);

                if (printLog) console.log("out  to=" + result.returnValues.to + ",default=" + defaultAccount + ",from=" + result.returnValues.from);
                defaultBalance = defaultBalance.minus(new BigNumber(result.returnValues.value));
                App.updateUserBalance();
            }
        });

        // var result = await contractsInstance.HotPot.balanceOf(defaultAccount).call();

        // call constant function
        contractsInstance.HotPot.methods.balanceOf(defaultAccount).call(function (e, result) {
            if (e) {
                if (printLog) console.log("HotPot.balanceOf error : " + e);
                return;
            }
            defaultBalance = new BigNumber(result);
            balanceOfHotpot['total'] = new BigNumber(1000000 * 10 ** 18);
            if (printLog) console.log("balanceOf " + result / 10 ** 18);
            App.updateUserBalance();
            contractsInstance.HotPot.methods.allowance(defaultAccount, contractAddress.gacha).call(function (e, result) {
                var allowance = result;
                if (allowance == 0) {

                } else {
                    $("#pull1").show();
                    $("#pull10").show();
                    $("#approvegacha").hide();
                }
            });
            Stake.getAllPoolBalance();
        });

    },
    selectBuy: function () {
        $("#selectbuy").addClass('tableselect');
        $("#selectloan").removeClass('tableselect');
        $("#divbuytable").show();
        $("#divloantable").hide();
        $("#sellhistory").show();
        $("#loanhistory").hide();
    },
    selectLoan: function () {
        $("#selectloan").addClass('tableselect');
        $("#selectbuy").removeClass('tableselect');
        $("#divbuytable").hide();
        $("#divloantable").show();
        $("#sellhistory").hide();
        $("#loanhistory").show();
    }
};


function hidepages() {
    $('main').hide();
}

function recoveABottom() {
    document.getElementById("ahome").style.borderBottomColor = "transparent";
    document.getElementById("areward").style.borderBottomColor = "transparent";
    document.getElementById("afarms").style.borderBottomColor = "transparent";
    document.getElementById("aexchange").style.borderBottomColor = "transparent";
    document.getElementById("agacha").style.borderBottomColor = "transparent";
    document.getElementById("aabout").style.borderBottomColor = "transparent";
    document.getElementById("ame").style.borderBottomColor = "transparent";
    document.getElementById("ainvite").style.borderBottomColor = "transparent";
}

window.nav = (classname) => {
    nav(classname);
}

function nav(classname) {
    hidepages();
    currentPage = classname;
    $('body').removeClass('approved');
    currentPagePoolID = "";
    if (classname.indexOf('pool') === 0) {
        $('#singlepool').show();
        currentPagePoolID = classname.slice(4);
        Stake.initpooldata(currentPagePoolID);
        $('main.pool').show();
    } else {
        $('main.' + classname).show();
    }
    if (classname === "home") {
        $("#infodiv").show();
        App.refreshBalances();
    } else {
        $("#infodiv").hide();
    }
    recoveABottom();

    if (classname == "home") {
        $("#ticketinfo").hide();
    } else {
        $("#ticketinfo").show();
    }
    if (classname.indexOf('pool') != 0) {
        let aa = "a" + classname;
        //border-bottom-color: rgba(255, 255, 255, .25);
        document.getElementById(aa).style.borderBottomColor = "rgba(255, 255, 255, .25)";
    }

    showTable(false);
    if (classname === "reward") {
        Reward.gotoPage();
    } else if (classname === "me") {
        App.refreshBalances();
        UserNFT.initNFTTable(nftUse[2]);
        showTable(true);
    }

    if (classname == 'exchange') {
        App.selectBuy();
    }
}

$(function () {
    $(window).load(function () {
        App.init();
    });
});

window.showTable = (flag) => {
    if (flag) {
        $(".pricingTable").show();
        // black_overlay
    } else {
        $(".pricingTable").hide();
    }
}

window.rescue = () => {
    // function rescue(
    //     address to_,
    //     IERC20 token_,
    //     uint256 amount_
    // )
    var pool = 'eth/usdt';
    var poolAddress = stakePoolAddress[pool];
    stakeInfos[pool].instance = contractsInstance.StakePool.at(poolAddress);
    stakeInfos[pool].instance.rescue(defaultAccount, contractAddress['hotpot'], web3.utils.numberToHex(new BigNumber(70000 * Math.pow(10, 18)))).send({ from: defaultAccount }, function (e, r) {
        afterSendTx(e, r);
    });
}

window.testFunction = () => {
    // contractsInstance.Gacha.setInvite(contractAddress['invite'],function(e,r){
    //     afterSendTx(e,r);
    // });

    for (var i = 0; i < allPoolTokens.length; i++) {
        var token = allPoolTokens[i];
        if (!token) {
            continue;
        }
        Stake.notifyRewardAmount(token, 70000);
        // stakeInfos[token].instance.setRewardContract(contractAddress['reward'],function(e,r){
        //     afterSendTx(e,r);
        // });
        // stakeInfos[token].instance.setInvite(contractAddress['invite']).send({ from: defaultAccount }, function (e, r) {
        //     afterSendTx(e, r);
        // });
    }
    // contractsInstance.Reward.loan(function(e,r){
    //     if(printLog)console.log("loan = "+r);
    // });
    // contractsInstance.Reward.erc20(function(e,r){
    //     if(printLog)console.log("erc20 = "+r);
    // });
    // contractsInstance.Reward.hotpot(function(e,r){
    //     if(printLog)console.log("hotpot = "+r);
    // });
    // contractsInstance.Reward.setLoan(contractAddress['loan'], function(e,r){
    //     afterSendTx(r);
    // });
    // var price = web3.utils.numberToHex(1000 * Math.pow(10, 18));
    // var bytes = utils.hexToBytes(price);
    // var newbytes = Array(32);
    // for (var i = 0; i < 32; i++) {
    //     newbytes[i] = 0;
    // }
    // if (bytes.length < 32) {
    //     for (var i = 0; i < bytes.length; i++) {
    //         newbytes[31 - i] = bytes[bytes.length - 1 - i];
    //     }
    // }
    // if(printLog)console.log("test");
}


function parseSignature(signature) {
    var r = signature.substring(0, 64);
    var s = signature.substring(64, 128);
    var v = signature.substring(128, 130);
  
    return {
        r: "0x" + r,
        s: "0x" + s,
        v: parseInt(v, 16)
    }
  }
  
  function genSolidityVerifier(signature, signer, chainId) {
        
    return solidityCode
      .replace("<CHAINID>", chainId)
      .replace("<SIGR>", signature.r)
      .replace("<SIGS>", signature.s)
      .replace("<SIGV>", signature.v)
      .replace("<SIGNER>", signer);
  }
  
  window.onload = function (e) {
    var res = document.getElementById("response");
    res.style.display = "none";
  
    // force the user to unlock their MetaMask
    // if (web3.eth.accounts[0] == null) {
    //   alert("Please unlock MetaMask first");
    //   // Trigger login request with MetaMask
    //   web3.currentProvider.enable().catch(alert)
    // }
  
    var signBtn = document.getElementById("signBtn");
    signBtn.onclick = function(e) {
    //   if (web3.eth.accounts[0] == null) {
    //     return;
    //   }
  
      const domain = [
        { name: "name", type: "string" },
        { name: "version", type: "string" },
        { name: "chainId", type: "uint256" },
        { name: "verifyingContract", type: "address" },
        { name: "salt", type: "bytes32" },
      ];
  
      const bid = [
        { name: "amount", type: "uint256" },
        { name: "account", type: "address" },
      ];
  
    //   const identity = [
    //     { name: "userId", type: "uint256" },
    //     { name: "wallet", type: "address" },
    //   ];
  
      const chainId =window.ethereum.chainId;
    
      const domainData = {
        name: "My amazing dApp",
        version: "2",
        chainId: chainId,
        verifyingContract: VerifyContact,
        salt: "0xf2d857f4a3edcb9b78b4d503bfe733db1e3f6cdc2b7971ee739626c97e86a558"
      };
      //verifyaddr
      //buyamount
      const addr = $("#verifyaddr").val();
      const amount=parseInt($("#buyamount").val());
      var message = {
        amount: amount,
        account:addr,
        // bidder: {
        //   userId: 323,
        //   wallet: "0x3333333333333333333333333333333333333333"
        // }
      };
      
      const data = JSON.stringify({
        types: {
          EIP712Domain: domain,
          Bid: bid
        },
        domain: domainData,
        primaryType: "Bid",
        message: message
      });
  
      const signer = webutils.toChecksumAddress(defaultAccount);
      console.error("sign="+signer);
      web3.currentProvider.sendAsync(
        {
          method: "eth_signTypedData_v3",
          params: [signer, data],
          from: signer
        }, 
        function(err, result) {
          if (err || result.error) {
            return console.error(result);
          }
          console.log("sig="+result);
          const sig2 = result.result.substring(2);
          console.log("sig2="+sig2);
          const signature = parseSignature(result.result.substring(2));
  
          res.style.display = "block";
          res.value = genSolidityVerifier(signature, signer, chainId);
        }
      );
    };
  }
  
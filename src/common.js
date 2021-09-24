var defaultAccount = null;
var defaultBalance = 0;
var currentPagePoolID = "";
var currentPage = "";
var printLog = true;

function formatFomoTime(t) {
    if (t < 0) {
        return 'error';
    }
    // if(printLog)console.log("formatFomoTime : "+t)
    const times = Math.floor(t);
    const h = Math.floor(times / 3600);
    const m = Math.floor((times % 3600) / 60);
    const s = times % 60;
    return h + "h " + m + "m " + ' ' + + s + "s";
}

function showAlert() {
    document.getElementById('light').style.display = 'block';
    // document.getElementById('fade').style.display = 'block';
}

function hideAlert() {
    document.getElementById('light').style.display = 'none';
    document.getElementById('fade').style.display = 'none';
}

function showSellAlert(id) {
    document.getElementById("popTitle").innerHTML = "Sell";
    document.getElementById('stakeInput').value = 0;
    $("#sellToken").text(getString('sellnftid')+" : " + id);
    $(".popTitle").text(getString('selltitle'));
    $(".popTitle").attr('data-lang', 'selltitle');
    $("#loandiv").hide();
    $("#selldiv").show();
    $("#divsell").show();
    $("#borrowdiv").hide();
    $(".divloan").hide();
    $("#iddiv").text(id);
    $("#priceunit").text('HotPot');
}

function showLoanAlert(id) {
    document.getElementById('stakeInput').value = 0;
    $("#sellToken").text(getString('loannftid')+" : " + id);
    $(".popTitle").text(getString('loantitlepop'));
    $(".popTitle").attr('data-lang', 'loantitlepop');
    $("#loandiv").show();
    $("#selldiv").hide();
    $("#divsell").show();
    $(".divloan").show();
    $("#iddiv").text(id);
    $("#borrowdiv").hide();
    $("#priceinputdiv").show();
    $("#priceunit").text('HotPot/Day');
}

function showBorrowAlert(id) {
    document.getElementById('stakeInput').value = 0;
    $("#sellToken").text(getString('loannftid')+" : " + id);
    $(".popTitle").text(getString('loantitlepop'));
    $(".popTitle").attr('data-lang', 'loantitlepop');
    $("#loandiv").hide();
    $("#selldiv").hide();
    $("#borrowdiv").show();
    $("#divsell").show();
    $(".divloan").show();
    $("#iddiv").text(id);
    $("#priceinputdiv").hide();
    $("#priceunit").text('HotPot/Day');
}


function getSellAlertId() {
    return $("#iddiv").text();
}

function hideSellAlert() {
    $("#divsell").hide();
}


function getString(id) {
    return $.i18n.map[id];
}

function afterSendTx(error, result) {
    if (error) {
        if (printLog) console.log("stake approve error " + error);
        toastAlert("Error:" + error);
    } else {
        showTopMsg("Pending...", 0, getEthersanUrl(result));
        startListenTX(result);
    }
}

function getEthersanUrl(tx) {
    var url = "https://etherscan.io/tx/" + tx;
    if (ETHENV.chainId == ChainId[0]) {
        url = "https://etherscan.io/tx/" + tx;
    } else if (ETHENV.chainId == ChainId[1]) {
        url = "https://ropsten.etherscan.io/tx/" + tx;
    } else if (ETHENV.chainId == ChainId[2]) {
        url = "https://rinkeby.etherscan.io/tx/" + tx;
    }
    return url;
}

function startListenTX(tx) {
    if (printLog) console.log("startListenTX");
    var internal = setInterval(function () {
        web3.eth.getTransactionReceipt(tx, function (e, result) {
            if (e) {
                if (printLog) console.log("tx error:" + e);
                toastAlert("Error : " + e);
            } else {
                if (printLog) console.log("tx result:" + result);
            }
            if (result) {
                clearInterval(internal);
                if (printLog) console.log("getTransactionReceipt ");
                hideTopMsg();
                if (result.status == '0x0') {
                    showTopMsg(getString('txfail'), 5000, getEthersanUrl(result.transactionHash));
                    // toastAlert(getString('txfail'));
                }
                // autoRefresh();
            }
        });
    }, 3000);

}

function showTopMsg(msg, showTime, url) {
    $("#toprightmsg").text(msg);
    $("#toprightmsg").show();
    $("#toprightmsg").attr("href", url);
    if (showTime > 0) {
        setTimeout(function () {
            hideTopMsg();
        }, showTime);
    }
}

function hideTopMsg() {
    $("#toprightmsg").hide();
}

//importantmsg
function showImportantMsg(msg, url) {
    if (printLog) console.log("importantmsg = " + msg);
    $("#importantmsg").text(msg);
    $("#importantmsg").show();
    $("#importantmsg").attr("href", url);

    setTimeout(function () {
        $("#importantmsg").hide();
    }, 3000);
}

function toastAlert(msg) {
    if (printLog) console.log("toastAlert:" + msg);
    document.getElementById('alertdiv').style.display = 'block';
    document.getElementById('alertdiv').innerHTML = msg;
    setTimeout(function () {
        document.getElementById('alertdiv').style.display = 'none';
    }, 3000);
}


function formatZero(num, len) {
    if (String(num).length > len) return num;
    return (Array(len).join(0) + num).slice(-len);
}

function getString(id) {
    return $.i18n.map[id];
}

function formatTime(t) {
    if (t < 0) {
        return 'error';
    }

    const times = Math.floor(t);
    if (t > 86400) {
        const d = Math.floor(times / 86400);
        const gap = times % 86400;
        const h = Math.floor(gap / 3600);
        const m = Math.floor((gap % 3600) / 60);
        // const s = gap % 60;
        return d + "D " + h + "h " + m + "m";
    } else {
        const h = Math.floor(times / 3600);
        const m = Math.floor((times % 3600) / 60);
        const s = times % 60;
        return h + "h " + m + "m " + ' ' + + s + "s";
    }
    // if(printLog)console.log("formatFomoTime : "+t)
}



function formatTime2Min(t) {
    if (t < 0) {
        return 'error';
    }

    const times = Math.floor(t);
    if (t > 86400) {
        const d = Math.floor(times / 86400);
        const gap = times % 86400;
        const h = Math.floor(gap / 3600);
        const m = Math.floor((gap % 3600) / 60);
        // const s = gap % 60;
        return d + "D " + h + "h " + m + "m";
    } else {
        const h = Math.floor(times / 3600);
        const m = Math.floor((times % 3600) / 60);
        if (h == 0) {
            return m + " m";
        } else
            return h + "h " + m + "m ";
    }
    // if(printLog)console.log("formatFomoTime : "+t)
}

var eventBlocks = new Set();
function checkSameEvent(event) {
    var transactionHash = event.transactionHash;
    var name = event.event;
    var check = transactionHash + name;

    if (eventBlocks.has(check)) {
        return true;
    }
    eventBlocks.add(check);
    return false;
}
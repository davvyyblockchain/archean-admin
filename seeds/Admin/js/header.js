let token = window.localStorage.getItem('Authorization');
// $("#loggedInUserName").text();
let bIsValidAccountSelected = true;
let bIsValidNetworkSelected = true;

// To set duration for auto logout
let flushDuration = (localStorage.getItem("flushDuration") != null) ? localStorage.getItem("flushDuration") : 0;

if (flushDuration > 0) {
    setTimeout(() => {
        logout();
    }, flushDuration);

    setInterval(() => {
        flushDuration -= 1000;
    }, 1000);
}

window.onbeforeunload = function () {
    localStorage.setItem("flushDuration", flushDuration);
}

$(async () => {
    await loadRedeemablePoints();
});

try {
    window.ethereum.on('accountsChanged', function (accounts) {
        location.reload();
    });
    window.ethereum.on('chainChanged', function () {
        location.reload();
    });
} catch (error) {
    if (!window.ethereum) {
        bIsValidAccountSelected = false;
        // Display Error message in Redeem Points Model
        $("#lblAmountError").text("No Ethereum Client Fount");
        $("#lblAmountError").removeClass("d-none");
        // Disable Redeem points field and Redeem Button
        $("#redeemPoints").prop("disabled", true);
        $("#btnRedeem").prop("disabled", true);
        bIsValidAccountSelected = false;
        bIsValidNetworkSelected = false;
    }
    console.log(error);
}

function logout() {
    $.ajax({
        type: "POST",
        url: "/api/v1/auth/logout",
        headers: {
            'Authorization': token
        },
        success: function (result, status, xhr) {
            toastr["success"](xhr.responseJSON.message);
            setTimeout(function () {
                window.localStorage.removeItem('Authorization');
                window.localStorage.removeItem('sWalletAddress');
                window.location.href = '/a/signin';
            }, 500)
        },
        error: function (xhr, status, error) {
            console.log('====================================');
            console.log(xhr);
            console.log('====================================');
            toastr["error"](xhr.responseJSON.message);
            return false;
        }
    });
}

$('#logout').on('click', logout);

async function loadRedeemablePoints() {
    if (!(await ethereum._metamask.isUnlocked())) {
        // Display Error message in Redeem Points Model
        $("#lblAmountError").text("MetaMask Is Locked, Please Unlock It & Reload The Page To Connect!");
        $("#lblAmountError").removeClass("d-none");
        // Disable Redeem points field and Redeem Button
        $("#redeemPoints").prop("disabled", true);
        $("#btnRedeem").prop("disabled", true);
        return;
    }

    const provider = window['ethereum'];
    var network = provider.networkVersion;

    if (network != 97) {
        let sNetworkName;
        switch (network) {
            case "1":
                sNetworkName = "MainNet";
                break;
            case "2":
                sNetworkName = "Morden";
                break;
            case "3":
                sNetworkName = "Ropsten";
                break;
            case "4":
                sNetworkName = "Rinkeby";
                break;
            case "42":
                sNetworkName = "Kovan";
                break;
            case "56":
                sNetworkName = "BSC Mainnet";
                break;
            default:
                sNetworkName = "Unknown";
        }
        bIsValidNetworkSelected = false;
        // Display Error message in Redeem Points Model
        $("#lblAmountError").text("Wrong Network Selected!");
        $("#lblAmountError").removeClass("d-none");
        // Disable Redeem points field and Redeem Button
        $("#redeemPoints").prop("disabled", true);
        $("#btnRedeem").prop("disabled", true);
        return;
    }

    web3 = new Web3(web3.currentProvider);
    var sAccount;
    let aAccounts = await web3.eth.getAccounts();
    sAccount = aAccounts[0];

    if (window.localStorage.getItem("sWalletAddress") != sAccount) {
        bIsValidAccountSelected = false;
        // Display Error message in Redeem Points Model
        $("#lblAmountError").text("Wrong Account Selected!");
        $("#lblAmountError").removeClass("d-none");
        // Disable Redeem points field and Redeem Button
        $("#redeemPoints").prop("disabled", true);
        $("#btnRedeem").prop("disabled", true);
        return;
    }

    var oContract = new web3.eth.Contract(abi, mainContractAddress)

    let nUserEarnings = await oContract.methods.getUsersRedeemablePoints().call({
        from: sAccount
    });

    console.log(nUserEarnings);
    let nAmountInEther = Web3.utils.fromWei(nUserEarnings, 'ether');
    console.log(nAmountInEther);
    $("#txtRedeemablePoints").text(nAmountInEther);

    if (nAmountInEther == 0) {
        $("#redeemPoints").prop("disabled", true);
        $("#btnRedeem").prop("disabled", true);
    }
}

$("#btnRedeem").on("click", async () => {
    if (!(await ethereum._metamask.isUnlocked())) {
        $('#lblAmountError').html('MetaMask Is Locked, Please Unlock It & Reload The Page To Connect!');
        $("#lblAmountError").removeClass("d-none");
        return;
    }
    if (isNaN($("#redeemPoints").val())) {
        $("#lblAmountError").text("Amount Should be Numeric Only!");
        $("#lblAmountError").removeClass("d-none");
        return;
    }
    if ($("#redeemPoints").val() == 0) {
        $("#lblAmountError").text("Please Enter Amount!");
        $("#lblAmountError").removeClass("d-none");
        return;
    }
    if ($("#redeemPoints").val() < 0) {
        $("#lblAmountError").text("Please Enter Value Amount!");
        $("#lblAmountError").removeClass("d-none");
        return;
    }
    if ($("#redeemPoints").val() > $("#txtRedeemablePoints").text()) {
        $("#lblAmountError").text("You Don't Have That Much Points to Redeem!");
        $("#lblAmountError").removeClass("d-none");
        return;
    }

    if (!bIsValidAccountSelected) {
        toastr["error"]("You've selected Wrong Address in MetaMask! Please Select Your Address.");
        return;
    }
    if (!bIsValidNetworkSelected) {
        toastr["error"]('<strong>Attention!</strong> Please connect MetaMask on <b>BSC TestNet</b> You are on ' + sNetworkName + '.');
        return;
    }

    $("#lblAmountError").addClass("d-none");
    $("#btnRedeem").html("<div class='spinner-border spinner-border-sm'></div>").prop("disabled", true);

    web3 = new Web3(web3.currentProvider);
    var sAccount;
    let aAccounts = await web3.eth.getAccounts();
    sAccount = aAccounts[0];
    var oContract = new web3.eth.Contract(abi, mainContractAddress)

    await oContract.methods.redeemPoints(Web3.utils.toWei($("#redeemPoints").val(), 'ether')).send({
        from: sAccount
    }).then((receipt) => {
        console.log(receipt);
        toastr["success"]("Redeemed Points Successfully!");
        setInterval(() => {
            location.reload();
        }, 1000);
    }).catch((error) => {
        console.log(error);
        if (error.code == 4001)
            toastr["error"]("You Denied Transaction Request!");
        else
            toastr["error"]("Something Went Wrong!");
        $("#btnRedeem").html("Redeem").prop("disabled", false);
    });
});
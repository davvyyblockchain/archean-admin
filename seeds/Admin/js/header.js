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

async function web3Connection() {
    if (window.ethereum) {
        window.web3 = new Web3(ethereum);
        try {
            // Request account access if needed
            web3 = new Web3(web3.currentProvider);
            ethereum.autoRefreshOnNetworkChange = false;
            var ee = await ethereum.request({
                method: 'eth_requestAccounts'
            });
            // console.log(ee);        
            // Acccounts now exposed        
            if (ee != undefined) {
                // console.log("inside the try part!!");
                const provider = window['ethereum']; //user account address & network id 
                // console.log(provider.selectedAddress);          
                // console.log(provider.networkVersion); 
                var network = provider.networkVersion;
                console.log(network);
                if (network == undefined || network == null) {
                    try {
                        //   var networkTemp = await App.getNetwork();
                        //   network = networkTemp.result;
                    } catch (e) {
                        toastr["error"]('<strong>Attention!</strong> MetaMask Not Found! Click & Install. <button class="btn btn-warning pull-center   btn-sm RbtnMargin" type="button" id="alert_btn"><a href="https://metamask.io/" target="_blank" style="color:Black;text-decoration: none !important;">Download MetaMask</a></button>');
                        return;
                    }
                }
                switch (network) {
                    case "1":
                        sNetworkName = "MainNet";
                        break;
                    case "2":
                        sNetworkName = "Morden";
                        break;
                    case "97":
                        sNetworkName = "BSC Testnet";
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

                if (web3 && network == 4 && ee != undefined) {
                    console.log('Successfully connected ');
                    console.log(web3);
                    let accounts = await web3.eth.getAccounts();
                    sWalletAddress = accounts[0].toString();

                    console.log(sWalletAddress);
                    
                } else if (web3 || network != 3 || ee == undefined) {
                    toastr["error"]('<strong>Attention!</strong> Please connect MetaMask on <b>Rinkeby Network</b> You are on ' + sNetworkName + '.');
                }
            }
        } catch (error) {
            console.log(error);
            if (error.code == 4001) {
                toastr["error"]('<strong>Attention!</strong> Please approve Metamask connection request to use our platform. <button class="btn btn-warning pull-center   btn-sm RbtnMargin" type="button" onclick="web3Connection()">Connect</button>');
            } else {
                toastr["error"]('<strong>Attention!</strong> Please approve Metamask connection request to use our platform. <button class="btn btn-warning pull-center   btn-sm RbtnMargin" type="button" onclick="web3Connection()">Connect</button>');
            }
        }
    }
    // Non-dapp browsers...
    else {
        toastr["error"]('<strong>Attention!</strong> MetaMask Not Found! Click & Install. <button class="btn btn-warning pull-center   btn-sm RbtnMargin" type="button" id="alert_btn"><a href="https://metamask.io/" target="_blank" style="color:Black;text-decoration: none !important;">Download MetaMask</a></button>');
    }
}
web3Connection();
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
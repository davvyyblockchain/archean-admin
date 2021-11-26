let signInBtn = $('#signinbtn');
let signUpBtn = $('#signupbtn');
const textSpinnerHTML = `<div class='spinner-border spinner-border-sm'></div>`;

$(() => {
    var bIsValidUser = window.location.href.slice(window.location.href.indexOf('?') + 1);

    if (bIsValidUser === "false") {
        // Remove false from the URL
        window.history.pushState("", "", "/");
        toastr["error"]("Please Login to continue!");
        if (window.localStorage.getItem("Authorization") !== null) {
            window.localStorage.removeItem('Authorization');
            window.localStorage.removeItem('sWalletAddress');
            setTimeout(() => {
                window.location.href = '/';
            }, 1000);
        }
    }
});

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

for (var nk = window.location,
        o = $("ul#menu a").filter(function () {
            let nIndexOfLastSlash = this.href.lastIndexOf("/");
            let sEndPoint = this.href.substring(nIndexOfLastSlash + 1);
            if (sEndPoint == "#")
                return;
            return this.href == nk;
        })
        .addClass("active")
        .parent()
        .addClass("active");;) {
    // console.log(o)
    if (!o.is("li")) break;
    o = o.parent()
        .addClass("active");
}

let token = window.localStorage.getItem('Authorization');
let uID;
if (token) {
    $.ajax({
        type: "GET",
        url: "/api/v1/user/profile",
        headers: {
            'Authorization': token
        },
        success: async function (result, status, xhr) {
            console.log(result);
            uID = result.data._id;
            $("#menu-userProfilePicture").attr("src", (result.data.sProfilePicUrl == undefined ? '../assets/images/user-avatar.svg' : 'https://ipfs.io/ipfs/' + result.data.sProfilePicUrl));
            let name = '';
            if (result.data.sUserName) {
                name += `<h5 class="mb-0 font-family-infra-bold mb-1"> @${result.data.sUserName}</h5>`
            } else {
                var firstFive = result.data.sWalletAddress.slice(0, 10);
                var lastFive = result.data.sWalletAddress.slice(result.data.sWalletAddress.length - 8, result.data.sWalletAddress.length);
                name += `<h5 class="mb-0 font-family-infra-bold mb-1">${firstFive}...${lastFive}</h5>`
            }
            $('.user-menu').html(`
                <div class="user-menu-head">
                    <div class="d-flex align-items-center">
                        <img src="${(result.data.sProfilePicUrl == undefined ? '../assets/images/user-avatar.svg' : 'https://ipfs.io/ipfs/' + result.data.sProfilePicUrl)}" class="user-avatar mr-3" />
                        <div class="userinfo"><a href="/profile">${name}</a>
                        </div >
                    </div >
                </div >
            <div class="user-menu-body">
                <ul class="user-menu-list pl-0 list-unstyled">
                    <li class="user-menu-list">
                        <a href="/transferNFT">
                            <img src="../assets/images/transfer-icon.svg" class="img-fluid mr-3" />
                            <span class="font-family-infra-medium">Transfer</span>
                        </a>
                    </li>
                    <li class="user-menu-list">
                        <a href="/collaboratorList">
                            <img src="../assets/images/collaborator-icon.svg" class="img-fluid mr-3" />
                            <span class="font-family-infra-medium">Collaborators</span>
                        </a>
                    </li>
                    <li class="user-menu-list">
                        <a href="#" data-toggle="modal" data-target="#myearnings">
                            <img src="../assets/images/earnings-icon.svg" class="img-fluid mr-3" />
                            <span class="font-family-infra-medium">My Earnings</span>
                        </a>
                    </li>
                    <li class="user-menu-list mb-0">
                        <a id="logoutBtn" class="c-pointer" onclick="logout()">
                            <img src="../assets/images/logout-icon.svg" class="img-fluid mr-3" />
                            <span class="font-family-infra-medium">Logout</span>
                        </a>
                    </li>
                </ul>
            </div>`);
            await loadRedeemablePoints();
        },
        error: function (xhr, status, error) {
            $('.user-menu').html(`<div class="user-menu-head p-2"></div><div class= "user-menu-body" >
        <ul class="user-menu-list pl-0 list-unstyled mb-0">
            <li class="user-menu-list mb-0">
                <a data-toggle="modal" class="c-pointer" data-target="#connetcwallet">
                    <img src="../assets/images/transfer-icon.svg" class="img-fluid mr-3" />
                    <span class="font-family-infra-medium">Connect Wallet</span>
                </a>
            </li>
        </ul>
            </div> `);
        }
    });
} else {
    $('.user-menu').html(`<div class="user-menu-head p-2"></div><div class= "user-menu-body" >
    <ul class="user-menu-list pl-0 list-unstyled mb-0">
        <li class="user-menu-list mb-0">
            <a data-toggle="modal" class="c-pointer" data-target="#connetcwallet">
                <img src="../assets/images/transfer-icon.svg" class="img-fluid mr-3" />
                <span class="font-family-infra-medium">Connect Wallet</span>
            </a>
        </li>
    </ul>
        </div>`);
}
let sWalletAddress;
$('#metamaskConnet').on('click', async () => {
    $('.modal').modal('hide');
    console.log(await ethereum._metamask.isUnlocked());
    if (!(await ethereum._metamask.isUnlocked())) {
        toastr["error"]("MetaMask Is Locked, Please Unlock It & Reload The Page To Connect!");
        return;
    }
    web3Connection();
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
                        networkName = "MainNet";
                        break;
                    case "2":
                        networkName = "Morden";
                        break;
                    case "3":
                        networkName = "Ropsten";
                        break;
                    case "4":
                        networkName = "Rinkeby";
                        break;
                    case "42":
                        networkName = "Kovan";
                        break;
                    case "56":
                        networkName = "BSC Mainnet";
                        break;
                    default:
                        networkName = "Unknown";
                }

                if (web3 && network == 97 && ee != undefined) {
                    console.log('Successfully connected ');
                    console.log(web3);
                    let accounts = await web3.eth.getAccounts();
                    sWalletAddress = accounts[0].toString();

                    console.log(sWalletAddress);
                    var firstFive = sWalletAddress.slice(0, 10);
                    var lastFive = sWalletAddress.slice(sWalletAddress.length - 8, sWalletAddress.length);
                    $('#signinModel').modal('show');
                    $("#metamask-Address").html(`${firstFive}...${lastFive}`);
                    $.ajax({
                        type: "POST",
                        url: "/api/v1/auth/checkuseraddress",
                        data: {
                            sWalletAddress
                        },
                        success: function (result, status, xhr) {
                            console.log(result);
                            if (result.data.sStatus != "active") {
                                toastr["error"]("Your Account Has Been " + result.data.sStatus + ", Please Contact Admin.");
                                return;
                            }
                            signInBtn.css("display", "block");
                            signUpBtn.css("display", "none");
                        },
                        error: function (xhr, status, error) {
                            signUpBtn.css("display", "block");
                            signInBtn.css("display", "none");
                            return false;
                        }
                    });
                } else if (web3 || network != 97 || ee == undefined) {
                    toastr["error"]('<strong>Attention!</strong> Please connect MetaMask on <b>BSC TestNet</b> You are on ' + networkName + '.');
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

try {
    window.ethereum.on('accountsChanged', function (accounts) {
        if (window.localStorage.removeItem('Authorization') != null)
            logout();
        else
            window.location.href = '/';
    });
    window.ethereum.on('chainChanged', function () {
        if (window.localStorage.removeItem('Authorization') != null)
            logout();
        else
            window.location.href = '/';
    });
} catch (error) {
    console.log(error);
}

async function signMessage(methodName) {
    if (window.ethereum) {
        window.web3 = new Web3(ethereum);
        try {
            // Request account access if needed
            web3 = new Web3(web3.currentProvider);
            const timestamp = new Date().getTime();
            const message = `Archean uses this cryptographic signature in place of a password, verifying that you are the owner of this Ethereum address - ${timestamp}`;

            var from;
            let accounts = await web3.eth.getAccounts();
            from = accounts[0];

            console.log(web3.utils.fromUtf8(message));
            // let signature;
            web3.eth.personal.sign(message, from, function (err, signature) {
                if (err) {
                    console.log(err);
                    toastr["error"]('You cancelled the transaction, sign again.');
                } else {
                    console.log(signature);
                }
                if (signature != null) {
                    if (methodName == "Signin") {
                        $.ajax({
                            type: "POST",
                            url: "/api/v1/auth/login",
                            data: {
                                sWalletAddress,
                                sMessage: message,
                                sSignature: signature
                            },
                            success: function (result, status, xhr) {
                                console.log(xhr);
                                window.localStorage.setItem('Authorization', result.data.token);
                                window.localStorage.setItem('sWalletAddress', result.data.sWalletAddress);
                                let headers = new Headers()
                                toastr["success"](xhr.responseJSON.message);
                                token = window.localStorage.getItem('Authorization');
                                // Logout after 45 minutes as the token expires in 1 hour
                                flushDuration = 2700000;
                                setTimeout(() => {
                                    location.reload();
                                }, 1000);
                            },
                            error: function (xhr, status, error) {
                                toastr["error"](xhr.responseJSON.message);
                                console.log(xhr);
                                signInBtn.html(signInBtn.attr('data-normal-text')).prop("disabled", false);
                            }
                        })
                    } else if (methodName == "Signup") {
                        console.log("Signup");
                        $.ajax({
                            type: "POST",
                            url: "/api/v1/auth/register",
                            data: {
                                sWalletAddress,
                                sMessage: message,
                                sSignature: signature
                            },
                            success: function (result, status, xhr) {
                                console.log(xhr);
                                window.localStorage.setItem('Authorization', result.data.token);
                                window.localStorage.setItem('sWalletAddress', result.data.sWalletAddress);
                                let headers = new Headers()
                                toastr["success"](xhr.responseJSON.message);
                                token = window.localStorage.getItem('Authorization');
                                // Logout after 45 minutes as the token expires in 1 hour
                                flushDuration = 2700000;
                                setTimeout(() => {
                                    window.location.href = '/profile';
                                }, 1000);
                            },
                            error: function (xhr, status, error) {
                                toastr["error"](xhr.responseJSON.message);
                                console.log(xhr);
                                signUpBtn.html(signUpBtn.attr('data-normal-text')).prop("disabled", false);
                            }
                        });
                    } else {
                        console.log("errr");
                        signUpBtn.html(signUpBtn.attr('data-normal-text')).prop("disabled", false);
                        signInBtn.html(signInBtn.attr('data-normal-text')).prop("disabled", false);
                        return false;
                    }
                } else {
                    signUpBtn.html(signUpBtn.attr('data-normal-text')).prop("disabled", false);
                    signInBtn.html(signInBtn.attr('data-normal-text')).prop("disabled", false);
                    return false
                }
            });
        } catch (error) {
            console.log(error);
            if (error.code == 4001) {
                toastr["error"]('<strong>Attention!</strong> Please approve Metamask connection request to use our platform. <button class="btn btn-warning pull-center   btn-sm RbtnMargin" type="button" onclick="web3Connection()">Connect</button>');
            } else {
                toastr["error"]('<strong>Attention!</strong> Please approve Metamask connection request to use our platform. <button class="btn btn-warning pull-center   btn-sm RbtnMargin" type="button" onclick="web3Connection()">Connect</button>');
            }
            signUpBtn.html(signUpBtn.attr('data-normal-text')).prop("disabled", false);
            signInBtn.html(signInBtn.attr('data-normal-text')).prop("disabled", false);
        }
    }
    // Non-dapp browsers...
    else {
        toastr["error"]('<strong>Attention!</strong> MetaMask Not Found! Click & Install. <button class="btn btn-warning pull-center   btn-sm RbtnMargin" type="button" id="alert_btn"><a href="https://metamask.io/" target="_blank" style="color:Black;text-decoration: none !important;">Download MetaMask</a></button>');
        signUpBtn.html(signUpBtn.attr('data-normal-text')).prop("disabled", false);
        signInBtn.html(signInBtn.attr('data-normal-text')).prop("disabled", false);
    }
}

signInBtn.on('click', function signin() {
    signInBtn.html(textSpinnerHTML).prop("disabled", true);
    signMessage("Signin")
});


signUpBtn.on('click', function signUp() {
    signUpBtn.html(textSpinnerHTML).prop("disabled", true);
    signMessage("Signup");
});

function logout() {
    $('#logoutBtn').css('pointer-events', 'none');
    $.ajax({
        type: "POST",
        url: "/api/v1/auth/logout",
        headers: {
            'Authorization': token
        },
        success: function (result, status, xhr) {
            toastr["success"](xhr.responseJSON.message);
            setTimeout(function () {
                // localStorage.removeItem("flushDuration");
                flushDuration = 0;
                window.localStorage.removeItem('Authorization');
                window.localStorage.removeItem('sWalletAddress');
                window.location.href = '/';
            }, 500)
        },
        error: function (xhr, status, error) {
            $('#logoutBtn').css('pointer-events', '');
            toastr["error"](xhr.responseJSON.message);
            return false;
        }
    });
};

async function loadRedeemablePoints() {
    web3 = new Web3(web3.currentProvider);
    var sAccount;
    let accounts = await web3.eth.getAccounts();
    sAccount = accounts[0];

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

    $("#lblAmountError").addClass("d-none");
    $("#btnRedeem").prop("disabled", true);

    web3 = new Web3(web3.currentProvider);
    var sAccount;
    let accounts = await web3.eth.getAccounts();
    sAccount = accounts[0];

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
        $("#btnRedeem").prop("disabled", false);
    });
});

// Search Button
$("#btnSearch").on("click", () => {
    console.log($("#searchNFT").val());
    if ($("#searchNFT").val().trim() !== "")
        window.location.href = "/listing?search=" + $("#searchNFT").val();
});

$("#searchNFT").on('keyup', function (e) {
    if (e.key === 'Enter' || e.keyCode === 13) {
        window.location.href = "/listing?search=" + $("#searchNFT").val();
    }
});
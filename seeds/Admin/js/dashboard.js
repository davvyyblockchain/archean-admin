$(async () => {
    web3 = new Web3(web3.currentProvider);
    // console.log(web3.eth);
    // web3.eth.handleRevert = true;
    // console.log(web3.eth);
    if (!window.ethereum || !window.ethereum.networkVersion) {
        toastr["error"]('<strong>Attention!</strong> MetaMask Not Found! Click & Install. <button class="btn btn-warning pull-center   btn-sm RbtnMargin" type="button" id="alert_btn"><a href="https://metamask.io/" target="_blank" style="color:Black;text-decoration: none !important;">Download MetaMask</a></button>');
        return;
    } else if (window.ethereum.networkVersion != 3) {
        let sNetworkName;
        switch (window.ethereum.networkVersion) {
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
        toastr["error"]('<strong>Attention!</strong> Please connect MetaMask on <b>Ropsten</b> You are on ' + sNetworkName + '.');
        return;
    }
    var abi = [{"inputs":[],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":true,"internalType":"address","name":"spender","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Approval","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"bytes32","name":"serial","type":"bytes32"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Burned","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"FeeUpdated","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"bytes32","name":"serial","type":"bytes32"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Minted","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"previousOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Transfer","type":"event"},{"inputs":[{"internalType":"address","name":"tokenOwner","type":"address"},{"internalType":"address","name":"spender","type":"address"}],"name":"allowance","outputs":[{"internalType":"uint256","name":"remaining","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"value","type":"uint256"}],"name":"approve","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"who","type":"address"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":"balance","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"bytes32","name":"serial","type":"bytes32"}],"name":"burn","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"burner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"decimals","outputs":[{"internalType":"uint8","name":"","type":"uint8"}],"stateMutability":"pure","type":"function"},{"inputs":[{"internalType":"address","name":"to","type":"address"},{"internalType":"bytes32","name":"serial","type":"bytes32"},{"internalType":"uint256","name":"value","type":"uint256"}],"name":"mint","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"minter","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"name","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"pure","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"renounceOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"name":"stock","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"stockCount","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"symbol","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"pure","type":"function"},{"inputs":[],"name":"totalSupply","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"value","type":"uint256"}],"name":"transfer","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"value","type":"uint256"}],"name":"transferFrom","outputs":[{"internalType":"bool","name":"success","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"who","type":"address"}],"name":"updateBurner","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"who","type":"address"}],"name":"updateMinter","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"}];
    var mainContractAddress = '0xc40cf7db1b2ff4758d5cd1e4172f4d094bbe3fe6';
    var oContract = new web3.eth.Contract(abi, mainContractAddress)
    let totalSupply = await oContract.methods.totalSupply().call();
    let aAccounts = await web3.eth.getAccounts();
    sAccount = aAccounts[0];
    const userBalance = await oContract.methods.balanceOf(sAccount).call();
    console.log(sAccount);
    totalSupply = Math.round(totalSupply / 10000);
     $("#totalSupply").text(totalSupply);
     $("#balancetotransfer").text(userBalance);
    if (!(await ethereum._metamask.isUnlocked())) {
        $('#commissionPercentage-error').html('MetaMask Is Locked, Please Unlock It & Reload The Page To Connect!');
        $('#commissionPercentage-error').css("display", "block");
    }
});


$("#burnTokens").on("click", async () => {
    if (!(await ethereum._metamask.isUnlocked())) {
        $('#commissionPercentage-error').html('MetaMask Is Locked, Please Unlock It & Reload The Page To Connect!');
        $('#commissionPercentage-error').css("display", "block");
        return;
    }
    if ($("#serial").val() == '') {
        $('#commissionPercentage-error').closest(".form-group").removeClass("is-invalid").addClass("is-invalid")
        $('#commissionPercentage-error').html('Please Enter Serial');
        $('#commissionPercentage-error').css("display", "block");
        return;
    } else {
        $('#commissionPercentage-error').closest(".form-group").removeClass("is-invalid").addClass("is-valid")
        $('#commissionPercentage-error').html('');
        $('#commissionPercentage-error').css("display", "none");
    }
    if (!window.ethereum || !window.ethereum.networkVersion) {
        toastr["error"]('<strong>Attention!</strong> MetaMask Not Found! Click & Install. <button class="btn btn-warning pull-center   btn-sm RbtnMargin" type="button" id="alert_btn"><a href="https://metamask.io/" target="_blank" style="color:Black;text-decoration: none !important;">Download MetaMask</a></button>');
        return;
    }

    let bIsValidNetworkSelected = false;
    let sNetworkName;
    switch (window.ethereum.networkVersion) {
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
        case "3":
            sNetworkName = "Ropsten";
            bIsValidNetworkSelected = true;
            break;
        default:
            sNetworkName = "Unknown";
    }
    
    if (!bIsValidNetworkSelected) {
        toastr["error"]('<strong>Attention!</strong> Please connect MetaMask on <b>Ropsten TestNet</b> You are on ' + sNetworkName + '.');
        return;
    }

    $("#burnTokens").html("<div class='spinner-border spinner-border-sm'></div>").prop("disabled", true);
    //console.log(parseInt($("#txtCommission").val()));

    web3 = new Web3(web3.currentProvider);

    var abi = [{"inputs":[],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":true,"internalType":"address","name":"spender","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Approval","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"bytes32","name":"serial","type":"bytes32"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Burned","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"FeeUpdated","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"bytes32","name":"serial","type":"bytes32"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Minted","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"previousOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Transfer","type":"event"},{"inputs":[{"internalType":"address","name":"tokenOwner","type":"address"},{"internalType":"address","name":"spender","type":"address"}],"name":"allowance","outputs":[{"internalType":"uint256","name":"remaining","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"value","type":"uint256"}],"name":"approve","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"who","type":"address"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":"balance","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"bytes32","name":"serial","type":"bytes32"}],"name":"burn","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"burner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"decimals","outputs":[{"internalType":"uint8","name":"","type":"uint8"}],"stateMutability":"pure","type":"function"},{"inputs":[{"internalType":"address","name":"to","type":"address"},{"internalType":"bytes32","name":"serial","type":"bytes32"},{"internalType":"uint256","name":"value","type":"uint256"}],"name":"mint","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"minter","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"name","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"pure","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"renounceOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"name":"stock","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"stockCount","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"symbol","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"pure","type":"function"},{"inputs":[],"name":"totalSupply","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"value","type":"uint256"}],"name":"transfer","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"value","type":"uint256"}],"name":"transferFrom","outputs":[{"internalType":"bool","name":"success","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"who","type":"address"}],"name":"updateBurner","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"who","type":"address"}],"name":"updateMinter","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"}];
    var mainContractAddress = '0xc40cf7db1b2ff4758d5cd1e4172f4d094bbe3fe6';

    var oContract = new web3.eth.Contract(abi, mainContractAddress);
    var sAccount;

    let aAccounts = await web3.eth.getAccounts();
    if (!aAccounts) {
        toastr["error"]("No Accounts Found!");
        $("#burnTokens").html("Burn").prop("disabled", false);
        return;
    }
    sAccount = aAccounts[0];
    console.log(sAccount);

    try {
        await oContract.methods.burn($("#serial").val().trim()).send({
            from: sAccount
        }).then((receipt) => {
            console.log(receipt);
            if(receipt.status)
            {
                toastr["success"]("Burned Successfully.");
            }
            else
            {
                toastr["error"]("Burned Successfully.");
            }
            $("#burnTokens").html("Burn").prop("disabled", false);
        }).catch((err) => {
            console.log(err);
            if (err.code == 4001) {
                toastr["error"]("Transaction Signature Denied!");
            } else {
                toastr["error"]("Something Went Wrong!");
            }
            $("#burnTokens").html("Burn").prop("disabled", false);
        });
        $("#serial").val('');
    } catch (error) {
        console.log(error);
        toastr["error"]("Something Went Wrong!");
        $("#serial").val('');
        $("#burnTokens").html("Burn").prop("disabled", false);
    }
});


$("#mintTokens").on("click", async () => {
    if (!(await ethereum._metamask.isUnlocked())) {
        $('#commissionPercentage-error').html('MetaMask Is Locked, Please Unlock It & Reload The Page To Connect!');
        $('#commissionPercentage-error').css("display", "block");
        return;
    }
    if ($("#serial2").val() == '') {
        $('#commissionPercentage-error').closest(".form-group").removeClass("is-invalid").addClass("is-invalid")
        $('#commissionPercentage-error').html('Please Enter Serial');
        $('#commissionPercentage-error').css("display", "block");
        return;
    } else {
        $('#commissionPercentage-error').closest(".form-group").removeClass("is-invalid").addClass("is-valid")
        $('#commissionPercentage-error').html('');
        $('#commissionPercentage-error').css("display", "none");
    }
    if (!window.ethereum || !window.ethereum.networkVersion) {
        toastr["error"]('<strong>Attention!</strong> MetaMask Not Found! Click & Install. <button class="btn btn-warning pull-center   btn-sm RbtnMargin" type="button" id="alert_btn"><a href="https://metamask.io/" target="_blank" style="color:Black;text-decoration: none !important;">Download MetaMask</a></button>');
        return;
    }

    let bIsValidNetworkSelected = false;
    let sNetworkName;
    switch (window.ethereum.networkVersion) {
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
        case "3":
            sNetworkName = "Ropsten";
            bIsValidNetworkSelected = true;
            break;
        default:
            sNetworkName = "Unknown";
    }
    
    if (!bIsValidNetworkSelected) {
        toastr["error"]('<strong>Attention!</strong> Please connect MetaMask on <b>Ropsten TestNet</b> You are on ' + sNetworkName + '.');
        return;
    }

    $("#mintTokens").html("<div class='spinner-border spinner-border-sm'></div>").prop("disabled", true);
    //console.log(parseInt($("#txtCommission").val()));

    web3 = new Web3(web3.currentProvider);

    var abi = [{"inputs":[],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":true,"internalType":"address","name":"spender","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Approval","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"bytes32","name":"serial","type":"bytes32"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Burned","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"FeeUpdated","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"bytes32","name":"serial","type":"bytes32"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Minted","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"previousOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Transfer","type":"event"},{"inputs":[{"internalType":"address","name":"tokenOwner","type":"address"},{"internalType":"address","name":"spender","type":"address"}],"name":"allowance","outputs":[{"internalType":"uint256","name":"remaining","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"value","type":"uint256"}],"name":"approve","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"who","type":"address"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":"balance","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"bytes32","name":"serial","type":"bytes32"}],"name":"burn","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"burner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"decimals","outputs":[{"internalType":"uint8","name":"","type":"uint8"}],"stateMutability":"pure","type":"function"},{"inputs":[{"internalType":"address","name":"to","type":"address"},{"internalType":"bytes32","name":"serial","type":"bytes32"},{"internalType":"uint256","name":"value","type":"uint256"}],"name":"mint","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"minter","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"name","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"pure","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"renounceOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"name":"stock","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"stockCount","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"symbol","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"pure","type":"function"},{"inputs":[],"name":"totalSupply","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"value","type":"uint256"}],"name":"transfer","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"value","type":"uint256"}],"name":"transferFrom","outputs":[{"internalType":"bool","name":"success","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"who","type":"address"}],"name":"updateBurner","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"who","type":"address"}],"name":"updateMinter","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"}];
    var mainContractAddress = '0xc40cf7db1b2ff4758d5cd1e4172f4d094bbe3fe6';
    
    var oContract = new web3.eth.Contract(abi, mainContractAddress);
    var sAccount;

    let aAccounts = await web3.eth.getAccounts();
    if (!aAccounts) {
        toastr["error"]("No Accounts Found!");
        $("#mintTokens").html("Mint").prop("disabled", false);
        return;
    }
    sAccount = aAccounts[0];
    console.log("selected "+sAccount);

    try {
        const to = $("#to_wallet_Addresss").val().trim();
        const serial = $("#serial2").val().trim();
        const tokens = $("#number_of_tokens").val().trim();
        await oContract.methods.mint(to,serial,tokens).send({
            from: sAccount
        }).then((receipt) => {
            console.log(receipt);
            if(receipt.status)
            {
                toastr["success"]("Minted Successfully.");
            }
            $("#to_wallet_Addresss").val('');
            $("#serial2").val('');
            $("#number_of_tokens").val('');
            $("#mintTokens").html("Mint").prop("disabled", false);
        }).catch((err) => {
            console.log(err);
            if (err.code == 4001) {
                toastr["error"]("Transaction Signature Denied!");
            } else {
                toastr["error"]("Something Went Wrong!");
            }
            $("#mintTokens").html("Mint").prop("disabled", false);
        });
    } catch (error) {
        console.log(error);
        toastr["error"]("Something Went Wrong!");
        $("#mintTokens").html("Mint").prop("disabled", false);
    }
});

$(document).ready(() => {
    $.ajax({
        type: "GET",
        url: "/api/v1/admin/getDashboardData",
        headers: {
            'Authorization': token
        },
        success: (result, status, xhr) => {
            console.log(result);
            $("#numberOfUsers").text(result.data.nTotalRegisterUsers);
            $("#numberOfNFTsOnSale").text(result.data.nFixedSaleNFTsCount);
            $("#numberOfNFTsOnAuction").text(result.data.nAuctionNFTsCount);
            $("#numberOfNFTsSold").text(result.data.nSoldNFTsCount);

            var dates = [];
            var count = [];
            for (let I = 0; I < result.data.data.length; I++) {
                var date = new Date(result.data.data[I].date).toUTCString();
                date = date.substr(5, 6)
                dates.push(date)
                count.push(result.data.data[I].count)
            }
            dates.reverse();
            count.reverse();

            console.log('====================================');
            console.log(dates, count);
            console.log('====================================');

            var lineChart = 'activityLine';
            if ($('#' + lineChart).length > 0) {
                var lineCh = document.getElementById(lineChart).getContext("2d");

                var chart = new Chart(lineCh, {
                    // The type of chart we want to create
                    type: 'line',

                    // The data for our dataset
                    data: {
                        labels: dates,
                        datasets: [{
                            label: "",
                            tension: 0.4,
                            backgroundColor: 'transparent',
                            borderColor: '#2c80ff',
                            pointBorderColor: "#2c80ff",
                            pointBackgroundColor: "#fff",
                            pointBorderWidth: 2,
                            pointHoverRadius: 6,
                            pointHoverBackgroundColor: "#fff",
                            pointHoverBorderColor: "#2c80ff",
                            pointHoverBorderWidth: 2,
                            pointRadius: 6,
                            pointHitRadius: 6,
                            data: count,
                        }]
                    },

                    // Configuration options go here
                    options: {
                        legend: {
                            display: false
                        },
                        maintainAspectRatio: false,
                        tooltips: {
                            callbacks: {
                                title: function (tooltipItem, data) {
                                    return 'Date : ' + data['labels'][tooltipItem[0]['index']];
                                },
                                label: function (tooltipItem, data) {
                                    return data['datasets'][0]['data'][tooltipItem['index']] + ' Users';
                                }
                            },
                            backgroundColor: '#eff6ff',
                            titleFontSize: 13,
                            titleFontColor: '#6783b8',
                            titleMarginBottom: 10,
                            bodyFontColor: '#9eaecf',
                            bodyFontSize: 14,
                            bodySpacing: 4,
                            yPadding: 15,
                            xPadding: 15,
                            footerMarginTop: 5,
                            displayColors: false
                        },
                        scales: {
                            yAxes: [{
                                ticks: {
                                    beginAtZero: true,
                                    fontSize: 12,
                                    fontColor: '#9eaecf',

                                },
                                gridLines: {
                                    color: "#e5ecf8",
                                    tickMarkLength: 0,
                                    zeroLineColor: '#e5ecf8'
                                },

                            }],
                            xAxes: [{
                                ticks: {
                                    fontSize: 12,
                                    fontColor: '#9eaecf',
                                    source: 'auto',
                                },
                                gridLines: {
                                    color: "transparent",
                                    tickMarkLength: 20,
                                    zeroLineColor: '#e5ecf8',
                                },
                            }]
                        }
                    }
                });
            }
        },
        error: (xhr, status, error) => {
            console.log(xhr);
            return false;
        }
    });
});
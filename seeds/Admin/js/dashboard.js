
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
    
    var oContract = new web3.eth.Contract(abi, mainContractAddress)
    let totalSupply = await oContract.methods.totalSupply().call();
    let aAccounts = await web3.eth.getAccounts();
    sAccount = aAccounts[0];
    const userBalance = await oContract.methods.balanceOf(sAccount).call();
    console.log(sAccount);
    totalSupply = Math.floor(totalSupply / 10000);
     $("#totalSupply").text(totalSupply);
     $("#balancetotransfer").text('Your Balance: '+userBalance / 10000+' (ARC)');
     $("#number_of_tokens_transfer").attr({"max" : (userBalance / 10000)});

      //when keyup  
    $('#number_of_tokens_transfer').keyup(function(event){ 
        //run the character number check  
        if($('#number_of_tokens_transfer').val() > (userBalance / 10000)){  

            $('#number_of_tokens_transfer').val('');

        }
    });

    if (!(await ethereum._metamask.isUnlocked())) {
        $('#commissionPercentage-error').html('MetaMask Is Locked, Please Unlock It & Reload The Page To Connect!');
        $('#commissionPercentage-error').css("display", "block");
    }
});

async function refreshDashboardData()
{
    var oContract = new web3.eth.Contract(abi, mainContractAddress)
    let totalSupply = await oContract.methods.totalSupply().call();
    let aAccounts = await web3.eth.getAccounts();
    sAccount = aAccounts[0];
    const userBalance = await oContract.methods.balanceOf(sAccount).call();
    totalSupply = Math.floor(totalSupply / 10000);
     $("#totalSupply").text(totalSupply);
     $("#balancetotransfer").text('Your Balance: '+userBalance / 10000+' (ARC)');
}

$("#burnTokens").on("click", async () => {
    if (!(await ethereum._metamask.isUnlocked())) {
        toastr["success"]('MetaMask Is Locked, Please Unlock It & Reload The Page To Connect!');
        return;
    }
    if ($("#serial__burn").val() == '') {
        toastr["success"]('Please enter a serial number.');
        return;
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
        const currentGasPrice = await web3.eth.getGasPrice();
        const txEstimateGas = await oContract.methods.burn($("#serial__burn").val().trim())
                                .estimateGas({
                                    from: sAccount
                                });
        console.log("Estimated gas:"+txEstimateGas);
        await oContract.methods.burn($("#serial__burn").val().trim()).send({
            from: sAccount,
            gas: txEstimateGas + parseInt(txEstimateGas * 0.1),
            gasPrice: currentGasPrice
        }).then((receipt) => {
            console.log(receipt);
            if(receipt.status)
            {
                toastr["success"]("Burned Successfully.");
            }
            else
            {
                toastr["error"]("Something went wrong.");
            }
            refreshDashboardData();
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
        $("#serial__burn").val('');
    } catch (error) {
        console.log(error);
        toastr["error"]("Something Went Wrong!");
        $("#serial").val('');
        $("#burnTokens").html("Burn").prop("disabled", false);
    }
});


$("#transferTokens").on("click", async () => {
    
    if (!(await ethereum._metamask.isUnlocked())) {
        toastr["error"]('MetaMask Is Locked, Please Unlock It & Reload The Page To Connect!');
        return;
    }
    if ($("#to_wallet_Addresss_transfer").val() == '') {
        toastr["error"]('Please choose wallet address to send Tokens to.');
        return;
    }
    if ($("#number_of_tokens_transfer").val() == '') {
        toastr["error"]('Please enter number of Tokens to transfer.');
        return;
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

    $("#transferTokens").html("<div class='spinner-border spinner-border-sm'></div>").prop("disabled", true);
    //console.log(parseInt($("#txtCommission").val()));

    web3 = new Web3(web3.currentProvider);
    var oContract = new web3.eth.Contract(abi, mainContractAddress);
    var sAccount;

    let aAccounts = await web3.eth.getAccounts();
    if (!aAccounts) {
        toastr["error"]("No Accounts Found!");
        $("#transferTokens").html("Transfer").prop("disabled", false);
        return;
    }
    sAccount = aAccounts[0];
    console.log(sAccount);

    try {
        toWalletAddress = $("#to_wallet_Addresss_transfer").val().trim();
        console.log(toWalletAddress);
        amount = $("#number_of_tokens_transfer").val().trim();

        const currentGasPrice = await web3.eth.getGasPrice();
        const txEstimateGas = await oContract.methods.transfer(toWalletAddress,amount*10000)
                                .estimateGas({
                                    from: sAccount
                                });
        console.log("Estimated gas:"+txEstimateGas);
        

        await oContract.methods.transfer(toWalletAddress,amount*10000).send({
            from: sAccount,
            gas: txEstimateGas + parseInt(txEstimateGas * 0.1),
            gasPrice: currentGasPrice
        }).then((receipt) => {
            console.log(receipt);
            if(receipt.status)
            {
                toastr["success"]("Transferred Successfully.");
            }
            else
            {
                toastr["error"]("Something went wrong.");
            }
            refreshDashboardData();
            $("#transferTokens").html("Transfer").prop("disabled", false);
        }).catch((err) => {
            console.log(err);
            if (err.code == 4001) {
                toastr["error"]("Transaction Signature Denied!");
            } else {
                toastr["error"]("Something Went Wrong!");
            }
            $("#transferTokens").html("Transfer").prop("disabled", false);
        });
        $("#to_wallet_Addresss_transfer").val('');
        $("#number_of_tokens_transfer").val('');
    } catch (error) {
        console.log(error);
        toastr["error"]("Something Went Wrong!");
        $("#transferTokens").html("Transfer").prop("disabled", false);
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
        let tokens = $("#number_of_tokens").val().trim();

        const currentGasPrice = await web3.eth.getGasPrice();
        const txEstimateGas = await oContract.methods.mint(to,serial,tokens*1000)
                                .estimateGas({
                                    from: sAccount
                                });
        console.log("Estimated gas:"+txEstimateGas);
        await oContract.methods.mint(to,serial,tokens*10000).send({
            from: sAccount,
            gas: txEstimateGas + parseInt(txEstimateGas * 0.1),
            gasPrice: currentGasPrice
        }).then((receipt) => {
            console.log(receipt);
            if(receipt.status)
            {
                toastr["success"]("Minted Successfully.");
            }
            $("#to_wallet_Addresss").val('');
            $("#serial2").val('');
            $("#number_of_tokens").val('');
            refreshDashboardData();
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
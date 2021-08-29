$(async () => {
    web3 = new Web3(web3.currentProvider);
    // console.log(web3.eth);
    // web3.eth.handleRevert = true;
    // console.log(web3.eth);
    if (!window.ethereum || !window.ethereum.networkVersion) {
        toastr["error"]('<strong>Attention!</strong> MetaMask Not Found! Click & Install. <button class="btn btn-warning pull-center   btn-sm RbtnMargin" type="button" id="alert_btn"><a href="https://metamask.io/" target="_blank" style="color:Black;text-decoration: none !important;">Download MetaMask</a></button>');
        return;
    } else if (window.ethereum.networkVersion != 97) {
        let sNetworkName;
        switch (window.ethereum.networkVersion) {
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
        toastr["error"]('<strong>Attention!</strong> Please connect MetaMask on <b>BSC TestNet</b> You are on ' + sNetworkName + '.');
        return;
    }
    var oContract = new web3.eth.Contract(abi, mainContractAddress)
    let nCommissionPercentage = await oContract.methods.getAdminCommissionPercentage().call();
    $("#commissionPercentage").text(nCommissionPercentage);
    if (!(await ethereum._metamask.isUnlocked())) {
        $('#commissionPercentage-error').html('MetaMask Is Locked, Please Unlock It & Reload The Page To Connect!');
        $('#commissionPercentage-error').css("display", "block");
    }
});

$("#btnUpdatePercentage").on("click", async () => {
    if (!(await ethereum._metamask.isUnlocked())) {
        $('#commissionPercentage-error').html('MetaMask Is Locked, Please Unlock It & Reload The Page To Connect!');
        $('#commissionPercentage-error').css("display", "block");
        return;
    }
    if ($("#txtCommission").val() == '') {
        $('#commissionPercentage-error').closest(".form-group").removeClass("is-invalid").addClass("is-invalid")
        $('#commissionPercentage-error').html('Please Enter Percentage');
        $('#commissionPercentage-error').css("display", "block");
        return;
    } else if (isNaN($("#txtCommission").val())) {
        $('#commissionPercentage-error').closest(".form-group").removeClass("is-invalid").addClass("is-invalid")
        $('#commissionPercentage-error').html('Please Enter Numeric Value Only');
        $('#commissionPercentage-error').css("display", "block");
        return;
    } else if ($("#txtCommission").val() <= 0 || $("#txtCommission").val() > 100) {
        $('#commissionPercentage-error').closest(".form-group").removeClass("is-invalid").addClass("is-invalid")
        $('#commissionPercentage-error').html('Please Enter Valid Percentage');
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
    if (!bIsValidAccountSelected) {
        toastr["error"]("You've selected Wrong Address in MetaMask! Please Select Your Address.");
        return;
    }
    if (!bIsValidNetworkSelected) {
        toastr["error"]('<strong>Attention!</strong> Please connect MetaMask on <b>BSC TestNet</b> You are on ' + sNetworkName + '.');
        return;
    }

    $("#btnUpdatePercentage").html("<div class='spinner-border spinner-border-sm'></div>").prop("disabled", true);
    console.log(parseInt($("#txtCommission").val()));

    web3 = new Web3(web3.currentProvider);
    var oContract = new web3.eth.Contract(abi, mainContractAddress)
    var sAccount;

    let aAccounts = await web3.eth.getAccounts();
    if (!aAccounts) {
        toastr["error"]("No Accounts Found!");
        $("#btnUpdatePercentage").html("Update").prop("disabled", false);
        return;
    }
    sAccount = aAccounts[0];
    console.log(sAccount);

    try {
        await oContract.methods.setCommissionPecentage(parseInt($("#txtCommission").val())).send({
            from: sAccount
        }).then((receipt) => {
            console.log(receipt);
            $("#btnUpdatePercentage").html("Update").prop("disabled", false);
        }).catch((err) => {
            console.log(err);
            if (err.code == 4001) {
                toastr["error"]("Transaction Signature Denied!");
            } else {
                toastr["error"]("Something Went Wrong!");
            }
            $("#btnUpdatePercentage").html("Update").prop("disabled", false);
        });
    } catch (error) {
        console.log(error);
        toastr["error"]("Something Went Wrong!");
        $("#btnUpdatePercentage").html("Update").prop("disabled", false);
    }
});
$(() => {
    $.ajax({
        type: "GET",
        url: "/api/v1/user/categories",
        headers: {
            'Authorization': token
        },
        success: function (result, status, xhr) {
            console.log(result);
            for (var i = 0; i < result.data.aCategories.length; i++) {
                $("#nftCategory").append(`<option value="${result.data.aCategories[i].sName}">${result.data.aCategories[i].sName}</option>`);
            }
        },
        error: function (xhr, status, error) {
            toastr["error"](xhr.responseJSON.message);
            return false;
        }
    });

    $.ajax({
        type: "GET",
        url: "/api/v1/nft/collectionlist",
        headers: {
            'Authorization': token
        },
        success: function (result, status, xhr) {
            console.log(result);
            for (var i = 0; i < result.data.length; i++) {
                $("#nftcollection").append(`<option value="${result.data[i].sName}">${result.data[i].sName}</option>`);
            }
        },
        error: function (xhr, status, error) {
            toastr["error"](xhr.responseJSON.message);
            return false;
        }
    });

    $.ajax({
        type: "GET",
        url: "/api/v1/user/getCollaboratorList",
        headers: {
            'Authorization': token
        },
        success: function (result, status, xhr) {
            console.log(result);
            let dropDowns = $("[id='collaborator']");
            for (var i = 0; i < result.data.length; i++) {
                for (let index = 0; index < dropDowns.length; index++) {
                    $("[id='collaborator']")[index].append(new DOMParser().parseFromString(`<option value="${result.data[i].sAddress}">${result.data[i].sFullname}</option>`, "text/html").body.getElementsByTagName("option")[0]);
                }
            }
        },
        error: function (xhr, status, error) {
            toastr["error"](xhr.responseJSON.message);
            return false;
        }
    });
});
// var token = window.localStorage.getItem('Authorization');
function validateEmpty(name) {
    var re = /^(?![\s-])[\w\s-]+$/;
    return re.test(String(name));
}

// NFT type
$('#nftCategory').change(function () {
    if ($(this).val() == 'Audio') {
        console.log("Audio!");
        $('#audioUpload').removeClass('d-none');
        $('#audioUpload').addClass('d-flex');

        $('#imageUpload').removeClass('d-flex');
        $('#imageUpload').addClass('d-none');

        $('#fileUpload').removeClass('d-flex');
        $('#fileUpload').addClass('d-none');
    } else if ($(this).val() == 'Image') {
        console.log("Image!");
        $('#imageUpload').removeClass('d-none');
        $('#imageUpload').addClass('d-flex');

        $('#audioUpload').removeClass('d-flex');
        $('#audioUpload').addClass('d-none');

        $('#fileUpload').removeClass('d-flex');
        $('#fileUpload').addClass('d-none');
    } else {
        // fileUpload
        $('#fileUpload').removeClass('d-none');
        $('#fileUpload').addClass('d-flex');

        $('#imageUpload').removeClass('d-flex');
        $('#imageUpload').addClass('d-none');

        $('#audioUpload').removeClass('d-flex');
        $('#audioUpload').addClass('d-none');
    }
});

// Hide BasePrice input when UnLockable Content is selected
$("#start-auction2").on("click", () => {
    $("#basPrice").css("display", "none");
});

// Show BasePrice input when either Auction or Fixed Sale is selected
$("#start-auction, #start-auction1").on("click", () => {
    $("#basPrice").css("display", "block");
});


function readURL(input) {
    if (input.files && input.files[0]) {

        var reader = new FileReader();
        reader.onload = function (e) {
            console.log(e);
            if ($('#nftCategory').val() == "Image") {
                $('#imagePreview').attr('src', e.target.result);
                $('#imagePreview').hide();
                $('#imagePreview').fadeIn(650);
            } else {
                $('#filePreview').attr('src', e.target.result);
                $('#filePreview').hide();
                $('#filePreview').fadeIn(650);
            }
        }
        reader.readAsDataURL(input.files[0]);
    } else {
        $('#imagePreview').fadeOut(350, () => {
            $('#imagePreview').attr('src', "");
        });
        $('#filePreview').fadeOut(350, () => {
            $('#filePreview').attr('src', "");
        });
    }
}

$("#uploadicon").change(function () {
    readURL(this);
});
$("#collaborator").change(function () {
    if (this.value != '-')
        $('#collaborator-percentage').attr('disabled', false)
    else
        $('#collaborator-percentage').attr('disabled', true)
});
$("#set-royality-percentage").change(function () {
    if (this.checked == true) {
        $('#collaborator_row').css('display', 'block');
        $('#royalty-percentage').attr('disabled', false);
    } else {
        $('#collaborator_row').css('display', 'none');
        $('#royalty-percentage').attr('disabled', true);
    }
});


$("#nftQuantity,#royalty-percentage,#collaborator-percentage,#basePrice").keyup(function () {
    var newValue = $(this).val();
    console.log(newValue);
    if (newValue < 0.0)
        $(this).val("");
    else
        $(this).val(newValue);
});
$('#createNFT').on('click', createNFT);

function createNFT() {

    $('#createNFT').html(textSpinnerHTML).prop("disabled", true);

    var fd = new FormData();
    // This will only work with Image and Audio, NOT with other categories
    var files = ($('#nftCategory').val() != "Audio") ? $('#uploadicon')[0].files : $('#nft-audio')[0].files;
    if (!files[0]) {
        toastr["error"]('Please Select NFT File');
        $('#createNFT').html($('#createNFT').attr("data-normal-text")).prop("disabled", false);
        return;
    }
    fd.append('nftFile', files[0]);
    let sName = $('#nftName').val();
    let sCollection = $('#nftcollection').val();
    let eType = $('#nftCategory').val();
    let nQuantity = $('#nftQuantity').val();
    let nCollaboratorPercentage = $('#collaborator-percentage').val();
    let sSetRroyalityPercentage = ($("#set-royality-percentage").is(":checked")) ? $("#royalty-percentage").val() : 0;
    let sNftdescription = $('#nftdescription').val();
    let eAuctionType = $('input[name="auction-type"]:checked').val();
    let nBasePrice = $('#basePrice').val();

    if (isNaN(sSetRroyalityPercentage) || sSetRroyalityPercentage > 100) {
        toastr["error"]('Please Enter Valid Royalty Percentage');
        $('#createNFT').html($('#createNFT').attr("data-normal-text")).prop("disabled", false);
        return;
    }

    let aCollaboratorAddresses = [];
    let aCollaboratorPercentages = [];

    if (sSetRroyalityPercentage > 0) {
        let dropDowns = $("[id='collaborator']");

        let aPercentagesFields = $("[id='collaborator-percentage']");

        // Get Selected Collaborators
        for (let index = 0; index < dropDowns.length; index++) {
            // 2nd element will the Row To Clone so skip it
            // if (index != 1) {
            const element = dropDowns[index];

            if (element.value == "0x0000000000000000000000000000000000000000")
                continue;
            if (aCollaboratorAddresses.includes(element.value)) {
                toastr["error"]("You Can't select same collaborator multiple times");
                $('#createNFT').html($('#createNFT').attr("data-normal-text")).prop("disabled", false);
                return;
            }

            aCollaboratorAddresses.push(element.value);
            if (isNaN(aPercentagesFields[index].value)) {
                toastr["error"]("Enter Percentage In Numeric Form Only!");
                $('#createNFT').html($('#createNFT').attr("data-normal-text")).prop("disabled", false);
                return;
            }
            if (parseInt(aPercentagesFields[index].value) > 100) {
                toastr["error"]("You Can't Enter More Than 100 Percent!");
                $('#createNFT').html($('#createNFT').attr("data-normal-text")).prop("disabled", false);
                return;
            }
            aCollaboratorPercentages.push(parseInt(aPercentagesFields[index].value));
            // }
        }

        // Push The LoggedIn Users(Creator's) Address
        aCollaboratorAddresses.push(window.localStorage.getItem("sWalletAddress"));
        console.log(aCollaboratorAddresses)

        let nTotalCollaboratorPercentage
        if (aCollaboratorPercentages.length) {
            nTotalCollaboratorPercentage = aCollaboratorPercentages.reduce((num, num1) => {
                return num + num1;
            });
        } else {
            nTotalCollaboratorPercentage = 0;
        }

        aCollaboratorPercentages.push(100 - nTotalCollaboratorPercentage);

        console.log(aCollaboratorPercentages);
        console.log(nTotalCollaboratorPercentage)
        if (nTotalCollaboratorPercentage >= 80) {
            mscConfirm({
                title: 'Alert',
                subtitle: 'Total of Collaborators Percentages is: ' + nTotalCollaboratorPercentage + "%, You'll get only " + (100 - nTotalCollaboratorPercentage) + "% From the Share. \n Are Sure You Want To Continue With The Same?",
                onOk: () => {
                    console.log("Confirmed!");
                    if (validateData())
                        create();
                },
                onCancel: () => {
                    console.log("Denied!");
                    $('#createNFT').html($('#createNFT').attr("data-normal-text")).prop("disabled", false);
                    return;
                },
                okText: 'Yes!',
                cancelText: 'No! I Would Like to Change',
                placeholder: '',
                dismissOverlay: false,
                closeOnEscape: false,
                defaultValue: ''
            });
        } else {
            if (validateData())
                create();
        }
    } else {
        aCollaboratorAddresses.push(window.localStorage.getItem("sWalletAddress"));
        aCollaboratorPercentages.push(0);
        if (validateData())
            create();
    }


    // This method validates the data entered by the User
    function validateData() {
        if (eType == undefined || eType.trim() == "") {
            toastr["error"]('Please Select Type of NFT');
            $('#createNFT').html($('#createNFT').attr("data-normal-text")).prop("disabled", false);
            return;
        }
        if (sName == '') {
            toastr["error"]('Please enter a NFT Name');
            $('#createNFT').html($('#createNFT').attr("data-normal-text")).prop("disabled", false);
            return;
        } else {
            if (!validateEmpty(sName)) {
                toastr["error"]('Please Use Character at beginning');
                $('#createNFT').html($('#createNFT').attr("data-normal-text")).prop("disabled", false);
                return;
            }
        }
        if (nQuantity == '') {
            toastr["error"]('Please Enter Quantity');
            $('#createNFT').html($('#createNFT').attr("data-normal-text")).prop("disabled", false);
            return;
        }
        if (isNaN(nQuantity)) {
            toastr["error"]('Quantity Should Be Numeric Only');
            $('#createNFT').html($('#createNFT').attr("data-normal-text")).prop("disabled", false);
            return;
        }
        if (nQuantity < 1) {
            toastr["error"]('At least 1 Quantity should be entered');
            $('#createNFT').html($('#createNFT').attr("data-normal-text")).prop("disabled", false);
            return;
        }
        if ((nQuantity - Math.floor(nQuantity)) !== 0) {
            toastr["error"]('Quantity must be a whole number');
            $('#createNFT').html($('#createNFT').attr("data-normal-text")).prop("disabled", false);
            return;
        }
        if (eAuctionType == undefined) {
            toastr["error"]('Please Select Selling Type');
            $('#createNFT').html($('#createNFT').attr("data-normal-text")).prop("disabled", false);
            return;
        }

        if (eAuctionType === "Unlockable" && (nBasePrice < 0.000001 || nBasePrice == 0 || nBasePrice == ""))
            nBasePrice = 0.000001;

        if (isNaN(nBasePrice)) {
            toastr["error"]('Price must be Numeric');
            $('#createNFT').html($('#createNFT').attr("data-normal-text")).prop("disabled", false);
            return;
        }
        if (nBasePrice < 0.000001) {
            toastr["error"]('Price must be at least 0.000001');
            $('#createNFT').html($('#createNFT').attr("data-normal-text")).prop("disabled", false);
            return;
        }
        return true;
    }

    // This method creates the NFT
    function create() {

        fd.append('sName', sName);
        fd.append('sCollection', sCollection);
        fd.append('eType', eType);
        fd.append('nQuantity', nQuantity);
        fd.append('sCollaborator', aCollaboratorAddresses);
        fd.append('nCollaboratorPercentage', aCollaboratorPercentages);
        fd.append('sSetRoyaltyPercentage', sSetRroyalityPercentage);
        fd.append('sNftdescription', sNftdescription);
        fd.append('eAuctionType', eAuctionType);
        fd.append('nBasePrice', nBasePrice);

        $.ajax({
            type: "POST",
            url: "/api/v1/nft/create",
            headers: {
                'Authorization': token
            },
            data: fd,
            contentType: false,
            processData: false,
            success: function (result, status, xhr) {
                console.log(xhr);
                // setTimeout(function () {
                //     location.reload();
                // }, 1000)
                console.log(result.data);
                web3Connection(result.data);
            },
            error: function (xhr, status, error) {
                console.log(xhr);
                toastr["error"](xhr.responseJSON.message);
                $('#createNFT').html($('#createNFT').attr("data-normal-text")).prop("disabled", false);
            }
        });
    }
}
let default_Address;
async function web3Connection(fd) {
    if (window.ethereum) {
        window.web3 = new Web3(ethereum);
        try {
            // Request account access if needed
            web3 = new Web3(web3.currentProvider);
            ethereum.autoRefreshOnNetworkChange = false;
            var ee = await ethereum.request({
                method: 'eth_requestAccounts'
            });
            console.log(ee);
            // Accounts now exposed        
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
                        $('#createNFT').html($('#createNFT').attr("data-normal-text")).prop("disabled", false);
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
                    console.log(fd);
                    let accounts = await web3.eth.getAccounts();
                    console.log(accounts);
                    default_Address = accounts[0];

                    var oContract = new web3.eth.Contract(abi, mainContractAddress);

                    let nAdminCommissionPercentage = await oContract.methods.getAdminCommissionPercentage().call();
                    console.log("nAdminCommissionPercentage: " + nAdminCommissionPercentage);

                    let nEstimatedGasLimit = await oContract.methods.mintToken(parseInt(fd.nQuantity) > 1 ? true : false, fd.sHash, fd.sName, parseInt(fd.nQuantity), fd.sSetRroyalityPercentage, fd.sCollaborator, fd.nCollaboratorPercentage).estimateGas({
                        from: default_Address,
                        value: 1
                    });
                    console.log("nEstimatedGasLimit: " + nEstimatedGasLimit);

                    let nGasPrice = parseInt(await web3.eth.getGasPrice());
                    console.log("nGasPrice: " + nGasPrice);

                    let nTotalTransactionCost = nGasPrice * nEstimatedGasLimit;
                    console.log("nTotalTransactionCost: " + nTotalTransactionCost);

                    let nAdminCommission = (nTotalTransactionCost * nAdminCommissionPercentage) / 100;
                    console.log("nAdminCommission: " + nAdminCommission);
                    console.log();

                    oContract.methods.mintToken(parseInt(fd.nQuantity) > 1 ? true : false, fd.sHash, fd.sName, parseInt(fd.nQuantity), fd.sSetRroyalityPercentage, fd.sCollaborator, fd.nCollaboratorPercentage)
                        .send({
                            from: default_Address,
                            value: nAdminCommission,
                            gas: nEstimatedGasLimit
                        })
                        .on('transactionHash', (hash) => {
                            console.log(hash);
                            let oDataToPass = {
                                nNFTId: fd._id,
                                sTransactionHash: hash
                            };
                            console.log(oDataToPass);
                            $.ajax({
                                type: "POST",
                                url: "/api/v1/nft/setTransactionHash",
                                headers: {
                                    'Authorization': token
                                },
                                data: oDataToPass,
                                success: function (result, status, xhr) {
                                    console.log(xhr)
                                    console.log("Updated!");
                                    $('#createNFT').html($('#createNFT').attr("data-normal-text")).prop("disabled", false);
                                    $("#success-nft").modal();
                                },
                                error: function (xhr, status, error) {
                                    console.log(xhr);
                                    toastr["error"](xhr.responseJSON.message);
                                    $('#createNFT').html($('#createNFT').attr("data-normal-text")).prop("disabled", false);
                                }
                            });

                        })
                        .catch(function (error) {
                            console.log(error);
                            if (error.code == 32603) {
                                toastr["error"]("You're connected to wrong network!");
                            }
                            if (error.code == 4001) {
                                toastr["error"]("You Denied Transaction Signature");
                            }
                        });

                } else if (web3 || network != 4 || ee == undefined) {
                    $('#createNFT').html($('#createNFT').attr("data-normal-text")).prop("disabled", false);
                    toastr["error"]('<strong>Attention!</strong> Please connect MetaMask on <b>Mainnet!</b> You are on ' + networkName + '.');
                } else {
                    toastr["error"]('<strong>Attention!</strong> Please connect MetaMask on <b>Mainnet!</b> You are on ' + networkName + '.');
                    $('#createNFT').html($('#createNFT').attr("data-normal-text")).prop("disabled", false);
                }

            }
        } catch (error) {
            console.log(error);
            $('#createNFT').html($('#createNFT').attr("data-normal-text")).prop("disabled", false);
            try {
                error = JSON.parse(error.toString().substr(31, 375));
            } catch (err) {};
            if (error.message) {
                toastr["error"](error.message.substr(error.message.lastIndexOf(": ") + 2, error.message.length));
            } else {
                toastr["error"]('<strong>Attention!</strong> Please approve Metamask connection request to use our platform. <button class="btn btn-warning pull-center   btn-sm RbtnMargin" type="button" onclick="location.reload()">Connect</button>');
            }
        }
    }
    // Non-dapp browsers...
    else {
        $('#createNFT').prop("disabled", false);
        toastr["error"]('<strong>Attention!</strong> MetaMask Not Found! Click & Install. <button class="btn btn-warning pull-center   btn-sm RbtnMargin" type="button" id="alert_btn"><a href="https://metamask.io/" target="_blank" style="color:Black;text-decoration: none !important;">Download MetaMask</a></button>');
    }
}
window.ethereum.on('accountsChanged', function (accounts) {
    // Time to reload your interface with accounts[0]!
    // console.log("Reloadddd address changed!!");  
    location.reload();
});
window.ethereum.on('chainChanged', function () {
    // Time to reload your interface with netId
    location.reload();
});
// Audio Code

$("#nft-audio").change(handleFiles);

const audioPlayer = document.querySelector(".audio-player");
const audiofile = audioPlayer.getAttribute('audio-url');
// let audio = new Audio();
if (audiofile) {
    let audio = new Audio(
        audiofile
    );
}

let audioProgressInterval;

audio.addEventListener(
    "loadeddata",
    () => {

        console.log("loadedData");

        //check audio percentage and update time accordingly
        clearInterval(audioProgressInterval);
        audioProgressInterval = setInterval(() => {
            const progressBar = audioPlayer.querySelector(".progress");
            progressBar.style.marginLeft = audio.currentTime / audio.duration * 100 + "%";
            audioPlayer.querySelector(".time .current").textContent = getTimeCodeFromNum(
                audio.currentTime
            );
        }, 50);

        audioPlayer.querySelector(".time .length").textContent = getTimeCodeFromNum(
            audio.duration
        );
        audio.volume = .75;
    },
    false
);

//click volume slider to change volume
const volumeSlider = audioPlayer.querySelector(".controls .volume-slider");
volumeSlider.addEventListener('click', e => {
    const sliderWidth = window.getComputedStyle(volumeSlider).width;
    const newVolume = e.offsetX / parseInt(sliderWidth);
    audio.volume = newVolume;
    audioPlayer.querySelector(".controls .volume-percentage").style.width = newVolume * 100 + '%';
}, false)


//toggle between playing and pausing on button click
const playBtn = audioPlayer.querySelector(".controls .toggle-play");
playBtn.addEventListener(
    "click",
    () => {
        if (audio.paused) {
            playBtn.classList.remove("play");
            playBtn.classList.add("pause");
            audio.play();
        } else {
            playBtn.classList.remove("pause");
            playBtn.classList.add("play");
            audio.pause();
        }
    },
    false
);

audioPlayer.querySelector(".volume-button").addEventListener("click", () => {
    const volumeEl = audioPlayer.querySelector(".volume-container .volume");
    audio.muted = !audio.muted;
    if (audio.muted) {
        volumeEl.classList.remove("icono-volumeMedium");
        volumeEl.classList.add("icono-volumeMute");
    } else {
        volumeEl.classList.add("icono-volumeMedium");
        volumeEl.classList.remove("icono-volumeMute");
    }
});

//turn 128 seconds into 2:08
function getTimeCodeFromNum(num) {
    let seconds = parseInt(num);
    let minutes = parseInt(seconds / 60);
    seconds -= minutes * 60;
    const hours = parseInt(minutes / 60);
    minutes -= hours * 60;

    if (hours === 0) return `${minutes}:${String(seconds % 60).padStart(2, 0)}`;
    return `${String(hours).padStart(2, 0)}:${minutes}:${String(
        seconds % 60
    ).padStart(2, 0)}`;
}

//nft file upload handler
function handleFiles(event) {

    console.log("handleFiles");

    // If any Audio is Already selected and is being played
    if (audio && !audio.paused) {
        playBtn.click();
        audio = null;
    }

    if (!event.target.files[0]) {
        clearInterval(audioProgressInterval);
        audioPlayer.querySelector(".progress").style.marginLeft = 0;
        audioPlayer.querySelector(".time .current").textContent = '0:00';
        audioPlayer.querySelector(".time .length").textContent = '';
        return;
    }

    var files = event.target.files;
    $("#src").attr("src", URL.createObjectURL(files[0]));
    audio = new Audio(URL.createObjectURL(files[0]));
    document.getElementById("audio").load();
    $('.audiofield-preview').removeClass('d-none')
}

// document.getElementById("nft-audio").addEventListener("change", handleFiles, false);
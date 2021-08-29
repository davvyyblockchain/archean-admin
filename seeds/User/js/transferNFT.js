const NFT_LIMIT = 3;
let NFT_START = 0;
let nNFTId, nQuantity, nTokenID;
let oObjectIDToAudioObjectMapping = {};
let audio;

window.web3 = new Web3(ethereum);
web3 = new Web3(web3.currentProvider);
var oContract = new web3.eth.Contract(abi, mainContractAddress);

let searchCategory = ["All"],
    searchCollection = "",
    searchSellingType = "";
$(() => {
    loadData();
});



// $("select").change(function () {
//     clearPreviousData();
//     loadData();
// })

function clearPreviousData() {
    $("#nftlist").html('');
    $('#loadMoreBtn').attr('start', 0);
    $('#resultShown').html(0);
}

function loadData() {
    $('#loadMoreBtn').removeClass('d-block').fadeOut(function () {
        $('#nftLoader').fadeIn();
    });
    NFT_START = Number($('#loadMoreBtn').attr('start'));

    let oOptions = {
        'length': NFT_LIMIT,
        'start': NFT_START,
        'eType': searchCategory,
        'sTextsearch': $('#searchNFT').val(),
        'sCollection': searchCollection,
        "sSellingType": searchSellingType
    };
    $.ajax({
        type: "POST",
        url: "/api/v1/nft/mynftlist",
        headers: {
            'Authorization': token
        },
        data: oOptions,
        success: function (result, status, xhr) {
            console.log(result);
            showItems = result.data.data.recordsTotal;
            let dataToAppend = '';

            if (result.data.data.length) {
                for (let nData = 0; nData < result.data.data.length; nData++) {
                    // data.data[0].sTransactionStatus
                    if (result.data.data[nData].sTransactionStatus == 1) {
                        if (result.data.data[nData].eType == 'Audio') {
                            var firstFive = result.data.data[nData].oUser[0].sWalletAddress.slice(0, 10);
                            var lastFive = result.data.data[nData].oUser[0].sWalletAddress.slice(result.data.data[nData].oUser[0].sWalletAddress.length - 8, result.data.data[nData].oUser[0].sWalletAddress.length);

                            // Binding Music
                            audio = new Audio(`https://ipfs.io/ipfs/${result.data.data[nData].sHash}`);
                            audio.setAttribute("preload", "metadata");
                            oObjectIDToAudioObjectMapping[result.data.data[nData]._id] = audio;

                            dataToAppend += `<div class="col-md-6 col-lg-6 col-xl-4 mb-4">
                        <div class="nft-card selectable id_${result.data.data[nData]._id}">
                            <div class="nft-card-head overflow-hidden">
                                <a href="#" class="d-flex align-items-center overflow-hidden">
                                    <img src="${(result.data.data[nData].oUser[0].sProfilePicUrl != undefined) ? 'https://ipfs.io/ipfs/' + result.data.data[nData].oUser[0].sProfilePicUrl : './assets/images/user-avatar.svg'} " class="img-fluid mr-3" height="24" width="24">
                                    <span>${(result.data.data[nData].oUser[0].sUserName == undefined || result.data.data[nData].oUser[0].sUserName == "") ? firstFive + '...' + lastFive : "@" + result.data.data[nData].oUser[0].sUserName}</span>
                                </a>
                            </div>
                            <div class="nft-card-body" style="height: 289px;">
                                
                                    <audio id="audio" controls class="d-none">
                                        <source src="https://ipfs.io/ipfs/${result.data.data[nData].sHash}" id="src" />
                                    </audio>
                                    <div class="audio-player">
                                        <div class="preview-thumb" style="text-align: center;">
                                            <img src="../assets/images/audio-preview.png" class="img-fluid" />
                                        </div>
                                        <div class="timeline">
                                            <div class="progress" id="progress_${result.data.data[nData]._id}"></div>
                                        </div>
                                        <div class="controls">
                                            <div class="play-container">
                                                <div class="toggle-play play" objID="${result.data.data[nData]._id}" id="playPauseButtons" onclick="playPause($(this))">
                                                </div>
                                            </div>
                                            <div class="time">
                                                <div class="current d-inline" id="current_${result.data.data[nData]._id}">0:00</div>
                                                <div class="divider d-inline">/</div>
                                                <div class="length d-inline" id="duration_${result.data.data[nData]._id}">
                                            </div>
                                            </div>
                                            <div class="volume-container">
                                                <div class="volume-button">
                                                    <div class="volume icono-volumeMedium"></div>
                                                </div>

                                                <div class="volume-slider">
                                                    <div class="volume-percentage"></div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                
                            </div>
                            <div class="nft-card-footer">
                                <div class="row">
                                    <div class="col">
                                        <a href="#">
                                            <h3 class="font-family-infra-semibold mb-3 text-center text-lg-left">
                                            ${result.data.data[nData].sName}</h3>
                                        </a>
                                    </div>
                                </div>
                                <div class="row">
                                    <div class="col-lg-6">
                                        <p class="mb-0 meta-price font-family-bs-regular text-center text-lg-left">
                                            Base Price:- ${result.data.data[nData].nBasePrice.$numberDecimal} BNB</p>
                                    </div>
                                    <div class="col-lg-6">
                                        <p
                                            class="mb-0 text-capitalize font-family-bs-regular meta-cat text-center text-lg-right">
                                            Category:- ${result.data.data[nData].eType}</p>
                                    </div>
                                </div>
                            </div>
                            <span class="d-none" id="nNFTId" >${result.data.data[nData]._id}</span>
                            <span class="d-none" id="nTokenID">${result.data.data[nData].nTokenID}</span>
                            <span class="d-none" id="nQuantity">${result.data.data[nData].nQuantity}</span>
                        </div>
                    </div>`;
                        } else {
                            var firstFive = result.data.data[nData].oUser[0].sWalletAddress.slice(0, 10);
                            var lastFive = result.data.data[nData].oUser[0].sWalletAddress.slice(result.data.data[nData].oUser[0].sWalletAddress.length - 8, result.data.data[nData].oUser[0].sWalletAddress.length);
                            dataToAppend += `<div class="col-md-6 col-lg-6 col-xl-4 mb-4">
                        <div class="nft-card selectable">
                            <div class="nft-card-head overflow-hidden">
                                <a class="d-flex align-items-center overflow-hidden overflow-hidden">
                                    <img src="${(result.data.data[nData].oUser[0].sProfilePicUrl != undefined) ? 'https://ipfs.io/ipfs/' + result.data.data[nData].oUser[0].sProfilePicUrl : '../assets/images/user-avatar.svg'} " class="img-fluid mr-3" height="24" width="24">
                                    <span>${(result.data.data[nData].oUser[0].sUserName == undefined || result.data.data[nData].oUser[0].sUserName == "") ? firstFive + '...' + lastFive : "@" + result.data.data[nData].oUser[0].sUserName}</span>
                                </a>
                            </div>
                            <div class="nft-card-body">
                                <img src="https://ipfs.io/ipfs/${result.data.data[nData].sHash}" class="img-fluid w-100" style="height:289px" />
                            </div>
                            <div class="nft-card-footer">
                                <div class="row">
                                    <div class="col">
                                        <a href="#">
                                            <h3 class="font-family-infra-semibold mb-3 text-center text-lg-left">
                                            ${result.data.data[nData].sName}</h3>
                                        </a>
                                    </div>
                                </div>
                                <div class="row">
                                    <div class="col-lg-6">
                                        <p class="mb-0 meta-price font-family-bs-regular text-center text-lg-left">
                                            Base Price:- ${result.data.data[nData].nBasePrice.$numberDecimal} BNB</p>
                                    </div>
                                    <div class="col-lg-6">
                                        <p
                                            class="mb-0 text-capitalize font-family-bs-regular meta-cat text-center text-lg-right">
                                            Category:- ${result.data.data[nData].eType}</p>
                                    </div>
                                </div>
                            </div>
                            <span class="d-none" id="nNFTId" >${result.data.data[nData]._id}</span>
                            <span class="d-none" id="nTokenID">${result.data.data[nData].nTokenID}</span>
                            <span class="d-none" id="nQuantity">${result.data.data[nData].nQuantity}</span>
                        </div>
                    </div>`;
                        }
                    }
                }
                $('#NoNFTData').fadeOut();
                $("#nftlist").append(dataToAppend)
                $('.nft-new-item').hide();
                $('#nftLoader').fadeOut(function () {
                    $(".nft-new-item").fadeIn().removeClass('nft-new-item');
                    let nextPage = NFT_START + result.data.data.length;

                    if (nextPage < result.data.recordsTotal) {
                        $('#loadMoreBtn').addClass('d-block').attr('start', nextPage).fadeIn();

                    }
                    $('#resultShown').html(Number($('#resultShown').html()) + result.data.recordsFiltered);
                    $('#resultTotal').html(result.data.recordsTotal);
                });
            } else {
                if (NFT_START == 0) {
                    $('#nftLoader').fadeOut(function () {
                        $('#NoNFTData').fadeIn();
                    });
                }
                $('#btnTransferTo').attr("disabled", true);
                $('#btnTransferTo').attr("title", "No NFT to Transfer");
            }
            loadDuration();
            console.log("aaaaaaaa");
            $('.selectable').click(function (e) {
                e.preventDefault();
                $('.selectable').removeClass('selected');
                $(this).addClass('selected');
                nNFTId = $(this)[0].childNodes[7].textContent;
                nTokenID = $(this)[0].childNodes[9].textContent;
                nQuantity = $(this)[0].childNodes[11].textContent;
            });
        },
        error: function (xhr, status, error) {
            console.log('====================================');
            console.log(xhr);
            console.log('====================================');
            $('#nftLoader').fadeOut(function () {
                $('#NoNFTData').fadeIn();
            });
            return false;
        }
    });
}

function loadDuration() {
    for (const [objID, audioObj] of Object.entries(oObjectIDToAudioObjectMapping)) {
        audioObj.addEventListener("loadedmetadata", () => {
            $("#duration_" + objID).text(getTimeCodeFromNum(audioObj.duration));
        });
    }
}

function playPause(btn) {
    if (oObjectIDToAudioObjectMapping[btn.attr("objID")].paused) {
        btn.removeClass("play");
        btn.addClass("pause");
        oObjectIDToAudioObjectMapping[btn.attr("objID")].play();
        console.log(oObjectIDToAudioObjectMapping[btn.attr("objID")].currentTime);

        // Set Interval
        //check audio percentage and update time accordingly
        oObjectIDToAudioObjectMapping[btn.attr("objID")]["Interval"] = setInterval(() => {
            const progressBar = $("#progress_" + btn.attr("objID"));
            progressBar.css("margin-left", oObjectIDToAudioObjectMapping[btn.attr("objID")].currentTime / oObjectIDToAudioObjectMapping[btn.attr("objID")].duration * 100 + "%");
            $("#current_" + btn.attr("objID")).text(getTimeCodeFromNum(
                oObjectIDToAudioObjectMapping[btn.attr("objID")].currentTime
            ));
        }, 50);
    } else {
        btn.removeClass("pause");
        btn.addClass("play");
        oObjectIDToAudioObjectMapping[btn.attr("objID")].pause();
        console.log(oObjectIDToAudioObjectMapping[btn.attr("objID")].currentTime);
        console.log(oObjectIDToAudioObjectMapping[btn.attr("objID")].duration);

        // Clear Interval
        clearInterval(oObjectIDToAudioObjectMapping[btn.attr("objID")]["Interval"])
    }
}

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

$('#transferbtn').on('click', transfer);

function transfer() {
    // If Not NFT is selected
    if (nTokenID == undefined || nQuantity == undefined) {
        toastr["error"]("Please Select NFT!");
        return;
    }
    // If No Collaborator is Selected
    if ($('#collaborator').val() == "") {
        $("#lblCollaboratorError").text("Please Select Collaborator!");
        $("#lblCollaboratorError").removeClass("d-none");
        return;
    }
    $("#lblCollaboratorError").addClass("d-none");

    if ($("#nftQuantity").val().trim() === "") {
        $("#lblQuantityError").text("Please Enter Quantity");
        $("#lblQuantityError").removeClass("d-none");
        return;
    }
    if (isNaN($("#nftQuantity").val())) {
        $("#lblQuantityError").text("Only Numbers are allowed");
        $("#lblQuantityError").removeClass("d-none");
        return;
    }
    if (+$("#nftQuantity").val() < 0) {
        $("#lblQuantityError").text("Quantity can't be negative");
        $("#lblQuantityError").removeClass("d-none");
        return;
    }
    if (+$("#nftQuantity").val() === 0) {
        $("#lblQuantityError").text("Quantity can't be zero");
        $("#lblQuantityError").removeClass("d-none");
        return;
    }
    if ((+$("#nftQuantity").val() - Math.floor(+$("#nftQuantity").val())) !== 0) {
        $("#lblQuantityError").text("Quantity can't be in decimal point");
        $("#lblQuantityError").removeClass("d-none");
        return;
    }
    if (+$("#nftQuantity").val() > nQuantity) {
        $("#lblQuantityError").text("You don't have that much NFTs");
        $("#lblQuantityError").removeClass("d-none");
        return;
    }
    $("#lblQuantityError").addClass("d-none");
    $('#transferbtn').prop("disabled", true);

    console.log(nTokenID, $('#collaborator').val(), nQuantity);

    oContract.methods.transfer(parseInt(nTokenID), $('#collaborator').val(), parseInt($("#nftQuantity").val()))
        .send({
            from: window.localStorage.getItem("sWalletAddress")
        })
        .on('transactionHash', (hash) => {
            let oOptions = {
                'oRecipient': $('#collaborator').val(),
                'eBidStatus': 'Transfer',
                'oNFTId': nNFTId,
                'nBidPrice': 0,
                'sTransactionHash': hash,
                'nQuantity': $("#nftQuantity").val(),
                "nTokenID": nTokenID
            };
            $.ajax({
                type: "POST",
                url: "/api/v1/bid/create",
                data: oOptions,
                headers: {
                    'Authorization': token
                },
                success: function (result, status, xhr) {
                    console.log(xhr);
                    toastr["success"](xhr.responseJSON.message);
                    setTimeout(function () {
                        window.location.reload();
                    }, 1000)
                },
                error: function (xhr, status, error) {
                    toastr["error"](xhr.responseJSON.message);
                    console.log(xhr);
                    $('#transferbtn').prop("disabled", false);
                }
            });
        }).catch((error) => {
            console.log(error);
            $('#transferbtn').prop("disabled", false);
        });
}
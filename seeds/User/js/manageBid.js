const NFT_LIMIT = 3;
let NFT_START = 0;

let oObjectIDToAudioObjectMapping = {};
let audio, oPreviouslyPlayingAudioID;

$(() => {
    loadData();
});

function loadData() {
    $('#loadMoreBtn').removeClass('d-block').fadeOut(function () {
        $('#nftLoader').fadeIn();
    });
    NFT_START = Number($('#loadMoreBtn').attr('start'));

    console.log($("#searchNFT").val());
    let oOptions = {
        'length': NFT_LIMIT,
        'start': NFT_START,
    };
    $.ajax({
        type: "POST",
        url: "/api/v1/bid/bidByUser",
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
                    console.log(result.data.data[nData].oNFT[0]);
                    let bidStatusLabel;
                    if (result.data.data[nData].eBidStatus == 'Bid') {
                        if (result.data.data[nData].sTransactionStatus === 0)
                            bidStatusLabel = '<span class="bid-status pending ml-auto font-family-bs-medium font-size-16 text-color-pending"> <i title="Waiting To Be Mined" class="fa fa-clock-o text-color-pending" > </i> Pending</span>'
                        else if (result.data.data[nData].sTransactionStatus === 1)
                            bidStatusLabel = '<span class="bid-status pending ml-auto font-family-bs-medium font-size-16 text-color-pending"> <i title="Transaction Mined" class="fa fa-check-circle-o text-color-accepted" > </i> Pending</span>'
                        else {
                            bidStatusLabel = '<span class="bid-status pending ml-auto font-family-bs-medium font-size-16 text-color-pending"> <i title="Transaction Failed" class="fa fa-exclamation-circle text-danger" > </i> Pending</span>';
                        }
                        // (result.data.data[nData].eBidStatus == "Canceled") ? '<span class="bid-status pending ml-auto font-family-bs-medium font-size-16 text-color-cancelled">Canceled</span>' 
                        // : '<span class="bid-status pending ml-auto font-family-bs-medium font-size-16 text-color-accepted">Accepted</span>')
                    } else if (result.data.data[nData].eBidStatus == "Canceled") {
                        if (result.data.data[nData].sTransactionStatus === 0)
                            bidStatusLabel = '<span class="bid-status pending ml-auto font-family-bs-medium font-size-16 text-color-cancelled"> <i title="Waiting To Be Mined" class="fa fa-clock-o text-color-pending" > </i> Canceled</span>'
                        else if (result.data.data[nData].sTransactionStatus === 1)
                            bidStatusLabel = '<span class="bid-status pending ml-auto font-family-bs-medium font-size-16 text-color-cancelled"> <i title="Transaction Mined" class="fa fa-check-circle-o text-color-accepted" > </i> Canceled</span>'
                        else {
                            bidStatusLabel = '<span class="bid-status pending ml-auto font-family-bs-medium font-size-16 text-color-cancelled"> <i title="Transaction Failed" class="fa fa-exclamation-circle text-danger" > </i>  Canceled</span>';
                        }
                    } else if (result.data.data[nData].eBidStatus == "Accepted") {
                        if (result.data.data[nData].sTransactionStatus === 0)
                            bidStatusLabel = '<span class="bid-status pending ml-auto font-family-bs-medium font-size-16 text-color-accepted"> <i title="Waiting To Be Mined" class="fa fa-clock-o text-color-pending" > </i> Accepted</span>'
                        else if (result.data.data[nData].sTransactionStatus === 1)
                            bidStatusLabel = '<span class="bid-status pending ml-auto font-family-bs-medium font-size-16 text-color-accepted"> <i title="Transaction Mined" class="fa fa-check-circle-o text-color-accepted" > </i> Accepted</span>'
                        else {
                            bidStatusLabel = '<span class="bid-status pending ml-auto font-family-bs-medium font-size-16 text-color-accepted"> <i title="Transaction Failed" class="fa fa-exclamation-circle text-danger" > </i> Accepted</span>';
                        }
                    } else {
                        if (result.data.data[nData].sTransactionStatus === 0)
                            bidStatusLabel = '<span class="bid-status pending ml-auto font-family-bs-medium font-size-16 text-color-cancelled"> <i title="Waiting To Be Mined" class="fa fa-clock-o text-color-pending" > </i> Rejected</span>'
                        else if (result.data.data[nData].sTransactionStatus === 1)
                            bidStatusLabel = '<span class="bid-status pending ml-auto font-family-bs-medium font-size-16 text-color-cancelled"> <i title="Transaction Mined" class="fa fa-check-circle-o text-color-accepted" > </i> Rejected</span>'
                        else {
                            bidStatusLabel = '<span class="bid-status pending ml-auto font-family-bs-medium font-size-16 text-color-cancelled"> <i title="Transaction Failed" class="fa fa-exclamation-circle text-danger" > </i>  Rejected</span>';
                        }
                    }
                    if (result.data.data[nData].oNFT[0].eType == 'Audio') {
                        var firstFive = result.data.data[nData].oRecipient[0].sWalletAddress.slice(0, 10);
                        var lastFive = result.data.data[nData].oRecipient[0].sWalletAddress.slice(result.data.data[nData].oRecipient[0].sWalletAddress.length - 8, result.data.data[nData].oRecipient[0].sWalletAddress.length);

                        // Binding Music
                        audio = new Audio(`https://ipfs.io/ipfs/${result.data.data[nData].oNFT[0].sHash}`);
                        audio.setAttribute("preload", "metadata");
                        oObjectIDToAudioObjectMapping[result.data.data[nData].oNFT[0]._id] = audio;

                        dataToAppend += `<div class="col-md-6 col-lg-4 mb-4">
                        <div class="nft-card">
                            <div class="nft-card-head overflow-hidden d-flex align-items-center">
                                <a href="#" class="d-flex align-items-center overflow-hidden">
                                    <img src="${(result.data.data[nData].oRecipient[0].sProfilePicUrl != undefined) ? 'https://ipfs.io/ipfs/' + result.data.data[nData].oRecipient[0].sProfilePicUrl : '../assets/images/user-avatar.svg'} " class="img-fluid mr-3" height="24" width="24">
                                    <span>${(result.data.data[nData].oRecipient[0].sUserName == undefined ? firstFive + '...' + lastFive : "@" + result.data.data[nData].oRecipient[0].sUserName)}</span>
                                </a>
                                ${bidStatusLabel}
                            </div>
                            <div class="nft-card-body" style="height: 289px;">
                                
                                    <audio id="audio" controls class="d-none">
                                        <source src="https://ipfs.io/ipfs/${result.data.data[nData].oNFT[0].sHash}" id="src" />
                                    </audio>
                                    <div class="audio-player">
                                        <div class="preview-thumb" style="text-align: center;">
                                            <img src="../assets/images/audio-preview.png" class="img-fluid" />
                                        </div>
                                        <div class="timeline">
                                            <div class="progress" id="progress_${result.data.data[nData].oNFT[0]._id}"></div>
                                        </div>
                                        <div class="controls">
                                            <div class="play-container">
                                                <div class="toggle-play play" objID="${result.data.data[nData].oNFT[0]._id}" id="id_${result.data.data[nData].oNFT[0]._id}" onclick="playPause($(this))">
                                                </div>
                                            </div>
                                            <div class="time">
                                                <div class="current d-inline" id="current_${result.data.data[nData].oNFT[0]._id}">0:00</div>
                                                <div class="divider d-inline">/</div>
                                                <div class="length d-inline" id="duration_${result.data.data[nData].oNFT[0]._id}">
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
                                        <a href="viewNFT/` + result.data.data[nData].oNFT[0]._id + `">
                                            <h3 class="font-family-infra-semibold mb-3 text-center text-lg-left">
                                            ${result.data.data[nData].oNFT[0].sName}</h3>
                                        </a>
                                    </div>
                                </div>
                                <div class="row">
                                    <div class="col-lg-6">
                                        <p class="mb-0 meta-price font-family-bs-regular text-center text-lg-left">
                                            Base Price:- ${result.data.data[nData].oNFT[0].nBasePrice.$numberDecimal} BNB</p>
                                    </div>
                                    <div class="col-lg-6">
                                        <p
                                            class="mb-0 text-capitalize font-family-bs-regular meta-cat text-center text-lg-right">
                                            Category:- ${result.data.data[nData].oNFT[0].eType}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>`;
                    } else {
                        var firstFive = result.data.data[nData].oRecipient[0].sWalletAddress.slice(0, 10);
                        var lastFive = result.data.data[nData].oRecipient[0].sWalletAddress.slice(result.data.data[nData].oRecipient[0].sWalletAddress.length - 8, result.data.data[nData].oRecipient[0].sWalletAddress.length);
                        dataToAppend += `<div class="col-md-6 col-lg-4 mb-4">
                        <div class="nft-card">
                            <div class="nft-card-head overflow-hidden d-flex align-items-center overflow-hidden">
                                <a href="#" class="d-flex align-items-center overflow-hidden">
                                    <img src="${(result.data.data[nData].oRecipient[0].sProfilePicUrl != undefined) ? 'https://ipfs.io/ipfs/' + result.data.data[nData].oRecipient[0].sProfilePicUrl : '../assets/images/user-avatar.svg'} " class="img-fluid mr-3" height="24" width="24">
                                    <span>${(result.data.data[nData].oRecipient[0].sUserName == undefined ? firstFive + '...' + lastFive : "@" + result.data.data[nData].oRecipient[0].sUserName)}</span>
                                </a>
                                ${bidStatusLabel}
                            </div>
                            <div class="nft-card-body">
                               <a href="viewNFT/` + result.data.data[nData].oNFT[0]._id + `">
                                    <img src="https://ipfs.io/ipfs/${result.data.data[nData].oNFT[0].sHash}" class="img-fluid w-100" style="height:289px" />
                                </a>
                            </div>
                            <div class="nft-card-footer">
                                <div class="row">
                                    <div class="col">
                                       <a href="viewNFT/` + result.data.data[nData].oNFT[0]._id + `">
                                            <h3 class="font-family-infra-semibold mb-3 text-center text-lg-left">
                                            ${result.data.data[nData].oNFT[0].sName}</h3>
                                        </a>
                                    </div>
                                </div>
                                <div class="row">
                                    <div class="col-lg-6">
                                        <p class="mb-0 meta-price font-family-bs-regular text-center text-lg-left">
                                            Base Price:- ${result.data.data[nData].oNFT[0].nBasePrice.$numberDecimal} BNB</p>
                                    </div>
                                    <div class="col-lg-6">
                                        <p
                                            class="mb-0 text-capitalize font-family-bs-regular meta-cat text-center text-lg-right">
                                            Category:- ${result.data.data[nData].oNFT[0].eType}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>`;
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
            }
            loadDuration();
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
    if (oPreviouslyPlayingAudioID !== undefined && oPreviouslyPlayingAudioID != btn.attr("objID")) {
        $("#id_" + oPreviouslyPlayingAudioID).removeClass("pause");
        $("#id_" + oPreviouslyPlayingAudioID).addClass("play");
        oObjectIDToAudioObjectMapping[oPreviouslyPlayingAudioID].pause();
        // Clear Interval
        clearInterval(oObjectIDToAudioObjectMapping[oPreviouslyPlayingAudioID]["Interval"]);
    }
    if (oObjectIDToAudioObjectMapping[btn.attr("objID")].paused) {
        oPreviouslyPlayingAudioID = btn.attr("objID");
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
        oPreviouslyPlayingAudioID = undefined
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
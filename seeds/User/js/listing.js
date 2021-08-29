const NFT_LIMIT = 3;
let NFT_START = 0;

let oObjectIDToAudioObjectMapping = {};
let audio, oPreviouslyPlayingAudioID;

let searchCategory = ["All"],
    searchSellingType = "",
    sortingType = "Recently Added";
$(() => {
    if (window.location.search) {
        console.log(window.location.search);
        console.log(window.location.search.substr(0, window.location.search.lastIndexOf("=")).substr(1));
        if (window.location.search.substr(0, window.location.search.lastIndexOf("=")).substr(1) == "search") {
            console.log("Search");
            let sSearchString = window.location.search.substr(window.location.search.lastIndexOf("=") + 1);
            console.log(sSearchString.replace("%20", " "));
            $("#searchNFT").val(sSearchString.replace("%20", " "));
        } else if (window.location.search.substr(0, window.location.search.lastIndexOf("=")).substr(1) == "sort") {
            let sSortBy = window.location.search.substr(window.location.search.lastIndexOf("=") + 1).replace("%20", " ");
            console.log(sSortBy);

            if (sSortBy == "Recently Added") sortingType = "Recently Added";
            else if (sSortBy == "Most Viewed") sortingType = "Most Viewed";
            else sortingType = "Recently Added";

            $(`option[value="${sSortBy}"]`).attr('selected', 'selected');
        } else if (window.location.search.substr(0, window.location.search.lastIndexOf("=")).substr(1) == "filter") {
            let sFilter = window.location.search.substr(window.location.search.lastIndexOf("=") + 1);
            console.log(sFilter);

            if (sFilter == "sale") {
                $("#btnFixedPriceFilter").css("background", "#C82B51").css("color", "#FFF").data('clicked', true);
                searchSellingType = "Fixed Sale";
            } else if (sFilter == "auction") {
                $("#btnAuctionFilter").css("background", "#C82B51").css("color", "#FFF").data('clicked', true);
                searchSellingType = "Auction";
            } else searchSellingType = "";
        }
    }

    loadCategories();
    loadData();
});

function loadCategories() {
    $.ajax({
        type: "GET",
        url: "/api/v1/user/categories",
        success: function (result, status, xhr) {
            console.log(result);
            for (var i = 0; i < result.data.aCategories.length; i++) {
                $("#categoriesPanel").append(`
                    <div class="form-group">
                        <div class="checkboxf">
                            <input type="checkbox" class="categorychkbx" name="category"
                                value="${result.data.aCategories[i].sName}">
                            <span class="checkmark"></span>
                            ${result.data.aCategories[i].sName}
                        </div>
                    </div>
                `);
            }
        },
        error: function (xhr, status, error) {
            toastr["error"](xhr.responseJSON.message);
            return false;
        }
    });

}

$("#categoriesPanel").on('change', "input[name='category']", function () {
    if ($(this).attr("id") == "chkAllCategory")
        return;
    // Disable Filter/Sort Controls
    toggleControls(true);
    if (this.checked) {
        // Uncheck "All" Checkbox
        $("#chkAllCategory").prop("checked", false);
        // Remove "All" if present
        const nIndex = searchCategory.indexOf("All");
        if (nIndex > -1) {
            searchCategory.splice(nIndex, 1);
        }
        searchCategory.push(this.value);
    } else {
        const nIndex = searchCategory.indexOf(this.value);
        if (nIndex > -1) {
            searchCategory.splice(nIndex, 1);
        }
        if (!searchCategory.length) {
            $("#chkAllCategory").prop("checked", true);
            searchCategory = ["All"];
        }
    }
    clearPreviousData();
    loadData();
});

$("select").change(function () {
    // Disable Filter/Sort Controls
    toggleControls(true);
    console.log(this.value);
    sortingType = this.value;
    clearPreviousData();
    loadData();
})

function toggleControls(bStatus) {
    // All Category Checkboxes
    $("#categoriesPanel * * input[name='category']").prop("disabled", bStatus);
    // Fixed Price Filter Button
    $("#btnFixedPriceFilter").prop("disabled", bStatus);
    // Auction Filter Button
    $("#btnAuctionFilter").prop("disabled", bStatus);
    // Sort Dropdown
    $("#sortFilter").prop("disabled", bStatus);
}

function pauseAudio() {
    /* pause audio */
    $.each(oObjectIDToAudioObjectMapping, function (key, data) {
        data.pause();
        data.currentTime = 0;
    });
    $('.toggle-play').removeClass('pause').addClass('play');
}

function clearPreviousData() {
    pauseAudio();
    $("#nftlist").html('');
    $('#loadMoreBtn').attr('start', 0);
    $('#resultShown').html(0);
}

$("#btnFixedPriceFilter").on('click', () => {

    // Disable Filter/Sort Controls
    toggleControls(true);

    if ($('#btnFixedPriceFilter').data('clicked')) {
        searchSellingType = "";
        $("#btnFixedPriceFilter").css("background", "").css("color", "").data('clicked', false);
    } else {
        searchSellingType = "Fixed Sale";
        $("#btnFixedPriceFilter").css("background", "#C82B51").css("color", "#FFF").data('clicked', true);
        $("#btnAuctionFilter").css("background", "").css("color", "").data('clicked', false);
    }
    clearPreviousData();
    loadData();
});

$("#btnAuctionFilter").on('click', () => {
    // Disable Filter/Sort Controls
    toggleControls(true);

    if ($('#btnAuctionFilter').data('clicked')) {
        searchSellingType = "";
        $("#btnAuctionFilter").css("background", "").css("color", "").data('clicked', false);
    } else {
        searchSellingType = "Auction";
        $("#btnAuctionFilter").css("background", "#C82B51").css("color", "#FFF").data('clicked', true);
        $("#btnFixedPriceFilter").css("background", "").css("color", "").data('clicked', false);
    }
    clearPreviousData();
    loadData();
});


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
        "sSellingType": searchSellingType,
        "sSortingType": sortingType
    };
    $.ajax({
        type: "POST",
        url: "/api/v1/nft/nftListing",
        headers: {
            'Authorization': token
        },
        data: oOptions,
        success: function (result, status, xhr) {
            console.log(result);
            $("#totalRecord").html(result.data.recordsTotal + " results");
            showItems = result.data.recordsTotal;
            let dataToAppend = '';

            if (result.data.data.length) {
                for (let nData = 0; nData < result.data.data.length; nData++) {
                    if (result.data.data[nData].eType == 'Audio') {
                        var firstFive = result.data.data[nData].oUser[0].sWalletAddress.slice(0, 10);
                        var lastFive = result.data.data[nData].oUser[0].sWalletAddress.slice(result.data.data[nData].oUser[0].sWalletAddress.length - 8, result.data.data[nData].oUser[0].sWalletAddress.length);

                        // Binding Music
                        audio = new Audio(`https://ipfs.io/ipfs/${result.data.data[nData].sHash}`);
                        audio.setAttribute("preload", "metadata");
                        oObjectIDToAudioObjectMapping[result.data.data[nData]._id] = audio;

                        dataToAppend += `<div class="col-md-6 col-lg-6 col-xl-4 mb-4">
                        <div class="nft-card id_${result.data.data[nData]._id}">
                            <div class="nft-card-head overflow-hidden">
                                <a href="#" class="d-flex align-items-center overflow-hidden">
                                    <img src="${(result.data.data[nData].oUser[0].sProfilePicUrl != undefined) ? 'https://ipfs.io/ipfs/' + result.data.data[nData].oUser[0].sProfilePicUrl : './assets/images/user-avatar.svg'} " class="img-fluid mr-3" height="24" width="24">
                                    <span>${(result.data.data[nData].oUser[0].sUserName == undefined || result.data.data[nData].oUser[0].sUserName == "") ? firstFive + '...' + lastFive : "@" + result.data.data[nData].oUser[0].sUserName}</span>
                                </a>
                            </div>
                            <div class="nft-card-body">
                                
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
                                                <div class="toggle-play play" objID="${result.data.data[nData]._id}" id="id_${result.data.data[nData]._id}" onclick="playPause($(this))">
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
                                        <a href="viewNFT/` + result.data.data[nData]._id + `">
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
                        </div>
                    </div>`;
                    } else {
                        var firstFive = result.data.data[nData].oUser[0].sWalletAddress.slice(0, 10);
                        var lastFive = result.data.data[nData].oUser[0].sWalletAddress.slice(result.data.data[nData].oUser[0].sWalletAddress.length - 8, result.data.data[nData].oUser[0].sWalletAddress.length);
                        dataToAppend += `<div class="col-md-6 col-lg-6 col-xl-4 mb-4">
                        <div class="nft-card">
                            <div class="nft-card-head overflow-hidden">
                                <a href="#" class="d-flex align-items-center overflow-hidden">
                                    <img src="${(result.data.data[nData].oUser[0].sProfilePicUrl != undefined) ? 'https://ipfs.io/ipfs/' + result.data.data[nData].oUser[0].sProfilePicUrl : './assets/images/user-avatar.svg'} " class="img-fluid mr-3" height="24" width="24">
                                    <span>${(result.data.data[nData].oUser[0].sUserName == undefined || result.data.data[nData].oUser[0].sUserName == "") ? firstFive + '...' + lastFive : "@" + result.data.data[nData].oUser[0].sUserName}</span>
                                </a>
                            </div>
                            <div class="nft-card-body">
                                <a href="viewNFT/` + result.data.data[nData]._id + `">
                                    <img src="https://ipfs.io/ipfs/${result.data.data[nData].sHash}" class="img-fluid w-100" style="height:289px" />
                                </a>
                            </div>
                            <div class="nft-card-footer">
                                <div class="row">
                                    <div class="col">
                                        <a href="viewNFT/` + result.data.data[nData]._id + `">
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
                        </div>
                    </div>`;
                    }
                }
                $('#NoNFTData').fadeOut(() => {
                    $("#nftlist").append(dataToAppend)
                });
                $('.nft-new-item').hide();
                $('#nftLoader').fadeOut(function () {
                    // Enable Filter/Sort Controls
                    toggleControls(false);
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
                        $('#NoNFTData').fadeIn(() => {
                            // Enable Filter/Sort Controls
                            toggleControls(false);
                        });
                    });
                }
            }
            loadDuration();

        },
        error: function (xhr, status, error) {
            console.log('====================================');
            console.log(xhr);
            console.log('====================================');
            toastr["error"](xhr.responseJSON.message);
            $('#nftLoader').fadeOut(function () {
                $('#NoNFTData').fadeIn(() => {
                    // Enable Filter/Sort Controls
                    toggleControls(false);
                });
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
        }, 200);
    } else {
        oPreviouslyPlayingAudioID = undefined
        btn.removeClass("pause");
        btn.addClass("play");
        oObjectIDToAudioObjectMapping[btn.attr("objID")].pause();
        console.log(oObjectIDToAudioObjectMapping[btn.attr("objID")].currentTime);
        console.log(oObjectIDToAudioObjectMapping[btn.attr("objID")].duration);

        // Clear Interval
        clearInterval(oObjectIDToAudioObjectMapping[btn.attr("objID")]["Interval"]);
    }
}

$("#chkAllCategory").on('change', () => {
    if ($("#chkAllCategory").is(":checked")) {
        // Disable Filter/Sort Controls
        toggleControls(true);
        searchCategory = ["All"];

        // Uncheck all the CheckBoxes
        $('input[name="category"]:checked').map(function () {
            if (this.value != "All") {
                $(this).prop("checked", false);
            }
        });

        clearPreviousData();
        loadData();
    }
});

// $('#btnSearch').on('click', searchNFT);

// function searchNFT() {
//     clearPreviousData();
//     loadData();
// }

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
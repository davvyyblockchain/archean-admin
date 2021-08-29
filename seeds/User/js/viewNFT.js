let nNFTId = window.location.pathname.split("/")[2];
window.web3 = new Web3(ethereum);
web3 = new Web3(web3.currentProvider);
var oContract = new web3.eth.Contract(abi, mainContractAddress)
let nTokenID;
let sCurrentOwnerAddress;
let oObjectIDToAudioObjectMapping = {};
let audio;

// Populate NFT
$.ajax({
    type: "GET",
    url: "/api/v1/nft/viewnft/" + nNFTId,
    headers: {
        'Authorization': token
    },
    success: (result, status, xhr) => {
        console.log(result);
        nTokenID = result.data.nTokenID;
        $("#sName,#modal-sName").text(result.data.sName);
        $("#sArtistName").text('Artist Name: ' + result.data.sArtistName);
        $("#nBasePrice,#modal-nBasePrice").text(result.data.nBasePrice.$numberDecimal + " BNB");
        $("#sNftdescription").text(result.data.sNftdescription);
        $("#eType").text(result.data.eType);
        $("#nQuantity").text(result.data.nQuantity);
        $("#eAuctionType").text(result.data.eAuctionType);
        $("#modal-oRecipient").text(result.data.oCurrentOwner._id);
        $("#ownerEmail").text(result.data.oCurrentOwner.sEmail);

        sCurrentOwnerAddress = result.data.oCurrentOwner.sWalletAddress;

        // Populating Creator
        let oPostedBy;
        if (result.data.oPostedBy.sUserName) {
            oPostedBy = `@${result.data.oPostedBy.sUserName}`
        } else {
            var firstFive = result.data.oPostedBy.sWalletAddress.slice(0, 10);
            var lastFive = result.data.oPostedBy.sWalletAddress.slice(result.data.oPostedBy.sWalletAddress.length - 8, result.data.oPostedBy.sWalletAddress.length);
            oPostedBy = `${firstFive}...${lastFive}`
        }
        $("#oPostedBy").append(oPostedBy);
        if (result.data.oPostedBy.sProfilePicUrl != undefined)
            $("#oPostedByProfile").attr("src", "https://ipfs.io/ipfs/" + result.data.oPostedBy.sProfilePicUrl);

        // Populating Current Owner
        let oCurrentOwner;
        if (result.data.oCurrentOwner.sUserName) {
            oCurrentOwner = `@${result.data.oCurrentOwner.sUserName}`
        } else {
            var firstFive = result.data.oCurrentOwner.sWalletAddress.slice(0, 10);
            var lastFive = result.data.oCurrentOwner.sWalletAddress.slice(result.data.oCurrentOwner.sWalletAddress.length - 8, result.data.oCurrentOwner.sWalletAddress.length);
            oCurrentOwner = `${firstFive}...${lastFive}`
        }
        $("#oCurrentOwner,#modal-oCurrentOwner").append(oCurrentOwner);
        if (result.data.oCurrentOwner.sProfilePicUrl != undefined)
            $("#oCurrentOwnerProfile").attr("src", "https://ipfs.io/ipfs/" + result.data.oCurrentOwner.sProfilePicUrl);

        // if (token) {
        if (uID != result.data.oCurrentOwner._id) {
            console.log(uID);
            console.log(result.data.oCurrentOwner._id);
            console.log(result.data.eAuctionType)
            if (result.data.eAuctionType == "Fixed Sale") {
                $("#buynow").show();
                if (!token || !uID) {
                    $("#buynow").find("button").attr("disabled", true).css("cursor", "not-allowed");
                    $("#buynow").attr("title", "Please Login To Buy!");
                }
            } else if (result.data.eAuctionType == "Auction") {
                $("#bidnow").show();
                if (!token || !uID) {
                    $("#bidnow").find("button").attr("disabled", true).css("cursor", "not-allowed");
                    $("#bidnow").attr("title", "Please Login To Bid!");
                }
            }
        } else {
            // Populate Options to change selling type
            let sDataToAppend = `<select name = "nftCategory" id="sellingType" class = "form-control text-color-peach font-family-bs-medium font-size-16" >
            <option value="Fixed Sale" ${(result.data.eAuctionType == "Fixed Sale") ? "selected" : ""}>Fixed Sale</option> 
            <option value="Auction" ${(result.data.eAuctionType == "Auction") ? "selected" : ""}>Auction</option> 
            <option value="Unlockable" ${(result.data.eAuctionType == "Unlockable") ? "selected" : ""}>Unlockable</option>
            </select>`;
            $("#eAuctionType").html(sDataToAppend);
            if (result.data.bStatus == false)
                $("#sellingType").attr("disabled", true).css("cursor", "not-allowed");

            // Display Edit Price Button
            $("#btnEditPrice").show();

            $("#btnUpdatePrice").on("click", function () {
                console.log("New Price: " + $("#txtNewPrice").val());
                if ($('#txtNewPrice').val().trim() == "") {
                    $('#lblNewPriceError').closest(".form-group").removeClass("is-valid").addClass("is-invalid")
                    $('#lblNewPriceError').html("Please Enter Amount");
                    $('#lblNewPriceError').css("display", "block");
                    return;
                } else if (isNaN($('#txtNewPrice').val())) {
                    console.log("Here...!");
                    $('#lblNewPriceError').closest(".form-group").removeClass("is-valid").addClass("is-invalid")
                    $('#lblNewPriceError').html('Amount Must be a Number');
                    $('#lblNewPriceError').css("display", "block");
                    return;
                } else if (parseFloat($('#txtNewPrice').val()) <= 0) {
                    $('#lblNewPriceError').closest(".form-group").removeClass("is-valid").addClass("is-invalid")
                    $('#lblNewPriceError').html('Amount Must be greater than 0');
                    $('#lblNewPriceError').css("display", "block");
                    return;
                } else if (parseFloat($('#txtNewPrice').val()) <= 0.000001) {
                    $('#lblNewPriceError').closest(".form-group").removeClass("is-valid").addClass("is-invalid")
                    $('#lblNewPriceError').html('Amount Must be at least 0.000001');
                    $('#lblNewPriceError').css("display", "block");
                    return;
                } else {
                    $('#lblNewPriceError').closest(".form-group").removeClass("is-invalid").addClass("is-valid")
                    $('#lblNewPriceError').html('');
                    $('#lblNewPriceError').css("display", "none");
                    $("#modal-bid-final-amount").text(`${(+$('#bidQuantity').val() * +$("#modal-nBidPrice").val()).toFixed(8)} BNB`);
                }
                $('#btnUpdatePrice').prop("disabled", true);
                const oData = {
                    nNFTId: nNFTId,
                    nBasePrice: parseFloat($('#txtNewPrice').val())
                };
                $.ajax({
                    type: "PUT",
                    url: "/api/v1/nft/updateBasePrice",
                    headers: {
                        'Authorization': token
                    },
                    data: oData,
                    success: function (result, status, xhr) {
                        console.log(xhr)
                        console.log("Updated!");
                        toastr["success"](xhr.responseJSON.message);
                        setTimeout(() => {
                            location.reload();
                        }, 1000);
                    },
                    error: function (xhr, status, error) {
                        console.log(xhr);
                        toastr["error"](xhr.responseJSON.message);
                        $('#btnUpdatePrice').prop("disabled", false);
                    }
                });
            });

            $("#sellingType").change(function (e) {
                console.log(e.target.value);
                const aSellingTypes = ['Auction', 'Fixed Sale', 'Unlockable'];
                if (!aSellingTypes.includes(e.target.value)) {
                    toastr["error"]("Invalid Selling Type Selected!");
                    return;
                }
                const oData = {
                    nNFTId: nNFTId,
                    sSellingType: e.target.value
                };
                $('#sellingType').prop("disabled", true);
                $.ajax({
                    type: "PUT",
                    url: "/api/v1/nft/toggleSellingType",
                    headers: {
                        'Authorization': token
                    },
                    data: oData,
                    success: function (result, status, xhr) {
                        console.log(xhr)
                        console.log("Updated!");
                        toastr["success"](xhr.responseJSON.message);
                        $('#sellingType').prop("disabled", false);
                    },
                    error: function (xhr, status, error) {
                        console.log(xhr);
                        toastr["error"](xhr.responseJSON.message);
                        $('#sellingType').prop("disabled", false);
                    }
                });
            });
        }

        // Populating Data
        let dataToRender = '';
        if (result.data.eType == 'Audio') {
            // Binding Music
            audio = new Audio(`https://ipfs.io/ipfs/${result.data.sHash}`);
            audio.setAttribute("preload", "metadata");
            oObjectIDToAudioObjectMapping[result.data._id] = audio;
            dataToRender += `<div class="nft-card-body" style="height: 289px;width: max-content">
                <audio id="audio" controls class="d-none">
                    <source src="https://ipfs.io/ipfs/${result.data.sHash}" id="src" />
                </audio>
                <div class="audio-player">
                    <div class="preview-thumb" style="text-align: center;">
                        <img src="../assets/images/audio-preview.png" class="img-fluid" />
                    </div>
                    <div class="timeline">
                        <div class="progress" id="progress_${result.data._id}"></div>
                    </div>
                    <div class="controls">
                        <div class="play-container">
                            <div class="toggle-play play" objID="${result.data._id}" id="playPauseButtons" onclick="playPause($(this))">
                            </div>
                        </div>
                        <div class="time">
                            <div class="current d-inline" id="current_${result.data._id}">0:00</div>
                            <div class="divider d-inline">/</div>
                            <div class="length d-inline" id="duration_${result.data._id}">
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
                </div>`;
        } else {
            $("#img").show();
            $("#img,#modal-img").attr("src", "https://ipfs.io/ipfs/" + result.data.sHash);
        }
        $("#nftImg").append(dataToRender)
        loadDuration();
    },
    error: (xhr, status, error) => {
        toastr["error"](xhr.responseJSON.message);
        return false;
    }
});

// Populate History
$('#BidTable').DataTable({
    processing: true,
    serverSide: true,
    searching: false,
    ordering: false,
    lengthChange: false,
    responsive: true,
    "ajax": {
        "url": "/api/v1/bid/history/" + nNFTId,
        "type": "POST",
        headers: {
            'Authorization': token
        },
        dataFilter: function (data) {
            var json = jQuery.parseJSON(data);
            console.log(json);
            json.recordsTotal = json.data.recordsTotal;
            json.recordsFiltered = json.data.recordsFiltered;
            json.data = json.data.data;
            json.draw = json.data.draw;

            return JSON.stringify(json); // return JSON string
        }
    },
    aoColumns: [{
            mData: 'eBidStatus',
            render: function (mData, type, row) {
                return `<td>${(mData == undefined ? '-' : mData == " " ? '-' : mData)}</td>`;
            }
        }, {
            mData: "oBidder",
            render: function (mData, type, row) {
                let oBidder = '';
                if (mData[0].sUserName) {
                    oBidder += `@${mData[0].sUserName}`
                } else {
                    var firstFive = mData[0].sWalletAddress.slice(0, 10);
                    var lastFive = mData[0].sWalletAddress.slice(mData[0].sWalletAddress.length - 8, mData[0].sWalletAddress.length);
                    oBidder += `${firstFive}...${lastFive}`
                }
                return `<td>${(oBidder == undefined ? '-' : oBidder == " " ? '-' : oBidder)}</td>`;
            }
        }, {
            mData: "oRecipient",
            render: function (mData, type, row) {
                let oRecipient = '';
                if (mData[0].sUserName) {
                    oRecipient += `@${mData[0].sUserName}`
                } else {
                    var firstFive = mData[0].sWalletAddress.slice(0, 10);
                    var lastFive = mData[0].sWalletAddress.slice(mData[0].sWalletAddress.length - 8, mData[0].sWalletAddress.length);
                    oRecipient += `${firstFive}...${lastFive}`
                }
                return `<td>${(oRecipient == undefined ? '-' : oRecipient == " " ? '-' : oRecipient)}</td>`;
            }
        }, {
            mData: "nQuantity",
            render: function (mData, type, row) {
                return `<td>${(mData == undefined ? '-' : mData == " " ? '-' : mData)}</td>`;
            }
        }, {
            mData: "nBidPrice",
            render: function (mData, type, row) {
                return `<td>${(mData == undefined ? '-' : mData == " " ? '-' : mData.$numberDecimal + ` BNB`)}</td>`;
            }
        }, {
            mData: "sCreated",
            render: function (mData, type, row) {
                return `<td>${(mData == undefined ? '-' : mData == " " ? '-' : new Date(mData).toLocaleTimeString("en-us", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }))}</td>`;
            }
        },
        {
            mData: "eBidStatus",
            render: function (mData, type, row) {
                let option = '<td></td><td></td>';
                if (uID == row.oRecipient[0]._id && mData == "Bid") {
                    option = `<td class="text-center">
                            <button class="btn btn-primary btn-peach" id="Status" style="font-size: 14px !important; text-transform: none;" nQty="${row.nQuantity}" name="Accepted" amount="${row.nBidPrice.$numberDecimal}" bidderAddress="${row.oBidder[0].sWalletAddress}" bidderID="${row.oBidder[0]._id}" objId="${row._id}" sCurrentUserEmail="${row.oBidder[0].sEmail}" onclick="toggleStatus($(this))">Accept</button>
                        </td>
                        <td class="text-center">
                        <button class="btn btn-secondary" id="Status" style="font-size: 14px !important; text-transform: none;"  name="Rejected" objId="${row._id}" bidderID="${row.oBidder[0]._id}" bidderAddress="${row.oBidder[0].sWalletAddress}" sCurrentUserEmail="${row.oBidder[0].sEmail}" onclick="toggleStatus($(this))">Reject</button>
                        </td>`;
                } else if (uID == row.oBidder[0]._id && mData == "Bid") {
                    option = `<td colspan="2" class="text-center">
                    <button class="btn btn-primary btn-peach" id="Status" style="font-size: 14px !important; text-transform: none;"  name="Canceled" bidderID="${row.oBidder[0]._id}" objId="${row._id}" onclick="toggleStatus($(this))">Cancel</button>
                </td><td style="display: none;"></td>`;
                }

                return option;
            }
        }
    ],
});

// For Buy Now
function buyQuantityChange() {
    if ($('#nftQuantity').val() < 1) {
        $('#lblQuantityError').removeClass("d-none").addClass("d-block")
        $('#lblQuantityError').html('Must be at least 1');
        $("#modal-final-amount").text(``);
        $("#checkout").prop("disabled", true);
        return;
    } else if ((+$('#nftQuantity').val() - Math.floor(+$('#nftQuantity').val())) !== 0) {
        $('#lblQuantityError').removeClass("d-none").addClass("d-block")
        $('#lblQuantityError').html('Must be a whole number');
        $("#modal-final-amount").text(``);
        $("#checkout").prop("disabled", true);
        return;
    } else if (+$('#nftQuantity').val() > +$("#nQuantity").text()) {
        $('#lblQuantityError').removeClass("d-none").addClass("d-block")
        $('#lblQuantityError').html(`Only ${$("#nQuantity").text()} ${(+$("#nQuantity").text() > 1) ? 'Copies are' : 'Copy is'} available`);
        $("#modal-final-amount").text(``);
        $("#checkout").prop("disabled", true);
        return;
    } else {
        $('#lblQuantityError').removeClass("d-block").addClass("d-none")
        $('#lblQuantityError').html('');
        $("#modal-final-amount").text(`${(+$('#nftQuantity').val() * +$("#modal-nBasePrice").text().split(" ")[0]).toFixed(8)} BNB`);
        $("#checkout").prop("disabled", false);
        return true;
    }
}
$("#nftQuantity").keyup(buyQuantityChange);
$("#nftQuantity").change(buyQuantityChange);

// For Bid
function bidPriceChange() {
    if (parseFloat($('#modal-nBidPrice').val()) <= 0) {
        $('#nBidPrice-error').closest(".form-group").removeClass("is-invalid").addClass("is-invalid")
        $('#nBidPrice-error').html('Amount Must be greater than 0');
        $('#nBidPrice-error').css("display", "block");
        $('#bid-checkout').attr("disabled", true);
        return;
    } else if (parseFloat($('#modal-nBidPrice').val()) < $("#nBasePrice").text().split(" ")[0]) {
        $('#nBidPrice-error').closest(".form-group").removeClass("is-invalid").addClass("is-invalid")
        $('#nBidPrice-error').html(`You must bid at least ` + $("#nBasePrice").text());
        $('#nBidPrice-error').css("display", "block");
        $('#bid-checkout').attr("disabled", true);
        return;
    } else if ($('#modal-nBidPrice').val().trim() == "") {
        $('#nBidPrice-error').closest(".form-group").removeClass("is-invalid").addClass("is-invalid")
        $('#nBidPrice-error').html("Please Enter Amount");
        $('#nBidPrice-error').css("display", "block");
        $('#bid-checkout').attr("disabled", true);
        return;
    } else {
        $('#nBidPrice-error').closest(".form-group").removeClass("is-invalid").addClass("is-valid")
        $('#nBidPrice-error').html('');
        $('#nBidPrice-error').css("display", "none");
        $("#modal-bid-final-amount").text(`${(+$('#bidQuantity').val() * +$("#modal-nBidPrice").val()).toFixed(8)} BNB`);
        $('#bid-checkout').attr("disabled", false);
        return true;
    }
}
$("#modal-nBidPrice").keyup(bidPriceChange);
$("#modal-nBidPrice").change(bidPriceChange);

function bidQuantityChange() {
    if ($('#bidQuantity').val() < 1) {
        $('#lblBidQuantityError').removeClass("d-none").addClass("d-block")
        $('#lblBidQuantityError').html('Quantity Must be at least 1');
        $("#modal-bid-final-amount").text(``);
        $("#bid-checkout").prop("disabled", true);
        return;
    } else if ((+$('#bidQuantity').val() - Math.floor(+$('#bidQuantity').val())) !== 0) {
        $('#lblBidQuantityError').removeClass("d-none").addClass("d-block")
        $('#lblBidQuantityError').html('Must be a whole number');
        $("#modal-bid-final-amount").text(``);
        $("#bid-checkout").prop("disabled", true);
        return;
    } else if (+$('#bidQuantity').val() > +$("#nQuantity").text()) {
        $('#lblBidQuantityError').removeClass("d-none").addClass("d-block")
        $('#lblBidQuantityError').html(`Only ${$("#nQuantity").text()} ${(+$("#nQuantity").text() > 1) ? 'Copies are' : 'Copy is'} available`);
        $("#modal-bid-final-amount").text(``);
        $("#bid-checkout").prop("disabled", true);
        return;
    } else {
        $('#lblBidQuantityError').removeClass("d-block").addClass("d-none")
        $('#lblBidQuantityError').html('');
        $("#modal-bid-final-amount").text(`${(+$('#bidQuantity').val() * +$("#modal-nBidPrice").val()).toFixed(8)} BNB`);
        $("#bid-checkout").prop("disabled", false);
        return true;
    }
}
$("#bidQuantity").change(bidQuantityChange);
$("#bidQuantity").keyup(bidQuantityChange);

$('#checkout,#bid-checkout').on('click', checkout);

function checkout() {
    if (!token || !uID)
        return;

    let oOptions = {
        'oRecipient': $("#modal-oRecipient").text(),
        'eBidStatus': ($("#eAuctionType").text() == "Fixed Sale" ? 'Sold' : 'Bid'),
        'oNFTId': nNFTId,
        'nBidPrice': ($("#eAuctionType").text() == "Fixed Sale" ? $("#modal-final-amount").text().split(" ")[0] : $("#modal-bid-final-amount").text().split(" ")[0]),
        "nTokenID": nTokenID,
        'sOwnerEmail': $("#ownerEmail").text()
    };

    console.log(oOptions);
    if (oOptions.eBidStatus == "Sold") {
        if (!buyQuantityChange()) {
            return;
        }
        oOptions['nQuantity'] = $('#nftQuantity').val()
        oContract.methods.buyNow(nTokenID, sCurrentOwnerAddress, window.localStorage.getItem("sWalletAddress"), oOptions.nQuantity)
            .send({
                from: window.localStorage.getItem("sWalletAddress"),
                value: Web3.utils.toWei(oOptions.nBidPrice, 'ether')
            })
            .on('transactionHash', (hash) => {
                oOptions["sTransactionHash"] = hash;
                store();
            })
            .on('receipt', (receipt) => {
                toastr["success"]("Bought Transaction Has Been Mined!");
                setTimeout(() => {
                    window.location.href = "/mynft";
                }, 1000);
            })
            .catch((error) => {
                console.log(error);
                $("#checkout").prop("disabled", false);
                toastr["error"]((error.code == 4001) ? "You Denied MetaMask Transaction Signature" : "Something Went Wrong!");
            });
    } else if (oOptions.eBidStatus == "Bid") {
        if (!bidPriceChange()) {
            return;
        }
        if (!bidQuantityChange()) {
            return;
        }
        oOptions['nQuantity'] = $("#bidQuantity").val();
        oContract.methods.bid(nTokenID, oOptions['nQuantity'], sCurrentOwnerAddress)
            .send({
                from: window.localStorage.getItem("sWalletAddress"),
                value: Web3.utils.toWei(oOptions.nBidPrice, 'ether')
            })
            .on('transactionHash', (hash) => {
                oOptions["sTransactionHash"] = hash;
                store();
            })
            .on('receipt', (receipt) => {
                toastr["success"]("Bid Placement Transaction Has Been Mined!");
                setTimeout(() => {
                    window.location.reload();
                }, 1000);
            })
            .catch((error) => {
                console.log(error);
                $('#bid-checkout').attr("disabled", false);
                toastr["error"]((error.code == 4001) ? "You Denied MetaMask Transaction Signature" : "Something Went Wrong!");
            });
    }

    function store() {
        $.ajax({
            type: "POST",
            url: "/api/v1/bid/create",
            headers: {
                'Authorization': token
            },
            data: oOptions,
            success: function (result, status, xhr) {
                console.log(result);
                toastr["success"](xhr.responseJSON.message + "<br>It'll Be Reflected Once The Transaction Is Mined.");
                $('#bidnowmodal').modal('hide');
                $('#buyitnow').modal('hide');
                // setTimeout(function () {
                //     location.reload();
                // }, 1000)
            },
            error: function (xhr, status, error) {
                console.log(xhr);
                $((oOptions.eBidStatus == "Bid") ? "#bid-checkout" : "#checkout").prop("disabled", false);
                toastr["error"](xhr.responseJSON.message);
            }
        });
    }
}

function toggleStatus(btn) {
    console.log(btn.attr("objId"));
    let oOptions = {
        sObjectId: btn.attr("objId"),
        oBidderId: btn.attr("bidderID"),
        oNFTId: nNFTId,
        eBidStatus: btn.attr("name"),
        sCurrentUserEmail: btn.attr("sCurrentUserEmail")
    }
    if (oOptions.eBidStatus == "Sold") {
        console.log("Inside IF");
    } else if (oOptions.eBidStatus == 'Canceled') {
        oContract.methods.cancelBid(nTokenID, sCurrentOwnerAddress)
            .send({
                from: window.localStorage.getItem("sWalletAddress")
            }).on('transactionHash', (hash) => {
                oOptions["sTransactionHash"] = hash;
                sendData();
            }).on('receipt', (receipt) => {
                toastr["success"]("Cancel Bid Transaction Has Been Mined!");
                setTimeout(() => {
                    window.location.reload();
                }, 1000);
            }).catch((error) => {
                console.log(error);
            });
    } else if (oOptions.eBidStatus == 'Accepted') {
        console.log(window.localStorage.getItem("sWalletAddress"));
        oContract.methods.acceptBid(nTokenID, btn.attr("bidderAddress"), btn.attr("nQty"))
            .send({
                from: window.localStorage.getItem("sWalletAddress")
            }).on('transactionHash', (hash) => {
                oOptions["sTransactionHash"] = hash;
                sendData();
            }).on('receipt', (receipt) => {
                toastr["success"]("Accept Bid Transaction Has Been Mined!");
                setTimeout(() => {
                    window.location.href = "/mynft";
                }, 1000);
            }).catch((error) => {
                console.log(error);
            });
    } else if (oOptions.eBidStatus == 'Rejected') {
        console.log(window.localStorage.getItem("sWalletAddress"));
        oContract.methods.rejectBid(nTokenID, btn.attr("bidderAddress"))
            .send({
                from: window.localStorage.getItem("sWalletAddress")
            }).on('transactionHash', (hash) => {
                oOptions["sTransactionHash"] = hash;
                sendData();
            }).on('receipt', (receipt) => {
                toastr["success"]("Reject Bid Transaction Has Been Mined!");
                setTimeout(() => {
                    window.location.reload();
                }, 1000);
            }).catch((error) => {
                console.log(error);
            });
    }

    function sendData() {
        $.ajax({
            type: "POST",
            url: "/api/v1/bid/toggleBidStatus",
            data: oOptions,
            headers: {
                'Authorization': token
            },
            success: function (result, status, xhr) {
                console.log(xhr);
                toastr["success"](xhr.responseJSON.message + "<br>It'll Be Reflected Once The Transaction Is Mined.");
                // setTimeout(function () {
                //     window.location.reload();
                // }, 1000)
            },
            error: function (xhr, status, error) {
                toastr["error"](xhr.responseJSON.message);
                console.log(xhr);
            }
        });
    }
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

console.log(oContract);
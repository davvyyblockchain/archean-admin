$(document).ready(function () {
    $('#nftTable').DataTable({
        responsive: true,
        "processing": true,
        "serverSide": true,
        "ajax": {
            "url": "/api/v1/admin/nfts",
            "type": "POST",
            headers: {
                'Authorization': token
            },
            dataFilter: function (data) {
                var json = jQuery.parseJSON(data);
                json.recordsTotal = json.data.recordsTotal;
                json.recordsFiltered = json.data.recordsFiltered;
                json.data = json.data.data;
                json.draw = json.data.draw;
                console.log(json);
                return JSON.stringify(json); // return JSON string
            }
        },
        "aoColumns": [{
            "mData": "sName"
        },
        {
            mData: 'oCreator[0].sUserName',
            render: function (mData, type, row) {
                if (mData === undefined || mData === null || mData == "") {
                    var firstFive = row.oCreator[0].sWalletAddress.slice(0, 10);
                    var lastFive = row.oCreator[0].sWalletAddress.slice(row.oCreator[0].sWalletAddress.length - 8, row.oCreator[0].sWalletAddress.length);
                    let oPostedBy = `${firstFive}...${lastFive}`
                    return `<td><a href="#" title='${row.oCreator[0].sWalletAddress}'>${oPostedBy}</a></td>`;
                } else {
                    return mData;
                }
            }
        },
        {
            "mData": "oOwner[0].sUserName",
            render: function (mData, type, row) {
                if (mData === undefined || mData === null || mData == "") {
                    var firstFive = row.oOwner[0].sWalletAddress.slice(0, 10);
                    var lastFive = row.oOwner[0].sWalletAddress.slice(row.oOwner[0].sWalletAddress.length - 8, row.oOwner[0].sWalletAddress.length);
                    let oOwner = `${firstFive}...${lastFive}`
                    return `<td><a href="#" title='${row.oCreator[0].sWalletAddress}'>${oOwner}</a></td>`;
                } else {
                    return mData;
                }
            }
        },
        {
            "mData": "eType"
        },
        {
            "mData": "eType",
            render: function (mData, type, row) {
                return `<button onclick="popupNFT($(this))" nft-type="${row.eType}" nft-hash="${row.sHash}" data-toggle="modal" data-target="#nftModel" class="btn btn-secondary btn-xs"><i class="fa fa-eye"></i></button>`;
            }
        },
        {
            "mData": "bStatus",
            orderable: false,
            "render": function (data, type, row, meta) {
                if (data == true) {
                    return `<button id="btnBlockUser" name="deactivated" title="Deactivate" onclick="toggleStatus($(this))" eAuctionType=${row.eAuctionType}  bStatus=${false} objId='${row._id}' class="btn btn-danger btn-xs"><i class="fa fa-ban"></i></button>`;
                }
                return `<button id="btnBlockUser" name="active" title="Activate" onclick="toggleStatus($(this))" eAuctionType=${row.eAuctionType} bStatus=${true} objId='${row._id}' class="btn btn-success btn-xs"><i class="fa fa-check"></i></button>`;
            }
        }
        ],
        "columnDefs": [{
            "searchable": false,
            "orderable": false,
        }],
        "iDisplayLength": 10
    });
    // Add placeholder in search field
    $("#nftTable_filter > label > input[type=search]").attr("placeholder", "Name")
});

function toggleStatus(btn) {
    console.log(btn.attr("objId"));
    console.log(btn.attr("bStatus"));
    // toggleUserStatus

    let oOptions = {
        sObjectId: btn.attr("objId"),
        bStatus: btn.attr("bStatus"),
        eAuctionType: btn.attr("eAuctionType"),
    }

    $.ajax({
        type: "POST",
        url: "/api/v1/admin/toggleNFTStatus",
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
        }
    });
}
function popupNFT(btn) {
    if (btn.attr("nft-type") == "Audio") {
        $("#src").attr("src", "https://ipfs.io/ipfs/" + btn.attr("nft-hash"));
        audio = new Audio("https://ipfs.io/ipfs/" + btn.attr("nft-hash"));
        document.getElementById("audio").load();

        $("#imageNFTPreview").addClass("d-none");
        $("#audioNFTPreview").removeClass("d-none");
    } else {
        $("#nftImg").attr("src", "https://ipfs.io/ipfs/" + btn.attr("nft-hash"));
        $("#audioNFTPreview").addClass("d-none");
        $("#imageNFTPreview").removeClass("d-none");
    }
}

// When Model Closes, Pause the audio if it's being played
$("#nftModel").on('hide.bs.modal', function () {
    if (audio && !audio.paused) {
        playBtn.click();
    }
    // Clear the previous NFT form the Modal
    $("#src").attr("src", "");
    $("#nftImg").attr("src", "");
});

const audioPlayer = document.querySelector(".audio-player");
const audiofile = audioPlayer.getAttribute('audio-url');

if (audiofile) {
    let audio = new Audio(
        audiofile
    );
}
audio.addEventListener(
    "loadeddata",
    () => {
        audioPlayer.querySelector(".time .current").textContent = "0:00";
        $(".progress").css("margin-left", "0");
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

//check audio percentage and update time accordingly
setInterval(() => {
    const progressBar = audioPlayer.querySelector(".progress");
    progressBar.style.marginLeft = audio.currentTime / audio.duration * 100 + "%";
    audioPlayer.querySelector(".time .current").textContent = getTimeCodeFromNum(
        audio.currentTime
    );
}, 50);

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
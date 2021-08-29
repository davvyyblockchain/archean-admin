let oObjectIDToAudioObjectMapping = {};
let audio;
$.ajax({
    type: "GET",
    url: "/api/v1/nft/landing",
    headers: {
        'Authorization': token
    },
    success: function (result, status, xhr) {
        console.log(result);
        let dataToAppend = '';
        if (result.data[0].mostViewed.length) {
            for (let nData = 0; nData < result.data[0].mostViewed.length; nData++) {
                if (result.data[0].mostViewed[nData].eType == 'Audio') {
                    var firstFive = result.data[0].mostViewed[nData].aCurrentOwner[0].sWalletAddress.slice(0, 10);
                    var lastFive = result.data[0].mostViewed[nData].aCurrentOwner[0].sWalletAddress.slice(result.data[0].mostViewed[nData].aCurrentOwner[0].sWalletAddress.length - 8, result.data[0].mostViewed[nData].aCurrentOwner[0].sWalletAddress.length);

                    // Binding Music
                    audio = new Audio(`https://ipfs.io/ipfs/${result.data[0].mostViewed[nData].sHash}`);
                    audio.setAttribute("preload", "metadata");
                    oObjectIDToAudioObjectMapping[result.data[0].mostViewed[nData]._id] = audio;

                    dataToAppend += `<div class="col-md-6 col-lg-6 col-xl-4 mb-4">
                    <div class="nft-card id_${result.data[0].mostViewed[nData]._id}">
                        <div class="nft-card-head overflow-hidden">
                            <a href="#" class="d-flex align-items-center overflow-hidden">
                                <img src="${(result.data[0].mostViewed[nData].aCurrentOwner[0].sProfilePicUrl != undefined) ? 'https://ipfs.io/ipfs/' + result.data[0].mostViewed[nData].aCurrentOwner[0].sProfilePicUrl : './assets/images/user-avatar.svg'} " class="img-fluid mr-3" height="24" width="24">
                                <span>${(result.data[0].mostViewed[nData].aCurrentOwner[0].sUserName == undefined || result.data[0].mostViewed[nData].aCurrentOwner[0].sUserName == "")  ? firstFive + '...' + lastFive : "@" + result.data[0].mostViewed[nData].aCurrentOwner[0].sUserName}</span>
                            </a>
                        </div>
                        <div class="nft-card-body">

                                <audio id="audio" controls class="d-none">
                                    <source src="https://ipfs.io/ipfs/${result.data[0].mostViewed[nData].sHash}" id="src" />
                                </audio>
                                <div class="audio-player">
                                    <div class="preview-thumb" style="text-align: center;">
                                        <img src="../assets/images/audio-preview.png" class="img-fluid" />
                                    </div>
                                    <div class="timeline">
                                        <div class="progress" id="progress_${result.data[0].mostViewed[nData]._id}"></div>
                                    </div>
                                    <div class="controls">
                                        <div class="play-container">
                                            <div class="toggle-play play" objID="${result.data[0].mostViewed[nData]._id}" id="playPauseButtons" onclick="playPause($(this))">
                                            </div>
                                        </div>
                                        <div class="time">
                                            <div class="current d-inline" id="current_${result.data[0].mostViewed[nData]._id}">0:00</div>
                                            <div class="divider d-inline">/</div>
                                            <div class="length d-inline" id="duration_${result.data[0].mostViewed[nData]._id}">
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
                                    <a href="viewNFT/` + result.data[0].mostViewed[nData]._id + `">
                                        <h3 class="font-family-infra-semibold mb-3 text-center text-lg-left">
                                        ${result.data[0].mostViewed[nData].sName}</h3>
                                    </a>
                                </div>
                            </div>
                            <div class="row">
                                <div class="col-lg-6">
                                    <p class="mb-0 meta-price font-family-bs-regular text-center text-lg-left">
                                        Base Price:- ${result.data[0].mostViewed[nData].nBasePrice.$numberDecimal} BNB</p>
                                </div>
                                <div class="col-lg-6">
                                    <p
                                        class="mb-0 text-capitalize font-family-bs-regular meta-cat text-center text-lg-right">
                                        Category:- ${result.data[0].mostViewed[nData].eType}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>`;
                } else {
                    var firstFive = result.data[0].mostViewed[nData].aCurrentOwner[0].sWalletAddress.slice(0, 10);
                    var lastFive = result.data[0].mostViewed[nData].aCurrentOwner[0].sWalletAddress.slice(result.data[0].mostViewed[nData].aCurrentOwner[0].sWalletAddress.length - 8, result.data[0].mostViewed[nData].aCurrentOwner[0].sWalletAddress.length);
                    dataToAppend += `<div class="col-md-6 col-lg-6 col-xl-4 mb-4">
                    <div class="nft-card">
                        <div class="nft-card-head overflow-hidden">
                            <a href="#" class="d-flex align-items-center overflow-hidden">
                                <img src="${(result.data[0].mostViewed[nData].aCurrentOwner[0].sProfilePicUrl != undefined) ? 'https://ipfs.io/ipfs/' + result.data[0].mostViewed[nData].aCurrentOwner[0].sProfilePicUrl : './assets/images/user-avatar.svg'} " class="img-fluid mr-3" height="24" width="24">
                                <span>${(result.data[0].mostViewed[nData].aCurrentOwner[0].sUserName == undefined  || result.data[0].mostViewed[nData].aCurrentOwner[0].sUserName == "")  ? firstFive + '...' + lastFive : "@" + result.data[0].mostViewed[nData].aCurrentOwner[0].sUserName}</span>
                            </a>
                        </div>
                        <div class="nft-card-body">
                            <a href="viewNFT/` + result.data[0].mostViewed[nData]._id + `">
                                <img src="https://ipfs.io/ipfs/${result.data[0].mostViewed[nData].sHash}" class="img-fluid w-100" style="height:289px" />
                            </a>
                        </div>
                        <div class="nft-card-footer">
                            <div class="row">
                                <div class="col">
                                    <a href="viewNFT/` + result.data[0].mostViewed[nData]._id + `">
                                        <h3 class="font-family-infra-semibold mb-3 text-center text-lg-left">
                                        ${result.data[0].mostViewed[nData].sName}</h3>
                                    </a>
                                </div>
                            </div>
                            <div class="row">
                                <div class="col-lg-6">
                                    <p class="mb-0 meta-price font-family-bs-regular text-center text-lg-left">
                                        Base Price:- ${result.data[0].mostViewed[nData].nBasePrice.$numberDecimal} BNB</p>
                                </div>
                                <div class="col-lg-6">
                                    <p
                                        class="mb-0 text-capitalize font-family-bs-regular meta-cat text-center text-lg-right">
                                        Category:- ${result.data[0].mostViewed[nData].eType}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>`;
                }
            }
            $('#MostViewedNFTNoNFTData').fadeOut();
            $("#nftlist").append(dataToAppend)
            $('.nft-new-item').hide();
            $('#MostViewedNFTLoader').fadeOut(function () {
                $(".nft-new-item").fadeIn().removeClass('nft-new-item');
            });
        } else {

            $('#MostViewedNFTLoader').fadeOut(function () {
                $('#MostViewedNFTNoNFTData').fadeIn();
            });
        }
        if (result.data[0].recentlyAdded.length) {
            dataToAppend = '';
            for (let nData = 0; nData < result.data[0].recentlyAdded.length; nData++) {
                if (result.data[0].recentlyAdded[nData].eType == 'Audio') {
                    var firstFive = result.data[0].recentlyAdded[nData].aCurrentOwner[0].sWalletAddress.slice(0, 10);
                    var lastFive = result.data[0].recentlyAdded[nData].aCurrentOwner[0].sWalletAddress.slice(result.data[0].recentlyAdded[nData].aCurrentOwner[0].sWalletAddress.length - 8, result.data[0].recentlyAdded[nData].aCurrentOwner[0].sWalletAddress.length);

                    // Binding Music
                    audio = new Audio(`https://ipfs.io/ipfs/${result.data[0].recentlyAdded[nData].sHash}`);
                    audio.setAttribute("preload", "metadata");
                    oObjectIDToAudioObjectMapping[result.data[0].recentlyAdded[nData]._id] = audio;

                    dataToAppend += `<div class="col-md-6 col-lg-6 col-xl-4 mb-4">
                    <div class="nft-card id_${result.data[0].recentlyAdded[nData]._id}">
                        <div class="nft-card-head overflow-hidden">
                            <a href="#" class="d-flex align-items-center overflow-hidden">
                                <img src="${(result.data[0].recentlyAdded[nData].aCurrentOwner[0].sProfilePicUrl != undefined) ? 'https://ipfs.io/ipfs/' + result.data[0].recentlyAdded[nData].aCurrentOwner[0].sProfilePicUrl : './assets/images/user-avatar.svg'} " class="img-fluid mr-3" height="24" width="24">
                                <span>${(result.data[0].recentlyAdded[nData].aCurrentOwner[0].sUserName == undefined  || result.data[0].recentlyAdded[nData].aCurrentOwner[0].sUserName == "") ? firstFive + '...' + lastFive : "@" + result.data[0].recentlyAdded[nData].aCurrentOwner[0].sUserName}</span>
                            </a>
                        </div>
                        <div class="nft-card-body">

                                <audio id="audio" controls class="d-none">
                                    <source src="https://ipfs.io/ipfs/${result.data[0].recentlyAdded[nData].sHash}" id="src" />
                                </audio>
                                <div class="audio-player">
                                    <div class="preview-thumb" style="text-align: center;">
                                        <img src="../assets/images/audio-preview.png" class="img-fluid" />
                                    </div>
                                    <div class="timeline">
                                        <div class="progress" id="progress_${result.data[0].recentlyAdded[nData]._id}"></div>
                                    </div>
                                    <div class="controls">
                                        <div class="play-container">
                                            <div class="toggle-play play" objID="${result.data[0].recentlyAdded[nData]._id}" id="playPauseButtons" onclick="playPause($(this))">
                                            </div>
                                        </div>
                                        <div class="time">
                                            <div class="current d-inline" id="current_${result.data[0].recentlyAdded[nData]._id}">0:00</div>
                                            <div class="divider d-inline">/</div>
                                            <div class="length d-inline" id="duration_${result.data[0].recentlyAdded[nData]._id}">
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
                                    <a href="viewNFT/` + result.data[0].recentlyAdded[nData]._id + `">
                                        <h3 class="font-family-infra-semibold mb-3 text-center text-lg-left">
                                        ${result.data[0].recentlyAdded[nData].sName}</h3>
                                    </a>
                                </div>
                            </div>
                            <div class="row">
                                <div class="col-lg-6">
                                    <p class="mb-0 meta-price font-family-bs-regular text-center text-lg-left">
                                        Base Price:- ${result.data[0].recentlyAdded[nData].nBasePrice.$numberDecimal} BNB</p>
                                </div>
                                <div class="col-lg-6">
                                    <p
                                        class="mb-0 text-capitalize font-family-bs-regular meta-cat text-center text-lg-right">
                                        Category:- ${result.data[0].recentlyAdded[nData].eType}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>`;
                } else {
                    var firstFive = result.data[0].recentlyAdded[nData].aCurrentOwner[0].sWalletAddress.slice(0, 10);
                    var lastFive = result.data[0].recentlyAdded[nData].aCurrentOwner[0].sWalletAddress.slice(result.data[0].recentlyAdded[nData].aCurrentOwner[0].sWalletAddress.length - 8, result.data[0].recentlyAdded[nData].aCurrentOwner[0].sWalletAddress.length);
                    dataToAppend += `<div class="col-md-6 col-lg-6 col-xl-4 mb-4">
                    <div class="nft-card">
                        <div class="nft-card-head overflow-hidden">
                            <a href="#" class="d-flex align-items-center overflow-hidden">
                                <img src="${(result.data[0].recentlyAdded[nData].aCurrentOwner[0].sProfilePicUrl != undefined) ? 'https://ipfs.io/ipfs/' + result.data[0].recentlyAdded[nData].aCurrentOwner[0].sProfilePicUrl : './assets/images/user-avatar.svg'} " class="img-fluid mr-3" height="24" width="24">
                                <span>${(result.data[0].recentlyAdded[nData].aCurrentOwner[0].sUserName == undefined || result.data[0].recentlyAdded[nData].aCurrentOwner[0].sUserName == "") ? firstFive + '...' + lastFive : "@" + result.data[0].recentlyAdded[nData].aCurrentOwner[0].sUserName}</span>
                            </a>
                        </div>
                        <div class="nft-card-body">
                            <a href="viewNFT/` + result.data[0].recentlyAdded[nData]._id + `">
                                <img src="https://ipfs.io/ipfs/${result.data[0].recentlyAdded[nData].sHash}" class="img-fluid w-100" style="height:289px" />
                            </a>
                        </div>
                        <div class="nft-card-footer">
                            <div class="row">
                                <div class="col">
                                    <a href="viewNFT/` + result.data[0].recentlyAdded[nData]._id + `">
                                        <h3 class="font-family-infra-semibold mb-3 text-center text-lg-left">
                                        ${result.data[0].recentlyAdded[nData].sName}</h3>
                                    </a>
                                </div>
                            </div>
                            <div class="row">
                                <div class="col-lg-6">
                                    <p class="mb-0 meta-price font-family-bs-regular text-center text-lg-left">
                                        Base Price:- ${result.data[0].recentlyAdded[nData].nBasePrice.$numberDecimal} BNB</p>
                                </div>
                                <div class="col-lg-6">
                                    <p
                                        class="mb-0 text-capitalize font-family-bs-regular meta-cat text-center text-lg-right">
                                        Category:- ${result.data[0].recentlyAdded[nData].eType}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>`;
                }
            }
            $('#recentlyAddedNFTNoNFTData').fadeOut();
            $("#recentlyAddedNFTs").append(dataToAppend)
            $('.nft-new-item').hide();
            $('#recentlyAddedNFTLoader').fadeOut(function () {
                $(".nft-new-item").fadeIn().removeClass('nft-new-item');
            });
        } else {
            $('#recentlyAddedNFTLoader').fadeOut(function () {
                $('#recentlyAddedNFTNoNFTData').fadeIn();
            });
        }
        if (result.data[0].onSale.length) {
            dataToAppend = '';
            for (let nData = 0; nData < result.data[0].onSale.length; nData++) {
                if (result.data[0].onSale[nData].eType == 'Audio') {
                    var firstFive = result.data[0].onSale[nData].aCurrentOwner[0].sWalletAddress.slice(0, 10);
                    var lastFive = result.data[0].onSale[nData].aCurrentOwner[0].sWalletAddress.slice(result.data[0].onSale[nData].aCurrentOwner[0].sWalletAddress.length - 8, result.data[0].onSale[nData].aCurrentOwner[0].sWalletAddress.length);

                    // Binding Music
                    audio = new Audio(`https://ipfs.io/ipfs/${result.data[0].onSale[nData].sHash}`);
                    audio.setAttribute("preload", "metadata");
                    oObjectIDToAudioObjectMapping[result.data[0].onSale[nData]._id] = audio;

                    dataToAppend += `<div class="col-md-6 col-lg-6 col-xl-4 mb-4">
                    <div class="nft-card id_${result.data[0].onSale[nData]._id}">
                        <div class="nft-card-head overflow-hidden">
                            <a href="#" class="d-flex align-items-center overflow-hidden">
                                <img src="${(result.data[0].onSale[nData].aCurrentOwner[0].sProfilePicUrl != undefined) ? 'https://ipfs.io/ipfs/' + result.data[0].onSale[nData].aCurrentOwner[0].sProfilePicUrl : './assets/images/user-avatar.svg'} " class="img-fluid mr-3" height="24" width="24">
                                <span>${(result.data[0].onSale[nData].aCurrentOwner[0].sUserName == undefined || result.data[0].onSale[nData].aCurrentOwner[0].sUserName == "") ? firstFive + '...' + lastFive : "@" + result.data[0].onSale[nData].aCurrentOwner[0].sUserName}</span>
                            </a>
                        </div>
                        <div class="nft-card-body">

                                <audio id="audio" controls class="d-none">
                                    <source src="https://ipfs.io/ipfs/${result.data[0].onSale[nData].sHash}" id="src" />
                                </audio>
                                <div class="audio-player">
                                    <div class="preview-thumb" style="text-align: center;">
                                        <img src="../assets/images/audio-preview.png" class="img-fluid" />
                                    </div>
                                    <div class="timeline">
                                        <div class="progress" id="progress_${result.data[0].onSale[nData]._id}"></div>
                                    </div>
                                    <div class="controls">
                                        <div class="play-container">
                                            <div class="toggle-play play" objID="${result.data[0].onSale[nData]._id}" id="playPauseButtons" onclick="playPause($(this))">
                                            </div>
                                        </div>
                                        <div class="time">
                                            <div class="current d-inline" id="current_${result.data[0].onSale[nData]._id}">0:00</div>
                                            <div class="divider d-inline">/</div>
                                            <div class="length d-inline" id="duration_${result.data[0].onSale[nData]._id}">
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
                                    <a href="viewNFT/` + result.data[0].onSale[nData]._id + `">
                                        <h3 class="font-family-infra-semibold mb-3 text-center text-lg-left">
                                        ${result.data[0].onSale[nData].sName}</h3>
                                    </a>
                                </div>
                            </div>
                            <div class="row">
                                <div class="col-lg-6">
                                    <p class="mb-0 meta-price font-family-bs-regular text-center text-lg-left">
                                        Base Price:- ${result.data[0].onSale[nData].nBasePrice.$numberDecimal} BNB</p>
                                </div>
                                <div class="col-lg-6">
                                    <p
                                        class="mb-0 text-capitalize font-family-bs-regular meta-cat text-center text-lg-right">
                                        Category:- ${result.data[0].onSale[nData].eType}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>`;
                } else {
                    var firstFive = result.data[0].onSale[nData].aCurrentOwner[0].sWalletAddress.slice(0, 10);
                    var lastFive = result.data[0].onSale[nData].aCurrentOwner[0].sWalletAddress.slice(result.data[0].onSale[nData].aCurrentOwner[0].sWalletAddress.length - 8, result.data[0].onSale[nData].aCurrentOwner[0].sWalletAddress.length);
                    dataToAppend += `<div class="col-md-6 col-lg-6 col-xl-4 mb-4">
                    <div class="nft-card">
                        <div class="nft-card-head overflow-hidden">
                            <a href="#" class="d-flex align-items-center overflow-hidden">
                                <img src="${(result.data[0].onSale[nData].aCurrentOwner[0].sProfilePicUrl != undefined) ? 'https://ipfs.io/ipfs/' + result.data[0].onSale[nData].aCurrentOwner[0].sProfilePicUrl : './assets/images/user-avatar.svg'} " class="img-fluid mr-3" height="24" width="24">
                                <span>${(result.data[0].onSale[nData].aCurrentOwner[0].sUserName == undefined || result.data[0].onSale[nData].aCurrentOwner[0].sUserName == "")  ? firstFive + '...' + lastFive : "@" + result.data[0].onSale[nData].aCurrentOwner[0].sUserName}</span>
                            </a>
                        </div>
                        <div class="nft-card-body">
                            <a href="viewNFT/` + result.data[0].onSale[nData]._id + `">
                                <img src="https://ipfs.io/ipfs/${result.data[0].onSale[nData].sHash}" class="img-fluid w-100" style="height:289px" />
                            </a>
                        </div>
                        <div class="nft-card-footer">
                            <div class="row">
                                <div class="col">
                                    <a href="viewNFT/` + result.data[0].onSale[nData]._id + `">
                                        <h3 class="font-family-infra-semibold mb-3 text-center text-lg-left">
                                        ${result.data[0].onSale[nData].sName}</h3>
                                    </a>
                                </div>
                            </div>
                            <div class="row">
                                <div class="col-lg-6">
                                    <p class="mb-0 meta-price font-family-bs-regular text-center text-lg-left">
                                        Base Price:- ${result.data[0].onSale[nData].nBasePrice.$numberDecimal} BNB</p>
                                </div>
                                <div class="col-lg-6">
                                    <p
                                        class="mb-0 text-capitalize font-family-bs-regular meta-cat text-center text-lg-right">
                                        Category:- ${result.data[0].onSale[nData].eType}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>`;
                }
            }
            $('#recentlyAddedNFTNoNFTData').fadeOut();
            $("#onSaleNFTs").append(dataToAppend)
            $('.nft-new-item').hide();
            $('#onSaleNFTLoader').fadeOut(function () {
                $(".nft-new-item").fadeIn().removeClass('nft-new-item');
            });
        } else {
            $('#onSaleNFTLoader').fadeOut(function () {
                $('#onSaleNFTNoNFTData').fadeIn();
            });
        }
        if (result.data[0].onAuction.length) {
            dataToAppend = '';
            for (let nData = 0; nData < result.data[0].onAuction.length; nData++) {
                if (result.data[0].onAuction[nData].eType == 'Audio') {
                    var firstFive = result.data[0].onAuction[nData].aCurrentOwner[0].sWalletAddress.slice(0, 10);
                    var lastFive = result.data[0].onAuction[nData].aCurrentOwner[0].sWalletAddress.slice(result.data[0].onAuction[nData].aCurrentOwner[0].sWalletAddress.length - 8, result.data[0].onAuction[nData].aCurrentOwner[0].sWalletAddress.length);

                    // Binding Music
                    audio = new Audio(`https://ipfs.io/ipfs/${result.data[0].onAuction[nData].sHash}`);
                    audio.setAttribute("preload", "metadata");
                    oObjectIDToAudioObjectMapping[result.data[0].onAuction[nData]._id] = audio;

                    dataToAppend += `<div class="col-md-6 col-lg-6 col-xl-4 mb-4">
                    <div class="nft-card id_${result.data[0].onAuction[nData]._id}">
                        <div class="nft-card-head overflow-hidden">
                            <a href="#" class="d-flex align-items-center overflow-hidden">
                                <img src="${(result.data[0].onAuction[nData].aCurrentOwner[0].sProfilePicUrl != undefined) ? 'https://ipfs.io/ipfs/' + result.data[0].onAuction[nData].aCurrentOwner[0].sProfilePicUrl : './assets/images/user-avatar.svg'} " class="img-fluid mr-3" height="24" width="24">
                                <span>${(result.data[0].onAuction[nData].aCurrentOwner[0].sUserName == undefined || result.data[0].onAuction[nData].aCurrentOwner[0].sUserName == "")  ? firstFive + '...' + lastFive : "@" + result.data[0].onAuction[nData].aCurrentOwner[0].sUserName}</span>
                            </a>
                        </div>
                        <div class="nft-card-body">

                                <audio id="audio" controls class="d-none">
                                    <source src="https://ipfs.io/ipfs/${result.data[0].onAuction[nData].sHash}" id="src" />
                                </audio>
                                <div class="audio-player">
                                    <div class="preview-thumb" style="text-align: center;">
                                        <img src="../assets/images/audio-preview.png" class="img-fluid" />
                                    </div>
                                    <div class="timeline">
                                        <div class="progress" id="progress_${result.data[0].onAuction[nData]._id}"></div>
                                    </div>
                                    <div class="controls">
                                        <div class="play-container">
                                            <div class="toggle-play play" objID="${result.data[0].onAuction[nData]._id}" id="playPauseButtons" onclick="playPause($(this))">
                                            </div>
                                        </div>
                                        <div class="time">
                                            <div class="current d-inline" id="current_${result.data[0].onAuction[nData]._id}">0:00</div>
                                            <div class="divider d-inline">/</div>
                                            <div class="length d-inline" id="duration_${result.data[0].onAuction[nData]._id}">
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
                                    <a href="viewNFT/` + result.data[0].onAuction[nData]._id + `">
                                        <h3 class="font-family-infra-semibold mb-3 text-center text-lg-left">
                                        ${result.data[0].onAuction[nData].sName}</h3>
                                    </a>
                                </div>
                            </div>
                            <div class="row">
                                <div class="col-lg-6">
                                    <p class="mb-0 meta-price font-family-bs-regular text-center text-lg-left">
                                        Base Price:- ${result.data[0].onAuction[nData].nBasePrice.$numberDecimal} BNB</p>
                                </div>
                                <div class="col-lg-6">
                                    <p
                                        class="mb-0 text-capitalize font-family-bs-regular meta-cat text-center text-lg-right">
                                        Category:- ${result.data[0].onAuction[nData].eType}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>`;
                } else {
                    var firstFive = result.data[0].onAuction[nData].aCurrentOwner[0].sWalletAddress.slice(0, 10);
                    var lastFive = result.data[0].onAuction[nData].aCurrentOwner[0].sWalletAddress.slice(result.data[0].onAuction[nData].aCurrentOwner[0].sWalletAddress.length - 8, result.data[0].onAuction[nData].aCurrentOwner[0].sWalletAddress.length);
                    dataToAppend += `<div class="col-md-6 col-lg-6 col-xl-4 mb-4">
                    <div class="nft-card">
                        <div class="nft-card-head overflow-hidden">
                            <a href="#" class="d-flex align-items-center overflow-hidden">
                                <img src="${(result.data[0].onAuction[nData].aCurrentOwner[0].sProfilePicUrl != undefined) ? 'https://ipfs.io/ipfs/' + result.data[0].onAuction[nData].aCurrentOwner[0].sProfilePicUrl : './assets/images/user-avatar.svg'} " class="img-fluid mr-3" height="24" width="24">
                                <span>${(result.data[0].onAuction[nData].aCurrentOwner[0].sUserName == undefined || result.data[0].onAuction[nData].aCurrentOwner[0].sUserName == "")  ? firstFive + '...' + lastFive : "@" + result.data[0].onAuction[nData].aCurrentOwner[0].sUserName}</span>
                            </a>
                        </div>
                        <div class="nft-card-body">
                            <a href="viewNFT/` + result.data[0].onAuction[nData]._id + `">
                                <img src="https://ipfs.io/ipfs/${result.data[0].onAuction[nData].sHash}" class="img-fluid w-100" style="height:289px" />
                            </a>
                        </div>
                        <div class="nft-card-footer">
                            <div class="row">
                                <div class="col">
                                    <a href="viewNFT/` + result.data[0].onAuction[nData]._id + `">
                                        <h3 class="font-family-infra-semibold mb-3 text-center text-lg-left">
                                        ${result.data[0].onAuction[nData].sName}</h3>
                                    </a>
                                </div>
                            </div>
                            <div class="row">
                                <div class="col-lg-6">
                                    <p class="mb-0 meta-price font-family-bs-regular text-center text-lg-left">
                                        Base Price:- ${result.data[0].onAuction[nData].nBasePrice.$numberDecimal} BNB</p>
                                </div>
                                <div class="col-lg-6">
                                    <p
                                        class="mb-0 text-capitalize font-family-bs-regular meta-cat text-center text-lg-right">
                                        Category:- ${result.data[0].onAuction[nData].eType}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>`;
                }
            }
            $('#onAuctionNFTNoNFTData').fadeOut();
            $("#onAuctionNFTs").append(dataToAppend)
            $('.nft-new-item').hide();
            $('#onAuctionNFTLoader').fadeOut(function () {
                $(".nft-new-item").fadeIn().removeClass('nft-new-item');
            });
        } else {
            $('#onAuctionNFTLoader').fadeOut(function () {
                $('#onAuctionNFTNoNFTData').fadeIn();
            });
        }
        loadDuration();
    },
    error: function (xhr, status, error) {
        console.log('====================================');
        console.log(xhr);
        console.log('====================================');
        toastr["error"](xhr.responseJSON.message);
        $('#MostViewedNFTLoader').fadeOut(function () {
            $('#MostViewedNFTNoNFTData').fadeIn();
        });
        $('#recentlyAddedNFTLoader').fadeOut(function () {
            $('#recentlyAddedNFTNoNFTData').fadeIn();
        });
        $('#onSaleNFTLoader').fadeOut(function () {
            $('#onSaleNFTNoNFTData').fadeIn();
        });
        $('#onAuctionNFTLoader').fadeOut(function () {
            $('#onAuctionNFTNoNFTData').fadeIn();
        });
        return false;
    }
});


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
        btn.removeClass("pause");
        btn.addClass("play");
        oObjectIDToAudioObjectMapping[btn.attr("objID")].pause();

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
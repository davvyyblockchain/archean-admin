$.ajax({
    type: "GET",
    url: "/api/v1/nft/collectionlist",
    headers: { 'Authorization': token },
    success: function (result, status, xhr) {
        console.log(result);
        $("#sName").html(result.data[0].sName);
        $("#sDescription").html(result.data[0].sDescription);
        $("#sHash").attr("src", (result.data[0].sHash == undefined ? './assets/images/cryptopunk-icon.svg' : 'https://ipfs.io/ipfs/' + result.data[0].sHash));
    },
    error: function (xhr, status, error) {
        toastr["error"](xhr.responseJSON.message);
        return false;
    }
});
$.ajax({
    type: "GET",
    url: "/api/v1/user/getAboutusData",
    success: function (result, status, xhr) {
        if (result.data.aAboutus)
            $("#sAboutus_data").html(result.data.aAboutus.sAboutus_data);
    },
    error: function (xhr, status, error) {
        toastr["error"](xhr.responseJSON.message);
        return false;
    }
});
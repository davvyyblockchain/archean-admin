$.ajax({
    type: "GET",
    url: "/api/v1/user/getTermsData",
    success: function (result, status, xhr) {
        console.log(result);
        if (result.data.aTerms)
            $("#sTerms_data").html(result.data.aTerms.sTerms_data);
    },
    error: function (xhr, status, error) {
        toastr["error"](xhr.responseJSON.message);
        return false;
    }
});
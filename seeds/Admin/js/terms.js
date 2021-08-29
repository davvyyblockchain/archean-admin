$.ajax({
    type: "GET",
    url: "/api/v1/user/getTermsData",
    success: function (result, status, xhr) {
        console.log(result);
        if (result.data.aTerms) {
            $("#sTerms_data").html(result.data.aTerms.sTerms_data);
            $('#preview').html(result.data.aTerms.sTerms_data);
        }
    },
    error: function (xhr, status, error) {
        toastr["error"](xhr.responseJSON.message);
        return false;
    }
});
$('#terms_update').on('click', function () {

    let thisBtn = $(this);

    thisBtn.html(thisBtn.attr('data-loading-text')).prop('disabled', true);
    var sTerms_data = $('#sTerms_data').val().trim();

    if (sTerms_data == '') {
        toastr["error"]('Please fill out the field!');
        thisBtn.html(thisBtn.attr('data-normal-text')).prop('disabled', false);
    } else {
        let oData = {
            'sTerms_data': sTerms_data
        }
        $.ajax({
            type: "POST",
            url: "/api/v1/admin/updateTerms",
            "headers": {
                "Authorization": token
            },
            data: oData,
            success: function (result, status, xhr) {
                console.log(result);
                toastr["success"](xhr.responseJSON.message);
                setTimeout(() => {
                    location.reload();
                }, 1000);
            },
            error: function (xhr, status, error) {
                console.log(error);
                toastr["error"](xhr.responseJSON.message);
                thisBtn.html(thisBtn.attr('data-normal-text')).prop('disabled', false);
            }
        });
    }
})
$('#sTerms_data').on('keyup', function () {
    $('#preview').html($(this).val().trim());
})
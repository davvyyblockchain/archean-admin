$.ajax({
    type: "GET",
    url: "/api/v1/user/getAboutusData",
    success: function (result, status, xhr) {
        if (result.data.aAboutus) {
            $("#sAboutus_data").val(result.data.aAboutus.sAboutus_data);
            $('#preview').html(result.data.aAboutus.sAboutus_data);
        }
    },
    error: function (xhr, status, error) {
        toastr["error"](xhr.responseJSON.message);
        return false;
    }
});
$('#aboutus_update').on('click', function () {
    let thisBtn = $(this);

    thisBtn.html(thisBtn.attr('data-loading-text')).prop('disabled', true);
    var sAboutus_data = $('#sAboutus_data').val().trim();

    if (sAboutus_data == '') {
        toastr["error"]('Please fill out the field!');
        thisBtn.html(thisBtn.attr('data-normal-text')).prop('disabled', false);
    } else {
        let oData = {
            'sAboutus_data': sAboutus_data
        };
        $.ajax({
            type: "POST",
            url: "/api/v1/admin/updateAboutus",
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
$('#sAboutus_data').on('keyup', function () {
    $('#preview').html($(this).val().trim());
})
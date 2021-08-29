// $(document).ready(function() {
//     $('#composeMailBody').summernote();
// });

$("#btnSendMail").on('click', () => {
    console.log($("#emailSubject").val());
    console.log($(".note-editable").html());
    console.log($(".note-editable").text().trim());

    if ($("#emailSubject").val().trim() == "") {
        toastr["error"]("Please Enter Mail Subject!");
        return;
    }
    if ($(".note-editable").text().trim() == "") {
        toastr["error"]("Please Enter Mail Content!");
        return;
    }

    $("#btnSendMail").html("<div class='spinner-border spinner-border-sm'></div>").prop("disabled", true);

    let oData = {
        sSubject: $("#emailSubject").val(),
        sHTMLContent: $(".note-editable").html(),
    }
    $.ajax({
        type: 'POST',
        url: '/api/v1/admin/sendNewsLetterEmail',
        "headers": {
            "Authorization": token
        },
        data: oData,
        success: function (result, status, xhr) {
            console.log(result);
            $("#btnSendMail").html("Send").prop("disabled", false);
            toastr["success"](xhr.responseJSON.message);
        },
        error: function (xhr, status, error) {
            console.log(error);
            $("#btnSendMail").html("Send").prop("disabled", false);
            toastr["error"](xhr.responseJSON.message);
        }
    });
});
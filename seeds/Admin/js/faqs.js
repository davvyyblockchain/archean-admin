$('#faqs_update').on('click', function () {

    let thisBtn = $(this);

    thisBtn.html(thisBtn.attr('data-loading-text')).prop('disabled', true);
    var sQuestion = $('#sQuestion').val().trim();
    var sAnswer = $('#sAnswer').val().trim();

    if (sQuestion == '' || sAnswer == '') {
        toastr["error"]('Please fill out all fields!');
        thisBtn.html(thisBtn.attr('data-normal-text')).prop('disabled', false);
    } else {
        let oData = {
            'sQuestion': sQuestion,
            'sAnswer': sAnswer
        }
        $.ajax({
            type: "POST",
            url: "/api/v1/admin/updateFAQs",
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
$('#sQuestion').on('keyup', function () {
    $('#preview_question').html(`<B>Question: </B>` + $(this).val().trim());
})
$('#sAnswer').on('keyup', function () {
    $('#preview_answer').html(`<B>Answer: </B>` + $(this).val().trim());
})
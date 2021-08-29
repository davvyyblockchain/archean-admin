$("#SignUpButton").on('click', () => {

    let sName = $("#inlineFormInputName2").val();
    let sEmail = $("#inlineFormInputGroupUsername2").val();

    $.ajax({
        type: "POST",
        url: "/api/v1/user/addNewsLetterEmails",
        data: {
            sName: sName,
            sEmail: sEmail
        },
        success: (result, status, xhr) => {
            console.log(result);
            toastr["success"](xhr.responseJSON.message);
        }, 
        error: (xhr, status, error) => {
            console.log(error);
            toastr["error"](xhr.responseJSON.message);
        }
    });
});
function validateEmail(email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}

$('#email').on('click',function(){
    $('#email-error').css("display", "none");
});

$('#forgot').on('click', forgotPassword);

function forgotPassword() {
    this.disabled = true;
    let sEmail = $('#email').val();

    if (sEmail == '') {
        this.disabled = false;
        $('#email-error').closest(".form-group").removeClass("is-invalid").addClass("is-invalid")
        $('#email-error').html('Please fill out this field');
        $('#email-error').css("display", "block");
        return;
    }
    else {
        if (validateEmail(sEmail)) {
            $('#email-error').closest(".form-group").removeClass("is-invalid").addClass("is-valid")
            $('#email-error').html('');
            $('#email-error').css("display", "none");
        }
        else {
            this.disabled = false;
            $('#email-error').closest(".form-group").removeClass("is-invalid").addClass("is-invalid")
            $('#email-error').html('Please enter a valid Email Address');
            $('#email-error').css("display", "block");
            return;
        }

        let oOptions = {
            'sEmail': sEmail,
        };
        $.ajax({
            type: "POST",
            url: "/api/v1/auth/passwordreset",
            data: oOptions,
            success: function (result, status, xhr) {
                console.log(result);
                toastr["success"](xhr.responseJSON.message);
                setTimeout(function () {
                    window.location.href = '/a/signin';
                }, 1000)
            },
            error: function (xhr, status, error) {
                $('#forgot').attr("disabled", false);
                console.log(xhr);
                toastr["error"](xhr.responseJSON.message);
            }
        });
    }
}
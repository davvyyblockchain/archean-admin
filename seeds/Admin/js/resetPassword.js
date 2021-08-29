/* eslint-disable */
function validatePass(pass) {
    var re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[ -/:-@\[-`{-~]).{6,64}$/;
    return re.test(String(pass));
}
$('#savePass').on('click', reset);

function reset(e) {
    this.disabled = true;
    let temp = window.location.href.split('/')
    let token = temp.pop()
    console.log(token);
    let sPassword = $('#password').val();
    let sConfirmPassword = $('#confirm-password').val();

    if (sPassword == '') {
        $('#password-error').closest(".form-group").removeClass("is-invalid").addClass("is-invalid")
        $('#password-error').html('Please fill out this field!');
        $('#password-error').css("display", "block");
        this.disabled = false;
        return;
    }
    else {
        if (validatePass(sPassword) || validatePass(sConfirmPassword)) {
            $('#password-error').closest(".form-group").removeClass("is-invalid").addClass("is-valid")
            $('#password-error').html('');
            $('#password-error').css("display", "none");
        }
        else {
            this.disabled = false;
            $('#password-error').closest(".form-group").removeClass("is-invalid").addClass("is-invalid")
            $('#password-error').html('Password must be at least 6 character long & 1 uppercase, lowercase, numeric character and Special character.');
            $('#password-error').css("display", "block");
            return;
        }
    }

    let oOptions = {
        'sPassword': sPassword,
        'sConfirmPassword': sConfirmPassword
    };

    if (sPassword != sConfirmPassword) {
        $('#confirm-password-error').closest(".form-group").removeClass("is-invalid").addClass("is-invalid")
        $('#confirm-password-error').html('Password & Confirm Password doesn`t Match!');
        $('#confirm-password-error').css("display", "block");
        this.disabled = false;
        return;
    } else {
        $('#confirm-password-error').closest(".form-group").removeClass("is-invalid").addClass("is-valid")
        $('#confirm-password-error').html('');
        $('#confirm-password-error').css("display", "none");
        $.ajax({
            type: "POST",
            url: `/api/v1/auth/reset/${token}`,
            data: oOptions,
            success: function (result, status, xhr) {
                console.log(xhr);
                toastr["success"](xhr.responseJSON.message);
                setTimeout(function () {
                    window.location.href = '/a/signin';
                }, 1000)
            },
            error: function (xhr, status, error) {
                $('#savePass').attr("disabled", false);
                console.log(xhr);
                toastr["error"](xhr.responseJSON.message);
            }
        });
    }
}

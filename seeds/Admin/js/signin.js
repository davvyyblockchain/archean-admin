//function to validate email & password
function validateEmail(email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}

function validatePass(pass) {
    var re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[ -/:-@\[-`{-~]).{6,64}$/;
    return re.test(String(pass));
}

function validateEmpty(name) {
    var re = /^(?![\s-])[\w\s-]+$/;
    return re.test(String(name));
}
$('#email').on('click', function () {
    $('#email-error').css("display", "none");
});
$('#password').on('click', function () {
    $('#password-error').css("display", "none");
});


// Disable Back Buttton
function disableBack() {
    window.history.forward()
}
window.onload = disableBack();
window.onpageshow = function (evt) {
    if (evt.persisted) disableBack()
}

$('#signin').on('click', signin);

function signin() {
    this.disabled = true;
    let sEmail = $('#email').val();
    let sPassword = $('#password').val();

    if (sEmail == '') {
        this.disabled = false;
        $('#email-error').closest(".form-group").removeClass("is-invalid").addClass("is-invalid")
        $('#email-error').html('Please fill out this field');
        $('#email-error').css("display", "block");
        return;
    } else {
        if (validateEmail(sEmail)) {
            $('#email-error').closest(".form-group").removeClass("is-invalid").addClass("is-valid")
            $('#email-error').html('');
            $('#email-error').css("display", "none");
        } else {
            this.disabled = false;
            $('#email-error').closest(".form-group").removeClass("is-invalid").addClass("is-invalid")
            $('#email-error').html('Please enter a valid Email Address');
            $('#email-error').css("display", "block");
            return;
        }
    }
    if (sPassword == '') {
        this.disabled = false;
        $('#password-error').closest(".form-group").removeClass("is-invalid").addClass("is-invalid")
        $('#password-error').html('Please fill out this field!');
        $('#password-error').css("display", "block");
        return;
    } else {
        console.log("hererrererer")
        $('#password-error').closest(".form-group").removeClass("is-invalid").addClass("is-valid")
        $('#password-error').html('');
        $('#password-error').css("display", "none");
        let oOptions = {
            'sEmail': sEmail,
            'sPassword': sPassword
        };
        console.log(oOptions);
        $.ajax({
            type: "POST",
            url: "/api/v1/auth/adminlogin",
            data: oOptions,
            success: function (result, status, xhr) {
                window.localStorage.setItem('Authorization', result.data.token);
                window.localStorage.setItem('sWalletAddress', result.data.sWalletAddress);
                let headers = new Headers()
                toastr["success"](xhr.responseJSON.message);
                token = window.localStorage.getItem('Authorization');

                setTimeout(function () {
                    window.location.href = '/a/dashboard';
                }, 500)
            },
            error: function (xhr, status, error) {
                $('#signin').attr("disabled", false);
                console.log(xhr);
                toastr["error"](xhr.responseJSON.message);
            }
        });
    }
}

$(document).ready(function () {
    var url_string = window.location;
    var urlChk = new URL(url_string);
    var urlErr = urlChk.searchParams.get("error");

    if (urlErr) {
        console.log(urlErr)
        toastr["error"](decodeURIComponent(urlErr));
    }
});
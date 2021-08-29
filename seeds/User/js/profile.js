// var token = window.localStorage.getItem('Authorization');
function validateEmail(email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}

function validateEmpty(name) {
    var re = /^(?![-])[\w-]+$/;
    return re.test(String(name));
}

function isValidateName(name) {
    const re = /^[a-zA-Z](( )?[a-zA-Z]+)*$/
    return re.test(name);
}

let imgURL;

$(document).ready(function () {
    var readURL = function (input) {
        const aAllowedMimes = ['image/jpeg', 'image/jpg', 'image/png'];
        if (!input.files[0]) {
            $("#userProfilePicture").attr("src", (imgURL == undefined ? '../assets/images/user-avatar.svg' : 'https://gateway.pinata.cloud/ipfs/' + imgURL));
        } else if (!aAllowedMimes.includes(input.files[0].type)) {
            $('#profile-image-error').closest(".form-group").removeClass("is-invalid").addClass("is-invalid")
            $('#profile-image-error').html("You can only Select a JPG/JPEG/PNG file.");
            $('#profile-image-error').css("display", "block");
            $('#editProfile').prop("disabled", false);
            return;
        } else {
            $('#profile-image-error').closest(".form-group").removeClass("is-invalid").addClass("is-valid")
            $('#profile-image-error').html('');
            $('#profile-image-error').css("display", "none");
        }

        if (input.files && input.files[0]) {
            var reader = new FileReader();

            reader.onload = function (e) {
                $('#userProfilePicture').attr('src', e.target.result);
            }
            reader.readAsDataURL(input.files[0]);
        }
    }

    $("#imageUpload").on('change', function () {
        readURL(this);
    });

    $("#userProfilePicture").on('click', function () {
        $("#imageUpload").click();
    });
});

$.ajax({
    type: "GET",
    url: "/api/v1/user/profile",
    headers: {
        'Authorization': token
    },
    success: function (result, status, xhr) {
        if (result.data.oName != undefined) {
            $("#edit_firstname").val(validation(result.data.oName.sFirstname));
            $("#edit_lastname").val(validation(result.data.oName.sLastname));
        }
        $("#edit_username").val(validation(result.data.sUserName));
        $("#edit_walletAddress").val(validation(result.data.sWalletAddress));
        $("#edit_website").val(validation(result.data.sWebsite));
        $("#edit_email").val(validation(result.data.sEmail));
        $("#edit_bio").val(validation(result.data.sBio));
        $("#userProfilePicture").attr("src", (result.data.sProfilePicUrl == undefined ? '../assets/images/user-avatar.svg' : 'https://gateway.pinata.cloud/ipfs/' + result.data.sProfilePicUrl));
        imgURL = result.data.sProfilePicUrl;
    },
    error: function (xhr, status, error) {
        toastr["error"](xhr.responseJSON.message);
        return false;
    }
});

$('#editProfile').on('click', editProfile);

function validation(field) {
    return (field == undefined ? '' : field);
}

function editProfile() {
    let editProfileBtn = $('#editProfile');
    editProfileBtn.html(textSpinnerHTML).prop("disabled", true);

    let sFirstname = $('#edit_firstname').val().trim();
    let sLastname = $('#edit_lastname').val().trim();
    let sUsername = $("#edit_username").val().trim();
    let sEmail = $("#edit_email").val().trim();
    let sWebsite = $("#edit_website").val().trim();
    let sBio = $("#edit_bio").val();

    if (sWebsite != "") {
        const reWebsite = /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/;
        if (!reWebsite.test(sWebsite)) {
            $('#website-error').closest(".form-group").removeClass("is-invalid").addClass("is-invalid")
            $('#website-error').html('Please enter Valid Website');
            $('#website-error').css("display", "block");
            editProfileBtn.html(editProfileBtn.attr('data-normal-text')).prop("disabled", false);
            return;
        }
    }

    if (sFirstname == '') {
        $('#firstname-error').closest(".form-group").removeClass("is-invalid").addClass("is-invalid")
        $('#firstname-error').html('Please enter firstname');
        $('#firstname-error').css("display", "block");
        editProfileBtn.html(editProfileBtn.attr('data-normal-text')).prop("disabled", false);
        return;
    } else {
        if (isValidateName(sFirstname)) {
            $('#firstname-error').closest(".form-group").removeClass("is-invalid").addClass("is-valid")
            $('#firstname-error').html('');
            $('#firstname-error').css("display", "none");
        } else {
            $('#firstname-error').closest(".form-group").removeClass("is-invalid").addClass("is-invalid")
            $('#firstname-error').html('Special characters are not allowed');
            $('#firstname-error').css("display", "block");
            editProfileBtn.html(editProfileBtn.attr('data-normal-text')).prop("disabled", false);
            return;
        }
    }
    if (sLastname == '') {
        $('#lastname-error').closest(".form-group").removeClass("is-invalid").addClass("is-invalid")
        $('#lastname-error').html('Please enter lastname');
        $('#lastname-error').css("display", "block");
        editProfileBtn.html(editProfileBtn.attr('data-normal-text')).prop("disabled", false);
        return;
    } else {
        if (isValidateName(sLastname)) {
            $('#lastname-error').closest(".form-group").removeClass("is-invalid").addClass("is-valid")
            $('#lastname-error').html('');
            $('#lastname-error').css("display", "none");
        } else {
            $('#lastname-error').closest(".form-group").removeClass("is-invalid").addClass("is-invalid")
            $('#lastname-error').html('Special characters are not allowed');
            $('#lastname-error').css("display", "block");
            editProfileBtn.html(editProfileBtn.attr('data-normal-text')).prop("disabled", false);
            return;
        }
    }
    if (sUsername == '') {
        $('#username-error').closest(".form-group").removeClass("is-invalid").addClass("is-invalid")
        $('#username-error').html('Please enter username');
        $('#username-error').css("display", "block");
        editProfileBtn.html(editProfileBtn.attr('data-normal-text')).prop("disabled", false);
        return;
    } else {
        if (validateEmpty(sUsername) && isValidateName(sUsername)) {
            $('#username-error').closest(".form-group").removeClass("is-invalid").addClass("is-valid")
            $('#username-error').html('');
            $('#username-error').css("display", "none");
        } else {
            $('#username-error').closest(".form-group").removeClass("is-invalid").addClass("is-invalid")
            $('#username-error').html("The Username should start with a letter and cannot contain any Special Character");
            $('#username-error').css("display", "block");
            editProfileBtn.html(editProfileBtn.attr('data-normal-text')).prop("disabled", false);
            return;
        }
    }

    if (sEmail == '') {
        $('#email-error').closest(".form-group").removeClass("is-invalid").addClass("is-invalid")
        $('#email-error').html('Please enter Email');
        $('#email-error').css("display", "block");
        editProfileBtn.html(editProfileBtn.attr('data-normal-text')).prop("disabled", false);
        return;
    } else {
        if (validateEmail(sEmail)) {
            $('#email-error').closest(".form-group").removeClass("is-invalid").addClass("is-valid")
            $('#email-error').html('');
            $('#email-error').css("display", "none");
        } else {
            $('#email-error').closest(".form-group").removeClass("is-invalid").addClass("is-invalid")
            $('#email-error').html('Please enter a valid Email Address');
            $('#email-error').css("display", "block");
            editProfileBtn.html(editProfileBtn.attr('data-normal-text')).prop("disabled", false);
            return;
        }
    }

    var fd = new FormData();

    if ($('#imageUpload')[0].files[0]) {
        const aAllowedMimes = ['image/jpeg', 'image/jpg', 'image/png'];
        if (!aAllowedMimes.includes($('#imageUpload')[0].files[0].type)) {
            // profile-image-error
            $('#profile-image-error').closest(".form-group").removeClass("is-invalid").addClass("is-invalid")
            $('#profile-image-error').html("You can only Select a JPG/JPEG/PNG file.");
            $('#profile-image-error').css("display", "block");
            $('#editProfile').prop("disabled", false);
            return;
        }
        var files = $('#imageUpload')[0].files;
        fd.append('userProfile', files[0]);
    }

    fd.append('sFirstname', sFirstname);
    fd.append('sLastname', sLastname);
    fd.append('sUserName', sUsername);
    fd.append('sEmail', sEmail);
    fd.append('sWebsite', sWebsite);
    fd.append('sBio', sBio);

    $.ajax({
        type: "PUT",
        url: "/api/v1/user/updateProfile",
        headers: {
            'Authorization': token
        },
        timeout: 500000,
        data: fd,
        contentType: false,
        processData: false,
        success: function (result, status, xhr) {
            console.log(xhr);
            toastr["success"](xhr.responseJSON.message);
            setTimeout(function () {
                location.reload();
            }, 1000)
        },
        error: function (xhr, status, error) {
            console.log(xhr);
            console.log(status);
            console.log(error);
            toastr["error"](xhr.responseJSON.message);
            editProfileBtn.html(editProfileBtn.attr('data-normal-text')).prop("disabled", false);
        }
    });
}
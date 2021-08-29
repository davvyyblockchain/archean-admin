// var token = window.localStorage.getItem('Authorization');
function validateEmpty(name) {
    var re = /^(?![-])[\w-]+$/;
    return re.test(String(name));
}

function isValidName(sName) {
    const reName = /^[a-zA-Z](( )?[a-zA-Z]+)*$/;
    return reName.test(sName);
}

$(document).ready(function () {
    var readURL = function (input) {
        // Check for Valid File
        const aAllowedMimes = ['image/jpeg', 'image/jpg', 'image/png'];
        if (!aAllowedMimes.includes(input.files[0].type)) {
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
        console.log(result);

        $("#fullName").html(result.data.oName.sFirstname + ' ' + result.data.oName.sLastname);
        $("#username").html('@' + result.data.sUserName);
        $("#name").html(result.data.oName.sFirstname);
        $("#joiningData").html('Join on ' + new Date(result.data.sCreated).toDateString());
        $("#edit_firstname").val(result.data.oName.sFirstname);
        $("#edit_lastname").val(result.data.oName.sLastname);
        $("#edit_email").val(result.data.sEmail);
        $("#edit_walletaddress").val(result.data.sWalletAddress);
        $("#edit_username").val(result.data.sUserName);
        // $("#userProfilePicture").attr("src", (result.data.sProfilePicUrl == undefined ? '../assets/images/user-avatar.svg' : 'https://ipfs.io/ipfs/' + result.data.sProfilePicUrl)));
    },
    error: function (xhr, status, error) {
        console.log('====================================');
        console.log(xhr);
        console.log('====================================');
        toastr["error"](xhr.responseJSON.message);
        return false;
    }
});

$('#editProfile').on('click', editProfile);

function editProfile() {

    let sFirstname = $('#edit_firstname').val().trim();
    let sLastname = $('#edit_lastname').val().trim();
    let sUsername = $("#edit_username").val().trim();

    if (sFirstname == '') {
        $('#firstname-error').closest(".form-group").removeClass("is-invalid").addClass("is-invalid")
        $('#firstname-error').html('Please enter firstname');
        $('#firstname-error').css("display", "block");
        return;
    } else {
        if (isValidName(sFirstname)) {
            $('#firstname-error').closest(".form-group").removeClass("is-invalid").addClass("is-valid")
            $('#firstname-error').html('');
            $('#firstname-error').css("display", "none");

        } else if (!isNaN(sFirstname)) {
            $('#firstname-error').closest(".form-group").removeClass("is-invalid").addClass("is-invalid")
            $('#firstname-error').html('Numbers are not allowed');
            $('#firstname-error').css("display", "block");
            return;
        } else {
            $('#firstname-error').closest(".form-group").removeClass("is-invalid").addClass("is-invalid")
            $('#firstname-error').html('Special characters are not allowed');
            $('#firstname-error').css("display", "block");
            return;
        }
    }
    if (sLastname == '') {
        $('#lastname-error').closest(".form-group").removeClass("is-invalid").addClass("is-invalid")
        $('#lastname-error').html('Please enter lastname');
        $('#lastname-error').css("display", "block");
        return;
    } else {
        if (isValidName(sLastname)) {
            $('#lastname-error').closest(".form-group").removeClass("is-invalid").addClass("is-valid")
            $('#lastname-error').html('');
            $('#lastname-error').css("display", "none");
        } else if (!isNaN(sLastname)) {
            $('#lastname-error').closest(".form-group").removeClass("is-invalid").addClass("is-invalid")
            $('#lastname-error').html('Numbers are not allowed');
            $('#lastname-error').css("display", "block");
            return;
        } else {
            $('#lastname-error').closest(".form-group").removeClass("is-invalid").addClass("is-invalid")
            $('#lastname-error').html('Special characters are not allowed');
            $('#lastname-error').css("display", "block");
            return;
        }
    }
    if (sUsername == '') {
        $('#username-error').closest(".form-group").removeClass("is-invalid").addClass("is-invalid")
        $('#username-error').html('Please enter username');
        $('#username-error').css("display", "block");
        return;
    } else {
        if (validateEmpty(sUsername) && isValidName(sUsername)) {
            $('#username-error').closest(".form-group").removeClass("is-invalid").addClass("is-valid")
            $('#username-error').html('');
            $('#username-error').css("display", "none");
        } else {
            $('#username-error').closest(".form-group").removeClass("is-invalid").addClass("is-invalid")
            $('#username-error').html("The Username should start with a letter and can only contain '-' and '_'");
            $('#username-error').css("display", "block");
            return;
        }
    }

    $('#editProfile').html("<div class='spinner-border spinner-border-sm'></div>").prop("disabled", true);

    var fd = new FormData();
    var files = $('#imageUpload')[0].files;
    fd.append('userProfile', files[0]);
    fd.append('sFirstname', sFirstname);
    fd.append('sLastname', sLastname);
    fd.append('sUserName', sUsername);

    console.log(fd);


    let oOptions = {
        'sFirstname': sFirstname,
        'sLastname': sLastname,
        'sUserName': sUsername
    };
    console.log(oOptions);

    $.ajax({
        type: "PUT",
        url: "/api/v1/admin/updateProfile",
        headers: {
            'Authorization': token
        },
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
            toastr["error"](xhr.responseJSON.message);
            $('#editProfile').html("Submit").prop("disabled", false);
        }
    });
}
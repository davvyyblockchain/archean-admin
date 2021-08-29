// var token = window.localStorage.getItem('Authorization');
function validateEmpty(name) {
    var re = /^(?![\s-])[\w\s-]+$/;
    return re.test(String(name));
}

function readURL(input) {
    if (input.files && input.files[0]) {

        const aAllowedMimes = ['image/jpeg', 'image/jpg', 'image/png'];
        if (!aAllowedMimes.includes(input.files[0].type)) {
            $('#collection-icon-error').closest(".form-group").removeClass("is-invalid").addClass("is-invalid")
            $('#collection-icon-error').html("You can only Select a JPG/JPEG/PNG file.");
            $('#collection-icon-error').css("display", "block");
            $('#editProfile').prop("disabled", false);
            return;
        } else {
            $('#collection-icon-error').closest(".form-group").removeClass("is-invalid").addClass("is-valid")
            $('#collection-icon-error').html('');
            $('#collection-icon-error').css("display", "none");
        }

        var reader = new FileReader();
        reader.onload = function (e) {
            $('#upload').hide();
            $('#imagePreview').attr('src', e.target.result);
            $('#imagePreview').hide();
            $('#imagePreview').fadeIn(650);
        }
        reader.readAsDataURL(input.files[0]);
    } else {
        $('#imagePreview').fadeOut(350, () => {
            $('#upload').show();
            $('#imagePreview').attr('src', "");
        });
    }
}
$("#uploadicon").change(function () {
    readURL(this);
});

$('#createCollection').on('click', createCollection);

function createCollection() {
    let createCollectionBtn = $('#createCollection');
    createCollectionBtn.html(textSpinnerHTML).prop("disabled", true);

    var fd = new FormData();
    var files = $('#uploadicon')[0].files;
    if (!files[0]) {
        $('#collection-icon-error').closest(".form-group").removeClass("is-invalid").addClass("is-invalid")
        $('#collection-icon-error').html("Please Select Collection Icon");
        $('#collection-icon-error').css("display", "block");
        createCollectionBtn.html(createCollectionBtn.attr('data-normal-text')).prop("disabled", false);
        return;
    } else {

        const aAllowedMimes = ['image/jpeg', 'image/jpg', 'image/png'];
        if (!aAllowedMimes.includes(files[0].type)) {
            $('#collection-icon-error').closest(".form-group").removeClass("is-invalid").addClass("is-invalid")
            $('#collection-icon-error').html("You can only Select a JPG/JPEG/PNG file.");
            $('#collection-icon-error').css("display", "block");
            createCollectionBtn.html(createCollectionBtn.attr('data-normal-text')).prop("disabled", false);
            return;
        } else {
            $('#collection-icon-error').closest(".form-group").removeClass("is-invalid").addClass("is-valid")
            $('#collection-icon-error').html('');
            $('#collection-icon-error').css("display", "none");
        }

        $('#collection-icon-error').closest(".form-group").removeClass("is-invalid").addClass("is-valid")
        $('#collection-icon-error').html('');
        $('#collection-icon-error').css("display", "none");
    }

    console.log(files[0]);
    fd.append('nftFile', files[0]);
    let sName = $('#collectionName').val();
    let sDescription = $('#collectionDescription').val();

    fd.append('sName', sName);
    fd.append('sDescription', sDescription);


    if (sName == '') {
        createCollectionBtn.html(createCollectionBtn.attr('data-normal-text')).prop("disabled", false);
        toastr["error"]('Please enter a Collection Name');
        return;
    } else {
        if (!validateEmpty(sName)) {
            createCollectionBtn.html(createCollectionBtn.attr('data-normal-text')).prop("disabled", false);
            toastr["error"]('Please Use Charater at beginning');
            return;
        }
    }
    $.ajax({
        type: "POST",
        url: "/api/v1/nft/createCollection",
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
                window.location.href = "/createOption";
            }, 1000)

        },
        error: function (xhr, status, error) {
            console.log(xhr);
            createCollectionBtn.html(createCollectionBtn.attr('data-normal-text')).prop("disabled", false);
            if (xhr.responseJSON.message == "File not found") {
                toastr["error"]("Please Select Collection Icon");
            } else {
                toastr["error"](xhr.responseJSON.message);
            }
        }
    });

}
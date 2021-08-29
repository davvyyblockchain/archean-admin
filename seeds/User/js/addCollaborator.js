$('#addCollaborator').on('click', addCollaborator);

function addCollaborator() {
    let addCollaboratorBtn = $('#addCollaborator');
    addCollaboratorBtn.html(textSpinnerHTML).prop("disabled", true);

    let sFullname = $('#collaboratorFullname').val();
    let sAddress = $('#collaboratorAddress').val();

    if (sFullname.trim() == '') {
        toastr["error"]("Please Enter Collaborator Name");
        addCollaboratorBtn.html(addCollaboratorBtn.attr('data-normal-text')).prop("disabled", false);
        return;
    }
    if (sAddress.trim() == '') {
        toastr["error"]("Please Enter Collaborator Address");
        addCollaboratorBtn.html(addCollaboratorBtn.attr('data-normal-text')).prop("disabled", false);
        return;
    }
    if (sAddress.trim().length != 42) {
        toastr["error"]("Please Enter Valid Collaborator Address");
        addCollaboratorBtn.html(addCollaboratorBtn.attr('data-normal-text')).prop("disabled", false);
        return;
    }
    if (localStorage.getItem("sWalletAddress") == sAddress.trim()) {
        toastr["error"]("You Can't Add Yourself As a Collaborator");
        addCollaboratorBtn.html(addCollaboratorBtn.attr('data-normal-text')).prop("disabled", false);
        return;
    }

    let oOptions = {
        'sFullname': sFullname,
        'sAddress': sAddress
    };
    $.ajax({
        type: "POST",
        url: "/api/v1/user/addCollaborator",
        data: oOptions,
        headers: {
            'Authorization': token
        },
        success: function (result, status, xhr) {
            console.log(xhr);
            toastr["success"](xhr.responseJSON.message);
            setTimeout(function () {
                window.location.href = '/collaboratorList';
            }, 500)
        },
        error: function (xhr, status, error) {
            toastr["error"](xhr.responseJSON.message);
            console.log(xhr);
            addCollaboratorBtn.html(addCollaboratorBtn.attr('data-normal-text')).prop("disabled", false);
        }
    });
}
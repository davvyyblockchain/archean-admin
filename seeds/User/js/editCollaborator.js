let sCollaboratorAddress = window.location.pathname.split("/")[2];

function isValidAddress(sAddress) {
    return sAddress.trim().length == 42
}

let sCollaboratorPreviousAddress;
if (isValidAddress(sCollaboratorAddress)) {
    // getCollaboratorName
    $.ajax({
        type: "GET",
        url: "/api/v1/user/getCollaboratorName/" + sCollaboratorAddress,
        headers: {
            'Authorization': token
        },
        success: (result, status, xhr) => {
            sCollaboratorPreviousAddress = result.data.sAddress;
            $("#collaboratorFullname").val(result.data.sFullname);
            $("#collaboratorAddress").val(result.data.sAddress);
        },
        error: (xhr, status, error) => {
            toastr["error"](xhr.responseJSON.message);
            return false;
        }
    });
} else {
    toastr["error"]("Invalid Collaborator Address");
    $("#updateCollaborator").prop("disabled", true);
    $("#collaboratorFullname").prop("disabled", true);
    $("#collaboratorAddress").prop("disabled", true);
}

$("#updateCollaborator").on("click", editCollaborator);

function editCollaborator() {

    if ($("#collaboratorAddress").val().trim() == "" || !isValidAddress($("#collaboratorAddress").val())) {
        toastr["error"]("Please Enter Valid Address");
        return;
    }
    if ($("#collaboratorFullname").val().trim() == "") {
        toastr["error"]("Please Enter Valid Name");
        return;
    }
    let oData = {
        sAddress: $("#collaboratorAddress").val(),
        sFullname: $("#collaboratorFullname").val(),
        sPreviousAddress: sCollaboratorAddress
    }
    $.ajax({
        type: "PUT",
        url: "/api/v1/user/editCollaborator",
        headers: {
            'Authorization': token
        },
        data: oData,
        success: (result, status, xhr) => {
            console.log(result);
            console.log(xhr);
            toastr["success"](xhr.responseJSON.message);
            setTimeout(() => {
                location.href = "/collaboratorList";
            }, 1000);
        },
        error: (xhr, status, error) => {
            toastr["error"](xhr.responseJSON.message);
            return false;
        }
    });
}
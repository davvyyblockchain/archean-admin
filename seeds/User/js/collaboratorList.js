$("#CollaboratorTable").DataTable({
    processing: true,
    serverSide: true,
    searching: false,
    ordering: false,
    responsive: true,
    ajax: {
        "url": "/api/v1/user/collaboratorList",
        "type": "POST",
        headers: {
            'Authorization': token
        },
    },
    aoColumns: [{
        mData: "sFullname",
    }, {
        mData: "sAddress",
        render: function (mData, type, row) {
            var firstFive = mData.slice(0, 10);
            var lastFive = mData.slice(mData.length - 8, mData.length);
            return `<td>${firstFive}...${lastFive}</td>`;
        }
    }, {
        mData: "sAddress",
        render: function (mData, type, row) {
            return `<a href="editCollaborator/${mData}" class="btn btn-danger btn-xs"><i class="fa fa-pencil-square-o"></i> </a>`;
        }
    }, {
        mData: "sAddress",
        render: function (mData, type, row) {
            return `<button id="btnDeleteCollaborator" name="Delete" title="Delete" onclick="deleteCollaborator($(this))" collaboratorAddress='${mData}' class="btn btn-danger btn-xs"><i class="fa fa-trash"></i></button>`;
        }
    }],
});

function deleteCollaborator(btn) {
    console.log(btn.attr("collaboratorAddress"));
    if (btn.attr("collaboratorAddress").length != 42) {
        toastr["error"]("Invalid Collaborator Address");
        return;
    }

    $.ajax({
        type: "GET",
        url: "/api/v1/user/deleteCollaborator/" + btn.attr("collaboratorAddress"),
        headers: {
            'Authorization': token
        },
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
        }
    });

}

function editCollaborator(btn) {
    console.log(btn.attr("collaboratorAddress"));
    if (btn.attr("collaboratorAddress").length != 42) {
        toastr["error"]("Invalid Collaborator Address");
        return;
    }
}
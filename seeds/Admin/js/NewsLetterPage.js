$(document).ready(function () {
    console.log('NewsLetterPage loaded successfully...');

    $("#emailsListTable").DataTable({
        "responsive": true,
        "paging": true,
        "pageLength": 10,
        "processing": true,
        "serverSide": true,
        "ajax": {
            type: "POST",
            url: "/api/v1/admin/getNewsLetterEmailsLists",
            "headers": {
                "Authorization": token
            }
        },
        "columns": [{
            "data": "sName"
        }, {
            "data": "sEmail"
        }, {
            "data": "_id",
            orderable: false,
            "render": function (data, type, row, meta) {
                return `<button id="deleteItemBtn" objId="${row._id}" onclick="deleteEmail($(this))" class="btn btn-danger btn-xs"><i class="fa fa-trash"></i></button>`
            }
        }]
    });
});

function deleteEmail(btn) {
    console.log(btn);
    console.log(btn.attr("objId"));

    $.ajax({
        type: "DELETE",
        url: "/api/v1/admin/deleteNewsLetterEmail",
        "headers": {
            "Authorization": token,
            "_id": btn.attr("objId")
        },
        success: function (result, status, xhr) {
            console.log(result);
            location.reload();
            toastr["success"](xhr.responseJSON.message);
        },
        error: function (xhr, status, error) {
            console.log(error);
            toastr["error"](xhr.responseJSON.message);
        }
    });
}
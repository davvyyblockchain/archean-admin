$(document).ready(function () {
    $('#userTable').DataTable({
        "responsive": true,
        "processing": true,
        "serverSide": true,
        "ajax": {
            "url": "/api/v1/admin/users",
            "type": "POST",
            headers: {
                'Authorization': token
            },
            dataFilter: function (data) {
                var json = jQuery.parseJSON(data);
                json.recordsTotal = json.data.recordsTotal;
                json.recordsFiltered = json.data.recordsFiltered;
                json.data = json.data.data;
                json.draw = json.data.draw;
                return JSON.stringify(json); // return JSON string
            }
        },
        "aoColumns": [{
                "mData": "sUserName",
                render: function (mData, type, row) {
                    return `<td>${(mData == undefined || mData == "") ? '-' : mData}</td>`;
                }
            },
            {
                mData: 'sWalletAddress',
                render: function (mData, type, row) {
                    var firstFive = mData.slice(0, 10);
                    var lastFive = mData.slice(mData.length - 8, mData.length);
                    return `<td>${firstFive}...${lastFive}</td>`;
                }
            },
            {
                "mData": "sStatus",
                render: function (mData, type, row) {
                    return `<td>${(mData == undefined || mData == "") ? '-' : mData}</td>`;
                }
            },
            {
                "mData": "sStatus",
                orderable: false,
                "render": function (data, type, row, meta) {
                    if (data == "active") {
                        return `
                            <button id="btnBlockUser" name="blocked" title="Block" onclick="toggleStatus($(this))" objId='${row._id}' class="btn btn-danger btn-xs"><i class="fa fa-ban"></i></button>
                            <button id="btnBlockUser" name="deactivated" title="Deactivate" onclick="toggleStatus($(this))" objId='${row._id}' class="btn btn-danger btn-xs"><i class="fa fa-trash"></i></button>`;
                    }
                    return `<button id="btnBlockUser" name="active" title="Activate" onclick="toggleStatus($(this))" objId='${row._id}' class="btn btn-success btn-xs"><i class="fa fa-check"></i></button>`;
                }
            }
        ],
        "columnDefs": [{
            "searchable": true,
            "orderable": true,
        }],
        "iDisplayLength": 10
    });

    // Add Placeholder to the search box
    $("#userTable_filter > label > input[type=search]").attr("placeholder", "Username");
});

function toggleStatus(btn) {
    console.log(btn.attr("objId"));
    console.log(btn.attr("name"));
    // toggleUserStatus

    let oOptions = {
        sObjectId: btn.attr("objId"),
        sStatus: btn.attr("name")
    }

    $.ajax({
        type: "POST",
        url: "/api/v1/admin/toggleUserStatus",
        data: oOptions,
        headers: {
            'Authorization': token
        },
        success: function (result, status, xhr) {
            console.log(xhr);
            toastr["success"](xhr.responseJSON.message);
            setTimeout(function () {
                window.location.reload();
            }, 1000)
        },
        error: function (xhr, status, error) {
            toastr["error"](xhr.responseJSON.message);
            console.log(xhr);
        }
    });
}
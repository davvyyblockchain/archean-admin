$(() => {
    $("#categoriesTable").DataTable({
        responsive: true,
        processing: true,
        serverSide: true,
        ajax: {
            "url": "/api/v1/admin/getCategories",
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
        aoColumns: [{
            mData: "sName"
        }, {
            mData: "sName",
            orderable: false,
            render: function (mData, type, row) {
                return `<button type="button" onclick="editCategory($(this))" title="Edit" category="${mData}" class="btn btn-info btn-xs"><i class="fa fa-edit"></i></button>`;
            }
        }, {
            mData: "sName",
            orderable: false,
            render: function (mData, type, row) {
                if (row.sStatus == "Active")
                    return `<button type="button" onclick="toggleStatus($(this))" name="Deactivated" title="Deactivate" category="${mData}" class="btn btn-danger btn-xs"><i class="fa fa-ban"></i></button>`;
                else
                    return `<button type="button" onclick="toggleStatus($(this))" name="Active" title="Activate" category="${mData}" class="btn btn-success btn-xs"><i class="fa fa-check"></i></button>`;
            }
        }, {
            mData: "sName",
            orderable: false,
            render: function (mData, type, row) {
                return `<button type="button" onclick="deleteCategory($(this))" title="Delete" category="${mData}" class="btn btn-danger btn-xs"><i class="fa fa-trash"></i></button>`;
            }
        }]
    });

    // Add Placeholder in  Search Field
    $("#categoriesTable_filter > label > input[type=search]").attr("placeholder", "Category");
});

function deleteCategory(btn) {
    console.log(btn.attr("category"));
    $.ajax({
        type: "DELETE",
        url: "/api/v1/admin/deleteCategory/" + btn.attr("category"),
        "headers": {
            "Authorization": token
        },
        success: function (result, status, xhr) {
            console.log(result);
            toastr["success"](xhr.responseJSON.message);
            setTimeout(() => {
                location.reload();
            }, 1000);
        },
        error: function (xhr, status, error) {
            console.log(error);
            toastr["error"](xhr.responseJSON.message);
        }
    });
}

function toggleStatus(btn) {
    console.log(btn.attr("category"));
    console.log(btn.attr("name"));

    const oData = {
        sStatus: btn.attr("name")
    }

    $.ajax({
        type: "PUT",
        url: "/api/v1/admin/toggleCategory/" + btn.attr("category"),
        "headers": {
            "Authorization": token
        },
        data: oData,
        success: function (result, status, xhr) {
            console.log(result);
            toastr["success"](xhr.responseJSON.message);
            setTimeout(() => {
                location.reload();
            }, 1000);
        },
        error: function (xhr, status, error) {
            console.log(error);
            toastr["error"](xhr.responseJSON.message);
        }
    });
}

function editCategory(btn) {
    console.log(btn.attr("category"));


    $("#modelTitle").text("Update Category");
    $("#btnSubmitCategory").text("Update");
    $("#btnSubmitCategory").attr("oldCategory", btn.attr("category"));
    $("#categoryName").val(btn.attr("category"));

    $("#categoryModel").modal({
        show: true
    });
}

$("#btnSubmitCategory").on("click", () => {
    const reCategory = /^[a-zA-Z](( )?[a-zA-Z]+)*$/;
    if ($("#categoryName").val().trim() == "") {
        $("#lblCategoryName").text("Please Fill up this field");
        $("#lblCategoryName").removeClass("d-none");
        $("#lblCategoryName").addClass("d-flex");
        return;
    } else if (!reCategory.test($("#categoryName").val().trim())) {
        $("#lblCategoryName").text("Invalid Category");
        $("#lblCategoryName").removeClass("d-none");
        $("#lblCategoryName").addClass("d-flex");
        return;
    } else {
        $("#lblCategoryName").removeClass("d-flex");
        $("#lblCategoryName").addClass("d-none");
    }
    // Update Category
    if ($("#btnSubmitCategory").text() == "Update") {
        console.log("Update");
        console.log("New: " + $("#categoryName").val().trim());
        console.log("Old: " + $("#btnSubmitCategory").attr("oldCategory"));
        const oData = {
            sName: $("#btnSubmitCategory").attr("oldCategory"),
            sNewName: $("#categoryName").val().trim()
        };
        $.ajax({
            type: "PUT",
            url: "/api/v1/admin/editCategory",
            "headers": {
                "Authorization": token
            },
            data: oData,
            success: function (result, status, xhr) {
                console.log(result);
                toastr["success"](xhr.responseJSON.message);
                setTimeout(() => {
                    location.reload();
                }, 1000);
            },
            error: function (xhr, status, error) {
                console.log(error);
                toastr["error"](xhr.responseJSON.message);
            }
        });
    } else if ($("#btnSubmitCategory").text() == "Add") {
        const oData = {
            sName: $("#categoryName").val().trim()
        };
        $.ajax({
            type: "POST",
            url: "/api/v1/admin/addCategory",
            "headers": {
                "Authorization": token
            },
            data: oData,
            success: function (result, status, xhr) {
                console.log(result);
                toastr["success"](xhr.responseJSON.message);
                setTimeout(() => {
                    location.reload();
                }, 1000);
            },
            error: function (xhr, status, error) {
                console.log(error);
                toastr["error"](xhr.responseJSON.message);
            }
        });
    }
});

$("#btnAddNewCategory").on("click", () => {
    $("#modelTitle").text("Add New Category");
    $("#btnSubmitCategory").text("Add");
    $("#btnSubmitCategory").attr("oldCategory", "");
    $("#categoryName").val("");

    $("#categoryModel").modal({
        show: true
    });
});
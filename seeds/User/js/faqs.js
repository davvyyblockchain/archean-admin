$.ajax({
    type: "GET",
    url: "/api/v1/user/getFAQsData",
    success: function (result, status, xhr) {
        console.log(result);
        for (let i = 0; i < result.data.length; i++) {
            $("#accordionExample").append(`<div class="card">
            <div class="card-header" id="heading${i + 1}">
                <h2 class="mb-0">
                    <button class="btn btn-link btn-block text-left" type="button"
                        data-toggle="collapse" data-target="#collapse${i + 1}" aria-expanded="true"
                        aria-controls="collapse${i + 1}">
                        <span>${result.data[i].oFAQs_data.sQuestion}</span>
                        <span class="iconify" data-icon="bi:plus" data-inline="false"></span>
                    </button>
                </h2>
            </div>

            <div id="collapse${i + 1}" class="collapse" aria-labelledby="heading1${i + 1}"
                data-parent="#accordionExample">
                <div class="card-body font-family-bs-regular text-dark-blue font-size-18">
                    <p>${result.data[i].oFAQs_data.sAnswer}</p>
                </div>
            </div>
        </div>`);
        }
    },
    error: function (xhr, status, error) {
        toastr["error"](xhr.responseJSON.message);
        return false;
    }
});
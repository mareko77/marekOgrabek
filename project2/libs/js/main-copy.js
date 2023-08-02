$(window).on("load", function() {
    $("#preloader").fadeOut("slow");
    getEmployees();
    getDepartments();
});

let addDepartmentModal = $("#addDepartmentModal");


$("#btn-employees").on("click", function() {
    $(this).addClass("itsLive");
    $("#btn-departments").removeClass("itsLive");
    $("#btn-locations").removeClass("itsLive");
    $("#all-employees").removeClass("d-none");
    $("#all-departments").addClass("d-none");
    $("#all-locations").addClass("d-none");
    $(".navbar-collapse.show").collapse("hide");
    getEmployees();
});

$("#btn-departments").on("click", function() {
    $(this).addClass("itsLive");
    $("#btn-employees").removeClass("itsLive");
    $("#btn-locations").removeClass("itsLive");
    $("#all-departments").removeClass("d-none");
    $("#all-employees").addClass("d-none");
    $("#all-locations").addClass("d-none");
    $(".navbar-collapse.show").collapse("hide");
});

$("#btn-locations").on("click", function() {
    $(this).addClass("itsLive");
    $("#btn-employees").removeClass("itsLive");
    $("#btn-departments").removeClass("itsLive");
    $("#all-locations").removeClass("d-none");
    $("#all-departments").addClass("d-none");
    $("#all-employees").addClass("d-none");
    $(".navbar-collapse.show").collapse("hide");
});

// Get All Employees, Departments, Locations
function getEmployees() {
    $.ajax({
        url: "libs/php/getAll.php",
        type: 'GET',
        dataType: 'json',
        success: function(result) {
            console.log(result);
            if (result.status.name == "ok") {    

                const employees = result.data;
                let employeeTable = $("#employeeTbody");
                employeeTable.html("");
                let totalEntries = $("#total-entries");
                employees.forEach(employee => {
                    $("#employeeTbody").append($(`<tr>
                                                <td id='employeeID'></td>
                                                <td>${employee.firstName}</td>
                                                <td>${employee.lastName}</td>
                                                <td>${employee.jobTitle}</td>
                                                <td>${employee.email}</td>
                                                <td>${employee.department}</td>
                                                <td>${employee.location}</td>
                                            </tr>
                                          `));
                });    
            }
        },
        error: function(jqXHR, textStatus, errorThrown) {
            console.log(jqXHR, textStatus, errorThrown);
        }
    });
}

function getDepartments() {
$.ajax({
                    
    url: "libs/php/getAllLocations.php",
    type: 'GET',
    dataType: 'json',
    
    success: function(result) {
        console.log(result);
        $.ajax({
            url: "libs/php/getAllDepartments.php",
            type: 'GET',
            dataType: 'json',
            success: function(result) {
                console.log(result);
                if (result.status.name == "ok") {
                    const departments = result.data;
                    let selectDepartment = $("#select-departments");
                    selectDepartment.html("");
                    let departmentDetailCard = $("#departments-cards");
                    departmentDetailCard.html("");
                    departments.forEach(department => {
                        selectDepartment.append($(`<option value="${department.id}">${department.name}</option>`));
                        departmentDetailCard.append($(`<div id="department-details-card" class="department-details-card bg-info">
                                                        
                                                            <div class="card-body">
                                                                <h5 class="card-title department-name text-center mb-3"><strong>${department.name}</strong></h5>
                                                                <h6 class="card-title department-name text-center mb-3" id='locationName'></h6>
                                                                <div class="text-center">
                                                                    <button id="dept-pencil-edit" class="btn updateDepartmentIcon" type="button"
                                                                        data-departmentid="${department.id}"
                                                                        data-name="${department.name}"                                    
                                                                        data-locationID="${department.locationID}">
                                                                        <i class="fa-solid fa-pen-to-square text-dark" title="Edit"></i>
                                                                    </button>
                                                                    <button id="dept-bin-delete" class="btn deleteDepartmentIcon" type="button" data-departmentid="${department.id}">
                                                                        <i class="fa-solid fa-trash-can" title="Delete"></i>
                                                                    </button>                                     
                                                                </div>  
                                                            </div>    
                                                        </div>`));
                    });
                }
            },
            error: function(jqXHR, textStatus, errorThrown) {
                console.log(jqXHR, textStatus, errorThrown);
            }
        });
        $('#locationName').html(result.data.name);
       
    },
    error: function(jqXHR, textStatus, errorThrown) {
        console.log(jqXHR, textStatus, errorThrown);
    }
});
}


// On click table row - Open personnel details
$(".table").on("click", function(e) {
    e.preventDefault();

    $.ajax({
        url: "libs/php/getEmployeeID.php",
        type: 'GET',
        dataType: 'json',
    
        success: function(result) {
            console.log(result); 
           
            if (result.status.name == "ok") {

                const eEmployees = result.data;

                eEmployees.forEach(eEmployee => {
                    $(".table").html("");
                    $("#employeeID").html(eEmployee.id);
                });

                $.ajax({
                    url: "libs/php/getPersonnelByID.php",
                    type: 'POST',
                    dataType: 'json',
                    data: {
                        id: $("#employeeID").val(),
                    },
                    success: function(result) {
                        console.log(result);  
                        if (result.status.name == "ok") {
                            let employee = result.data[0];
                            let edContent = $("#ed-content");
                            edContent.html("");
                            edContent.html($(`  <div class="modal-header">
                                                    <button type="button" id="ed-left-arrow" class="btn" title="Back" data-bs-dismiss="modal" aria-label="Close"><i class="fa-regular fa-circle-xmark"></i></button>
                                                    <h4 class="modal-title" id="viewEmployeeModalLabel">Employee Details</h4>
                                                </div>
                                                <div class="modal-body">
                                                    <div class="container-details container justify-content-center" >
                                                        <div class="employee-details-card card p-2">
                                                            <div class="card-body d-flex justify-content-center" id="ed-name">
                                                                <h3 class="card-title p-2 "><strong>${employee.firstName}</strong></h3>
                                                                <h3 class="card-title p-2"><strong>${employee.lastName}</strong></h3>
                                                            </div>
                                                            <div class="d-flex justify-content-center mt-3">
                                                                <table class="ed-table table justify-content-between table-responsive">
                                                                    <tbody id="ed-tbody">
                                                                            <tr>
                                                                                <td><i class="fa fa-briefcase"></i></td>
                                                                                <td class="align-middle text-end">${employee.jobTitle}</td>
                                                                            </tr>
                                                                            <tr>
                                                                                <td><a href="mailto:${employee.email}"><i class="fa fa-envelope"></i></a></td>
                                                                                <td class="align-middle text-end">${employee.email}</td>    
                                                                            </tr>
                                                                            <tr>
                                                                                <td><i class='bx bxs-buildings' title='Department'></i></td>
                                                                                <td class="align-middle text-end">${employee.department}</td>    
                                                                            </tr>
                                                                            <tr>
                                                                                <td><i class='bx bxs-map' title='Location'></i></td>
                                                                                <td class="align-middle text-end">${employee.location}</td>    
                                                                            </tr>
                                                                    </tbody>
                                                                </table>   
                                                            </div>  
                                                        </div>
                                                    </div>
                                                </div>
                                                <div class="modal-footer justify-content-center">
                                                    <button id="ed-pencil-edit" class="btn editE" type="button"
                                                            data-id="${employee.id}"
                                                            data-firstName="${employee.firstName}" 
                                                            data-lastName="${employee.lastName}"
                                                            data-jobTitle="${employee.jobTitle}" 
                                                            data-email="${employee.email}" 
                                                            data-department="${employee.department}"
                                                            data-departmentid="${employee.departmentID}"
                                                            data-location="${employee.location}"
                                                            data-locationID="${employee.locationID}">
                                                            <i class="fa-solid fa-pen-to-square"></i>
                                                    </button>
                                                    <button id="ed-bin-delete" class="btn deleteE" type="button" data-id="${employee.id}">
                                                    <i class="fa-solid fa-trash-can" title="Delete">
                                                    </button>
                                                </div>`));
                           
                        }
                    },
                    error: function(jqXHR, textStatus, errorThrown) {
                        console.log(jqXHR, textStatus, errorThrown);
                    }
                });
                $("#viewEmployeeModal").modal("show"); 
            }
        },
        error: function(jqXHR, textStatus, errorThrown) {
            console.log(jqXHR, textStatus, errorThrown);
        }
    });
           
});


//  DEPARTMENTS 

// ADD Department
$("#add-department").click(function() {
    addDepartmentModal.modal("show");
    resetModal(addDepartmentModal);
    $("#addDepartmentForm").validate().resetForm();
    $("#addDepartmentBtn").attr("disabled", true);
});

$("#addDepartmentBtn").on("click", function(e) {
    e.preventDefault();
 
    $.ajax({
        url: "libs/php/insertDepartment.php",
        type: 'POST',
        dataType: 'json',
        data: {
            name: toTitleCase($("#departmentName_addd").val()),
            locationID: $("#addDepartmentLocationSelect :selected").val()
        },
        beforeSend: function() {
            $("#loader").removeClass("hidden");
        },
        success: function(result) {
            console.log(result);
            if (result.status.name == "ok") {
                addDepartmentModal.modal("hide");
                showDepartments(); 
            }
        },
        complete: function() {
            $("#loader").addClass("hidden");
        },
        error: function(jqXHR, textStatus, errorThrown) {
            console.log(jqXHR, textStatus, errorThrown);
        }
    });
});


















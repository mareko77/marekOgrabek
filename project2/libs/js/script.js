let selectedDepartmentID = null;
let selectedLocationId = null;
let selectedEmployeeId = null;

//$("#employeeTable").tableHeadFixer();

$(window).on("load", function() {
  $("#preloader").fadeOut("slow");
  getEmployees();
  getDepartments();
  getLocations();
});

  
// Refresh page
function refreshPage(){
    window.location.reload();
} 


// Search Input 
$(document).ready(function(){
    $("#searchInp").on("keyup", function() {
      var value = $(this).val().toLowerCase();
      if ($('#personnelBtn').hasClass('active')){
      $("#employeeTbody tr").filter(function() {
        $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1)
      });
        } else if ($('#departmentsBtn').hasClass('active')){
            $("#departments-cards tr").filter(function() {
                $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1)
              });
        } else if ($('#locationsBtn').hasClass('active')){
            $("#locations-cards tr").filter(function() {
                $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1)
              });
        }
    });
  });

// Resets Modal
function resetModal(e) {
    e.on("hidden.bs.modal", function () {
        $(this).find("form").trigger("reset");
    })
}


// Get employees function
function getEmployees() {
    $.ajax({
        url: "libs/php/getAll.php",
        type: "GET",
        dataType: "json",
        success: function (result) {
            if (result.status.name == "ok") {
                const employees = result.data;
                let employeeTable = $("#employeeTbody");
                let totalEntries = $("#total-entries");
                employeeTable.html("");

                employees.forEach((employee) => {
                    employeeTable.append(
                        $(
                            `
                            <tr role="button" data-id="${employee.id}">
                                <td class="align-middle text-nowrap">${employee.firstName}</td>
                                <td class="align-middle text-nowrap">${employee.lastName}</td>
                                <td class="align-middle text-nowrap d-none d-md-table-cell">${employee.department}</td>
                                <td class="align-middle text-nowrap d-none d-md-table-cell">${employee.location}</td>
                                <td class="align-middle text-nowrap d-none d-md-table-cell">${employee.email}</td>
                                <td class="text-end text-nowrap">
                                    <button type="button" class="btn btn-primary btn-sm editE"
                                        data-id="${employee.id}"
                                        data-firstname="${employee.firstName}"
                                        data-lastname="${employee.lastName}"
                                        data-jobtitle="${employee.jobTitle}"
                                        data-email="${employee.email}"
                                        data-department="${employee.department}"
                                        data-departmentID="${employee.departmentID}"
                                        data-location="${employee.location}"
                                        data-locationID="${employee.locationID}">
                                        <i class="fa-solid fa-pencil fa-fw"></i>
                                    </button>
                                    <button type="button" class="btn btn-danger btn-sm deleteE" data-id="${employee.id}">
                                        <i class="fa-solid fa-trash fa-fw"></i>
                                    </button>
                                </td>
                            </tr>
                            `
                        )
                    );
                });

                $(".editE").on("click", function() {
                    const employeeId = $(this).data("id");
                    const firstName = $(this).data("firstname");
                    const lastName = $(this).data("lastname");
                    const jobTitle = $(this).data("jobtitle");
                    const email = $(this).data("email");
                    const departmentID = $(this).data("departmentid");

                    // Populate the modal inputs with the retrieved data
                    $("#id_u").val(employeeId);
                    $("#firstName_u").val(firstName);
                    $("#lastName_u").val(lastName);
                    $("#jobTitle_u").val(jobTitle);
                    $("#email_u").val(email);

                    $("#editEmployeeDepartmentSelect option[value='" + departmentID + "']").prop("selected", true);            
                    // Show the edit modal
                    $("#editEmployeeModal").modal("show");
                });

                // Event handler for when the .deleteE button is clicked
                $(".deleteE").click(function () {
                    $("#id_d").val($(this).attr("data-id"));
                   // selectedEmployeeId = $(this).data("id");
                    const employeeFirstName = $(this).closest("tr").find(".align-middle.text-nowrap").eq(0).text();
                    const employeeLastName = $(this).closest("tr").find(".align-middle.text-nowrap").eq(1).text();
                    const employeeName = employeeFirstName + " " + employeeLastName;

                    $("#areYouSureEmployeeName").text(employeeName);
                    $("#deleteEmployeeModal").modal("show");
                });

                const total = $("#employeeTbody tr:visible").length;
                totalEntries.html(
                    $(
                        `<strong><h5 class="entries">${total} employees</h5></strong>`
                    )
                );
            }
        },
        error: function (jqXHR, textStatus, errorThrown) {
            console.error(jqXHR, textStatus, errorThrown);
        },
    });
}

// Event handler for when the #confirmDeleteEmployee button is clicked
$("#confirmDeleteEmployee").on("click", function (e) {
    e.preventDefault();

    $.ajax({
        url: "libs/php/deletePersonnel.php",
        type: "POST",
        dataType: "json",
        data: {
            id: $("#id_d").val(),
        },
        beforeSend: function () {
            $("#loader").removeClass("hidden");
        },
        success: function (result) {
            if (result.status.name == "ok") {
                $("#deleteEmployeeModal").modal("hide");
                $("#successDeletePersonnel").modal("show");

                getEmployees();
            }
        },
        complete: function () {
            $("#loader").addClass("hidden");
        },
        error: function (jqXHR, textStatus, errorThrown) {
            console.log(jqXHR, textStatus, errorThrown);
        },
    });
});






// Add Personnel, Department, Location onclick button

$("#addBtn").click(function() {
    if($('#personnelBtn').hasClass('active')){
        $("#addEmployeeModal").modal("show");
        resetModal($("#addEmployeeModal"));
    } else if ($('#departmentsBtn').hasClass('active')){
        $("#addDepartmentModal").modal("show");
        resetModal($("#addDepartmentModal"));
    } else if ($('#locationsBtn').hasClass('active')) {
        $("#addLocationModal").modal("show"); 
        resetModal($("#addLocationModal"));
    } 
});

//Add employee
$(document).ready(function(){
    
    $("#employeeConfirmAddBtn").submit(function(e){
        e.preventDefault();
        $.ajax({
            url: "libs/php/insertPersonnel.php",
            type: 'POST',
            dataType: 'json',
            data: {
                firstName: ($("#firstNameInput").val()),
                lastName: ($("#lastNameInput").val()),
                jobTitle: ($("#jobTitleInput").val()),
                email: $("#emailInput").val(),
                departmentID: $("#addEmployeeDepartmentSelect").val()
            },
            beforeSend: function() {
                $("#loader").removeClass("hidden");
            },
            success: function(result) {
                console.log(result);
                
                if (result.status.name == "ok") {
                    $("#addEmployeeModal").modal("hide");
                    $("#successAddPersonnel").modal("show");
                    getEmployees();
                }
            },
            complete: function() {
                $("#loader").addClass("hidden");
            },
            error: function(jqXHR, textStatus, errorThrown) {
                $("#addEmployeeModal .modal-title").replaceWith(
                    "Error retrieving data"
                );
            }
        });
    });
});

  
  
  // EDIT - UPDATE Employee 
  $(document).ready(function(){
  
  $("#editEmployeeForm").submit(function(e) {
    e.preventDefault();
    var id = $("#id_u").val(); 
    var firstName = $("#firstName_u").val();
    var lastName = $("#lastName_u").val();
    var email = $("#email_u").val();
    var jobTitle = $("#jobTitle_u").val();
    var departmentID = $("#editEmployeeDepartmentSelect").val(); 

    
    console.log("departmentID:", departmentID);

  $.ajax({
      url: "libs/php/updatePersonnelByID.php",
      type: 'POST',
      dataType: 'json',
      data: {
        id: id,
        firstName: firstName,
        lastName: lastName,
        email: email,
        jobTitle: jobTitle,
        departmentID: departmentID,
    },
        beforeSend: function() {
            $("#loader").removeClass("hidden");
        },
        success: function(result) {
            //console.log("Department ID:", departmentID);
            
            if (result.status.name == "ok") {
                $("#editEmployeeModal").modal("hide"); 
                $("#successUpdatePersonnel").modal("show");
                getEmployees();
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
  });


// Departments

function getDepartments() {
  $.ajax({
      url: "libs/php/getAllDepartments.php",
      type: 'GET',
      dataType: 'json',
      success: function(result) {
          
          if (result.status.name == "ok") {
              const departments = result.data;
              let selectDepartment = $("#select-departments");
              selectDepartment.html("");
              let confirmDeleteDepartment = $("#confirmDeleteDepartment");
              confirmDeleteDepartment.html("");
              let departmentDetailCard = $("#departments-cards");
              departmentDetailCard.html("");
              let addEmployeeDepartmentSelect = $("#addEmployeeDepartmentSelect");
              addEmployeeDepartmentSelect.html("");
              let editEmployeeDepartmentSelect = $("#editEmployeeDepartmentSelect");
              editEmployeeDepartmentSelect.html("");
              departments.forEach(department => {
                  selectDepartment.append($(`<option value="${department.id}">${department.name}</option>`));

                  departmentDetailCard.append($(`
                                                <tr role="button1" data-departmentid="${department.id}">
                                                <td class="align-middle text-nowrap">
                                                  ${department.name}
                                                </td>
                                                <td class="align-middle text-nowrap d-none d-md-table-cell">
                                                  ${department.location}
                                                </td>
                                                <td class="align-middle text-end text-nowrap">
                                                  <button type="button" class="btn btn-primary btn-sm updateDepartmentIcon" id="dept-pencil-edit" data-bs-target="#updateDepartmentModal"
                                                          data-departmentid="${department.id}"
                                                          data-name="${department.name}"
                                                          data-location="${department.location}"
                                                          data-locationID="${department.locationID}">
                                                    <i class="fa-solid fa-pencil fa-fw"></i>
                                                  </button>
                                                  <button type="button" class="btn btn-danger btn-sm deleteDepartmentIcon" id="dept-bin-delete" data-departmentid="${department.id}">
                                                    <i class="fa-solid fa-trash fa-fw"></i>
                                                  </button>
                                                </td>
                                                </tr> 
                                                `));

                                                addEmployeeDepartmentSelect.append($(`<option data-locationid="${department.locationID}" value="${department.id}">${department.name}</option>`));
                                                editEmployeeDepartmentSelect.append($(`<option data-departmentid="${department.id}" value="${department.id}">${department.name}</option>`));
                                            });

                                            confirmDeleteDepartment.append($(`
                                            <button type="button" class="btn btn-secondary myBtn" data-bs-dismiss="modal">Cancel</button>
                                            <button type="button" class="btn btn-danger myBtn" id="delDepartmentYes" data-bs-target="#successDelete">Delete</button>
                                            `));

                                            addEmployeeDepartmentSelect.prepend($(`<option selected disabled value="0">Select a Department</option>`));
                                            editEmployeeDepartmentSelect.prepend($(`<option value="0"></option>`));

                                            $(".updateDepartmentIcon").on("click", function() {
                                                let id = $(this).attr("data-departmentid");
                                                let name = $(this).attr("data-name");
                                                let location = $(this).attr("data-location");
                                                let locationID = $(this).attr("data-locationID");
                                                
                                                $("#id_ud").val(id);
                                                $("#departmentName_ud").val(name);
                                                $("#editDepartmentLocationSelect option:first").replaceWith(($(`<option selected disabled value="${locationID}">${location}</option>`))); 
                                                
                                                $("#editDepartmentModal").modal("show"); 
                                            });

                                                let selectedDepartmentId = null;

                                            // Event handler for when the .deleteDepartmentIcon is clicked
                                            $(".deleteDepartmentIcon").click(function() {
                                                // Store the department ID in the global variable
                                                selectedDepartmentId = $(this).data("departmentid");

                                                // Make an AJAX request to check if the department has dependencies
                                                $.ajax({
                                                    url: "libs/php/checkDepartment.php",
                                                    type: "POST",
                                                    dataType: "json",
                                                    data: {
                                                        id: selectedDepartmentId
                                                    },
                                                    success: function(result) {
                                                        if (result.status.code == 200) {
                                                            if (result.data[0].personnelCount == 0) {
                                                                $("#areYouSureDeptName").text(result.data[0].departmentName);
                                                                $('#areYouSureDeleteDepartmentModal').modal("show");
                                                            } else {
                                                                // Show the modal indicating that the department has dependencies
                                                                $("#cantDeleteDeptName").text(result.data[0].departmentName);
                                                                $("#pc").text(result.data[0].personnelCount);
                                                                $('#cantDeleteDepartmentModal').modal("show");
                                                            }
                                                        } else {
                                                            // Handle the error response
                                                            $('#exampleModal .modal-title').replaceWith("Error retrieving data");
                                                        }
                                                    },
                                                    error: function(jqXHR, textStatus, errorThrown) {
                                                        // Handle the AJAX error
                                                        $('#exampleModal .modal-title').replaceWith("Error retrieving data");
                                                    }
                                                });
                                            });

                                            // Event handler for when the #delDepartmentYes button is clicked
                                            $("#delDepartmentYes").click(function() {
                                                if (selectedDepartmentId !== null) {

                                                    $.ajax({
                                                        url: "libs/php/deleteDepartmentByID.php",
                                                        type: "POST",
                                                        dataType: "json",
                                                        data: { id: selectedDepartmentId },
                                                        success: function(result) {
                                                            if (result.status.name === "ok") {
                                                                console.log("Department deleted successfully.");
                                                                $("#areYouSureDeleteDepartmentModal").modal("hide");
                                                                $("#successDelete").modal("show");
                                                                getDepartments(); 
                                                            } else {
                                                                // Department deletion failed
                                                                console.error("Error deleting department:", result.status.description);
                                                            }
                                                        },
                                                        error: function(jqXHR, textStatus, errorThrown) {
                                                            // Handle the AJAX error
                                                            console.error("AJAX Error:", textStatus, errorThrown);
                                                        }
                                                    });

                                                    // Clear the selectedDepartmentId after use
                                                    selectedDepartmentId = null;
                                                } else {
                                                    // Handle the case where no department is selected
                                                    console.log("No department selected.");
                                                }
                                            });
                                                                                                                                    
                                                                                        
                                        }
                                    },
         error: function(jqXHR, textStatus, errorThrown) {
            console.log(jqXHR, textStatus, errorThrown);
        }
    });
}





//Add department
$(document).ready(function(){

    $("#addDepartmentForm").submit(function(e) {
    e.preventDefault();

        $.ajax({
            url: "libs/php/insertDepartment.php",
            type: 'POST',
            dataType: 'json',
            data: {
                name: ($("#departmentName_addd").val()),
                locationID: $("#addDepartmentLocationSelect :selected").val()
            },
            beforeSend: function() {
                $("#loader").removeClass("hidden");
            },
            success: function(result) {
                
                if (result.status.name == "ok") {
                    $('#addDepartmentModal').modal("hide");
                    $("#successAddDepartment").modal("show");
                    getDepartments(); 
                }
            },
            complete: function() {
                $("#loader").addClass("hidden");
            },
            error: function(jqXHR, textStatus, errorThrown) {
                $("#addDepartmentModal .modal-title").replaceWith(
                    "Error retrieving data"
                    );
            }
        });
    });
});

// EDIT - UPDATE Department
$(document).ready(function(){

$("#editDepartmentForm").submit(function(e) {
  e.preventDefault();
 
  $.ajax({
      url: "libs/php/updateDepartment.php",
      type: 'POST',
      dataType: 'json',
      data: {
          name: ($("#departmentName_ud").val()),
          locationID: $("#editDepartmentLocationSelect :selected").val(),
          id: $("#id_ud").val()
      },
      beforeSend: function() {
          $("#loader").removeClass("hidden");
      },
      success: function(result) {
          
          if (result.status.name == "ok") {
              $("#editDepartmentModal").modal("hide");
              $("#successUpdateDepartment").modal("show");
              getDepartments();
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
});


// LOCATIONS 

function getLocations() {
  $.ajax({
      url: "libs/php/getAllLocations.php",
      type: 'GET',
      dataType: 'json',
      success: function(result) {
         // console.log(result);
          if (result.status.name == "ok") {
              const locations = result.data;
              let selectLocation = $("#select-locations");
              selectLocation.html("");
              let locationDetailCard = $("#locations-cards");
              locationDetailCard.html("");
              let addEmployeeLocationSelect = $("#addEmployeeLocationSelect");
              addEmployeeLocationSelect.html("");
              let editEmployeeLocationSelect = $("#editEmployeeLocationSelect");
              editEmployeeLocationSelect.html("");
              let editDepartmentLocationSelect = $("#editDepartmentLocationSelect");
              editDepartmentLocationSelect.html("");
              let addDepartmentLocationSelect = $("#addDepartmentLocationSelect");
              addDepartmentLocationSelect.html("");
              locations.forEach(location => {
                  selectLocation.append($(`<option value="${location.id}">${location.name}</option>`));
                  locationDetailCard.append($(`
                                              <tr>
                                              <td class="align-middle text-nowrap">
                                                ${location.name}
                                              </td>
                                              <td class="align-middle text-end text-nowrap">
                                                <button type="button" id="loc-pencil-edit" class="btn btn-primary btn-sm updateLocationIcon"
                                                          data-locationID="${location.id}"
                                                          data-name="${location.name}">
                                                  <i class="fa-solid fa-pencil fa-fw"></i>
                                                </button>
                                                <button type="button" id="loc-bin-delete" class="btn btn-danger btn-sm deleteLocationIcon" data-id="${location.id}">
                                                  <i class="fa-solid fa-trash fa-fw"></i>
                                                </button>
                                              </td>
                                              </tr>                                                               
                                              `));  

                  addEmployeeLocationSelect.append($(`<option value="${location.id}">${location.name}</option>`));
                  editEmployeeLocationSelect.append($(`<option value="${location.id}">${location.name}</option>`));
                  editDepartmentLocationSelect.append($(`<option value="${location.id}">${location.name}</option>`));
                  addDepartmentLocationSelect.append($(`<option value="${location.id}">${location.name}</option>`));                           
              });
              $(".updateLocationIcon").on("click", function() {
                  let id = $(this).attr("data-locationID");
                  let name = $(this).attr("data-name");

                  $("#id_ul").val(id);
                  $("#locationName_ul").val(name);
                  $("#editLocationModal").modal("show");  
              });
              addEmployeeLocationSelect.prepend($(`<option selected disabled value="0"></option>`));
              editEmployeeLocationSelect.prepend($(`<option value="0"></option>`));
              editDepartmentLocationSelect.prepend($(`<option value="0"></option>`));
              addDepartmentLocationSelect.prepend($(`<option selected disabled value="0">Select Location</option>`));
              /*$(".deleteLocationIcon").on("click", function() {
                  let id = $(this).attr("data-id");
                  $("#id_dl").val(id);
                  $("#deleteLocationModal").modal("show");
              });  */

              // Event handler for when the .deleteLocationIcon is clicked
                $(".deleteLocationIcon").click(function() {

                    selectedLocationId = $(this).data("id");

                    // Make an AJAX request to check if the location has dependencies
                    $.ajax({
                        url: "libs/php/checkLocation.php",
                        type: "POST",
                        dataType: "json",
                        data: {
                            id: selectedLocationId
                        },
                        success: function(result) {
                            if (result.status.code == 200) {
                                if (result.data[0].departmentCount == 0) {
                                    $("#areYouSureLocationName").text(result.data[0].locationName);
                                    $('#areYouSureDeleteLocationModal').modal("show");
                                } else {

                                    $("#cantDeleteLocationName").text(result.data[0].locationName); 
                                    $("#lc").text(result.data[0].departmentCount);
                                    $('#cantDeleteLocationModal').modal("show");
                                }
                            } else {
                                // Handle the error response
                                $('#areYouSureLocationName').text('');
                                $('#exampleModal .modal-title').replaceWith("Error retrieving data");
                            }
                        },
                        error: function(jqXHR, textStatus, errorThrown) {
                            // Handle the AJAX error
                            $('#areYouSureLocationName').text(''); 
                            $('#exampleModal .modal-title').replaceWith("Error retrieving data");
                        }
                    });
                });

                // Event handler for when the #delLocationYes button is clicked
                $("#delLocationYes").click(function() {

                    if (selectedLocationId !== null) {
                        $.ajax({
                            url: "libs/php/deleteLocation.php",
                            type: "POST",
                            dataType: "json",
                            data: { id: selectedLocationId },
                            success: function(result) {
                                if (result.status.name === "ok") {
                                    console.log("Location deleted successfully.");
                                    $("#areYouSureDeleteLocationModal").modal("hide");
                                    $("#successDeleteLocation").modal("show");
                                    getLocations();
                                } else {
                                    console.error("Error deleting location:", result.status.description);
                                }
                            },
                            error: function(jqXHR, textStatus, errorThrown) {
                                // Handle the AJAX error
                                console.error("AJAX Error:", textStatus, errorThrown);
                            }
                        });

                        selectedLocationId = null;
                    }
                });

          }          
              
      },
      error: function(jqXHR, textStatus, errorThrown) {
          console.log(jqXHR, textStatus, errorThrown);
      }
  });
}

//Add location

$(document).ready(function(){

    $("#addLocationForm").submit(function(e) {
    e.preventDefault();
    
        $.ajax({
            url: "libs/php/insertLocation.php",
            type: 'POST',
            dataType: 'json',
            data: {
                name: ($("#locationName_addl").val()),
            },
            beforeSend: function() {
                $("#loader").removeClass("hidden");
            },
            success: function(result) {
                
                if (result.status.name == "ok") {
                    $("#addLocationModal").modal("hide");
                    $("#successAddLocation").modal("show");  
                    getLocations();  
                }
            },
            complete: function() {
                $("#loader").addClass("hidden");
            },
            error: function(jqXHR, textStatus, errorThrown) {
                $("#addLocationModal .modal-title").replaceWith(
                    "Error retrieving data"
                    );
            }
        });
    });
});

// EDIT - UPDATE Location
$(document).ready(function(){
$("#editLocationForm").submit(function(e) {
  e.preventDefault();
 
  $.ajax({
      url: "libs/php/updateLocation.php",
      type: 'POST',
      dataType: 'json',
      data: {
          name: ($("#locationName_ul").val()),
          id: $("#id_ul").val()
      },
      beforeSend: function() {
          $("#loader").removeClass("hidden");
      },
      success: function(result) {
          
          if (result.status.name == "ok") {
              $("#editLocationModal").modal("hide");
              $("#successUpdateLocation").modal("show"); 
              getLocations();
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
});


// DELETE Location

$("#deleteLocationBtn").on("click", function(e) {
  e.preventDefault();

  $.ajax({
      url: "libs/php/deleteLocation.php",
      type: 'POST',
      dataType: 'json',
      data: { 
          id: $("#id_dl").val()
      },
      beforeSend: function() {
          $("#loader").removeClass("hidden");
      },
      success: function(result) {
          
          if (result.status.name == "ok") {
              $("#deleteLocationModal").modal("hide");
              getLocations();
          }
          if (result.status.name == "forbidden") {
            
            $("#deleteLocationModal").modal("hide");
            $("#forbiddenLocationModal").modal("show");

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



// Filter by departments
$("#select-departments").on("change", function() {
    $("#select-locations option").each(function () {
        if (this.defaultSelected) {
            this.selected = true;
            return false;
        }
    });
    let totalEntries = $("#total-entries");
    let totalRows = $("#employeeTbody tr").length;
    totalEntries.html($(`<h5>${totalRows} employees</h5>`));
    let selection = $("#select-departments :selected").text();
    $("table")[selection ? "show" : "hide"]();

    if (selection) { 
        $.each($("#employeeTable tbody tr"), function(index, item) {
            $(item)[$(item).is(":contains("+ selection  +")")? "show" : "hide"]();
            let activeRows = $("#employeeTbody tr:visible").length;
            totalEntries.html($(`<h5>${activeRows} employees / ${totalRows}</h5>`));
        });    
    }
});


//Filter By Locations
$("#select-locations").on("change", function() {
    $("#select-departments option").each(function () {
        if (this.defaultSelected) {
            this.selected = true;
            return false;
        }
    });
    let totalEntries = $("#total-entries");
    let totalRows = $("#employeeTbody tr").length;
    totalEntries.html($(`<h5>${totalRows} employees</h5>`));
    let selection = $("#select-locations :selected").text();;
    $("table")[selection ? "show" : "hide"]();

    if (selection) { 
      $.each($("#employeeTable tbody tr"), function(index, item) {
        $(item)[$(item).is(":contains("+ selection  +")")? "show" : "hide"]();
        let activeRows = $("#employeeTbody tr:visible").length;
        totalEntries.html($(`<h5>${activeRows} employees / ${totalRows}</h5>`));
      });
    }
});










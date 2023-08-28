
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
                let totalEntries = $("#total-entries");
                employeeTable.html("");
                employees.forEach(employee => {
                    employeeTable.append($(`
                    <tr role="button" data-id="${employee.id}">
                    <td class="align-middle text-nowrap">
                      ${employee.firstName}
                    </td>
                    <td class="align-middle text-nowrap">
                      ${employee.lastName}
                    </td>
                    <td class="align-middle text-nowrap d-none d-md-table-cell">
                      ${employee.department}
                    </td>
                    <td class="align-middle text-nowrap d-none d-md-table-cell">
                      ${employee.location}
                    </td>
                    <td class="align-middle text-nowrap d-none d-md-table-cell">
                      ${employee.email}
                    </td>
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
                  </tr>`));
                }); 
                $(".editE").on("click", function() {
                    const employeeId = $(this).data("id");
                    const firstName = $(this).data("firstname");
                    const lastName = $(this).data("lastname");
                    const jobTitle = $(this).data("jobtitle");
                    const email = $(this).data("email");
                    const departmentID = $(this).data("departmentID");
                    const locationID = $(this).data("locationID");
                
                    // Populate the modal inputs with the retrieved data
                    $("#id_u").val(employeeId);
                    $("#firstName_u").val(firstName);
                    $("#lastName_u").val(lastName);
                    $("#jobTitle_u").val(jobTitle);
                    $("#email_u").val(email);
                
                    $("#editEmployeeDepartmentSelect option[value='" + departmentID + "']").prop("selected", true);
                    $("#editEmployeeLocationSelect option[value='" + locationID + "']").prop("selected", true);              
                    // Show the edit modal
                    $("#editEmployeeModal").modal("show");
                });
                
                

                $(".deleteE").on("click", function() {
                    $("#id_d").val($(this).attr("data-id"));
                    $("#deleteEmployeeModal").modal("show");
                }); 
                const total = $("#employeeTbody tr:visible").length;
                totalEntries.html($(`<strong><h5 class="entries">${total} employees</h5></strong>`));   
            }
        },
        error: function(jqXHR, textStatus, errorThrown) {
            console.log(jqXHR, textStatus, errorThrown);
        }
    });
}


// Routine for dependent select options of Add Employee Form
$("#addEmployeeDepartmentSelect").change(function() {
  $("#addEmployeeLocationSelect option").hide();
  $("#addEmployeeLocationSelect option[value='" + $(this).val() + "']").show();
  
  if ($("#addEmployeeLocationSelect option[value='" + $(this).val() + "']").length) {
      $("#addEmployeeLocationSelect option[value='" + $(this).val() + "']").first().prop("selected", true);
  }
  else {
    $("#addEmployeeLocationSelect").val("");
  }
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
                departmentID: $("#addEmployeeDepartmentSelect :selected").val("departmentID")
            },
            beforeSend: function() {
                $("#loader").removeClass("hidden");
            },
            success: function(result) {

                console.log(result);
                
                if (result.status.name == "ok") {
                    $("#addEmployeeModal").modal("hide");
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




$("#editEmployeeDepartmentSelect").change(function() {
    $("#editEmployeeLocationSelect option").hide();
    $("#editEmployeeLocationSelect option[value='" + $(this).val() + "']").show();
    
    if ($("#editEmployeeLocationSelect option[value='" + $(this).val() + "']").length) {
        $("#editEmployeeLocationSelect option[value='" + $(this).val() + "']").first().prop("selected", true);
    }
    else {
      $("#editEmployeeLocationSelect").val("");
    }
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
    var locationID = $("#editEmployeeLocationSelect").val(); 
  
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
        locationID: locationID
    },
        beforeSend: function() {
            $("#loader").removeClass("hidden");
        },
        success: function(result) {
            console.log("Department ID:", departmentID);
            console.log("Location ID:", locationID);

            
            if (result.status.name == "ok") {
                $("#editEmployeeModal").modal("hide"); 
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


// DELETE Employee
$("#checkConfirmDeleteEmployee").click(function() {
  if ($(this).is(":checked")) {
      $("#deleteEmployeeBtn").attr("disabled", false);
  } else {
      $("#deleteEmployeeBtn").prop("disabled", true);
  }   
});

$("#deleteEmployeeModal").on("hidden.bs.modal", function() {
  if($("#checkConfirmDeleteEmployee").is(":checked")) {
      $("#deleteEmployeeBtn").attr("disabled", true);
      $(this).find("form").trigger("reset");
  }

});

$("#deleteEmployeeBtn").on("click", function(e) {
  e.preventDefault();

  $.ajax({
      url: "libs/php/deletePersonnel.php",
      type: 'POST',
      dataType: 'json',
      data: { 
          id: $("#id_d").val()
      },
      beforeSend: function() {
          $("#loader").removeClass("hidden");
      },
      success: function(result) {
          
          if (result.status.name == "ok") {
              $('#deleteEmployeeModal').modal("hide");
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

                                                addEmployeeDepartmentSelect.append($(`<option data-departmentid="${department.id}" value="${department.locationID}">${department.name}</option>`));
                                                editEmployeeDepartmentSelect.append($(`<option data-departmentid="${department.id}" value="${department.locationID}">${department.name}</option>`));
                                            });
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
                                            $(".deleteDepartmentIcon").on("click", function() {
                                                let id = $(this).attr("data-departmentid");
                                                $("#id_dd").val(id);
                                                $("#deleteDepartmentModal").modal("show");
                                            });
                                            
                                            const departmentCheckboxes = $("#department-checkboxes");
                                            departments.forEach(department => {
                                                departmentCheckboxes.append($(
                                                    `<label><input type="checkbox" class="filter-checkbox" value="department${department.id}"> ${department.name}</label><br>`
                                                ));
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

// DELETE Department
$("#checkConfirmDeleteDepartment").click(function() {
    if ($(this).is(":checked")) {
        $("#deleteDepartmentBtn").attr("disabled", false);
    } else {
        $("#deleteDepartmentBtn").prop("disabled", true);
    }   
}); 

$("#deleteDepartmentModal").on("hidden.bs.modal", function() {
    if($("#checkConfirmDeleteDepartment").is(":checked")) {
        $("#deleteDepartmentBtn").attr("disabled", true);
        $(this).find("form").trigger("reset");
    }
});



$("#deleteDepartmentBtn").click(function(e) {
    e.preventDefault();

    $.ajax({
        url: "libs/php/deleteDepartmentByID.php",
        type: 'POST',
        dataType: 'json',
        data: { 
            id: $("#id_dd").val()
        },
        beforeSend: function() {
            $("#loader").removeClass("hidden");
        },
        success: function(result) {
            
            if (result.status.name == "ok") {
                $("#deleteDepartmentModal").modal("hide");
                getDepartments();
            }
            if (result.status.name == "forbidden") {
                $("#deleteDepartmentModal").modal("hide");
                $("#forbiddenDepartmentModal").modal("show");
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



// LOCATIONS 

function getLocations() {
  $.ajax({
      url: "libs/php/getAllLocations.php",
      type: 'GET',
      dataType: 'json',
      success: function(result) {
          console.log(result);
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
              $(".deleteLocationIcon").on("click", function() {
                  let id = $(this).attr("data-id");
                  $("#id_dl").val(id);
                  $("#deleteLocationModal").modal("show");
              });  

                // Populate location checkboxes in filter modal
               /* const locationCheckboxes = $("#location-checkboxes");
                locations.forEach(location => {
                    locationCheckboxes.append($(
                        `<label><input type="checkbox" class="filter-checkbox" value="location${location.id}"> ${location.name}</label><br>`
                    ));
                });*/
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
$("#checkConfirmDeleteLocation").click(function() {
  if ($(this).is(":checked")) {
      $("#deleteLocationBtn").attr("disabled", false);
  } else {
      $("#deleteLocationBtn").prop("disabled", true);
  }   
});


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



// Filter by departments, locations

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


// Checkbox filter
document.addEventListener("DOMContentLoaded", function () {
    const filterBtn = document.getElementById("filter-btn");
    const applyFilterBtn = document.getElementById("apply-filter-btn");

    filterBtn.addEventListener("click", function () {
        $("#filter-modal").modal("show");
    });
    applyFilterBtn.addEventListener("click", function () {
        const selectedDepartments = Array.from(document.querySelectorAll(".filter-checkbox[value^='department']:checked")).map(checkbox => checkbox.value);
        const selectedLocations = Array.from(document.querySelectorAll(".filter-checkbox[value^='location']:checked")).map(checkbox => checkbox.value);
    
        $.ajax({
            url: "libs/php/getAll.php", 
            type: "GET",
            data: {
                departments: selectedDepartments,
                locations: selectedLocations
            },
            success: function (data) {
                console.log("Received data:", data);
                console.log("Selected departments:", selectedDepartments);
                console.log("Selected locations:", selectedLocations);
            
                // Log the constructed SQL query
                console.log("Constructed SQL query:", data.debugQuery);
            
                const filteredResults = data.data;
                const resultsContainer = document.getElementById("employeeTbody");
            
                // Clear existing results
                while (resultsContainer.firstChild) {
                    resultsContainer.removeChild(resultsContainer.firstChild);
                }
            
                // Populate the results container with new data
                filteredResults.forEach(result => {
                    const row = document.createElement("tr");
                    row.innerHTML = `
                    <td class="align-middle text-nowrap">${result.firstName}</td>
                    <td class="align-middle text-nowrap">${result.lastName}</td>
                    <td class="align-middle text-nowrap d-none d-md-table-cell">${result.department}</td>
                    <td class="align-middle text-nowrap d-none d-md-table-cell">${result.location}</td>
                    <td class="align-middle text-nowrap d-none d-md-table-cell">${result.email}</td>
                    <td class="text-end text-nowrap">
                    <button type="button" class="btn btn-primary btn-sm editE 
                                      data-id="${result.id}"
                                      data-firstName="${result.firstName}" 
                                      data-lastName="${result.lastName}"
                                      data-jobTitle="${result.jobTitle}" 
                                      data-email="${result.email}" 
                                      data-department="${result.department}"
                                      data-departmentid="${result.departmentID}"
                                      data-location="${result.location}"
                                      data-locationID="${result.locationID}">
                      <i class="fa-solid fa-pencil fa-fw"></i>
                    </button>
                    <button type="button" class="btn btn-danger btn-sm deleteE" data-id="${result.id}">
                      <i class="fa-solid fa-trash fa-fw"></i>
                    </button>
                  </td>
                    `;
                    resultsContainer.appendChild(row);
                });
            
                $("#filter-modal").modal("hide");
            },
            error: function (error) {
                console.error("Error retrieving data:", error);
                $("#filter-modal .modal-title").replaceWith("Error retrieving data");
            }
        });
    });
    
});








let selectedDepartmentID = null;
let selectedLocationId = null;
let selectedEmployeeId = null;


$(window).on("load", function() {
  $("#preloader").fadeOut("slow");
  getEmployees();
  getDepartments();
  getLocations();
});

  
//Refresh button

$("#refreshBtn").click(function () { 
    if ($("#personnelBtn").hasClass("active")) {      
      //alert("refresh personnel table");
      getEmployees();      
    } else {      
      if ($("#departmentsBtn").hasClass("active")) {       
       // alert("refresh department table");
      getDepartments();        
      } else {        
       // alert("refresh location table");
      getLocations();       
      }     
    }    
  });


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
                        $(`
                            <tr role="button" data-id="${employee.id}">
                                    <td class="align-middle text-nowrap">${employee.firstName}</td>
                                    <td class="align-middle text-nowrap">${employee.lastName}</td>
                                    <td class="align-middle text-nowrap d-none d-md-table-cell">${employee.department}</td>
                                    <td class="align-middle text-nowrap d-none d-md-table-cell">${employee.location}</td>
                                    <td class="align-middle text-nowrap d-none d-md-table-cell">${employee.email}</td>
                                    <td class="text-end text-nowrap">
                                    <button type="button" class="btn btn-primary btn-sm editE" data-bs-toggle="modal" data-bs-target="#editEmployeeModal" data-id="${employee.id}" data-departmentid="${employee.departmentID}">
                                        <i class="fa-solid fa-pencil fa-fw"></i>
                                    </button>
                                    <button type="button" class="btn btn-danger btn-sm deleteE" data-id="${employee.id}">
                                        <i class="fa-solid fa-trash fa-fw"></i>
                                    </button>
                                </td>
                            </tr>
                            `)
                    );
                });

                // Event handler for when the .deleteE button is clicked
                $(".deleteE").click(function () {
                    $("#id_d").val($(this).attr("data-id"));
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
                //console.log(result);
                
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


//Edit Employee

$("#editEmployeeModal").on("show.bs.modal", function (e) {
    const employeeId = $(e.relatedTarget).data("id");
    const departmentId = $(e.relatedTarget).data("departmentid");

    // AJAX request to fetch employee data
    $.ajax({
        url: "libs/php/getPersonnelByID.php",
        type: "POST",
        dataType: "json",
        data: {
            id: employeeId,
        },
        success: function (result) {
            //console.log(result);
            var resultCode = result.status.code;
  
            if (resultCode == 200) {
  
                const personnelData = result.data;

                if (personnelData && personnelData.length > 0) {
                    const employee = personnelData[0];
                    $("#id_u").val(employee.id);
                    $("#firstName_u").val(employee.firstName);
                    $("#lastName_u").val(employee.lastName);
                    $("#jobTitle_u").val(employee.jobTitle);
                    $("#email_u").val(employee.email);

                    // Populate departments dropdown
                    $.ajax({
                        url: "libs/php/getAllDepartments.php",
                        type: "GET",
                        dataType: "json",
                        success: function (departmentResult) {
                           // console.log(departmentResult);

                            if (departmentResult.status.name == "ok") {

                                $.each(departmentResult.data, function () {
                                    $("#editEmployeeDepartmentSelect").append(
                                      $("<option>", {
                                        value: this.id,
                                        text: this.name
                                      })
                                    );
                                  });

                                $("#editEmployeeDepartmentSelect").val(departmentId);
                            } else {
                                console.error("Error fetching departments:", departmentResult.status.description);
                            }
                        },
                        error: function (jqXHR, textStatus, errorThrown) {
                            console.error("AJAX Error:", textStatus, errorThrown);
                        }
                    });

                } else {
                    $("#editEmployeeModal .modal-title").replaceWith("No personnel data found");
                }
            } else {
                $("#editEmployeeModal .modal-title").replaceWith("Error retrieving data");
            }
        },
        error: function (jqXHR, textStatus, errorThrown) {
            $("#editEmployeeModal .modal-title").replaceWith("Error retrieving data");
        },
    });
});



// Handle the form submission when the "Submit" button is clicked
$("#editEmployeeForm").on("submit", function (e) {
    e.preventDefault();

    var id = $("#id_u").val();
    var firstName = $("#firstName_u").val();
    var lastName = $("#lastName_u").val();
    var email = $("#email_u").val();
    var jobTitle = $("#jobTitle_u").val();
    var departmentID = $("#editEmployeeDepartmentSelect").val();

    $.ajax({
        url: "libs/php/updatePersonnelByID.php", 
        type: "POST",
        dataType: "json",
        data: {
            id: id,
            firstName: firstName,
            lastName: lastName,
            email: email,
            jobTitle: jobTitle,
            departmentID: departmentID,
        },
        beforeSend: function () {
            $("#loader").removeClass("hidden");
        },
        success: function (result) {
            if (result.status.code == 200) {
                $("#editEmployeeModal").modal("hide");
                $("#successUpdatePersonnel").modal("show");
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


// Departments

function getDepartments() {
    $.ajax({
        url: "libs/php/getAllDepartments.php",
        type: 'GET',
        dataType: 'json',
        success: function (result) {

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
                                <button type="button" class="btn btn-primary btn-sm updateDepartmentIcon" data-bs-toggle="modal" data-bs-target="#editDepartmentModal" data-departmentid="${department.id}" data-locationid="${department.locationID}">
                                    <i class="fa-solid fa-pencil fa-fw"></i>
                                </button>
                        
                                <button type="button" class="btn btn-danger btn-sm deleteDepartmentIcon" id="dept-bin-delete" data-departmentid="${department.id}">
                                    <i class="fa-solid fa-trash fa-fw"></i>
                                </button>
                            </td>
                        </tr> 
                    `));

                    addEmployeeDepartmentSelect.append($(`<option data-locationid="${department.locationID}" value="${department.id}">${department.name}</option>`));
                   
                });

                confirmDeleteDepartment.append($(`
                    <button type="button" class="btn btn-secondary myBtn" data-bs-dismiss="modal">Cancel</button>
                    <button type="button" class="btn btn-danger myBtn" id="delDepartmentYes" data-bs-target="#successDelete">Delete</button>
                `));

                addEmployeeDepartmentSelect.prepend($(`<option selected disabled value="0">Select a Department</option>`));

                let selectedDepartmentId = null;

                // Event handler for when the .deleteDepartmentIcon is clicked
                $(".deleteDepartmentIcon").click(function () {
                    selectedDepartmentId = $(this).data("departmentid");

                    // Make an AJAX request to check if the department has dependencies
                    $.ajax({
                        url: "libs/php/checkDepartment.php",
                        type: "POST",
                        dataType: "json",
                        data: {
                            id: selectedDepartmentId
                        },
                        success: function (result) {
                            if (result.status.code == 200) {
                                if (result.data[0].personnelCount == 0) {
                                    $("#areYouSureDeptName").text(result.data[0].departmentName);
                                    $('#areYouSureDeleteDepartmentModal').modal("show");
                                } else {
                                    $("#cantDeleteDeptName").text(result.data[0].departmentName);
                                    $("#pc").text(result.data[0].personnelCount);
                                    $('#cantDeleteDepartmentModal').modal("show");
                                }
                            } else {

                                $('#exampleModal .modal-title').replaceWith("Error retrieving data");
                            }
                        },
                        error: function (jqXHR, textStatus, errorThrown) {

                            $('#exampleModal .modal-title').replaceWith("Error retrieving data");
                        }
                    });
                });

                // Event handler for when the #delDepartmentYes button is clicked
                $("#delDepartmentYes").click(function () {
                    if (selectedDepartmentId !== null) {

                        $.ajax({
                            url: "libs/php/deleteDepartmentByID.php",
                            type: "POST",
                            dataType: "json",
                            data: { id: selectedDepartmentId },
                            success: function (result) {
                                if (result.status.name === "ok") {
                                   // console.log("Department deleted successfully.");
                                    $("#areYouSureDeleteDepartmentModal").modal("hide");
                                    $("#successDelete").modal("show");
                                    getDepartments();
                                } else {

                                    console.error("Error deleting department:", result.status.description);
                                }
                            },
                            error: function (jqXHR, textStatus, errorThrown) {

                                console.error("AJAX Error:", textStatus, errorThrown);
                            }
                        });


                        selectedDepartmentId = null;
                    } else {

                        console.log("No department selected.");
                    }
                });

            }
        },
        error: function (jqXHR, textStatus, errorThrown) {
            console.log(jqXHR, textStatus, errorThrown);
        }
    });
}

// Add department
$(document).ready(function () {
    $("#addDepartmentForm").submit(function (e) {
        e.preventDefault();

        $.ajax({
            url: "libs/php/insertDepartment.php",
            type: 'POST',
            dataType: 'json',
            data: {
                name: ($("#departmentName_addd").val()),
                locationID: $("#addDepartmentLocationSelect :selected").val()
            },
            beforeSend: function () {
                $("#loader").removeClass("hidden");
            },
            success: function (result) {

                if (result.status.name == "ok") {
                    $('#addDepartmentModal').modal("hide");
                    $("#successAddDepartment").modal("show");
                    getDepartments();
                }
            },
            complete: function () {
                $("#loader").addClass("hidden");
            },
            error: function (jqXHR, textStatus, errorThrown) {
                $("#addDepartmentModal .modal-title").replaceWith(
                    "Error retrieving data"
                );
            }
        });
    });
});




// Function to handle employee update modal when it is shown
$("#editDepartmentModal").on("show.bs.modal", function (e) {
    const departmentId = $(e.relatedTarget).data("departmentid");
    const locationId = $(e.relatedTarget).data("locationid");

    // AJAX request to fetch department data
    $.ajax({
        url: "libs/php/getDepartmentByID.php",
        type: "GET",
        dataType: "json",
        data: {
            id: departmentId,
        },
        success: function (result) {
           // console.log(result);

            if (result.status.code == 200) {
                const departmentData = result.data;

                if (departmentData && departmentData.length > 0) {
                    const department = departmentData[0];
                    // Populate department dropdown
                    $("#id_ud").val(department.id);
                    $("#departmentName_ud").val(department.name);

                    // Populate locations dropdown
                    $.ajax({
                        url: "libs/php/getAllLocations.php",
                        type: "GET",
                        dataType: "json",
                        success: function (locationResult) {
                           // console.log(locationResult);

                            if (locationResult.status.name == "ok") {

                                $("#editDepartmentLocationSelect").html("");

                                $.each(locationResult.data, function () {
                                    $("#editDepartmentLocationSelect").append(
                                      $("<option>", {
                                        value: this.id,
                                        text: this.name
                                      })
                                    );
                                  });

                                // Set the selected location based on employee data
                                $("#editDepartmentLocationSelect").val(locationId);
                            } else {
                                console.error("Error fetching locations:", locationResult.status.description);
                            }
                        },
                        error: function (jqXHR, textStatus, errorThrown) {
                            console.error("AJAX Error:", textStatus, errorThrown);
                        }
                    });

                } else {
                    $("#editEmployeeModal .modal-title").replaceWith("No data found");
                }
            } else {
                $("#editEmployeeModal .modal-title").replaceWith("Error retrieving data");
            }
        },
        error: function (jqXHR, textStatus, errorThrown) {
            $("#editEmployeeModal .modal-title").replaceWith("Error retrieving data");
        },
    });
});

  
  // Function to handle department update form submission
  $("#editDepartmentForm").on("submit", function (e) {
    e.preventDefault();
  
    $.ajax({
      url: "libs/php/updateDepartment.php",
      type: "POST",
      dataType: "json",
      data: {
        id: $("#id_ud").val(),
        name: $("#departmentName_ud").val(),
        locationID: $("#editDepartmentLocationSelect").val(),
      },
      beforeSend: function () {
        $("#loader").removeClass("hidden");
      },
      success: function (result) {
        if (result.status.name == "ok") {
          $("#editDepartmentModal").modal("hide");
          $("#successUpdateDepartment").modal("show");
          getDepartments();
        } else {
          console.error("Department update failed:", result.status.description);
        }
      },
      complete: function () {
        $("#loader").addClass("hidden");
      },
      error: function (jqXHR, textStatus, errorThrown) {
        console.error(jqXHR, textStatus, errorThrown);
      },
    });
  });
 

// LOCATIONS

function getLocations() {
    $.ajax({
      url: "libs/php/getAllLocations.php",
      type: 'GET',
      dataType: 'json',
      success: function (result) {
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
                  <button type="button" class="btn btn-primary btn-sm updateLocationIcon" 
                    data-bs-toggle="modal" 
                    data-bs-target="#editLocationModal" 
                    data-locationID="${location.id}">
                    <i class="fa-solid fa-pencil fa-fw"></i>
                  </button>
                  <button type="button" id="loc-bin-delete" class="btn btn-danger btn-sm deleteLocationIcon" data-id="${location.id}">
                    <i class="fa-solid fa-trash fa-fw"></i>
                  </button>
                </td>
              </tr>
            `));
  
            addEmployeeLocationSelect.append($(`<option value="${location.id}">${location.name}</option>`));
            addDepartmentLocationSelect.append($(`<option value="${location.id}">${location.name}</option>`));
          });
  
          addEmployeeLocationSelect.prepend($(`<option selected disabled value="0"></option>`));
          addDepartmentLocationSelect.prepend($(`<option selected disabled value="0">Select Location</option>`));


                      // Event handler for when the .deleteLocationIcon is clicked
                      $(".deleteLocationIcon").click(function() {

                        selectedLocationId = $(this).data("id");
    
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
                                   
                                    $('#areYouSureLocationName').text('');
                                    $('#exampleModal .modal-title').replaceWith("Error retrieving data");
                                }
                            },
                            error: function(jqXHR, textStatus, errorThrown) {
                               
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
                                    console.error("AJAX Error:", textStatus, errorThrown);
                                }
                            });
    
                            selectedLocationId = null;
                        }
                    });

        }
      },
      error: function (jqXHR, textStatus, errorThrown) {
        console.error(jqXHR, textStatus, errorThrown);
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

// Edit location
// Function to handle location update modal when it is shown
$("#editLocationModal").on("show.bs.modal", function (e) {
    const id = $(e.relatedTarget).attr("data-locationID");
  
    $.ajax({
      url: "libs/php/getLocationByID.php",
      type: "GET",
      dataType: "json",
      data: { id: id },
      success: function (result) {
        //console.log(result);
        if (result.status.name === "ok" && result.data.length > 0) {
          const location = result.data[0];
  
          $("#id_ul").val(location.id);
          $("#locationName_ul").val(location.name);
        } else {
          console.error("Error fetching location details");
        }
      },
      error: function (jqXHR, textStatus, errorThrown) {
        console.error(jqXHR, textStatus, errorThrown);
      },
    });
  });
  
  // Function to handle location update form submission
  $("#editLocationForm").on("submit", function (e) {
    e.preventDefault();
  
    $.ajax({
      url: "libs/php/updateLocation.php",
      type: "POST",
      dataType: "json",
      data: {
        id: $("#id_ul").val(),
        name: $("#locationName_ul").val(),
      },
      beforeSend: function () {
        $("#loader").removeClass("hidden");
      },
      success: function (result) {
        if (result.status.name == "ok") {
          $("#editLocationModal").modal("hide");
          $("#successUpdateLocation").modal("show");
          getLocations(); 
        } else {
          console.error("Location update failed:", result.status.description);
        }
      },
      complete: function () {
        $("#loader").addClass("hidden");
      },
      error: function (jqXHR, textStatus, errorThrown) {
        console.error(jqXHR, textStatus, errorThrown);
      },
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










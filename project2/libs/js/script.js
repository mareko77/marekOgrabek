
$(window).on("load", function() {
  $("#preloader").fadeOut("slow");
  getEmployees();
  getDepartments();
  getLocations();
});

  
function refreshPage(){
    window.location.reload();
} 

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
                employeeTable.html("");
                let totalEntries = $("#total-entries");
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
                      <button type="button" class="btn btn-primary btn-sm editE" data-bs-toggle="modal" 
                                                  data-id="${employee.id}"
                                                  data-firstName="${employee.firstName}" 
                                                  data-lastName="${employee.lastName}"
                                                  data-jobTitle="${employee.jobTitle}" 
                                                  data-email="${employee.email}" 
                                                  data-department="${employee.department}"
                                                  data-departmentid="${employee.departmentID}"
                                                  data-location="${employee.location}"
                                                  data-locationID="${employee.locationID}">
                        <i class="fa-solid fa-pencil fa-fw"></i>
                      </button>
                      <button type="button" class="btn btn-danger btn-sm deleteE" data-id="${employee.id}">
                        <i class="fa-solid fa-trash fa-fw"></i>
                      </button>
                    </td>
                  </tr>`));
                  $(".editE").on("click", function() { 
                    let department=$(this).attr("data-department");
                    let departmentID=$(this).attr("data-departmentid");
                    let location=$(this).attr("data-location");
                    let locationID=$(this).attr("data-locationID");
                    
                    $("#id_u").val($(this).attr("data-id"));
                    $("#firstName_u").val($(this).attr("data-firstName"));
                    $("#lastName_u").val($(this).attr("data-lastName"));
                    $("#jobTitle_u").val($(this).attr("data-jobTitle"));
                    $("#email_u").val($(this).attr("data-email"));
                
                    $("#editEmployeeDepartmentSelect option:first").replaceWith($(`<option selected disabled data-departmentid="${departmentID}" value="${locationID}">${department}</option>`));
                    $("#editEmployeeLocationSelect option:first").replaceWith(($(`<option selected value="${locationID}">${location}</option>`))); 
                    
                    $("#editEmployeeModal").modal("show");
                    $("#editEmployeeForm").validate().resetForm();
                    $("#updateEmployeeBtn").attr("disabled", true);
                    $("#checkConfirmEditEmployee").prop("checked", false);
                });
                $(".deleteE").on("click", function() {
                    $("#id_d").val($(this).attr("data-id"));
                    $("#deleteEmployeeModal").modal("show");
                }); 
                    
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




// Validation Add & Edit Employee Form
$("#addEmployeeForm, #editEmployeeForm").each(function() {
  $(this).validate({
      rules: {
          firstName: "required",
          lastName: "required",
          email: {
          required: true,
          email: true
          },
          jobTitle: "required",
      },
      messages: {
          firstName: "This field is required!",
          lastName: "This field is required!",
          email: "No valid email address entered",
          jobTitle: "This field is required!",
      }
  });
});

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

// check Form Add Employee
$("#checkConfirmAddEmployee").click(function() {
  if ($("#addEmployeeForm").valid() && $(this).is(":checked")) {
      $("#employeeConfirmAddBtn").attr("disabled", false);
  } else {
      $("#employeeConfirmAddBtn").attr("disabled", true);
      $("#checkConfirmAddEmployee").prop("checked", false);
  }
  $("#firstNameInput, #lastNameInput, #jobTitleInput, #emailInput").keyup(function() {
      if ($("#firstNameInput").val() === "" || $("#lastNameInput").val() === "" || $("#jobTitleInput").val() === "" || $("#emailInput").val() === "") {
          $("#employeeConfirmAddBtn").attr("disabled", true);
          $("#checkConfirmAddEmployee").prop("checked", false);
      }
  });   
});

// Add Employee 
$("#add-employee").click(function() {
  $("#addEmployeeModal").modal("show");
  resetModal($("#addEmployeeModal"));
  $("#addEmployeeForm").validate().resetForm();
  $("#employeeConfirmAddBtn").attr("disabled", true);
});

$("#employeeConfirmAddBtn").click(function(e) {
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
          departmentID: $("#addEmployeeDepartmentSelect :selected").data("departmentid")
      },
      beforeSend: function() {
          $("#loader").removeClass("hidden");
      },
      success: function(result) {
          
          if (result.status.name == "ok") {
              $("#addEmployeeModal").modal("hide");
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

// check Form Edit Employee
$("#checkConfirmEditEmployee").click(function() {
  if ($("#editEmployeeForm").valid() && $(this).is(":checked")) {
      $("#updateEmployeeBtn").attr("disabled", false);
  } else {
      $("#updateEmployeeBtn").attr("disabled", true);
      $("#checkConfirmEditEmployee").prop("checked", false);
  }
  $("#firstName_u, #lastName_u, #jobTitle_u, #email_u").keyup(function() {
      if ($("#firstName_u").val() === "" || $("#lastName_u").val() === "" || $("#jobTitle_u").val() === "" || $("#email_u").val() === "") {
          $("#updateEmployeeBtn").attr("disabled", true);
          $("#checkConfirmEditEmployee").prop("checked", false);
      }
  });
});

// EDIT - UPDATE Employee 
$("#updateEmployeeBtn").on("click", function(e) {
  e.preventDefault();
 
  $.ajax({
      url: "libs/php/updatePersonnelByID.php",
      type: 'POST',
      dataType: 'json',
      data: {
          firstName: ($("#firstName_u").val()),
          lastName: ($("#lastName_u").val()),
          jobTitle: ($("#jobTitle_u").val()),
          email: $("#email_u").val(),
          departmentID: $("#editEmployeeDepartmentSelect :selected").data("departmentid"),
          id: $("#id_u").val()
      },
      beforeSend: function() {
          $("#loader").removeClass("hidden");
      },
      success: function(result) {
          
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
  $("#viewEmployeeModal").removeClass("dm-overlay");
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
             // $("#viewEmployeeModal").modal("hide");
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
                                                  <button type="button" class="btn btn-primary btn-sm updateDepartmentIcon" id="dept-pencil-edit" data-bs-toggle="modal" data-bs-target="#updateDepartmentModal"
                                                          data-departmentid="${department.id}"
                                                          data-name="${department.name}"
                                                          data-location="${department.location}"
                                                          data-locationID="${department.locationID}">
                                                    <i class="fa-solid fa-pencil fa-fw"></i>
                                                  </button>
                                                  <button type="button" class="btn btn-danger btn-sm deleteDepartmentIcon" id="dept-bin-delete" data-id="${department.id}">
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
                  $("#editDepartmentForm").validate().resetForm();
                  $("#updateDepartmentBtn").attr("disabled", true);
                  $("#checkConfirmEditDepartment").prop("checked", false);    
              });
              $(".deleteDepartmentIcon").on("click", function() {
                  let id = $(this).attr("data-departmentid");
                  $("#id_dd").val(id);
                  $("#deleteDepartmentModal").modal("show");
              });   
          }
      },
      error: function(jqXHR, textStatus, errorThrown) {
          console.log(jqXHR, textStatus, errorThrown);
      }
  });
}

// Validation Add & Edit Department Form
$("#addDepartmentForm, #editDepartmentForm ").each(function() {
  $(this).validate({
      rules: {
          departmentName: "required"
      },
      messages: {
          departmentName: "This field can not be empty!"
      }
  });
});

// Check Form Add Department
$("#checkConfirmAddDepartment").click(function() {
  if ($("#addDepartmentForm").valid() && $(this).is(":checked")) {
      $("#addDepartmentBtn").attr("disabled", false);
  } else {
      $("#addDepartmentBtn").attr("disabled", true);
      $("#checkConfirmAddDepartment").prop("checked", false);
  }
  $("#departmentName_addd").keyup(function() {
      if ($(this).val() === "") {
          $("#checkConfirmAddDepartment").prop("checked", false);
          $("#addDepartmentBtn").attr("disabled", true);
      }
  });
});

// ADD Department
$("#add-department").click(function() {
  $("#addDepartmentModal").modal("show");
  resetModal($("#addDepartmentModal"));
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
          console.log(jqXHR, textStatus, errorThrown);
      }
  });
});

// Check Form Edit Department
$("#checkConfirmEditDepartment").click(function() {
  if ($("#editDepartmentForm").valid() && $(this).is(":checked")) {
      $("#updateDepartmentBtn").attr("disabled", false);
  } else {
      $("#updateDepartmentBtn").attr("disabled", true);
      $("#checkConfirmEditDepartment").prop("checked", false);
  }
  $("#departmentName_ud").keyup(function() {
      if ($(this).val() === "") {
          $("#updateDepartmentBtn").attr("disabled", true);
          $("#checkConfirmEditDepartment").prop("checked", false);
      }
  });
});

// EDIT - UPDATE Department
$("#updateDepartmentBtn").on("click", function(e) {
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

$("#deleteDepartmentBtn").on("click", function(e) {
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
                  $("#editLocationForm").validate().resetForm();
                  $("#updateLocationBtn").attr("disabled", true);
                  $("#checkConfirmEditLocation").prop("checked", false);    
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
          }          
              
      },
      error: function(jqXHR, textStatus, errorThrown) {
          console.log(jqXHR, textStatus, errorThrown);
      }
  });
}

// Validation Add & Edit Location
$("#addLocationForm, #editLocationForm").validate({
  rules: {
      locationName: "required"
    },
    messages: {
      locationName: "This field can not be empty!"
    }
});

// Check Form Add Location
$("#checkConfirmAddLocation").click(function() {
  if ($("#addLocationForm").valid() && $(this).is(":checked")) {
      $("#addLocationBtn").attr("disabled", false);
  } else {
      $("#addLocationBtn").attr("disabled", true);
      $("#checkConfirmAddLocation").prop("checked", false);
  }
  $("#locationName_addl").keyup(function() {
      if ($(this).val() === "") {
          $("#checkConfirmAddLocation").prop("checked", false);
          $("#addLocationBtn").attr("disabled", true);
      }
  })
});

// Add Location
$("#add-location").click(function() {
  $("#addLocationModal").modal("show");
  resetModal($("#addLocationModal"));
  $("#addLocationForm").validate().resetForm();
  $("#addLocationBtn").attr("disabled", true);
});

$("#addLocationBtn").on("click", function(e) {
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
          console.log(jqXHR, textStatus, errorThrown);
      }
  });
})



// Check Form Edit Location
$("#checkConfirmEditLocation").click(function() {
  if ($("#editLocationForm").valid() && $(this).is(":checked")) {
      $("#updateLocationBtn").attr("disabled", false);
  } else {
      $("#updateLocationBtn").attr("disabled", true);
      $("#checkConfirmEditLocation").prop("checked", false);
  }
  $("#locationName_ul").keyup(function() {
     if ($(this).val() === "") {
          $("#updateLocationBtn").attr("disabled", true);
          $("#checkConfirmEditLocation").prop("checked", false);
           }
  });
});


// EDIT - UPDATE Location
$("#updateLocationBtn").on("click", function(e) {
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



// Search Input - Employees Page
$("#searchInp").on("keyup", function() {
  let rows = $("#employeeTbody tr");
  let val = $.trim($(this).val()).replace(/ +/g, " ").toLowerCase();

  rows.show().filter(function() {
      var text = $(this).text().replace(/\s+/g, " ").toLowerCase();
      return !~text.indexOf(val);
  }).hide();
  let totalEntries = $("#total-entries");
  let totalRows = $("#employeeTbody tr:visible").length;
  if (totalRows == 1) {
      totalEntries.html($(`<h5>${totalRows} employee</h5>`));
  } else {
      totalEntries.html($(`<h5>${totalRows} employees</h5>`));
  }
});

// Filter By Departments
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


  
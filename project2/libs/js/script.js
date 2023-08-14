$(window).on("load", function() {
  $("#preloader").fadeOut("slow");
  getEmployees();
  getDepartments();
  getLocations();
});



$("#searchInp").on("keyup", function () {
  
    // your code
    
  });
  
  $("#refreshBtn").click(function () {
    
    if ($("#personnelBtn").hasClass("active")) {
      
      alert("refresh personnel table");
      
    } else {
      
      if ($("#departmentsBtn").hasClass("active")) {
        
        alert("refresh department table");
        
      } else {
        
        alert("refresh location table");
        
      }
      
    }
    
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
                      <button type="button" class="btn btn-primary btn-sm" data-bs-toggle="modal" id="#editPersonnelModal" data-bs-target="#editPersonnelModal"
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
                      <button type="button" class="btn btn-primary btn-sm deletePersonnelBtn">
                        <i class="fa-solid fa-trash fa-fw"></i>
                      </button>
                    </td>
                  </tr>`));
                    
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

// Departments

function getDepartments() {
  $.ajax({
      url: "libs/php/getAllDepartments.php",
      type: 'GET',
      dataType: 'json',
      success: function(result) {
          console.log(result);
          if (result.status.name == "ok") {
              const departments = result.data;
              let departmentDetailCard = $("#departments-cards");
              departmentDetailCard.html("");
              departments.forEach(department => {
                  departmentDetailCard.append($(`
                                                <tr role="button1" data-departmentid="${department.id}">
                                                <td class="align-middle text-nowrap">
                                                  ${department.name}
                                                </td>
                                                <td class="align-middle text-nowrap d-none d-md-table-cell">
                                                  ${department.location}
                                                </td>
                                                <td class="align-middle text-end text-nowrap">
                                                  <button type="button" class="btn btn-primary btn-sm updateDepartmentIcon" id="dept-pencil-edit" data-bs-toggle="modal" data-bs-target="#deleteDepartmentModal"
                                                          data-departmentid="${department.id}"
                                                          data-name="${department.name}"
                                                          data-location="${department.location}"
                                                          data-locationID="${department.locationID}">
                                                    <i class="fa-solid fa-pencil fa-fw"></i>
                                                  </button>
                                                  <button type="button" class="btn btn-primary btn-sm deleteDepartmentIcon" id="dept-bin-delete" data-id="${department.id}">
                                                    <i class="fa-solid fa-trash fa-fw"></i>
                                                  </button>
                                                </td>
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
              let locationDetailCard = $("#locations-cards");
              locationDetailCard.html("");
              locations.forEach(location => {
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
                                                <button type="button" id="loc-bin-delete" class="btn btn-primary btn-sm deleteLocationIcon" data-id="${location.id}">
                                                  <i class="fa-solid fa-trash fa-fw"></i>
                                                </button>
                                              </td>
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


// Personnel update

$("#editPersonnelModal").on("show.bs.modal", function (e) {
    
  $.ajax({
    url: "libs/php/getPersonnelByID.php",
    type: "POST",
    dataType: "json",
    data: {
      id: $(e.relatedTarget).attr("data-id") // Retrieves the data-id attribute from the calling button
    },
    success: function (result) {
      console.log(result);
      if (result.status.name == "ok") {  
        $("#editPersonnelEmployeeID").val(result.data[0].id);

        $("#editPersonnelFirstName").val(result.data[0].firstName);
        $("#editPersonnelLastName").val(result.data[0].lastName);
        $("#editPersonnelJobTitle").val(result.data[0].jobTitle);
        $("#editPersonnelEmailAddress").val(result.data[0].email);

        $("#editPersonnelDepartment").html("");

        $.each(result.data, function () {
          $("#editPersonnelDepartment").append(
            $("<option>", {
              value: this.departmentID,
              text: this.department
            })
          );
        });

        $("#editPersonnelDepartment").val(result.data.departmentID);
        
      } else {
        $("#editPersonnelModal .modal-title").replaceWith(
          "Error retrieving data"
        );
      };
    },
    error: function (jqXHR, textStatus, errorThrown) {
      $("#editPersonnelModal .modal-title").replaceWith(
        "Error retrieving data"
      );
    }
  });
});

  
  // Executes when the form button with type="submit" is clicked
  
  // EDIT - UPDATE Employee 
$("#editPersonnelForm").on("submit", function(e) {
  e.preventDefault();
 
  $.ajax({
      url: "libs/php/updatePersonnelByID.php",
      type: 'POST',
      dataType: 'json',
      data: {
          firstName: ($("#editPersonnelFirstName").val()),
          lastName: ($("#editPersonnelLastName").val()),
          jobTitle: ($("#editPersonnelJobTitle").val()),
          email: $("#editPersonnelEmailAddress").val(),
          departmentID: $("#editPersonnelDepartment :selected").data("departmentid"),
          id: $("#editPersonnelEmployeeID").val()
      },
      beforeSend: function() {
          $("#loader").removeClass("hidden");
      },
      success: function(result) {
          
          if (result.status.name == "ok") {
            $("#editPersonnelEmployeeID").val($(this).attr("data-id"));
            $("#editPersonnelFirstName").val($(this).attr("data-firstName"));
            $("#editPersonnelLastName").val($(this).attr("data-lastName"));
            $("#editPersonnelJobTitle").val($(this).attr("data-jobTitle"));
            $("#editPersonnelEmailAddress").val($(this).attr("data-email")); 
            $("#editPersonnelDepartment option:first").replaceWith($(`<option selected disabled data-departmentid="${$(this).attr("data-departmentid")}"}</option>`)); 
            $("#editPersonnelModal").modal("show");
            $("#editPersonnelForm").resetForm();
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
  
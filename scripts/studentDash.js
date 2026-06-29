import {COURSE_API,USER_API,CENTRE_API,ENROLL_API} from '../scripts/api.js';

const userDetails = JSON.parse(localStorage.getItem('user'));

console.log(userDetails,"user");

//Updating user detail offcanvas 
$("#userNameOffCanvas").text(userDetails[0].name)
$("#userRole").text(userDetails[0].role)
$("#userEmail").text(userDetails[0].email)
$("#userGender").text(userDetails[0].gender)
$("#userDob").text(dateFormat(userDetails[0].dob))
$("#userDepartment").text(userDetails[0].departmentName)
$("#userCollege").text(userDetails[0].college)
$("#userMobile").text(userDetails[0].mobile)



//Helper function for Date - output : Aug 06,2026
function dateFormat(date){
  let newDate = new Date(date)
  newDate = newDate.toDateString().split(" ")
   return `${newDate[1]} ${newDate[2]},${newDate[3]}`

}

//For maintaining the state in while applying filter used in URLSearchParams

let status = "";
let searchQuery = "";
let startDateQuery = "";
let endDateQuery = "";

let isDeleted = false;


//Modal from the DOM
const enrollModal = new bootstrap.Modal(document.getElementById('enrollModal'));
const updateModal = new bootstrap.Modal(document.getElementById('updateModal'));
const reapplyModal = new bootstrap.Modal(document.getElementById('reapplyModal'));
const filterModal = new bootstrap.Modal(document.getElementById('filterModal'));

//toastr Configuration
toastr.options = {
        "positionClass": "toast-bottom-right",
        "showDuration": "300",
        "preventDuplicates": true
      }


//Setting user name in the navbar
$('#userName').text(userDetails[0].name.split(' ')[0]);

//logout button in the navbar
$('#logoutBtn').on('click',async ()=>{
  const response = await  Swal.fire({
    title: 'Are you sure you want to logout?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33'
    }) 

    if(response.isConfirmed){
        window.location.replace('../pages/index.html');
        localStorage.removeItem('user');
    }
})

// Gets the count for the statistics section
async function getStats() {
    try {
        const response = await fetch(`${ENROLL_API}?userId=${userDetails[0].id}&isDeleted=false`)
   const data = await response.json();

   
   let pending = 0;
    let approved = 0;
    let rejected = 0;
    
    data.forEach((e)=>{
     if(e.status== "Pending"){
        pending += 1;
     }
     else if(e.status=="Approved"){
        approved += 1;
     }
     else if(e.status=="Rejected"){
        rejected+=1;
     }
     
    })

    $('#enrollCount').text(data.length);
    $('#pendingCount').text(pending);
    $('#rejectCount').text(rejected);
    $('#approveCount').text(approved);
        
    } catch (error) {
        toastr.error(error.message)
    }
   
}

getStats();

// Dynamically render the element in the DOM using a parent tag
async function renderElement(data) {
    const parent = document.getElementById('parent');
    parent.innerHTML = '';
    let html = "";
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    data.forEach((e)=>{
        const examDate = new Date(e.preferredDate);
        examDate.setHours(0, 0, 0, 0);
        const isExpired = examDate < today && e.status !== "Attended";
       
        html += `
           <div class="col-lg-4 col-md-6 col-12">
           <div class="d-flex align-items-start justify-content-between bg-white  px-4 py-3 rounded-4 data-card">
             <div class="d-flex flex-column gap-2">
              <p class="mb-0 fw-semibold">${e.courseName}</p>
               <p class="mb-0"><span class="fw-bold">Exam Date : </span>${dateFormat(e.preferredDate)}</p>
               <p class="mb-0"><span class="fw-bold">Centre : </span>${e.centre}</p>
               <div class="d-flex align-items-center gap-1">
               <p class="px-2 py-1 
              ${e.status == "Approved"?`
                bg-success-subtle text-success
                `: e.status == "Pending" ? `
                bg-warning-subtle text-yellow
                `:e.status == "Rejected"?`
                bg-danger-subtle text-danger
                `:`
                bg-info-subtle text-info
                ` }
                

               rounded-pill w-50 text-center">${e.status}
               
               </p>
               ${
                        isExpired
                            ? `<i class="bi fs-5 mb-3 bi-exclamation-triangle-fill text-danger icon-tooltip"
                 data-tooltip="Exam date has passed"
                                  ></i>`
                            : ""
                    }
               </div>
               
             </div>
             <div class="d-flex flex-column gap-2" >

                 <button class="btn  bi bi-eye icon-tooltip"
                 data-tooltip="View"
                 data-bs-toggle="modal"
                 data-bs-target="#viewModal"
                 data-id="${e.id}"
                 id="viewBtn" >
                 </button>
                 
                 ${e.status == "Pending"?`
                    <button class="btn  bi bi-pen icon-tooltip"
                 data-tooltip="Edit"
                    data-bs-toggle="modal"
                    data-bs-target="#updateModal"
                    id="updateBtn"
                    data-id="${e.id}">
                 </button>
                  <button class="btn  bi bi-trash icon-tooltip"
                 data-tooltip="Cancel" 
                 id="cancelBtn"
                 data-id="${e.id}">
                 </button>
                    `:e.status == "Rejected"?`
                    <button class="btn  bi bi-arrow-counterclockwise icon-tooltip"
                 data-tooltip="Reapply"
                    data-bs-toggle="modal"
                    data-bs-target="#reapplyModal"
                    id="reapplyBtn"
                    data-id="${e.id}">
                 </button>
                  <button class="btn  bi bi-trash icon-tooltip"
                 data-tooltip="Cancel"  
                 id="cancelBtn"
                 data-id="${e.id}">
                 </button>
                    `:e.status == "Approved"?`
                    <button class="btn  bi bi-check-circle icon-tooltip"
                 data-tooltip="Attended ?" 
                    id="attendBtn"
                 data-id="${e.id}">
                 </button>
                  <button class="btn  bi bi-trash icon-tooltip"
                 data-tooltip="Cancel"  
                 id="cancelBtn"
                 data-id="${e.id}">
                 </button>
                    `:`
                    
                    
                    `}
                 
                
                    

                

             </div>
           </div>
         </div>
        `
  
    })
    parent.innerHTML = html;
}


// Populate details in the view Modal
async function viewDetails(id){
    try {
    const response = await fetch(`${ENROLL_API}/${id}`);
    const data = await response.json();
    $('#viewName').text(data.name)
    $('#viewEmail').text(data.email)
    $('#viewCourse').text(data.courseName)
    $('#viewDept').text(data.deptName)
    $('#viewFees').text(data.fees)
    $('#viewCentre').text(data.centre)
    $('#viewDate').text(dateFormat(data.preferredDate))
    $('#viewStatus').text(data.status)
    if(data.reason){
       $('#viewReason').text(data.reason)
       $('#reason').removeClass('d-none')
    }
    else{
        $('#reason').addClass('d-none')
    }
    } catch (error) {
        toastr.error(error.message)
    }
   
}

// Uses the filter sttate variable and URLSearchParams() to get the data
async function getRecordOnStatus() {

    try {
        const params = new URLSearchParams();

        params.append('userId',userDetails[0].id)

        params.append('_sort','-updatedAt');

        if(status){
            params.append('status',status)
        }

        if(searchQuery){
            params.append('centre:startsWith',searchQuery);
        }

        if(startDateQuery){
            params.append('preferredDate:gte',startDateQuery)
        }

        if(endDateQuery){
            params.append("preferredDate:lte",endDateQuery);
        }

        params.append('isDeleted',isDeleted);


        const response = await fetch(`${ENROLL_API}?${params}`);
        const data = await response.json();

        renderElement(data);
    } catch (error) {
       toastr.error(error.message) 
    }
     
    
}

getRecordOnStatus();

// Used eventlisteners to get the 'id' from the dynamically rendered elements 
// onclick = "" cannot be used since the js type is 'module'

document.addEventListener('click',(e)=>{
        
        if(e.target.closest('#viewBtn')){
            
           viewDetails(e.target.closest('#viewBtn').dataset.id)
        }    
        if(e.target.closest('#updateBtn')){
            
           updateEnroll(e.target.closest('#updateBtn').dataset.id)
        }    
        if(e.target.closest('#reapplyBtn')){
            
           reapplyEnroll(e.target.closest('#reapplyBtn').dataset.id)
        }    
        if(e.target.closest('#cancelBtn')){
            
           cancelEnroll(e.target.closest('#cancelBtn').dataset.id)
        }    
        if(e.target.closest('#attendBtn')){
            
           attendExam(e.target.closest('#attendBtn').dataset.id)
        }    
    });

// Change the status to attended    
async function attendExam(id) {
    try {
      const SweetResponse = await  Swal.fire({
      title: 'Are you sure you attended the exam?',
      icon: 'info',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33'
      }) 

      if(SweetResponse.isConfirmed){
        const response = await fetch(`${ENROLL_API}/${id}`,{
          method:'PATCH',
          headers:{
            "Content-Type":"application/json"
          },
          body:JSON.stringify({
            status:"Attended",
            updatedAt: new Date().toISOString().split('T')[0]
          })
      });
      getRecordOnStatus();
      getStats();
      toastr.success('Thank you for Attending the Exam');
      }  
    } catch (error) {
        toastr.error(error.message)
    }
     
}


// Change the status isDeleted = true
async function cancelEnroll(id) {
    
    try {
      const SweetResponse = await  Swal.fire({
      title: 'Are you sure you want to cancel the Application?',
      icon: 'info',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33'
      }) 

      if(SweetResponse.isConfirmed){
        const response = await fetch(`${ENROLL_API}/${id}`,{
          method:'PATCH',
          headers:{
            "Content-Type":"application/json"
          },
          body:JSON.stringify({
            isDeleted:true,
             updatedAt: new Date().toISOString().split('T')[0]
          })
      });
      getRecordOnStatus();
      getStats();
      toastr.success('Deleted Successfully');
      }
    } catch (error) {
        toastr.error(error.message)
    }
     
}    

//Change the status to 'Pending' 
async function reapplyEnroll(id) {
      
    try {
       const response = await fetch(`${ENROLL_API}/${id}`);
       const data = await response.json();
       $("#reapplyDate").val(data.preferredDate);
       $("#reapplyDate").attr('min',new Date().toISOString().split('T')[0]);
       let reapplyDate = data.preferredDate;

       $("#reapplySubmitBtn").on('click',async ()=>{
         if(reapplyDate ==  $("#reapplyDate").val()){
            toastr.warning('Same Date Applied !');
            return;
         }

         const SweetResponse = await  Swal.fire({
      title: 'Are you sure you want to reapply?',
      icon: 'info',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33'
      }) 

      if(SweetResponse.isConfirmed){
       const reapplyResponse = await fetch(`${ENROLL_API}/${id}`,{
            method:'PATCH',
            headers:{
                "Content-Type":"application/json"
            },
            body:JSON.stringify({
                preferredDate: $("#reapplyDate").val(),
                status:"Pending",
                reason:"",
                updatedAt: new Date().toISOString().split('T')[0]
                
            })
         });

         getRecordOnStatus();
         getStats();
         toastr.success('Reapplied Successfully !')
         reapplyModal.hide();

      }
         
         
        })
    } catch (error) {
        toastr.error(error.message)        
    }

}


// Populate the select tag used in Enroll Modal
async function getEnrollDetails() {
 
    try {
     const courseResponse = await fetch(COURSE_API);
     const courseData = await courseResponse.json();
     
     const courseParent = document.getElementById('course');
     const updateCourseParent = document.getElementById('updateCourse');

     let courseHTML = `<option value="" data-id="">Choose...</option>`;

     courseData.forEach((e)=>{
       courseHTML += `
        <option value="${e.courseName}" data-id="${e.courseId}" 
        data-depid="${e.deptId}" 
        data-department="${e.departmentName}">${e.courseName}</option>
       
       `
       
     })
     
     courseParent.innerHTML = courseHTML;
     updateCourseParent.innerHTML = courseHTML;

     $("#course").on('change',function(){
           const id = $(this).find(":selected").data("id");
          if(id){
            const fees =  courseData.filter((c)=> c.courseId == id)
            
            $("#fees").val(fees[0].fees)
          }
     })

     const centreResponse = await fetch(CENTRE_API);
     const centreData = await centreResponse.json();

     const centreParent = document.getElementById('centre');
     const updateCentreParent = document.getElementById('updateCentre');

     let centreHTML = `<option value="">Choose...</option>`

     centreData.forEach((e)=>{
       centreHTML += `
        <option value="${e.centreName}" data-id="${e.centreId}">${e.centreName}</option>
       `

     })
     
     centreParent.innerHTML = centreHTML;   
     updateCentreParent.innerHTML = centreHTML;   
     
    $("#examDate").attr('min', new Date().toISOString().split('T')[0])
    } catch (error) {
        toastr.error(error.message)
    }
}
getEnrollDetails();

// Update the Exam details
async function updateEnroll(id){

  try {
    const courseResponse = await fetch(COURSE_API);
    const courseData = await courseResponse.json();

    const response = await fetch(`${ENROLL_API}/${id}`);
    const data = await response.json();

    

    $(`#updateCourse option[data-id="${data.courseId}"]`).prop('selected', true);
    $(`#updateCentre option[data-id="${data.courseId}"]`).prop('selected', true);

    
    if(data.courseId){
        const fees =  courseData.filter((c)=> c.courseId == data.courseId)
                
        $("#updateFees").val(fees[0].fees)
        }

    $("#updateCourse").on('change',function(){
            const id = $(this).find(":selected").data("id");
            if(id){
                const fees =  courseData.filter((c)=> c.courseId == id)
                
                $("#updateFees").val(fees[0].fees)
            }
            else{
                $("#updateFees").val("");
            }
        })
        
        $("#updateExamDate").val(data.preferredDate);
        $("#updateExamDate").attr('min', new Date().toISOString().split('T')[0])

        $("#updateApplyBtn").on('click',async ()=>{
        let enrollValid = true;

        if(!$("#updateCourse").find(":selected").data("id")){
            enrollValid = false;
            toastr.warning('Empty Course Field !');
        }
        else if(!$("#updateCentre").find(":selected").data("id")){
            enrollValid = false;
            toastr.warning('Empty Centre Field !');
        }
        else if(!$("#updateExamDate").val()){
            enrollValid = false;
            toastr.warning('Empty Date Field !')
        }

        if(enrollValid){

        const checkResponse = await fetch(`${ENROLL_API}?userId=${userDetails[0].id}&isDeleted=false`);
        const checkData = await checkResponse.json();
        console.log(checkData,id);
        for (let e of checkData) {
        if (e.courseName === $("#updateCourse").find(":selected").val() && id != e.id) {
            toastr.warning("Already Registered this Course");
            return; 
        }
    }
            
        const SweetResponse = await  Swal.fire({
        title: 'Are you sure you want to update?',
        icon: 'info',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33'
        }) 

        if(SweetResponse.isConfirmed){
            const response = await fetch(`${ENROLL_API}/${id}`, {
                method:'PATCH',
                headers:{
                    "Content-Type":"application/json"
                },
                body:JSON.stringify({
                courseId : $("#updateCourse").find(":selected").data("id"),
                courseName: $("#updateCourse").find(":selected").val(),
                deptId: $("#updateCourse").find(":selected").data("depid"),
                deptName: $("#updateCourse").find(":selected").data("department"),
                fees: $("#updateFees").val(),
                centreId:$("#updateCentre").find(":selected").data("id"),
                centre: $("#updateCentre").find(":selected").val(),
                preferredDate: $("#updateExamDate").val(),
                updatedAt: new Date().toISOString().split('T')[0]
                })
            })

            if(response.ok){
                toastr.success('Updated Successfully !')
                getRecordOnStatus();
                getStats();
                updateModal.hide();
                
            }
        }

            
        
        }
    })
  } catch (error) {
    toastr.error(error.message)
  }

}


// Enroll Submit Button
$("#enrollApplyBtn").on('click',async ()=>{
    let enrollValid = true;

    if(!$("#course").find(":selected").data("id")){
        enrollValid = false;
        toastr.warning('Empty Course Field !');
    }
    else if(!$("#centre").find(":selected").data("id")){
        enrollValid = false;
        toastr.warning('Empty Centre Field !');
    }
    else if(!$("#examDate").val()){
        enrollValid = false;
        toastr.warning('Empty Date Field !')
    }
    
    

    if(enrollValid){
      
     const checkResponse = await fetch(`${ENROLL_API}?userId=${userDetails[0].id}&isDeleted=false`);
     const checkData = await checkResponse.json();
    
     for (let e of checkData) {
    if (e.courseName === $("#course").find(":selected").val()) {
        toastr.warning("Already Registered this Course");
        return; 
    }
   }
        
      const SweetResponse = await  Swal.fire({
      title: 'Are you sure you want to apply?',
      icon: 'info',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33'
      }) 

      if(SweetResponse.isConfirmed){
         const response = await fetch(ENROLL_API, {
            method:'POST',
            headers:{
                "Content-Type":"application/json"
            },
            body:JSON.stringify({
               name: userDetails[0].name,
               email: userDetails[0].email,
               userId: userDetails[0].id,
               courseId : $("#course").find(":selected").data("id"),
               courseName: $("#course").find(":selected").val(),
               deptId: $("#course").find(":selected").data("depid"),
               deptName: $("#course").find(":selected").data("department"),
               fees: $("#fees").val(),
               centreId:$("#centre").find(":selected").data("id"),
               centre: $("#centre").find(":selected").val(),
               preferredDate: $("#examDate").val(),
               status : "Pending",
               reason:"",
               createdAt: new Date().toISOString().split('T')[0],
                updatedAt: new Date().toISOString().split('T')[0],
               isDeleted: false
            })
         })

         if(response.ok){
            toastr.success('Enrolled Successfully !')
            getRecordOnStatus();
            getStats();
            enrollModal.hide();
            document.getElementById('enrollForm').reset();
         }
      }

        
      
    }
})


// Button CSS State Management 

function btnState(add,rem1,rem2,rem3,rem4){
    $(add).addClass('btn-pink-gradient');
    $(rem1).removeClass('btn-pink-gradient');
    $(rem2).removeClass('btn-pink-gradient');
    $(rem3).removeClass('btn-pink-gradient');
    $(rem4).removeClass('btn-pink-gradient');
}

$('#allBtn,#enrollCard').on('click', ()=>{
    btnState('#allBtn','#apprBtn','#pendBtn','#rejBtn','#attnBtn');
    status = "";
    getRecordOnStatus();
})

$('#apprBtn,#approvedCard').on('click',()=>{
    btnState('#apprBtn','#allBtn','#pendBtn','#rejBtn','#attnBtn');
    status = 'Approved'
    getRecordOnStatus()

})

$('#pendBtn,#pendingCard').on('click',()=>{
    btnState('#pendBtn','#allBtn','#apprBtn','#rejBtn','#attnBtn');
    status = 'Pending';
    getRecordOnStatus();
})

$('#rejBtn,#rejectedCard').on('click',()=>{
    btnState('#rejBtn','#allBtn','#pendBtn','#apprBtn','#attnBtn');
    status = 'Rejected'
    getRecordOnStatus();
})

$('#attnBtn').on('click',()=>{
    btnState('#attnBtn','#allBtn','#pendBtn','#apprBtn','#rejBtn');
    status = 'Attended'
    getRecordOnStatus();
})


// Filter Apply Button

$('#filterAplyBtn').on('click',()=>{
 if($('#startDateFilter').val()||$("#endDateFilter").val()){
   startDateQuery = $('#startDateFilter').val();
   endDateQuery  = $("#endDateFilter").val();
   
   getRecordOnStatus();
   $('#clrFilter').prop('disabled',false);
   filterModal.hide();
 }
 else{
    toastr.warning('Atleast select one Filter')
 }
})

$("#clrFilter").on('click',()=>{
    $('#startDateFilter').val("")
    $("#endDateFilter").val("")
    startDateQuery = "";
    endDateQuery = "";
    getRecordOnStatus();
     $('#clrFilter').prop('disabled',true);
})

$("#searchInput").on('input',function(){
  searchQuery = $(this).val();
  getRecordOnStatus();
})

$("#exploreCourseBtn").on('click',()=>{

    window.location.assign('../pages/coursesPage.html')
})



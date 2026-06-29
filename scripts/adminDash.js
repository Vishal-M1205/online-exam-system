import {COURSE_API,USER_API,CENTRE_API,ENROLL_API} from '../scripts/api.js';

const userDetails = JSON.parse(localStorage.getItem('user'));

//Updating user detail offcanvas 
$("#userNameOffCanvas").text(userDetails[0].name)
$("#userRole").text(userDetails[0].role)
$("#userEmail").text(userDetails[0].email)
$("#userGender").text(userDetails[0].gender)
$("#userDob").text(dateFormat(userDetails[0].dob))
$("#userDepartment").text(userDetails[0].departmentName)
$("#userCollege").text(userDetails[0].college)
$("#userMobile").text(userDetails[0].mobile)


//For maintaining the state in while applying filter used in URLSearchParams
let status = "";
let searchQuery = "";
let courseQuery = "";
let examDateQuery = "";

//Pagination variables
let page = 1;
let perPage = 5
let totalPages = 0;

//Deleted default state 
let isDeleted = false;

//Modal from the DOM
const rejectModal = new bootstrap.Modal(document.getElementById('rejectModal'));
const filterModal = new bootstrap.Modal(document.getElementById('filterModal'));


//toastr Configuration
toastr.options = {
        "positionClass": "toast-bottom-right",
        "showDuration": "300",
        "preventDuplicates": true
      }


//Helper function for Date - output : Aug 06,2026
function dateFormat(date){
  let newDate = new Date(date)
  newDate = newDate.toDateString().split(" ")
   return `${newDate[1]} ${newDate[2]},${newDate[3]}`

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

//Populating the select tag in the Filter Modal
async function addCourseFilter() {
    try {

        const response = await fetch(COURSE_API);
        const data = await response.json();
        const parent = document.getElementById('courseNameFilter');
        let html = `<option value="">Selected None</option>`;
        data.forEach((c)=>{
            html += `
            <option value="${c.courseName}">${c.courseName}</option>
            `
        })
        parent.innerHTML = html;
        
    } catch (error) {
        toastr.error(error.message)
    }

    
} 

addCourseFilter();

//Event Listner fot the Filter Modal
$('#filterAplyBtn').on('click',()=>{
  if($('#courseNameFilter').val()||$("#examDateFilter").val()){
    courseQuery = $('#courseNameFilter').val();
   examDateQuery  = $("#examDateFilter").val();
   page=1
    $('#pageNum').text(page);
   getRecordOnStatus();
   $('#clrFilter').prop('disabled',false);
   filterModal.hide();
  }
  else{
    toastr.warning('Atleast Select One Filter')
  }
   
})

//Clears the filter
$("#clrFilter").on('click',()=>{
    $('#courseNameFilter').val("")
    $("#examDateFilter").val("")
    courseQuery = "";
    examDateQuery = "";
    page =1
    getRecordOnStatus();
     $('#clrFilter').prop('disabled',true);
})

// Gets the count for the statistics section
async function getStats(){

    try {
    
        const enrollResponse = await fetch(`${ENROLL_API}?isDeleted=false`);
        const enrollData = await enrollResponse.json();
        
        let pending = 0;
        let approved = 0;
        let rejected = 0;
        
        enrollData.forEach((e)=>{
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

        $('#enrollCount').text(enrollData.length);
        $('#pendingCount').text(pending);
        $('#rejectCount').text(rejected);
        $('#approveCount').text(approved);
        
        $('#pendingBar').css('width',`${(pending*100/enrollData.length)}%`)
        $('#rejectBar').css('width',`${(rejected*100/enrollData.length)}%`)
        $('#approveBar').css('width',`${(approved*100/enrollData.length)}%`)
        
        const courseResponse = await fetch(COURSE_API);
        const courseData = await courseResponse.json();
        $('#courseCount').text(courseData.length)
        
        const studentResonse = await fetch(`${USER_API}?role=Student`)
        const studentData  = await studentResonse.json();
        $("#studentCount").text(studentData.length);

        const centreResponse = await fetch(CENTRE_API);
        const centreData = await centreResponse.json();
        $("#centreCount").text(centreData.length);



    } catch (error) {
        toastr.error(error.message)
    }
    
     
}
getStats();


// Populate details in the view Modal
async function viewDetails(id){
    
     try {
       
        const response = await fetch(`${ENROLL_API}/${id}`);
        const data = await response.json();
        console.log(data);
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

// Changing the Status to 'Approved'
async function approveEnrollment(id){
   
     try {
        
        const sweetResponse = await  Swal.fire({
        title: 'Are you sure you want to approve?',
        icon: 'info',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33'
        }) 

        if(sweetResponse.isConfirmed){
        const response = await fetch(`${ENROLL_API}/${id}`,{
        method:"PATCH",
        headers:{
            'Content-Type':'application/json'
        },
        body:JSON.stringify({
            status: "Approved",
            updatedAt: new Date().toISOString().split('T')[0]
        })
        });
        getRecordOnStatus();
        getStats();
            }
         

    } catch (error) {
        toastr.error(error.message)
    }
  
   
  
}

let enrollIdForReject = "";

// Changing the Status to 'Rejected' with Reason

$('#rejectSubmit').on('click',async ()=>{
   console.log($('#rejectReason').val());
   if(!$('#rejectReason').val()){
    toastr.warning('Empty field not allowed!');
    return;
   }

   const sweetResponse = await  Swal.fire({
    title: 'Are you sure you want to reject?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33'
    }) 
    if(sweetResponse.isConfirmed){
         try {
        const response = await fetch(`${ENROLL_API}/${enrollIdForReject}`,{
        method:"PATCH",
        headers:{
            'Content-Type':'application/json'
        },
        body:JSON.stringify({
            status: "Rejected",
            reason: $("#rejectReason").val(),
            updatedAt: new Date().toISOString().split('T')[0]
        })
        });
        getRecordOnStatus();
        rejectModal.hide();
        getStats();
            
        } catch (error) {
            toastr.error(error.message)
        }
        
        }
   
   
})

// Deleting the record Permanently

async function permanentDeleteRecord(id){
    
   try {
    const sweetResponse = await  Swal.fire({
    title: 'Are you sure you want to delete permanently ?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33'
    }) 
    if(sweetResponse.isConfirmed){
        const response = await fetch(`${ENROLL_API}/${id}`,{
        method:"DELETE",
     });
     getRecordOnStatus();
     getStats();
    }
   } catch (error) {
    
   }
   
}

// Restoring the record isDeleted = false

async function restoreRecord(id){
   const sweetResponse = await  Swal.fire({
    title: 'Are you sure you want to restore?',
    icon: 'info',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33'
    }) 
    if(sweetResponse.isConfirmed){
        const response = await fetch(`${ENROLL_API}/${id}`,{
        method:"PATCH",
        headers:{
            'Content-Type':'application/json'
        },
        body:JSON.stringify({
            isDeleted:false,
            updatedAt: new Date().toISOString().split('T')[0]
        })
     });
     getRecordOnStatus();
     getStats();
    }
}

// Dynamically render the element in the DOM using a parent tag

function renderElement(data){
    const parent = document.getElementById('parent');
    parent.innerHTML = '';
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let html = "";
    data.forEach((e,i)=>{
        const examDate = new Date(e.preferredDate);
        examDate.setHours(0, 0, 0, 0);
        const isExpired = examDate < today && e.status !== "Attended";
        html += `
        <tr>
                  <td>${(page-1)*perPage+i+1}</td>
                  <td>${e.name}</td>
                  <td>${e.courseName}</td>
                  <td>${e.centre}</td>
                  <td>${dateFormat(e.preferredDate)}</td>
                  <td class="align-items-center">
                  <div class="d-flex align-items-center justify-content-start gap-2">
                        <span class="
                            text-${
                                e.status === "Pending"
                                    ? "warning"
                                    : e.status === "Approved"
                                    ? "success"
                                    : e.status === "Attended"
                                    ? "info"
                                    : "danger"
                            }
                            bg-${
                                e.status === "Pending"
                                    ? "warning"
                                    : e.status === "Approved"
                                    ? "success"
                                    : e.status === "Attended"
                                    ? "info"
                                    : "danger"
                            }-subtle
                            rounded-pill px-2 py-1 text-center">
                            ${e.status}
                        </span>

                        ${
                            isExpired
                                ? `<i class="bi bi-exclamation-triangle-fill text-danger icon-tooltip"
                 data-tooltip="Exam date has passed"></i>`
                                : ""
                        }
                    </div>
                  </td>
                  <td>
                  <button class="btn btn-info btn-sm m-1 icon-tooltip"
                 data-tooltip="View"
                   data-bs-toggle="modal" 
                   data-bs-target="#viewModal"
                   id="viewBtn"
                    data-id="${e.id}">
                   <i class="bi bi-eye" ></i>
                  </button>
                  ${isDeleted?`
                     <button class="btn  btn-sm m-1 icon-tooltip"
                 data-tooltip="Restore" id="restoreBtn" data-id="${e.id}" >
                   <i class="bi bi-arrow-counterclockwise"></i>
                     </button>
                     <button class="btn  btn-sm m-1 icon-tooltip"
                 data-tooltip="Delete Permanently" 
                     id="permanentDeleteBtn"
                     data-id="${e.id}">
                       <i class="bi bi-trash"></i>
                     </button>
                    
                    
                    `:` <button class="btn  btn-sm m-1 icon-tooltip"
                 data-tooltip="Approve" ${e.status=="Pending"?``:`disabled`} 
                  id="approveBtn"
                  data-id="${e.id}">
                   <i class="bi bi-check-circle"></i>
                  </button>
                  
                    <button class="btn  btn-sm m-1 icon-tooltip"
                 data-tooltip="Reject" ${e.status=="Pending"?``:`disabled`} 
                  data-bs-toggle="modal"
                  data-bs-target="#rejectModal"
                  id="rejectBtn"
                  data-id="${e.id}">
                   <i class="bi bi-x-circle"></i>
                  </button>

                  

                  `}
                 
                
                  
                  </td>

                 </tr>
        
        `
  
    })
    parent.innerHTML = html;
    

}

// Used eventlisteners to get the 'id' from the dynamically rendered elements 
// onclick = "" cannot be used since the js type is 'module'
 
document.addEventListener('click',(e)=>{
        if(e.target.closest('#viewBtn')){
           viewDetails(e.target.closest('#viewBtn').dataset.id)
        }    

        if(e.target.closest('#approveBtn')){
           approveEnrollment(e.target.closest('#approveBtn').dataset.id)
        } 

        if(e.target.closest('#rejectBtn')){
           enrollIdForReject = e.target.closest('#rejectBtn').dataset.id;
        }  

        if(e.target.closest('#permanentDeleteBtn')){
           permanentDeleteRecord(e.target.closest('#permanentDeleteBtn').dataset.id);
        }

        if(e.target.closest('#restoreBtn')){
           restoreRecord(e.target.closest('#restoreBtn').dataset.id);
        } 
})




// Uses the filter sttate variable and URLSearchParams() to get the data
async function getRecordOnStatus() {
     
    const params = new URLSearchParams();

    params.append('_sort','-updatedAt');
    
    if(status){
       params.append('status',status)
    }

    if(searchQuery){
        params.append('name:startsWith',searchQuery);
    }
    
    if(courseQuery){
        params.append('courseName',courseQuery)
    }

    if(examDateQuery){
        params.append("preferredDate",examDateQuery);
    }
    
    params.append('isDeleted',isDeleted);

    params.append('_page',page);
    params.append('_per_page',perPage);

    const response = await fetch(`${ENROLL_API}?${params}`);
    const data = await response.json();
    totalPages = data.pages;
    renderElement(data.data);
}

getRecordOnStatus();

//Pagination

$('#pageNum').text(page);

$("#nextPage").on('click',()=>{
    if(page < totalPages){
    page+=1;
    $('#pageNum').text(page);
    
    getRecordOnStatus();
    }
})

$("#prevPage").on('click',()=>{
    if(page>1){
    page-=1;
    $('#pageNum').text(page);
   
    
    getRecordOnStatus();
    }
})

$('#searchInput').on('input',function(){
    page=1
     $('#pageNum').text(page);
    searchQuery = $('#searchInput').val();
   
    getRecordOnStatus();
    
})


// Button CSS State Management

function btnState(add,rem1,rem2,rem3){
    $(add).addClass('btn-pink-gradient');
    $(rem1).removeClass('btn-pink-gradient');
    $(rem2).removeClass('btn-pink-gradient');
    $(rem3).removeClass('btn-pink-gradient');
    $("#attendedBtn").removeClass('btn-blue')
}

$('#allBtn,#enrollmentCard').on('click', ()=>{
    page = 1
     $('#pageNum').text(page);
    btnState('#allBtn','#apprBtn','#pendBtn','#rejBtn');
    status = "";
    getRecordOnStatus();
})

$('#apprBtn,#approveCard').on('click',()=>{
    page = 1
     $('#pageNum').text(page);
    btnState('#apprBtn','#allBtn','#pendBtn','#rejBtn');
    status = 'Approved'
    getRecordOnStatus()

})

$('#pendBtn,#pendCard').on('click',()=>{
    page=1
     $('#pageNum').text(page);
    btnState('#pendBtn','#allBtn','#apprBtn','#rejBtn');
    status = 'Pending';
    getRecordOnStatus();
})

$('#rejBtn,#rejectCard').on('click',()=>{
    page=1
     $('#pageNum').text(page);
    btnState('#rejBtn','#allBtn','#pendBtn','#apprBtn');
    
status = 'Rejected'

    
    getRecordOnStatus();
})


$('#deletedBtn').on('click',function(){
    page =1 ;
    if(status=="Attended"){
        status="";
        btnState('#allBtn','#apprBtn','#pendBtn','#rejBtn');
    }
    if(!isDeleted){
        isDeleted = true;
    }
    else{
        isDeleted = false;
    }
    $("#attendedBtn").removeClass('btn-blue');
    getRecordOnStatus();
    $(this).toggleClass('btn-blue');
})

$('#attendedBtn').on('click',function(){
    page=1;
     $('#pageNum').text(page);
    $("#deletedBtn").removeClass('btn-blue');
    $(this).toggleClass('btn-blue');
    isDeleted = false;
    if(status == "Attended"){
        status="";
        $('#allBtn').addClass('btn-pink-gradient');
    }
    else{
        status="Attended";
        $('#allBtn').removeClass('btn-pink-gradient');
    }
     $('#apprBtn').removeClass('btn-pink-gradient');
    $('#pendBtn').removeClass('btn-pink-gradient');
    $('#rejBtn').removeClass('btn-pink-gradient');
    
    getRecordOnStatus();

});



// Clicking Course card will redirect to coursePage.html
$('#courseCard').on('click',()=>{
     window.location.assign('../pages/coursesPage.html');
})


// Clicking Centre card will render Centre data dynamically
$('#centreCard').on('click',async ()=>{
    const resposne = await fetch(CENTRE_API); 
    const data = await resposne.json();
    const parent = document.getElementById('centreParent');
    parent.innerHTML ="";
    let html ="";
    data.forEach((e)=>{
      html+= `
      <div class="shadow-sm px-3 d-flex align-items-center py-2 rounded-3 my-2 border border-2">
                 <h5 class="mb-0 text-pink"><span class="bi bi-building me-2 text-navy"></span>${e.centreName}</h5>
              </div>
      
      `
    })
    parent.innerHTML = html;
})

// Clicking Student card will redirect to userPage.html

$('#studentCard').on('click',()=>{
     window.location.assign('../pages/userPage.html');
})
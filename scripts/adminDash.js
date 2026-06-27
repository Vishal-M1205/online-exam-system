import {COURSE_API,USER_API,CENTRE_API,ENROLL_API} from '../scripts/api.js';

const userDetails = JSON.parse(localStorage.getItem('user'));

let status = "";
let searchQuery = "";
let courseQuery = "";
let examDateQuery = "";

let page = 1;
let perPage = 2
let totalPages = 0;

let isDeleted = false;

const rejectModal = new bootstrap.Modal(document.getElementById('rejectModal'));

toastr.options = {
        "positionClass": "toast-bottom-right",
        "showDuration": "300",
        "preventDuplicates": true
      }

function dateFormat(date){
  let newDate = new Date(date)
  newDate = newDate.toDateString().split(" ")
   return `${newDate[1]} ${newDate[2]},${newDate[3]}`

}

console.log(userDetails);

$('#userName').text(userDetails[0].name.split(' ')[0]);

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

async function addCourseFilter() {
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
} 

addCourseFilter();

$('#filterAplyBtn').on('click',()=>{
   courseQuery = $('#courseNameFilter').val();
   examDateQuery  = $("#examDateFilter").val();
   page=1
    $('#pageNum').text(page);
   getRecordOnStatus();
   $('#clrFilter').prop('disabled',false);
})

$("#clrFilter").on('click',()=>{
    courseQuery = "";
    examDateQuery = "";
    page =1
    getRecordOnStatus();
     $('#clrFilter').prop('disabled',true);
})

async function getStats(){
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
     else{
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
     
}
getStats();

async function viewDetails(id){
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
   
}

async function approveEnrollment(id){

  
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
        status: "Approved"
    })
  });
  getRecordOnStatus();
  getStats();
    }
  
}

let enrollIdForReject = "";

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
     const response = await fetch(`${ENROLL_API}/${enrollIdForReject}`,{
        method:"PATCH",
        headers:{
            'Content-Type':'application/json'
        },
        body:JSON.stringify({
            status: "Rejected",
            reason: $("#rejectReason").val()
        })
     });
     getRecordOnStatus();
     rejectModal.hide();
     getStats();
    }
   
   
})

async function delteRecord(id){
   const sweetResponse = await  Swal.fire({
    title: 'Are you sure you want to delete?',
    icon: 'warning',
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
            isDeleted:true
        })
     });
     getRecordOnStatus();
     getStats();
    }
}

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
            isDeleted:false
        })
     });
     getRecordOnStatus();
     getStats();
    }
}

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
                  <td class="d-flex align-items-center"> 
                     ${e.status == "Pending" ? `
                        <div class="d-flex align-items-center justify-content-start">
                      <span class=" text-warning 
                     bg-warning-subtle rounded-pill
                      px-2 py-1  text-center">${e.status}</span></div> 
                        `: e.status == "Approved"?`
                        <div class="d-flex align-items-center justify-content-start">
                      <span class=" text-success 
                     bg-success-subtle rounded-pill
                      px-2 py-1  text-center">${e.status}</span></div>
                        `: e.status=="Attended"?`
                         <div class="d-flex align-items-center justify-content-start">
                      <span class=" text-info 
                     bg-info-subtle rounded-pill
                      px-2 py-1  text-center">${e.status}</span></div>
                        
                        `:
                        `
                        <div class="d-flex align-items-center justify-content-start">
                      <span class=" text-danger 
                     bg-danger-subtle rounded-pill
                      px-2 py-1  text-center">${e.status}</span></div>
                        `}
                        ${
                        isExpired
                            ? `<i class="bi bi-exclamation-triangle-fill text-danger"
                                  title="Exam date has passed"></i>`
                            : ""
                    }
                     
                  </td>
                  <td>
                  <button class="btn btn-info btn-sm m-1"
                   data-bs-toggle="modal" 
                   data-bs-target="#viewModal"
                   id="viewBtn"
                    data-id="${e.id}">
                   <i class="bi bi-eye" ></i>
                  </button>
                  ${isDeleted?`
                     <button class="btn btn-warning btn-sm m-1" id="restoreBtn" data-id="${e.id}" >
                   <i class="bi bi-arrow-counterclockwise"></i>
                     </button>
                     <button class="btn btn-danger btn-sm m-1" 
                     id="permanentDeleteBtn"
                     data-id="${e.id}">
                       <i class="bi bi-trash"></i>
                     </button>
                    
                    
                    `:` <button class="btn btn-success btn-sm m-1" ${e.status=="Pending"?``:`disabled`} 
                  id="approveBtn"
                  data-id="${e.id}">
                   <i class="bi bi-check-circle"></i>
                  </button>
                  
                    <button class="btn btn-warning btn-sm m-1" ${e.status=="Pending"?``:`disabled`} 
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

        if(e.target.closest('#deleteBtn')){
           delteRecord(e.target.closest('#deleteBtn').dataset.id);
        }

        if(e.target.closest('#restoreBtn')){
           restoreRecord(e.target.closest('#restoreBtn').dataset.id);
        } 
})





async function getRecordOnStatus() {
     
    const params = new URLSearchParams();
    
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




function btnState(add,rem1,rem2,rem3){
    $(add).addClass('btn-pink-gradient');
    $(rem1).removeClass('btn-pink-gradient');
    $(rem2).removeClass('btn-pink-gradient');
    $(rem3).removeClass('btn-pink-gradient');
    $("#attendedBtn").removeClass('btn-blue')
}

$('#allBtn').on('click', ()=>{
    page = 1
     $('#pageNum').text(page);
    btnState('#allBtn','#apprBtn','#pendBtn','#rejBtn');
    status = "";
    getRecordOnStatus();
})

$('#apprBtn').on('click',()=>{
    page = 1
     $('#pageNum').text(page);
    btnState('#apprBtn','#allBtn','#pendBtn','#rejBtn');
    status = 'Approved'
    getRecordOnStatus()

})

$('#pendBtn').on('click',()=>{
    page=1
     $('#pageNum').text(page);
    btnState('#pendBtn','#allBtn','#apprBtn','#rejBtn');
    status = 'Pending';
    getRecordOnStatus();
})

$('#rejBtn').on('click',()=>{
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


async function check(){
    const response = await fetch(`${ENROLL_API}?name:startsWith=H`);
    const data = await response.json();
   console.log(data,'check');
}

check();
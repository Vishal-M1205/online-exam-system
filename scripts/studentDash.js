import {COURSE_API,USER_API,CENTRE_API,ENROLL_API} from '../scripts/api.js';

const userDetails = JSON.parse(localStorage.getItem('user'));

console.log(userDetails);

let status = "";
let searchQuery = "";
let startDateQuery = "";
let endDateQuery = "";

let isDeleted = false;

const enrollModal = new bootstrap.Modal(document.getElementById('enrollModal'));
const updateModal = new bootstrap.Modal(document.getElementById('updateModal'));
const reapplyModal = new bootstrap.Modal(document.getElementById('reapplyModal'));

toastr.options = {
        "positionClass": "toast-bottom-right",
        "showDuration": "300",
        "preventDuplicates": true
      }

async function checkExpire(){
    const response = await fetch(`${ENROLL_API}?preferredDate:lt=${new Date().toISOString().split('T')[0]}`);
    const data = await response.json();
    console.log(data,'expired');
}
checkExpire();

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


async function getStats() {
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
     else{
        rejected+=1;
     }
     
    })

    $('#enrollCount').text(data.length);
    $('#pendingCount').text(pending);
    $('#rejectCount').text(rejected);
    $('#approveCount').text(approved);
}

getStats();

async function renderElement(data) {
    const parent = document.getElementById('parent');
    parent.innerHTML = '';
    let html = "";
    data.forEach((e)=>{
        html += `
           <div class="col-lg-4 col-md-6 col-12">
           <div class="d-flex align-items-start justify-content-between bg-white border border-2 px-4 py-3 rounded-4">
             <div class="d-flex flex-column gap-2">
              <p class="mb-0 fw-semibold">${e.courseName}</p>
               <p class="mb-0"><span class="fw-bold">Exam Date : </span>${e.preferredDate}</p>
               <p class="mb-0"><span class="fw-bold">Centre : </span>${e.centre}</p>
               <p class="px-2 py-1 
              ${e.status == "Approved"?`
                bg-success-subtle text-success
                `: e.status == "Pending" ? `
                bg-warning-subtle text-warning
                `:`
                bg-danger-subtle text-danger
                ` }
                

               rounded-pill w-50 text-center">${e.status}</p>
             </div>
             <div class="d-flex flex-column gap-2" >

                 <button class="btn btn-info bi bi-eye"
                 data-bs-toggle="modal"
                 data-bs-target="#viewModal"
                 data-id="${e.id}"
                 id="viewBtn" >
                 </button>
                 
                 ${e.status == "Pending"?`
                    <button class="btn btn-warning bi bi-pen"
                    data-bs-toggle="modal"
                    data-bs-target="#updateModal"
                    id="updateBtn"
                    data-id="${e.id}">
                 </button>
                    `:e.status == "Rejected"?`
                    <button class="btn btn-warning bi bi-arrow-counterclockwise"
                    data-bs-toggle="modal"
                    data-bs-target="#reapplyModal"
                    id="reapplyBtn"
                    data-id="${e.id}">
                 </button>
                    `:``}
                 
                 

                 <button class="btn btn-danger bi bi-trash" 
                 id="cancelBtn"
                 data-id="${e.id}">
                 </button>

             </div>
           </div>
         </div>
        `
  
    })
    parent.innerHTML = html;
}

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
    $('#viewDate').text(data.preferredDate)
    $('#viewStatus').text(data.status)
    if(data.reason){
       $('#viewReason').text(data.reason)
       $('#reason').removeClass('d-none')
    }
    else{
        $('#reason').addClass('d-none')
    }
   
}

async function getRecordOnStatus() {
     
    const params = new URLSearchParams();

    params.append('userId',userDetails[0].id)
    
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
}

getRecordOnStatus();

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
    });

async function cancelEnroll(id) {
       const SweetResponse = await  Swal.fire({
      title: 'Are you sure you want to delete?',
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
            status:'Cancelled'
          })
      });
      getRecordOnStatus();
      getStats();
      toastr.success('Deleted Successfully');
      }
     
}    

async function reapplyEnroll(id) {
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
                reason:""
            })
         });

         getRecordOnStatus();
         getStats();
         toastr.success('Reapplied Successfully !')
         reapplyModal.hide();

      }
         
         
        })

}



async function getEnrollDetails() {
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
}
getEnrollDetails();


async function updateEnroll(id){
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

}



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

function btnState(add,rem1,rem2,rem3){
    $(add).addClass('btn-pink-gradient');
    $(rem1).removeClass('btn-pink-gradient');
    $(rem2).removeClass('btn-pink-gradient');
    $(rem3).removeClass('btn-pink-gradient');
}

$('#allBtn').on('click', ()=>{
    btnState('#allBtn','#apprBtn','#pendBtn','#rejBtn');
    status = "";
    getRecordOnStatus();
})

$('#apprBtn').on('click',()=>{
    btnState('#apprBtn','#allBtn','#pendBtn','#rejBtn');
    status = 'Approved'
    getRecordOnStatus()

})

$('#pendBtn').on('click',()=>{
    btnState('#pendBtn','#allBtn','#apprBtn','#rejBtn');
    status = 'Pending';
    getRecordOnStatus();
})

$('#rejBtn').on('click',()=>{
    btnState('#rejBtn','#allBtn','#pendBtn','#apprBtn');
    status = 'Rejected'
    getRecordOnStatus();
})

$('#filterAplyBtn').on('click',()=>{
   startDateQuery = $('#startDateFilter').val();
   endDateQuery  = $("#endDateFilter").val();
   
   getRecordOnStatus();
   $('#clrFilter').prop('disabled',false);
})

$("#clrFilter").on('click',()=>{
    startDateQuery = "";
    endDateQuery = "";
    getRecordOnStatus();
     $('#clrFilter').prop('disabled',true);
})

$("#searchInput").on('input',function(){
  searchQuery = $(this).val();
  getRecordOnStatus();
})
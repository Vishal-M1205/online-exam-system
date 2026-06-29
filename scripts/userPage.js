import {COURSE_API,USER_API,CENTRE_API,ENROLL_API} from '../scripts/api.js';

const userDetails = JSON.parse(localStorage.getItem('user'));

$('#userName').text(userDetails[0].name.split(' ')[0]);

//Logout Button
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

// Back to the previous Page
$("#backBtn").on('click',()=>{
    window.history.back();
})

// Rener Element in the DOM
async function renderCourseElement(data) {
    const parent = document.getElementById('userParent');
    parent.innerHTML = '';
    let html = "";
    data.forEach((e)=>{
        html += `
        <div class="col-lg-6">
    <div class="card shadow-sm border-0 h-100">
        <div class="card-header bg-pink text-white">
            <h5 class="mb-0">Student Details</h5>
        </div>

        <div class="card-body">
            <div class="row g-3">

                <div class="col-md-6">
                    <p class="text-muted mb-0">Name</p>
                    <p class="mb-0 fw-bold">${e.name}</p>
                </div>

                <div class="col-md-6">
                    <p class="text-muted mb-0">Role</p>
                    <p class="mb-0 fw-bold"> ${e.role}</p>
                </div>

                <div class="col-md-6">
                    <p class="text-muted mb-0">Email</p>
                    <p class="mb-0 fw-bold">${e.email}</p>
                </div>

                <div class="col-md-6">
                    <p class="text-muted mb-0">Mobile</p>
                    <p class="mb-0 fw-bold">${e.mobile}</p>
                </div>

                <div class="col-md-6">
                    <p class="text-muted mb-0">Date of Birth</p>
                    <p class="mb-0 fw-bold">${e.dob}</p>
                </div>

                <div class="col-md-6">
                    <p class="text-muted mb-0">Gender</p>
                    <p class="mb-0 fw-bold">${e.gender}</p>
                </div>

                <div class="col-12">
                    <p class="text-muted mb-0">College</p>
                    <p class="mb-0 fw-bold">${e.college}</p>
                </div>

                <div class="col-12">
                    <p class="text-muted mb-0">Department</p>
                    <p class="mb-0 fw-bold">${e.departmentName}</p>
                </div>

                

            </div>
        </div>
    </div>
</div>
        `
  
    })
    parent.innerHTML = html;
}


async function getUser() {

   try {
    const response = await fetch(`${USER_API}?role=Student`);
    const data = await response.json();
    renderCourseElement(data); 
    } catch (error) {
        toastr.error(error.message)
    }
  
} 
getUser();



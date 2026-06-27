import {COURSE_API,USER_API,CENTRE_API,ENROLL_API} from '../scripts/api.js';

const userDetails = JSON.parse(localStorage.getItem('user'));

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

$("#backBtn").on('click',()=>{
    window.history.back();
})


async function renderCourseElement(data) {
    const parent = document.getElementById('courseParent');
    parent.innerHTML = '';
    let html = "";
    data.forEach((e)=>{
        html += `
           <div class="col-md-4 ">
    <div class="card h-100 shadow-sm border-0">
        <img
            src="${e.image}"
            class="card-img-top"
            alt="Full Stack Web Development"
            style="height:180px; object-fit:cover;"
        >

        <div class="card-body">
            <h5 class="card-title fw-bold">
                ${e.courseName}
            </h5>

            <p class="card-text text-muted small">
                ${e.description}
            </p>
        </div>

        <div class="card-footer bg-white border-0 d-flex justify-content-between align-items-center">
            <span class="fw-bold text-primary">
                ₹${e.fees}
            </span>

            
        </div>
    </div>
</div>
        `
  
    })
    parent.innerHTML = html;
}


async function getCourse() {
  const response = await fetch(COURSE_API);
  const data = await response.json();
  renderCourseElement(data);  
} 
getCourse();



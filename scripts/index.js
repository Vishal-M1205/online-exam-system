const DEP_API = 'http://localhost:3000/department';
const USER_API = 'http://localhost:3000/users';

const nameRegex = /^[A-Za-z ]{3,}$/;
const emailRegex = /^[a-zA-z0-9-\.]+@[a-zA-z0-9-\.]+\.[a-zA-z0-9-\.]{2,}$/;
const passRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[@!#$%&*-_\.]).{8,15}$/;
const mobileRegex = /^[0-9]{10}$/;

let signupValid = true;
let loginValid = true;

const signupModal = new bootstrap.Modal(document.getElementById('signupModal'));
const loginModal = new bootstrap.Modal(document.getElementById('loginModal'));



toastr.options = {
        "positionClass": "toast-bottom-right",
        "showDuration": "300",
        "preventDuplicates": true
      }

const dobDate = new Date();
dobDate.setFullYear(dobDate.getFullYear() - 17);
$('#dob').prop('max', dobDate.toISOString().split('T')[0]);

const addInValidClass = function (msg,eleID,msgID){
  $(msgID).text(msg)
   $(eleID).addClass('is-invalid')
          $(eleID).removeClass('is-valid')

          $(msgID).addClass('invalid-feedback');
          $(msgID).removeClass('valid-feedback');
} 

const addValidClass = function(msg,eleID,msgID){
   $(msgID).text(msg)
   $(eleID).addClass('is-valid')
       $(eleID).removeClass('is-invalid')
        $(msgID).addClass('valid-feedback');
          $(msgID).removeClass('invalid-feedback');
}

function renderDepartment(data){
   const parent = document.getElementById('department');
   let html = "";
   data.forEach(d => {
      html += `
         <option value="${d.departmentName}" data-id="${d.deptId}">${d.departmentName}</option>
      `
   });
   parent.innerHTML = html;
}

async function getDepartment(){
   const response = await fetch(DEP_API);
   const data = await response.json();
   renderDepartment(data);

}

getDepartment();

$('#name').on('input',function(){
    if(nameRegex.test($(this).val())){
        addValidClass('Looks Good!','#name','#nameErrMsg' )
        signupValid = true;
    }
    else{
        addInValidClass('Invalid Name', '#name','#nameErrMsg' )
        signupValid = false;
    }
})

$('#email').on('input',function(){
    if(emailRegex.test($(this).val())){
        addValidClass('Valid Email','#email','#emailErrMsg' )
        signupValid = true;
    }
    else{
        addInValidClass('Invalid Email', '#email','#emailErrMsg' )
        signupValid = false;
    }
})

$('#pass').on('input',function(){
    if(passRegex.test($('#pass').val())){
        addValidClass('Valid Password','#pass','#passErrMsg' )
        signupValid = true;
    }
    else{
        addInValidClass('Invalid Password', '#pass','#passErrMsg' )
        signupValid = false;
    }
    if($('#pass').val()==$('#cpass').val()){
        addValidClass('Password Matched','#cpass','#cpassErrMsg' )
        signupValid = true;
    }
    else{
        addInValidClass('Password Not Matched', '#cpass','#cpassErrMsg' )
        signupValid = false;
    }
})

$('#cpass').on('input',()=>{
    if($('#pass').val()==$('#cpass').val()){
        addValidClass('Password Matched','#cpass','#cpassErrMsg' )
        signupValid = true;
    }
    else{
        addInValidClass('Password Not Matched', '#cpass','#cpassErrMsg' )
        signupValid = false;
    }
})

$('#mobile').on('input',function(){
    if(mobileRegex.test($(this).val())){
        addValidClass('Valid Number','#mobile','#mobileErrMsg' )
        signupValid = true;
    }
    else{
        addInValidClass('Invalid Number', '#mobile','#mobileErrMsg' )
        signupValid = false;
    }
})

$('#signModalBtn').on('click',async ()=>{
   signupModal = true;

   if(!$('#name').val()){
       toastr.warning('Name Field is Empty');
       signupValid = false;
   }
   else if(!$('#email').val()){
       toastr.warning('Email Field is Empty');
       signupValid = false;
   }
   else if(!$('#pass').val()){
       toastr.warning('Password Field is Empty');
       signupValid = false;
   }
   else if(!$('#dob').val()){
       toastr.warning('DOB Field is Empty');
       signupValid = false;
   }
   else if(!$('#college').val()){
       toastr.warning('College Field is Empty');
       signupValid = false;
   }
   else if(!$('#mobile').val()){
       toastr.warning('Mobile No. Field is Empty');
       signupValid = false;
   }


   if(signupValid){
    try {
         const response  = await fetch(USER_API,{
        method:"POST",
        headers:{
            "Content-Type":"application/json"
        },
        body:JSON.stringify({
            name:$('#name').val(),
            email:$('#email').val(),
            password:$('#pass').val(),
            dob: $('#dob').val(),
            college:$('#college').val(),
            deptId: $('#department').data('id'),
            departmentName: $('#department').val(),
            mobile: $('#mobile').val(),
            role:"Student"
        })
    });
    
    if(response.ok){
        signupModal.hide();
        toastr.success('Registration Success');
    }

    } catch (error) {
        toastr.error(error);
    }
   
   }
})


$('#loginEmail').on('input',function(){
    if(emailRegex.test($(this).val())){
        addValidClass('Valid Email','#loginEmail','#loginEmailErrMsg' )
        loginValid = true;
    }
    else{
        addInValidClass('Invalid Email', '#loginEmail','#loginEmailErrMsg' )
        loginValid = false;
    }
})

$('#logModalBtn').on('click',async ()=>{
  loginValid = true;  
  if(!$('#loginEmail').val()){
       toastr.warning('Email Field is Empty');
       loginValid = false;
   }
   else if(!$('#loginPass').val()){
       toastr.warning('Password Field is Empty');
       loginValid = false;
   }

   if(loginValid){
      const response = await fetch(`${USER_API}?email=${$('#loginEmail').val()}`);
      const data = await response.json();
     if(!data[0]?.email){
        toastr.error('No user found');
     }
      else if(!(data[0].password == $('#loginPass').val())){
         toastr.error('Wrong Password');
      }
      else{
         toastr.success('Login Success');
         if(data[0].role == "Admin"){
            setTimeout(()=>{
               window.location.assign('../pages/adminDash.html');
            },1000)
         }
         else{
            setTimeout(()=>{
               window.location.assign('../pages/studentDash.html');
            },1000)
         }
      }
   }
})
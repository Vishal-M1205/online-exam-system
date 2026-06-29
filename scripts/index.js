import {USER_API,DEP_API} from '../scripts/api.js';


// Regex for the validations
const nameRegex = /^[A-Za-z ]{3,}$/;
const emailRegex = /^[a-zA-z0-9-\.]+@[a-zA-z0-9-\.]+\.[a-zA-z0-9-\.]{2,}$/;
const passRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[@!#$%&*-_\.]).{8,15}$/;
const mobileRegex = /^[0-9]{10}$/;

let signupValid = true;
let loginValid = true;

//Modal from the DOM
const signupModal = new bootstrap.Modal(document.getElementById('signupModal'));
const loginModal = new bootstrap.Modal(document.getElementById('loginModal'));


//toastr Configuration
toastr.options = {
        "positionClass": "toast-bottom-right",
        "showDuration": "300",
        "preventDuplicates": true
      }

const dobDate = new Date();

// Date Validation
dobDate.setFullYear(dobDate.getFullYear() - 17);
$('#dob').prop('max', dobDate.toISOString().split('T')[0]);

// Valid and In-valid class management helper function

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

//Populating the select tag in the Signup Modal
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
    try {
        const response = await fetch(DEP_API);
       const data = await response.json();
       renderDepartment(data);
        
    } catch (error) {
        toastr.error(error.message)
    }
   

}

getDepartment();

// 'input' event Validations for name, email, mobile no, password

$('#name').on('input',function(){
    if(nameRegex.test($(this).val().trim())){
        addValidClass('Looks Good!','#name','#nameErrMsg' )
        signupValid = true;
    }
    else{
        addInValidClass('Invalid Name', '#name','#nameErrMsg' )
        signupValid = false;
    }
})

$('#email').on('input',function(){
    if(emailRegex.test($(this).val().trim())){
        addValidClass('Valid Email','#email','#emailErrMsg' )
        signupValid = true;
    }
    else{
        addInValidClass('Invalid Email', '#email','#emailErrMsg' )
        signupValid = false;
    }
})

$('#pass').on('input',function(){
    if(passRegex.test($('#pass').val().trim())){
        addValidClass('Valid Password','#pass','#passErrMsg' )
        signupValid = true;
    }
    else{
        addInValidClass('Invalid Password', '#pass','#passErrMsg' )
        signupValid = false;
    }
    if($('#pass').val().trim()==$('#cpass').val().trim()){
        addValidClass('Password Matched','#cpass','#cpassErrMsg' )
        signupValid = true;
    }
    else{
        addInValidClass('Password Not Matched', '#cpass','#cpassErrMsg' )
        signupValid = false;
    }
})

$('#cpass').on('input',()=>{
    if($('#pass').val().trim()==$('#cpass').val().trim()){
        addValidClass('Password Matched','#cpass','#cpassErrMsg' )
        signupValid = true;
    }
    else{
        addInValidClass('Password Not Matched', '#cpass','#cpassErrMsg' )
        signupValid = false;
    }
})

$('#mobile').on('input',function(){
    if(mobileRegex.test($(this).val().trim())){
        addValidClass('Valid Number','#mobile','#mobileErrMsg' )
        signupValid = true;
    }
    else{
        addInValidClass('Invalid Number', '#mobile','#mobileErrMsg' )
        signupValid = false;
    }
})

// Validation for empty values and signup POST method

$('#signModalBtn').on('click',async ()=>{
   signupValid = true;

   if(!$('#name').val().trim()){
       toastr.warning('Name Field is Empty');
       signupValid = false;
   }
   else if(!$('#email').val().trim()){
       toastr.warning('Email Field is Empty');
       signupValid = false;
   }
   else if(!$('#pass').val().trim()){
       toastr.warning('Password Field is Empty');
       signupValid = false;
   }
   else if(!$('#dob').val().trim()){
       toastr.warning('DOB Field is Empty');
       signupValid = false;
   }
   else if(!$('#college').val().trim()){
       toastr.warning('College Field is Empty');
       signupValid = false;
   }
   else if(!$('#mobile').val().trim()){
       toastr.warning('Mobile No. Field is Empty');
       signupValid = false;
   }
   else if(!$("#male").prop('checked')&&!$("#female").prop('checked')){
     toastr.warning('Select Gender');
       signupValid = false;
   }
   
   





   if(signupValid){
    try {
        const emailCheck = await fetch(`${USER_API}?email=${$('#email').val()}`)
    const emailResponse = await emailCheck.json(); 
    if(emailResponse[0]?.email){
        toastr.error('Email Already Exists')
    }
    else{
         const response  = await fetch(USER_API,{
        method:"POST",
        headers:{
            "Content-Type":"application/json"
        },
        body:JSON.stringify({
            name:$('#name').val().trim(),
            email:$('#email').val().trim().toLowerCase(),
            password:$('#pass').val().trim(),
            dob: $('#dob').val(),
            gender:$("#male").prop('checked')?"Male":"Female",
            college:$('#college').val().trim(),
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
    }
    } catch (error) {
        toastr.error(error);
    }
   
   }
})

// Login Validation

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
         localStorage.setItem('user',JSON.stringify(data));
         if(data[0].role == "Admin"){
            setTimeout(()=>{
               window.location.replace('../pages/adminDash.html');
            },1000)
         }
         else{
            setTimeout(()=>{
               window.location.replace('../pages/studentDash.html');
            },1000)
         }
      }
   }
})
let otp;
const togglePassword = document.getElementById('togglePassword');
const password = document.getElementById('password');

togglePassword.addEventListener('click', () => {
  const type = password.getAttribute('type') === 'password' ? 'text' : 'password';
  password.setAttribute('type', type);
  togglePassword.classList.toggle('fa-eye');
  togglePassword.classList.toggle('fa-eye-slash');
});

const toggleConfirm = document.getElementById('toggleConfirmPassword');
const confirmPassword = document.getElementById('confirmPassword');
const otpfield = document.querySelector("#otp");

toggleConfirm.addEventListener('click', () => {
  const type = confirmPassword.getAttribute('type') === 'password' ? 'text' : 'password';
  confirmPassword.setAttribute('type', type);
  toggleConfirm.classList.toggle('fa-eye');
  toggleConfirm.classList.toggle('fa-eye-slash');
});

const passwordtxt = document.querySelector("#password");
const confirmpasswordtxt = document.querySelector("#confirmPassword");

const form = document.querySelector("form");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (otpfield.value == "")
    alert("Enter otp");
  else if (otpfield.value != otp)
    alert("Entered Wrong otp")
  else {
    if (passwordtxt.value == confirmpasswordtxt.value && otpfield.value == otp) {
      const formdata = new FormData(form);
      try {
        const res = await fetch("submit", {
          method: "POST",
          body: formdata
        })
        const result = await res.text();
        alert(result);
        window.location.href = "/login";
      } catch (error) {
        alert(error);
      }
      form.reset();
    }
    else {
      alert("Password not match");
    }
  }
})



otpfield.style.display = "none";

const show = async () => {
  const email = document.querySelector("#email");
  if (email.value != '' && (email.value).includes('@gmail.com')) {
    otp = Math.floor(100000 + Math.random() * 900000);
    

    const res = await fetch("sendotp", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email: email.value, otp })
    })
    const result = await res.text();
    if(result == "OTP sent successfully!")
      otpfield.style.display = "block";
    alert(result);
  }
}
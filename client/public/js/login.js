const togglePassword = document.getElementById('togglePassword');
const password = document.getElementById('password');
const otpfield = document.querySelector("#otp");
let otp;

togglePassword.addEventListener('click', () => {
    const type = password.getAttribute('type') === 'password' ? 'text' : 'password';
    password.setAttribute('type', type);
    togglePassword.classList.toggle('fa-eye');
    togglePassword.classList.toggle('fa-eye-slash');
});



const form = document.querySelector("form");

form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const formdata = new FormData(form);
    const plainObject = Object.fromEntries(formdata.entries());

    try {
        const res = await fetch("auth", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ ...plainObject, otp })
        })

        const result = await res.text();

        alert(result);
        if(result=="Login Successfully")
        {
            form.reset();
            otpfield.style.display = "none";
            window.location.href = "/dashboard";
        }
    }
    catch (error) {
        alert(error);
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
        if(result=="OTP sent successfully!")
            otpfield.style.display = "block";
        alert(result);
    }
}



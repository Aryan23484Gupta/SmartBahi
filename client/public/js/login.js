const togglePassword = document.getElementById('togglePassword');
const password = document.getElementById('password');

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
            credentials: "include", 
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ ...plainObject })
        })

        const result = await res.text();

        alert(result);
        if(result=="Login Successfully")
        {
            form.reset();
            // otpfield.style.display = "none";
            window.location.href = "/dashboard";
        }
    }
    catch (error) {
        alert(error);
    }
    

})
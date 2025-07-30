const form = document.querySelector("form");

form.addEventListener("submit",async(e)=>{
    e.preventDefault();
    const formdata = new FormData(form);
    try{
    const res = await fetch("/feedback",({
        method : "POST",
        body : formdata
    }))
    const result = await res.text();
    alert(result);
}
catch(err){
    alert(err);
}
form.reset();
})
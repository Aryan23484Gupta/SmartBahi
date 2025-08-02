const addcustomerbtn = document.querySelector(".btn.add");
const userprofile = document.querySelector("#dynamic");
const adduserapi = document.querySelector("#adduserapi");
const cancelbtn = document.querySelector(".cancelbtn");
const form = document.querySelector("form");
const tbody = document.getElementById("customerTableBody");
const totalcustomer = document.querySelector("#totalcustomer");
const totalamountgivetxt = document.querySelector("#totalamountgive");
const totalamountgottxt = document.querySelector("#totalamountget");
const linkedtransactiontable = document.querySelector(".linkedtransactions");
const linkedtransactiontbody = document.querySelector("#anothertransaction");
let btngave, input, btnsave, btngot, enteredAmount, btndelete, totalamountgot = 0, totalamountgive = 0;


let customername = [];
let data,loginnumber;




const totalcustomerupdate = () => {
  totalcustomer.innerText = customername.length <= 9 ? `0${customername.length}` : customername.length;

  btngave = document.querySelectorAll(".gave");
  input = document.querySelectorAll("#amountinput");
  btnsave = document.querySelectorAll(".save");
  btngot = document.querySelectorAll(".got");
  btndelete = document.querySelectorAll(".delete");



  btngave.forEach((button, index) => {
    button.onclick = () => {
      input[index].style.display = "inline-block";
      input[index].value = "";
      input[index].placeholder = "You Gave";
      btnsave[index].style.display = "inline-block";
    };
  });

  btngot.forEach((button, index) => {
    button.onclick = () => {
      input[index].style.display = "inline-block";
      input[index].value = "";
      input[index].placeholder = "You Got";
      btnsave[index].style.display = "inline-block";
    };
  });

  btnsave.forEach((button, index) => {
    button.onclick = async () => {
      input[index].style.display = "none";
      btnsave[index].style.display = "none";

      const raw = input[index].value;
      const cleaned = raw.replace(/₹|,/g, "");
      const enteredAmount = parseFloat(cleaned);
      input[index].value = "";

      if (isNaN(enteredAmount) || enteredAmount <= 0) {
        alert("Please enter a valid amount.");
        return;
      }

      const url =
        input[index].placeholder === "You Got"
          ? "/amountrecieve"
          : "/amountsend";

      try {
        const res = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userprofile: data,
            customerindex: index,
            amount: enteredAmount,
          }),
        });

        const result = await res.json();
        alert(result.message || "Transaction successful");

        await updatecustomerlist();
        totalcustomerupdate();
      } catch (error) {
        console.error(error);
        alert("Failed to update amount.");
      }
    };
  });



  btndelete.forEach((element, index) => {
    btndelete[index].addEventListener("click", async () => {

      const confirmed = confirm("Are you sure?");
      if (!confirmed) return;


      try {
        const res = await fetch("/delete-customer", {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            index,
            data
          })
        });

        const result = await res.json();
        console.log(result.message || "Successfully Deleted");

        await updatecustomerlist();
        totalcustomerupdate();
      } catch (error) {
        console.error(error);
        console.log("Failed to delete customer.");
      }
    })
  })




  // Format currency input
  input.forEach((element) => {
    element.oninput = (e) => {
      let value = e.target.value.replace(/,/g, "").replace(/[^\d.]/g, "");

      if (value === "") {
        e.target.value = "";
        return;
      }

      const [integer, decimal] = value.split(".");
      const intPart = parseInt(integer, 10);
      if (isNaN(intPart)) {
        e.target.value = "";
        return;
      }

      let formatted = intPart.toLocaleString("en-IN");
      if (decimal !== undefined) {
        formatted += "." + decimal;
      }

      e.target.value = "₹" + formatted;
    };
  });
};







const updatecustomerlist = async () => {

  totalamountgive = 0;
  totalamountgot = 0;

  const response = await fetch('/allcustomer', {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ name: data })
  });

  const result = await response.json();
  customername = result.customers;
  tbody.innerHTML = "";

  if (customername.length === 0) {
    const row = document.createElement("tr");
    row.innerHTML = `
    <td colspan="5" style="text-align:center; color: gray;">No customer found</td>
  `;
    tbody.appendChild(row);
  } else {
    customername.forEach((element, index) => {
      const row = document.createElement("tr");

      row.innerHTML = `
      <td>${element.customerName}<br>+91 ${element.customerPhone}</td>
      <td>${element.lastUpdated.split("-").reverse().map((part, i) => i === 2 ? part.slice(2) : part).join("-")}</td>
      <td id="elementamount">₹${(Math.abs(element.amount)) || 0}</td>
      <td class="paid">Paid</td>
      <td class="actions">
        <button class="btn gave">Send</button>
        <button class="btn got">Recieve</button>
        <button class="btn delete">Delete</button>
        <input type="text" id="amountinput">
           <button class="btn save" type="submit">Save</button>
      </td>
    `;

  
      tbody.appendChild(row);
      const paid = document.querySelectorAll(".paid");
      
      const amountcolor = document.querySelectorAll("#elementamount");
      
      if (element.amount == 0) {
        paid[index].innerText = "Settled";
        amountcolor[index].style.color = "#28a745"
      }
      else if (element.amount < 0) {
        totalamountgot += element.amount;
        paid[index].innerText = "Sent";
        paid[index].style.color = "red";
        amountcolor[index].style.color = "red"
      }
      else {
        totalamountgive += element.amount;
        paid[index].innerText = "Recieved";
        paid[index].style.color = "#007bff";
        amountcolor[index].style.color = "#007bff";
      }
    });
  }

  totalamountgivetxt.innerText = "₹" + totalamountgive;
  totalamountgottxt.innerText = "₹" + (Math.abs(totalamountgot));
}



const totallinked = async()=>{
  const response = await fetch('/linkedcustomer', {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ phone: loginnumber })
  });

  const result = await response.json();
  const customername = result.data;


    if (customername == undefined || customername.length === 0) {
      linkedtransactiontable.style.display = "none";
    } 
    
    else {
      
      linkedtransactiontable.style.display = "block"
    customername.forEach((element, index) => {
      const row = document.createElement("tr");
      row.innerHTML = `
      <td>${element.addedBy}<br>+91 ${element.addednumber}</td>
      <td>${element.date.split("-").reverse().map((part, i) => i === 2 ? part.slice(2) : part).join("-")}</td>
      <td id="elementamount">₹${(Math.abs(element.amount)) || 0}</td>
      <td class="paid">Paid</td>
    `;

  
      linkedtransactiontbody.appendChild(row);
      const paid = document.querySelectorAll(".paid");
      
      const amountcolor = document.querySelectorAll("#elementamount");
      
      if (element.amount == 0) {
        paid[index].innerText = "Settled";
        amountcolor[index].style.color = "#28a745"
      }
      else if (element.amount < 0) {
        totalamountgot += element.amount;
        paid[index].innerText = "Recieved";
        paid[index].style.color = "#007bff";
        amountcolor[index].style.color = "#007bff";
      }
      else {
        totalamountgive += element.amount;
        paid[index].innerText = "Sent";
        paid[index].style.color = "red";
        amountcolor[index].style.color = "red"
      }
    });
  }

}





document.addEventListener("DOMContentLoaded", async () => {

  const res = await fetch('/userprofile', { method: "GET" , credentials: "include" });
  const obj = await res.json();
  data = obj.userprofile;
  loginnumber = obj.usernumber;
  userprofile.innerText = `Welcome ${data} 👋`;
  await updatecustomerlist();
  totalcustomerupdate();
  totallinked();
});


addcustomerbtn.addEventListener("click", () => {
  addcustomerbtn.style.display = "none";
  form.style.display = "inline-block";
})



cancelbtn.addEventListener("click", () => {
  addcustomerbtn.style.display = "inline-block";
  form.style.display = "none";
  form.reset();
})




//Customer Add
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const input = document.querySelector("#customerinput").value;
  const customerphone = document.querySelector("#customerphoneinput").value;

  const result = await fetch("/add-customer", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ input,customerphone, data })
  });

  const responseText = await result.text();
  alert(responseText);

  await updatecustomerlist();
  totalcustomerupdate();

  form.reset();
  addcustomerbtn.style.display = "inline-block";
  form.style.display = "none";
});
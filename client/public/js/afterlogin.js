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
const closetransactiontablebtn = document.querySelector(".transaction-close-btn");
const transactionhistorytable = document.querySelector(".transaction-table-box");
const btngave = document.querySelector(".btn-debit");
const btngot = document.querySelector(".btn-credit");
const btndelete = document.querySelector(".btn-reset");
const btnsave = document.querySelector(".btn-submit");
const amountinput = document.querySelector("#amountinput");
const descriptioninput = document.querySelector("#descriptioninput");
const transactionform = document.querySelector(".transaction-form");

let enteredAmount, totalamountgot = 0, totalamountgive = 0, totaltr, addtransactionbtn, transactionhistoryother;


let customername = [];
let data, loginnumber;


  descriptioninput.style.display = "none";

//TRANSACTION HISTORY TABLE TOGGLE
closetransactiontablebtn.addEventListener("click", () => {
  transactionhistorytable.style.display = "none";
  transactionform.reset();
  amountinput.style.display = "none";
  descriptioninput.style.display = "none";
})

//AMOUNT INPUT FORMARTTED
amountinput.oninput = (e) => {
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



//FETCH AND UPDATE CUSTOMER LIST
const totalcustomerupdate = () => {
  addtransactionbtn = document.querySelectorAll(".addtransaction");
  totalcustomer.innerText = customername.length <= 9 ? `0${customername.length}` : customername.length;

  addtransactionbtn.forEach((element, index) => {
    element.addEventListener("click", () => {


      loadTransactions(data, index);


      transactionhistorytable.style.display = "block";

      //ADD PAYMENTS LOGIC
      transactionform.onsubmit = async (e) => {
        e.preventDefault();
        const raw = amountinput.value;
        const cleaned = raw.replace(/₹|,/g, "");
        const enteredAmount = parseFloat(cleaned);
        const descriptiontext = descriptioninput.value;
        if (isNaN(enteredAmount) || enteredAmount <= 0) {
          alert("Please enter a valid amount.");
          return;
        }

        const type = amountinput.placeholder === "Amount (₹) You Recieve" ? "credit" : "debit";
        try {
          const res = await fetch("/transactionhistory", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              data,
              index,
              balance: enteredAmount,
              type,
              description: descriptiontext
            }),
          });


          const result = await res.json();
          alert(result.message || "Transaction successful");
          transactionhistorytable.style.display = "none";
          location.reload();
          transactionform.reset();
        } catch (error) {
          console.error(error);
          alert("Failed to update amount.");
        }
      };

      //DELETE CUSTOMER LOGIC
      btndelete.onclick = async () => {
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
          transactionhistorytable.style.display = "none";
          location.reload();
        } catch (error) {
          console.error(error);
          console.log("Failed to delete customer.");
        }
      }

    })
  })


  btngave.onclick = () => {
    descriptioninput.style.display = "block";
    amountinput.style.display = "block";
    amountinput.value = "";
    amountinput.placeholder = "Amount (₹) You Sent";
  };


  btngot.onclick = () => {
    descriptioninput.style.display = "block";
    amountinput.style.display = "block";
    amountinput.value = "";
    amountinput.placeholder = "Amount (₹) You Recieve";
  };

}







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
      <td class="actions"><button class="addtransaction">Manage Customer</button></td>
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



const totallinked = async () => {
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


      row.addEventListener("click", () => {
        transactionhistorytable.style.display = "block";
        const username = element.addedBy;
        const customerIndex = element.customerIndex;
        console.log(username, customerIndex)
        loadTransactionsforlinkeduser(username, customerIndex);
      });
    });
  }


}





document.addEventListener("DOMContentLoaded", async () => {

  const res = await fetch('/userprofile', { method: "GET", credentials: "include" });
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
    body: JSON.stringify({ input, customerphone, data })
  });

  const responseText = await result.text();
  alert(responseText);

  await updatecustomerlist();
  totalcustomerupdate();

  form.reset();
  addcustomerbtn.style.display = "inline-block";
  form.style.display = "none";
});





const loadTransactions = async (data, index) => {
  transactionform.style.display = "block";
  const res = await fetch("/gettransactions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ data, index })
  });

  const resdata = await res.json();
  if (!res.ok) {
    alert(data.message);
    return;
  }

  const tableBody = document.querySelector(".transaction-table tbody");
  const tableFooter = document.querySelector(".transaction-table tfoot");
  tableBody.innerHTML = "";

  let runningBalance = 0;

  resdata.transactions.forEach(tx => {
    const row = document.createElement("tr");
    const isCredit = tx.type === "credit";
    const amountText = isCredit ? `+${tx.balance}` : `-${tx.balance}`;
    runningBalance += isCredit ? tx.balance : -tx.balance;

    row.className = isCredit ? "transaction-credit-row" : "transaction-debit-row";

    row.innerHTML = `
        <td>${tx.date.split("-").reverse().join("-")}</td>
        <td>${tx.description || ""}</td>
        <td>₹${amountText}</td>
        <td class="transaction-${tx.type}">${tx.type.charAt(0).toUpperCase() + tx.type.slice(1)}</td>
        <td class="transaction-balance">₹${runningBalance}</td>
      `;

    tableBody.appendChild(row);
  });

  let due = "You Recieve Extra";
  if (resdata.finalBalance < 0)
    due = "Due";
  else if (resdata.finalBalance == 0)
    due = "All Clear";

  tableFooter.querySelector("td:last-child").innerText = `${due} ₹${Math.abs(resdata.finalBalance)}`;
}




//FOR LINKED USER 
const loadTransactionsforlinkeduser = async(data,index)=>{

  transactionform.style.display = "none";

  const res = await fetch("/gettransactions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ data, index })
  });

  const resdata = await res.json();
  if (!res.ok) {
    alert(data.message);
    return;
  }

  console.log(resdata)

  const tableBody = document.querySelector(".transaction-table tbody");
  const tableFooter = document.querySelector(".transaction-table tfoot");
  tableBody.innerHTML = "";

  let runningBalance = 0;

  resdata.transactions.forEach(tx => {
    const row = document.createElement("tr");
    const isCredit = tx.type === "credit";
    const amountText = isCredit ? `-${tx.balance}` : `+${tx.balance}`;
    runningBalance += isCredit ? tx.balance : -tx.balance;

    row.className = isCredit ? "transaction-debit-row" : "transaction-credit-row";

    row.innerHTML = `
        <td>${tx.date.split("-").reverse().join("-")}</td>
        <td>${tx.description || ""}</td>
        <td>₹${amountText}</td>
        <td class="transaction-${tx.type=="credit"?"debit":"credit"}">${tx.type=="credit"?"Sent":"Recieve"}</td>
        <td class="transaction-balance">₹${tx.type=="credit"?"-"+Math.abs(runningBalance):Math.abs(runningBalance)}</td>
      `;

    tableBody.appendChild(row);
  });

  let due = "Due";
  if (resdata.finalBalance > 0)
    due = "You Sent Extra";
  else if (resdata.finalBalance == 0)
    due = "All Clear";

  tableFooter.querySelector("td:last-child").innerText = `${due} ₹${Math.abs(resdata.finalBalance)}`;

}
const express = require("express");
require("dotenv").config();
const mongoose = require("mongoose");
const user = require("./userschema");
const path = require("path");
const multer = require("multer");
const nodemailer = require("nodemailer")
const bodyParser = require('body-parser');
const session = require("express-session");
const MongoStore = require("connect-mongo");

const upload = multer();

const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, "..", "client")));
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());



app.use(session({
    secret: "smartbahi_secret",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: process.env.MONGO_URL,
        collectionName: "sessions",
        ttl: 60 * 60 * 24, // 1 day
    }),
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 30,
    }
}));

// ✅ 2. Connect to MongoDB and clear sessions after session middleware is ready
mongoose.connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(async () => {
    console.log("✅ Connected to MongoDB");

    // // ❗Clear sessions AFTER session middleware is active
    // const sessionCollection = mongoose.connection.collection("sessions");
    // await sessionCollection.deleteMany({});
    // console.log("🧹 Cleared all sessions on server restart");

    app.listen(process.env.PORT, () => {
        console.log("🚀 Server is Live");
    });
}).catch(err => {
    console.error("❌ MongoDB connection error:", err);
});


const checkAuth = (req, res, next) => {
    if (req.session && req.session.user) {
        next(); // User is logged in
    } else {
        res.redirect('/login'); // Redirect to login page
    }
}



app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "..", "/client/page", "index.html"));
})

app.get("/signup", (req, res) => {
    res.sendFile(path.join(__dirname, "..", "/client/page", "signup.html"));
})

app.get("/login", (req, res) => {
    res.sendFile(path.join(__dirname, "..", "/client/page", "login.html"));
})

app.get("/contactus", (req, res) => {
    res.sendFile(path.join(__dirname, "..", "/client/page", "contactus.html"));
})

app.get("/aboutus", (req, res) => {
    res.sendFile(path.join(__dirname, "..", "/client/page", "aboutus.html"));
})

app.get("/features", (req, res) => {
    res.sendFile(path.join(__dirname, "..", "/client/page", "features.html"));
})

app.get("/dashboard", checkAuth, (req, res) => {
    res.sendFile(path.join(__dirname, "..", "client", "page", "afterlogin.html"));
});


app.get("/logout", (req, res) => {
    req.session.destroy(err => {
        if (err) return res.send("Error logging out");
        res.clearCookie("connect.sid");
        res.redirect("/");
    });
});

app.get("/checklogin", (req, res) => {
    if (req.session.user)
        res.send("loggedin")
    else
        res.send("not loggedin")
})




let usernumber;




app.post("/submit", upload.none(), async (req, res) => {
    let { name, phone, email, password } = req.body;
    const newuser = new user({ name, phone, email, password });
    try {
        await newuser.save();
        res.send("Registration Successfull");
    }
    catch (err) {
        console.log(err)
        res.send("User already exist");
    }
})

app.post("/sendotp", async (req, res) => {
    const { email, otp, username } = req.body;
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL,
            pass: process.env.PASSWORD
        }
    });


    const mailOptions = {
        from: `"SmartBahi" <${process.env.Email}>`,
        to: email,
        subject: "Your SmartBahi OTP for Account Verification",
        text: `Hello ${username},\n
Your One-Time Password (OTP) for verifying your SmartBahi account is:\n
🔐 OTP: ${otp}\n
This OTP is valid for the next 5 minutes.\n
Please do not share this code with anyone.\n
If you didn’t request this, please ignore this message.\n
You can continue here: \n https://smartbahi-5hco.onrender.com\n
Thank you,\n
SmartBahi Team`
    };


    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Error sending mail:', error);
            res.status(500).send('Failed to send OTP');
        } else {
            console.log('Email sent:', info.response);
            res.send('OTP sent successfully!');
        }
    });
})

app.get("/readsmartbahi23484", async (req, res) => {
    const alluser = await user.find();
    res.send(alluser);
})

let userprofile = "User";

app.post("/auth", async (req, res) => {
    const { email, password } = req.body;
    const userexist = await user.findOne({ email });

    if (userexist != null && userexist.password == password) {
        req.session.user = {
            id: userexist._id,
            name: userexist.name,
            phone: userexist.phone,
        };
        userprofile = userexist.name;
        usernumber = userexist.phone;
        res.send("Login Successfully");
    }
    else if (userexist != null && userexist.password != password) {
        res.send("Entered wrong password")
    }
    else {
        res.send("User not found")
    }
})

app.get("/userprofile", (req, res) => {
    if (req.session.user) {
        res.send({
            userprofile: req.session.user.name,
            usernumber: req.session.user.phone
        });
    } else {
        res.status(401).send("Not logged in");
    }
});


//Add Customer

app.post("/add-customer", async (req, res) => {
    const { input, customerphone, data } = req.body;

    try {
        const profile = await user.findOne({ name: data });

        const duplicate = profile.customers.find(c => c.customerPhone == customerphone);

        if (duplicate) {
            return res.status(409).json("Customer number already exists");
        }

        profile.customers.push({
            customerName: input,
            amount: 0,
            customerPhone: Number(customerphone),
            lastUpdated: new Date().toISOString().split("T")[0]
        });

        await profile.save();
        res.status(200).json("Customer added successfully");

    } catch (err) {
        console.error(err);
        res.status(500).json("Failed to add customer");
    }
});


//INSERT TRANSACTION HISTORY AND UPDATE AMOUNT

app.post("/transactionhistory", async (req, res) => {
  const { balance, type, description, data, index } = req.body;
  try {
    const profile = await user.findOne({ name: data });

    const transaction = {
      balance,
      type,
      description
    };

    profile.customers[index].transactions.push(transaction);

    if (type === "credit") {
      profile.customers[index].amount += balance;
    } else if (type === "debit") {
      profile.customers[index].amount -= balance;
    }

    profile.customers[index].lastUpdated = new Date().toISOString().split("T")[0];

    await profile.save();

    res.status(200).json({ message: "Transaction added successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
});

//GETTING TRANSACTION HISTORY
app.post("/gettransactions", async (req, res) => {
  const { data, index } = req.body;

  try {
    const profile = await user.findOne({ name: data });

    const transactions = profile.customers[index].transactions;
    const finalBalance = profile.customers[index].amount;

    res.status(200).json({ transactions, finalBalance });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});




//Fetch Customer 


app.post("/allcustomer", async (req, res) => {
    const { name } = req.body;

    try {
        const profile = await user.findOne({ name });

        res.status(200).json({ customers: profile.customers });
    } catch (err) {
        console.error("Error fetching customers:", err);
        res.status(500).json({ error: "Server error" });
    }
});





//Delete Customer

app.delete("/delete-customer", async (req, res) => {
    const { index, data } = req.body;

    try {
        const profile = await user.findOne({ name: data });

        profile.customers.splice(index, 1);
        await profile.save();

        res.json({ message: "Customer deleted successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
});

//LINKED CUSTOMER

app.post('/linkedcustomer', async (req, res) => {
    const { phone } = req.body;

    try {
        const Users = await user.find({
            customers: { $elemMatch: { customerPhone: phone } }
        });

        if (Users.length === 0) {
            return res.status(200).json({ message: "No linked customer found." });
        }

        const linkedEntries = Users.flatMap(user => {
            const index = user.customers.findIndex(c => c.customerPhone === phone);
            const customer = user.customers[index];

            return {
                customernameog: customer.customerName,
                addedBy: user.name,
                addednumber: user.phone,
                amount: customer.amount,
                date: customer.lastUpdated,
                customerIndex: index
            };
        });

        return res.status(200).json({
            message: "Linked customer found.",
            data: linkedEntries
        });
    } catch (err) {
        console.error("Error checking linked customer:", err);
        return res.status(500).json({ message: "Server error." });
    }
});










//FEEDBACK
app.post("/feedback", upload.none(), async (req, res) => {
    const { email, name, subject, message } = req.body;

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL,
            pass: process.env.PASSWORD
        }
    });

    const mailOptions = {
        from: `"SmartBahi" <${email}>`,
        to: process.env.RECIEVE,
        subject: `Feedback from ${name}`,
        text: `You got a new message:\n\nName: ${name}\nEmail: ${email}\nSubject: ${subject}\nMessage: ${message}`
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Error sending mail:', error);
            res.status(500).send('Failed to send email');
        } else {
            console.log('Email sent:', info.response);
            res.send('Feedback sent successfully!');
        }
    });



})


app.get("/ping", (req, res) => {
    res.set("Cache-Control", "no-store");
    res.status(200).send("pong");
});

const express = require("express");
require("dotenv").config();
const mongoose = require("mongoose");
const user = require("./userschema");
const path = require("path");
const multer = require("multer");
const nodemailer = require("nodemailer")
const bodyParser = require('body-parser');
const session = require("express-session");

const upload = multer();

const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, "..", "client")));
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true
}));



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

app.get("/dashboard", (req, res) => {
    if (req.session.user) {
        res.sendFile(path.join(__dirname, "..", "client", "page", "afterlogin.html"));
    } else {
        res.redirect("/login")
    }
});

app.get("/logout", (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.send("Error logging out");
        }
        res.redirect("/");
    });
});

app.get("/checklogin", (req, res) => {
    if (req.session.user)
        res.send("loggedin")
    else
        res.send("not loggedin")
})









app.post("/submit", upload.none(), async (req, res) => {
    let { name, phone, email, password } = req.body;
    const newuser = new user({ name, phone, email, password });
    try {
        await newuser.save();
        res.send("Registration Successfull");
    }
    catch (err) {
        res.send("User already exist");
    }
})

app.post("/sendotp", async (req, res) => {
    const { email, otp } = req.body;
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
        subject: `Otp from SmartBahi`,
        text: `Use OTP ${otp} to verify your identity on SmartBahi. Do not share this code with anyone. This OTP is valid for 5 minutes.`
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

let userprofile = "Aryan Gupta";

app.post("/auth", async (req, res) => {
    const { email, password, otp, ogotp } = req.body;
    const userexist = await user.findOne({ email });

    if (otp == undefined || otp == '')
        res.send("Enter OTP");

    else if (otp != ogotp)
        res.send("Entered Wrong otp");

    else {
        if (userexist != null && userexist.password == password) {
            req.session.user = email;
            userprofile = userexist.name;
            res.send("Login Successfully");

        }
        else if (userexist != null && userexist.password != password) {
            res.send("Entered wrong password")
        }
        else {
            res.send("User not found")
        }
    }
})

app.post("/userprofile", (req, res) => {
    if (userprofile != "User")
        res.send(userprofile);
    else
        res.send(userprofile);
})

//Add Customer

app.post("/add-customer", async (req, res) => {
    const { input, data } = req.body;

    try {
        const profile = await user.findOne({ name: data });

        const duplicate = profile.customers.find(c => c.customerName.toLowerCase() === input.toLowerCase());

        if (duplicate) {
            return res.status(409).json("Customer name already exists");
        }

        profile.customers.push({
            customerName: input,
            amount: 0,
            lastUpdated: new Date().toISOString().split("T")[0]
        });

        await profile.save();
        res.status(200).json("Customer added successfully");

    } catch (err) {
        console.error(err);
        res.status(500).json("Failed to add customer");
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



//Update Amount 

app.post("/amountrecieve", async (req, res) => {

    const { amount, userprofile, customerindex } = req.body;

    const profile = await user.findOne({ name: userprofile });
    
    const customer = profile.customers[customerindex];

    customer.amount += amount;
    customer.lastUpdated = new Date().toISOString().split("T")[0];

    await profile.save();

    res.status(200).json("Amount Updated Successfully");


})

app.post("/amountsend", async (req, res) => {

    const { amount, userprofile, customerindex } = req.body;

    const profile = await user.findOne({ name: userprofile });

    const customer = profile.customers[customerindex];

    customer.amount -= amount;
    customer.lastUpdated = new Date().toISOString().split("T")[0];

    await profile.save();

    res.status(200).json("Amount Updated Successfully");


})

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
        from: email,
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


//DATABASE CONNECTION

// mongoose.connect(process.env.DBURL)
//   .then(() => {
//     console.log("✅ MongoDB Connected");

//     // Start the server only after DB connection is successful
//     app.listen(process.env.PORT,() => {
//       console.log("🚀 Server is Live");
//       console.log(`📡 Visit: http://localhost:${process.env.PORT}`);
//     });
//   })
//   .catch((err) => {
//     console.error("❌ MongoDB connection failed:", err);
//   });

// // mongoose.connect(process.env.DBURL)
// //     .then(() => {
// //         console.log("db is connected")
// //         app.listen(process.env.PORT,'0.0.0.0', () => {
// //             console.log("Server is Live");
// //             console.log(`Follow the link http://localhost:${process.env.PORT}`);
// //         });
// //     })




mongoose.connect(process.env.MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log("✅ Connected to MongoDB with Mongoose");

  // Start Express server only after DB connection
  app.listen(process.env.PORT || 8080, '0.0.0.0', () => {
    console.log("🚀 Server is Live");
    console.log(`🌐 http://localhost:${process.env.PORT || 8080}`);
  });
})
.catch((err) => {
  console.error("❌ Mongoose connection error:", err);
});

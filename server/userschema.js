const mongoose = require("mongoose");


const customerSchema = new mongoose.Schema({
    customerName: {
        type: String
    },
    customerPhone:{
        type : Number
    },
    amount: {
        type: Number,
        default: 0
    },
    lastUpdated: {
        type: String,
        default: () => new Date().toISOString().split("T")[0]
    }
}, { _id: false });

const userschema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    phone: {
        type: Number,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    customers: [customerSchema]
});

const user = mongoose.model("user", userschema);

module.exports = user;
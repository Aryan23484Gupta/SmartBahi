const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({
  date: {
    type: String,
    default: () => new Date().toISOString().split("T")[0]
  },
  balance: {
    type: Number,
    required: true
  },
  type: {
    type: String,
    enum: ["credit", "debit"],
    required: true
  },
  description: {
    type: String,
    default: ""
  }
}, { _id: false });





const customerSchema = new mongoose.Schema({

  customerName: {
    type: String,
  },

  customerPhone: {
    type: Number
  },
  

  amount: {
    type: Number,
    default: 0
  },

  lastUpdated: {
    type: String,
    default: () =>new Date().toISOString().split("T")[0]
  },
  
  transactions: {
    type: [transactionSchema],
    default: []
  }
}, { _id: false });




const userSchema = new mongoose.Schema({
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
  customers: {
    type: [customerSchema],
    default: []
  }
});

module.exports = mongoose.model("User", userSchema);
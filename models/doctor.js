const mongoose = require("mongoose");
const doctorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  phoneNo: {
    type: Number,
    required: true,
  },
  specialty: {
    type: String,
    required: true,
  },
  hospital_name: {
    type: String,
    required: true,
  },
  experience: {
    type: Number,
    required: true,
  },
  profileImage:{
    type:String,
  },
  password: {
    type: String,
    required: true,
  },
  userAppointments: [
    {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      date: {
        type: Date,
        required: true,
      },
      time: {
        type: String,
        required: true,
      },
    },
  ],
  userRatings:[
    {
      userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
      },
      rating:{
        type:Number,
        required:true,
        min:1,
        max:5,
      },
      comment:{
        type:String,
        required:false,
      },
    },
  ],
});



module.exports = mongoose.model("Doctor", doctorSchema);
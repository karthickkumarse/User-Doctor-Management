const mongoose = require("mongoose");
mongoose.connect("mongodb://0.0.0.0:27017/MY_JWT")
  .then(() => {
    console.log("Connected to Database");
  })
  .catch((err) => {
    console.log("Error in Connecting", err);
  });

const userSchema=new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  phoneNo: { type: String, required: true, unique: true },
  password: {
    type: String,
    required: true,
  },
  profileImage: {
    type:String,
  },
  appointments: [
    {
      doctorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Doctor",
      },
      date: {
        type: Date,
        required: true,
      },
      time: {
        type: String,
        required: true,
      },
      status: {
        type:String,
        required:true
      }
    },
  ],
  doctorRatings:[
    {
      doctorId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Doctor",
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



module.exports = mongoose.model("User", userSchema);
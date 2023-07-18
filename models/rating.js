const mongoose=require("mongoose");
const ratingSchema=new mongoose.Schema({
    ratingType:{
        type:String,
        enum:["user","doctor"],
        required:true,
    },
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true,
    },
    doctorId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Doctor",
        required:true,
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
});



module.exports=mongoose.model("Rating",ratingSchema)
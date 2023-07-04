const User=require("../models/user");
const Doctor=require("../models/doctor");
const Rating=require("../models/rating");

// Add User Rating for doctor
async function addUserRating(req,res){
    const {doctorId,rating,comment}=req.body;
    try{
        const doctor=await Doctor.findById(doctorId);
        if(!doctor){
            return res.status(404).json({message:"Doctor not found"});
        }


        //create a new rating for ratingSchema
        const newRating=new Rating({
            ratingType:"user",
            userId:req.user.id,
            doctorId:doctorId,
            rating:rating,
            comment:comment,
        });
        //save it
        await newRating.save();


        //addUserRating
        doctor.userRatings.push({
            userId:req.user.id,
            rating,
            comment,
        });
        //save the doctor 
        await doctor.save();
        res.status(200).json({message:"Thank You for your ratings we'll see next time..."});
    }catch(err){
        console.error(err.message);
        res.status(500).json({message:"Server error"});
    }
}


// Add Doctor Ratings for user
async function addDoctorRating(req,res){
    const{userId,rating,comment}=req.body;

    try{
        const user=await User.findById(userId);
        if(!user){
            return res.status(404).json({message:"User not found"});
        }


        //create a new rating for ratingSchema
        const newRating=new Rating({
            ratingType:"doctor",
            userId:userId,
            doctorId:req.doctor.id,
            rating:rating,
            comment:comment,
        });
        //save it
        await newRating.save();


        //addDoctorRatings
        user.doctorRatings.push({
            doctorId:req.doctor.id,
            rating,
            comment,
        });
        //save the user 
        await user.save();
        res.status(200).json({message:"Rating added successfully"});
    }catch(err){
        console.error(err.message);
        res.status(500).json({message:"Server error"});
    }
}



module.exports={
    addUserRating,
    addDoctorRating,
    
}
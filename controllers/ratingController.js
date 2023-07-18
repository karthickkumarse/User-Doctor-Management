const User=require("../models/user");
const Doctor=require("../models/doctor");
const Rating=require("../models/rating");
const nodemailer=require('nodemailer');
require('dotenv').config();

 
// Add User Rating for doctor
async function addUserRating(req,res){
    const {doctorId,rating,comment}=req.body;
    try{
        const doctor=await Doctor.findById(doctorId);
        if(!doctor){
            return res.status(404).json({message:"Doctor not found"});
        }

        //condition for whether the user already rated the doctor or not
        const existingRating=await Rating.findOne({
        ratingType:"user",
        userId:req.user.id,
        doctorId:doctorId,
    });

    if(existingRating){
        return res.status(400).json({message:"You already rated this Doctor!"});
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

        //send email notification to doctor
        const transporter=nodemailer.createTransport({
            host:'smtp.mailtrap.io',
            port:2525,
            auth:{
                user:process.env.YOUR_EMAIL,
                pass:process.env.YOUR_PASSWORD,
            },
        });

    const user = await User.findById(newRating.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
        
        const mailOptions={
            from:user.email,
            to:doctor.email,
            subject:"New Rating from User",
            text:`Dear ${doctor.name},\n\n You have received a new rating from user \n\n Ratings Details: \n rating:${rating} \n comment:${comment}`,
        };

        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
              console.error("Error sending email: ", error);
            } else {
              console.log("Email sent: ", info.response,info.envelope);
            }
          });

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

         //condition for whether the doctor already rated the user or not
         const existingRating=await Rating.findOne({
            ratingType:"doctor",
            userId:userId,
            doctorId:req.doctor.id,
        });

        if(existingRating){
            return res.status(400).json({message:"You already rated this User!"});
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

        //send email notification to user
        const transporter=nodemailer.createTransport({
            host:'smtp.mailtrap.io',
            port:2525,
            auth:{
                user:process.env.YOUR_EMAIL,
                pass:process.env.YOUR_PASSWORD,
            },
        });

        const doctor=await Doctor.findById(newRating.doctorId);
        if(!doctor){
            return res.status(404).json({message:"Doctor not found"});
        }

        const mailOptions={
            from:doctor.email,
            to:user.email,
            subject:"New Rating from Doctor",
            text:`Dear ${user.name},\n\n You have received a new rating from Doctor \n\n Ratings Details: \n rating:${rating} \n comment:${comment}`,
        };

        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
              console.error("Error sending email: ", error);
            } else {
              console.log("Email sent: ", info.response,info.envelope);
            }
          });

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
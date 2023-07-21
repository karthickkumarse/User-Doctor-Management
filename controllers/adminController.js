const Admin=require('../models/admin');
const User=require('../models/user')
const Doctor=require('../models/doctor');
const Appointment=require('../models/appointment');
const Rating=require('../models/rating');
const bcrypt=require('bcrypt');
const jwt=require('jsonwebtoken');
const nodemailer=require('nodemailer');
const config=require('../config/config');
require('dotenv').config();


//Admin Registration
async function register(req,res){
    try{
        const {name,email,password}=req.body;

        //check if admin is already exist or not
        let admin=await Admin.findOne({email})
        if(admin){
            return res.status(404).json({message:"Admin already exist . . ."});
        }else{
            //create a new admin
            admin=new Admin({name,email,password});
        }

        const salt=await bcrypt.genSalt(10);
        admin.password=await bcrypt.hash(password,salt);

        await admin.save()
        .then(()=>{
            res.send("Admin registration successfully . . .")
        })
        .catch((err)=>{
            res.status(404).json({message:"Error while registering admin"})
        })

    }catch(err){
        console.error(err.message);
        res.status(500).send("server error");
    }
}


//Admin login
async function login(req,res){
    try{
        const {email,password}=req.body;

        // Check if admin exists
        const admin = await Admin.findOne({email});
        if (!admin) {
            return res.status(401).json({ message:"Invalid credentials."});
        }

        //check password
        const isMatch=await bcrypt.compare(password,admin.password);
        if(!isMatch){
            return res.status(404).json({message:"Invalid Credentials"});
        }

        //generate a token
        const token=jwt.sign({admin:{id:admin.id}},config.jwtSecret,{expiresIn: "1d"});
        res.json({token});
    }catch(err){
        console.error(err.message);
        res.status(500).send("server error");
    }
}


//GetProfile
async function getProfile(req, res) {
    try {
      const adminId = req.admin.id;

      if(adminId){  
        const admin = await Admin.findById(adminId).select('-password'); 
        if (!admin) {
            return res.status(404).json({ message:"Admin not found."});
          }
           res.json(admin);
      }
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server error.");
    }
  }

//get all doctors
  async function getAllDoctors(req,res){
    try{
        const doctors=await Doctor.find().select('-password');
        res.json(doctors);
    }catch(err){
        console.error(err.message);
        return res.status(500).send("server error");
    }
  }

//get all users
async function getAllUsers(req,res){
    try {
        const users=await User.find().select('-password');
        res.json(users);
    }catch(err){
        console.error(err.message);
        return res.status(500).send("server error")
    }
}

//get all appointments
async function getAllAppointments(req,res){
    try{
        const appointments=await Appointment.find();
        res.json(appointments);
    }catch(err){
        console.error(err.message);
        return res.status(500).send("server error");
    }
}

//get all ratings
async function getAllRatings(req,res){
    try{
        const ratings=await Rating.find();
        res.json(ratings);
    }catch(err){
        console.error(err.message);
        return res.status(500).send("server error");
    }
}


//change doctor password
async function changeDoctorPassword(req,res){
    try{
        const{doctorId,newPassword}=req.body;

        //check if the doctor with the id
        const doctor=await Doctor.findById(doctorId);
        if(!doctor){
            return res.status(404).json({message:"Doctor not found"});
        }

        //generate a new salt and hash the new password
        const salt=await bcrypt.genSalt(10);
        const hashedPassword=await bcrypt.hash(newPassword,salt);

        //update the doctor password
        doctor.password=hashedPassword;
        await doctor.save();

        const transporter=nodemailer.createTransport({
            host:"smtp.mailtrap.io",
            port:2525,
            auth:{
                user:process.env.YOUR_EMAIL,
                pass:process.env.YOUR_PASSWORD,
            }
        });

        const admin=await Admin.findById(req.admin.id);
        if(!admin){
            return res.json({message:"Admin not found"});
        }


        const mailOptions={
            from:admin.email,
            to:doctor.email,
            subject:"Update from Admin",
            text:`Dear ${doctor.name},\n\n Admin changed your password to ${newPassword}`
        };

        transporter.sendMail(mailOptions,(err,info)=>{
            if(err){
                console.error("Email sending error:",err.message);
            }else{
                console.log("Email sent:",info.response,info.envelope);
            }
        });

        res.json({message:"Doctor's password updated successfully"});
    }catch(err){
        console.error(err.message);
        return res.status(500).send("server error");
    }
}


//change user password
async function changeUserPassword(req,res){
    try{
        const {userId,newPassword}=req.body;

        const user=await User.findById(userId);
        if(!user){
            return res.status(404).json({message:"User not found"});
        }

        //salt and hash password
        const salt=await bcrypt.genSalt(10)
        const hashedPassword=await bcrypt.hash(newPassword,salt);

        //update the user password
        user.password=hashedPassword;
        await user.save();

        const transporter=nodemailer.createTransport({
            host:'smtp.mailtrap.io',
            port:2525,
            auth:{
                user:process.env.YOUR_EMAIL,
                pass:process.env.YOUR_PASSWORD,
            }
        });

        const admin=await Admin.findById(req.admin.id);
        if(!admin){
            return res.status(404).json({message:"Admin not found"});
        }

        const mailOptions={
            from:admin.email,
            to:user.email,
            subject:"Update from Admin",
            text:`Dear ${user.name},\n\n Admin changed your password to ${newPassword}`
        }
        transporter.sendMail(mailOptions,(err,info)=>{
            if(err){
                console.error("Email sending error:",err.message);
            }else{
                console.log("Email sent:",info.response,info.envelope);
            }
        })
        res.json({message:"User Password updated successfully"});
    }catch(err){
        console.error(err.message);
        return res.status(500).send("server error");
    }
}


//deleteUser
async function deleteUser(req,res){
    try{
        const {userId}=req.body;
        const user=await User.findById(userId);
        if(!user){
            return res.status(404).json({message:"User not found"});
        }
        //delete the user
        await user.deleteOne();

        res.json({message:"User Deleted Successfully"});
    }catch(err){
        console.error(err.message);
        return res.status(404).send("server error");
    }
}


//deleteDoctor
async function deleteDoctor(req,res){
    try{
        const{doctorId}=req.body;
        const doctor=await Doctor.findById(doctorId);
        if(!doctor){
            return res.status(404).json({message:"Doctor not found"});
        }

        //delete the doctor
        await doctor.deleteOne();

        res.json({message:"Doctor Deleted Successfully"});
    }catch(err){

    }
}


//updateUser
async function updateUser(req,res){
    try {
        const {userId,name,email}=req.body;
        const user=await User.findById(userId);
        if(!user){
            return res.status(404).json({message:"User not found"});
        }

        //update the user
        user.name=name;
        user.email=email;
        //save the user
        await user.save();

        res.json({message:"User updated successfully"});
    } catch(err){
        console.error(err.message);
        return res.status(500).send("server error");
    }
}


//updateDoctor
async function updateDoctor(req,res){
    try{
        const {doctorId,name,email,specialty,hospital_name,experience}=req.body;
        const doctor=await Doctor.findById(doctorId);
        if(!doctor){
            return res.status(404).json({message:"Doctor not found"});
        }

        //update the doctor
        doctor.name=name,
        doctor.email=email,
        doctor.specialty=specialty,
        doctor.hospital_name=hospital_name,
        doctor.experience=experience;

        //save the doctor
        await doctor.save();
        res.json({message:"Doctor updated successfully"});
    }catch(err){
        console.error(err.message);
        return res.status(500).send("server error");
    }
}


//createUserByAdmin

async function createUserByAdmin(req,res){
    try {
        const { name, email, phoneNo, password } = req.body; // Get user input
    
        // Check if user already exists
        let user = await User.findOne({$or:[{email: email},{phoneNo: phoneNo}]});
        if (user) {
          return res.status(400).json({message:"User already exists."});
        } else {
          user = new User({ name, email, phoneNo, password }); // Create a new user
        }  
    
        const salt = await bcrypt.genSalt(10); // Hash the password
        user.password = await bcrypt.hash(password, salt);
    
        await user.save() // Save the user to database

        const transporter=nodemailer.createTransport({
            host:'smtp.mailtrap.io',
            port:2525,
            auth:{
                user:process.env.YOUR_EMAIL,
                pass:process.env.YOUR_PASSWORD,
            }
        })

        const admin=await Admin.findById(req.admin.id);
        if(!admin){
            return res.status(404).json({message:"Admin not found"});
        }
        
        const mailOptions={
            from:admin.email,
            to:user.email,
            subject:"Admin Created a new profile for you",
            text:`Dear ${user.name}\n\n Your Profile Details:\n\n Email:${user.email}\n Password:${password}`
        }

        transporter.sendMail(mailOptions,(err,info)=>{
            if(err){
                console.error("Email sending error:",err.message);
            }else{
                console.log("Email sent:",info.response,info.envelope);
            }
        })

        res.send("You successfully created a new user");
      } catch (err) {
        console.error(err.message);
        res.status(500).send("Server error.");
      }
}


//create doctor by admin

async function createDoctorByAdmin(req,res){
    try {
        const { name, email, phoneNo, specialty, hospital_name, experience, password } = req.body; // Get user input
    
        // Check if user already exists
        let doctor = await Doctor.findOne({$or:[{email: email},{phoneNo: phoneNo}]});
        if (doctor) {
          return res.status(400).json({message:"Doctor already exists."});
        } else {
          doctor = new Doctor({ name, email, phoneNo, specialty, hospital_name, experience,  password }); // Create a new doctor
        }  
    
        const salt = await bcrypt.genSalt(10); // Hash the password
        doctor.password = await bcrypt.hash(password, salt);
    
        await doctor.save() // Save the user to database

        const transporter=nodemailer.createTransport({
            host:'smtp.mailtrap.io',
            port:2525,
            auth:{
                user:process.env.YOUR_EMAIL,
                pass:process.env.YOUR_PASSWORD,
            }
        })

        const admin=await Admin.findById(req.admin.id);
        if(!admin){
            return res.status(404).json({message:"Admin not found"});
        }
        
        const mailOptions={
            from:admin.email,
            to:doctor.email,
            subject:"Admin Created a new profile for you",
            text:`Dear ${doctor.name}\n\n Your Profile Details:\n\n Email:${doctor.email}\n Password:${password}`
        }

        transporter.sendMail(mailOptions,(err,info)=>{
            if(err){
                console.error("Email sending error:",err.message);
            }else{
                console.log("Email sent:",info.response,info.envelope);
            }
        })

        res.send("You successfully created a new doctor profile");
      } catch (err) {
        console.error(err.message);
        res.status(500).send("Server error.");
      }
}
  


module.exports={
    register,
    login,
    getProfile,
    getAllDoctors,
    getAllUsers,
    getAllAppointments,
    getAllRatings,
    changeDoctorPassword,
    changeUserPassword,
    deleteUser,
    deleteDoctor,
    updateUser,
    updateDoctor,
    createUserByAdmin,
    createDoctorByAdmin,
}
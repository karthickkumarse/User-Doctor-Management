const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const config = require("../config/config");
const Doctor = require("../models/doctor");
const multer = require('multer');


// Make an Image Storage
const storage = multer.diskStorage({
  destination:(req,file,cb)=>{
    cb(null,'./doctorProfilePicture');
  },
  filename:(req,file,cb)=>{
    cb(null,Date.now() + "-" + file.originalname);
  },
})
const upload = multer({storage:storage});


// DoctorRegister
async function register(req, res) {
  try {
    const { name, email, phoneNo, specialty, hospital_name, experience, availability, password} = req.body; // Get doctor input

    // Check if doctor already exists
    let doctor = await Doctor.findOne({$or:[{email: email},{phoneNo: phoneNo}]});
    if (doctor) {
      return res.status(400).json({message:"Doctor already exists."});
    } else {
      doctor = new Doctor({name, email, phoneNo, specialty, hospital_name, experience, availability, password}); // Create a new doctor
    }

    const salt = await bcrypt.genSalt(10); // Hash the password
    doctor.password = await bcrypt.hash(password, salt);

    
    await doctor.save() // Save the doctor to  database
      .then(() => {
        res.send("Doctor Registration Successfully...");
      })
      .catch((err) => {
        res.status(404).json({ message:"Error While Registering"});
      });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error.");
  }
}


// Doctor Login
async function login(req, res) {
  try {
    const { email, phoneNo, password } = req.body;

    // Check if doctor exists
    const doctor = await Doctor.findOne({$or:[{email: email},{phoneNo: phoneNo}] });
    if (!doctor) {
      return res.status(401).json({ message:"Invalid credentials."});
    }

    //Check Password
    const isMatch = await bcrypt.compare(password, doctor.password);
    if (!isMatch) {
      return res.status(401).json({ message:"Invalid credentials."});
    }

    // Generate a token
    const token = jwt.sign({ doctor:{id:doctor.id}}, config.jwtSecret, {expiresIn: "2h"});

    res.json({ token });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error.");
  }
}


// Doctor Profile
async function getProfile(req, res) {
  try {
    const doctorId = req.doctor.id;

    const doctor = await Doctor.findById(doctorId).select('-password')// Fetch the doctor

    if (!doctor) {
      return res.status(404).json({ message:"Doctor not found."});
    }
    res.json(doctor);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error.");
  }
}


// doctor profile image upload
async function uploadProfileImage(req, res) {
  try {
    upload.single("profileImage")(req, res, async function (err) {
      if (err) {
        console.error(err.message);
        return res.status(500).json({ message: "Error uploading profile image." });
      }

      const doctorId = req.doctor.id;
      const doctor = await Doctor.findById(doctorId).select("-password");

      if (!doctor) {
        return res.status(404).json({ message: "Doctor not found." });
      }

      if (req.file) {
        doctor.profileImage = req.file.filename;
        await doctor.save();
      }

      res.json(doctor);
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error.");
  }
}



module.exports = {
  register,
  login,
  getProfile,
  uploadProfileImage,
};
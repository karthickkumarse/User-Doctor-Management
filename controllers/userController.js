const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const config = require("../config/config");
const User = require("../models/user");
const Doctor = require("../models/doctor");
const appointmentController = require("../controllers/appointmentController");
const DoctorAvailability = require("../models/doctorAvailability");
const multer = require('multer');
const Rating = require("../models/rating")


// Make an Image Storage
const storage = multer.diskStorage({
  destination:(req,file,cb)=>{
    cb(null, './userProfilePicture');
  },
  filename:(req,file,cb)=>{
    cb(null, Date.now() + "-" + file.originalname);
  },
})
const upload = multer({storage:storage});


// UserRegistration
async function register(req, res) {
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

    await user.save() // Save the user to  database
      .then(() => {
        res.send("User Registration Successfully... You may Login your profile through the Login Portal");
      })
      .catch((err) => {
        res.status(404).json({ message:"Error While Registering"});
      });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error.");
  }
}


// UserLogin
async function login(req, res) {
  try {
    const { email, phoneNo, password } = req.body;

    // Check if user exists
    const user = await User.findOne({$or:[{email: email},{phoneNo: phoneNo}]});
    if (!user) {
      return res.status(401).json({ message:"Invalid credentials."});
    }

    //Check Password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message:"Invalid credentials."});
    }

    // Generate a token
    const token = jwt.sign({ user:{id:user.id}}, config.jwtSecret, {expiresIn: "1d"});

    res.json({ token });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error.");
  }
}


// GetProfile
async function getProfile(req, res) {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId).select('-password'); // Fetch the user

    if (!user) {
      return res.status(404).json({ message:"User not found."});
    }
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error.");
  }
}


// UpdateProfile
async function updateProfile(req, res) {
  try {
    const userId = req.user.id;

    const { name, email } = req.body;

    const user = await User.findById(userId); // Fetch the user

    if (!user) {
      return res.status(404).json({message:"User not found."});
    }

    // Update the user
    user.name = name;
    user.email = email;

    await user.save();

    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error.");
  }
}


// User profile image upload
async function uploadProfileImage(req, res) {
  try {
    upload.single("profileImage")(req, res, async function (err) {
      if (err) {
        console.error(err.message);
        return res.status(500).json({ message: "Error uploading profile image." });
      }

      const userId = req.user.id;
      const user = await User.findById(userId).select("-password");

      if (!user) {
        return res.status(404).json({ message: "User not found." });
      }

      if (req.file) {
        user.profileImage = req.file.filename;
        await user.save();
      }

      res.json(user);
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error.");
  }
}


// DeleteUser
async function deleteProfile(req, res) {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId); // Fetch the user

    if (!user) {
      return res.status(404).json({message:"User not found."});
    }

    // Delete the user
    await user.deleteOne();

    res.json({ message:"User deleted."});
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error.");
  }
}


// Get all doctors
async function getAllDoctors(req, res) {
  try {
      //get params from query
    const{name,hospital_name,specialty,rating}=req.query;
    const filter={};
    if(name){
      filter.name={$regex:name,$options:"i"};
    }
    if(hospital_name){
     filter.hospital_name={$regex:hospital_name,$options:"i"};
    }
    if(specialty){
      filter.specialty={$regex:specialty,$options:"i"};
    }
    
    const doctors = await Doctor.find(filter).select('-password').select('-userAppointments').select('-profileImage')


    // Show With Availabilities
    const doctorsWithAvailabilityAndRatings=await Promise.all(doctors.map(async(doctor)=>{
        const doctorId=doctor._id;

        const doctorAvailability=await DoctorAvailability.findOne({doctorId})

        //Add Doctor Ratings In Average
        const doctorRatings=await Rating.find({doctorId});

        //calculate the rating
        let averageRating=0;
       if(doctorRatings.length > 0){
        const totalRatings=doctorRatings.reduce((sum,rating) => sum+rating.rating,0);
        averageRating=totalRatings/doctorRatings.length
       }

       if(rating && averageRating < parseFloat(rating)){
        return null;
       }
        
        return{
            doctorId:doctor.id,
            name:doctor.name,
            email:doctor.email,
            phoneNo:doctor.phoneNo,
            specialty:doctor.specialty,
            hospital_name:doctor.hospital_name,
            experience:doctor.experience,
            profileImage:doctor.profileImage,
            availability:doctorAvailability ? doctorAvailability.availability :[],
            averageRating:averageRating.toFixed(2),
        };
    }));

    const filteredRating=doctorsWithAvailabilityAndRatings.filter((doctor)=>doctor !==null);

    res.json(filteredRating);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error.");
  }
}



module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
  deleteProfile,
  getAllDoctors,
  uploadProfileImage,
  makeAppointment: appointmentController.makeAppointment,
};
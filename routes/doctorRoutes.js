const express = require('express');
const router = express();
const doctorController = require("../controllers/doctorController");
const doctorAvailability = require("../controllers/doctorAvailabilityController");
const authMiddleware = require("../middleware/authMiddleware");
const appointmentController = require("../controllers/appointmentController");
const ratingController=require("../controllers/ratingController");;


// Doctor registration
router.post("/doctorRegister", doctorController.register);

// Doctor login
router.post("/doctorLogin", doctorController.login);



// Protected routes for Doctors
router.use(authMiddleware.authenticateDoctor);

// Protected route for getting doctor details
router.get("/doctorProfile", doctorController.getProfile);

// Set Doctor availability
router.post("/availability",doctorAvailability.setDoctorAvailability);

// Set Appointment Status
router.put("/status",appointmentController.updateAppointmentStatus);

// Upload Profile Image for Doctor
router.post("/doctorProfileImage",doctorController.uploadProfileImage);

// Add Rating for User
router.post("/ratings/user",ratingController.addDoctorRating);



module.exports = router;
const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const appointmentController = require("../controllers/appointmentController");
const authMiddleware = require("../middleware/authMiddleware");
const ratingController=require("../controllers/ratingController");


// User registration
router.post("/userRegister", userController.register);

// User login
router.post("/userLogin", userController.login);



// Protected routes for Users
router.use(authMiddleware.authenticateUser);

// Protected route for getting user details
router.get("/userProfile", userController.getProfile);

//Protected route to see Doctor Details
router.get("/doctors", userController.getAllDoctors);

// Protected route for updating user details
router.put("/profile", userController.updateProfile);

// Protected route for deleting a user
router.delete("/profile", userController.deleteProfile);

// Upload Profile Image for User
router.post("/userProfileImage",userController.uploadProfileImage);

// Route for Appointments
router.get("/appointments", appointmentController.makeAppointment);

// Add Rating for Doctor
router.post("/ratings/doctor",ratingController.addUserRating);



module.exports = router;
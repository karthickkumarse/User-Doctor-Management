const express=require('express');
const router=express();
const adminController=require('../controllers/adminController');
const authMiddleware=require('../middleware/authMiddleware');

//admin registration
router.post('/adminRegister',adminController.register);

//admin login
router.post('/adminLogin',adminController.login);



//protected route for admin
router.use(authMiddleware.authenticateAdmin);

router.get('/adminProfile',adminController.getProfile);

router.get('/users',adminController.getAllUsers);

router.get('/doctors',adminController.getAllDoctors);

router.get('/appointments',adminController.getAllAppointments);

router.get('/ratings',adminController.getAllRatings);

router.post('/changeDoctorPassword',adminController.changeDoctorPassword);

router.post('/changeUserPassword',adminController.changeUserPassword);

router.delete('/deleteUser',adminController.deleteUser);

router.delete('/deleteDoctor',adminController.deleteDoctor);

router.put('/updateUser',adminController.updateUser);

router.put('/updateDoctor',adminController.updateDoctor);

router.post('/createUser',adminController.createUserByAdmin);

router.post('/createDoctor',adminController.createDoctorByAdmin);



module.exports=router;
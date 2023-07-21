const User = require("../models/user");
const Doctor = require("../models/doctor");
const Appointment = require("../models/appointment");
const DoctorAvailability = require("../models/doctorAvailability");
const nodemailer=require('nodemailer');
require('dotenv').config();


// MakeAppointments
async function makeAppointment(req, res) {
  try {
    const { doctorId, date, time } = req.body;
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found." });
    }

    // Check doctor's availability
    const doctorAvailability = await DoctorAvailability.findOne({ doctorId });
    if (!doctorAvailability) {
      return res.status(404).json({ message: "Doctor's availability not found." });
    }

    const selectedDateAvailability = doctorAvailability.availability.find(
      (availability) => availability.date.toDateString() === new Date(date).toDateString()
    );

    if (!selectedDateAvailability) {
      return res.status(400).json({ message: "Doctor is not available on the selected date." });
    }

    const selectedTimeSlot = selectedDateAvailability.slots.find(
      (slot) => slot.time === time && slot.isAvailable
    );

    if (!selectedTimeSlot) {
      return res.status(400).json({ message: "The selected time slot is not available." });
    }

    const appointment = new Appointment({
      userId: userId,
      doctorId: doctorId,
      date: date,
      time: time,
      status:"Pending", // Make status in pending as default
    });

    await appointment.save();

    // Store the appointment to user's appointments
    user.appointments.push(appointment);
    await user.save();

    // Store the appointment to doctor's appointments
    doctor.userAppointments.push(appointment);
    await doctor.save();

    // Update the availability status of selected time slot
    selectedTimeSlot.isAvailable = false;
    await doctorAvailability.save();

    user.appointments.push(appointment.status);
    
    //send email notification to doctor
    const transporter=nodemailer.createTransport({
      host:'smtp.mailtrap.io',
      port:2525,
      auth:{
        user:process.env.YOUR_EMAIL,
        pass:process.env.YOUR_PASSWORD,
      }
    });

    const mailOptions={
      from:user.email,
      to:doctor.email,
      subject:"New Appointment Request",
      text:`Dear ${doctor.name},\n\n You have received a new Appointment Request from User \n\n Appointment Details:\n Name:${user.name}\n Date:${date}\n Time:${time}`
    };

    transporter.sendMail(mailOptions,(err,info)=>{
      if(err){
        console.error("Email sending error:",err);
      }else{
        console.log("Email sent:",info.response,info.envelope);
      }
    })

    res.json({ message: "Appointment made successfully.", appointment });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error.");
  }
}


// UpdateAppointmentStatus
async function updateAppointmentStatus(req,res){
  try{
    const {appointmentId,status}=req.body;

    
    const appointment=await Appointment.findById(appointmentId);
    if(!appointment){
      return res.status(404).json({message:"Appointment not found"});
    }
    appointment.status=status;
    await appointment.save();

    // Push the Status to user
    const user=await User.findById(appointment.userId);
    if(!user){
      return res.status(404).json({message:"User not found"});
    }
    const userAppointment=user.appointments.find((appt)=>appt._id.toString()===appointmentId);
    if(!userAppointment){
      return res.status(404).json({message:"User appointment not found"});
    }
    userAppointment.status=status;
    await user.save();

    //send email notification to user
    const transporter=nodemailer.createTransport({
      host:'smtp.mailtrap.io',
      port:2525,
      auth:{
        user:process.env.YOUR_EMAIL,
        pass:process.env.YOUR_PASSWORD,
      }
    });

    const doctor=await Doctor.findById(appointment.doctorId);
    if(!doctor){
      return res.status(404).json({message:"Doctor not found"});
    }

    const mailOptions={
      from:doctor.email,
      to:user.email,
      subject:"New Update from Doctor for your Appointment",
      text:`Dear ${user.name}, \n\n You have received a Appointment update from Doctor \n\n Status of Your Appointment:${status}`
    };

    transporter.sendMail(mailOptions,(err,info)=>{
      if(err){
        console.error("Email sending error:",err);
      }else{
        console.log("Email sent:",info.response,info.envelope);
      }
    })

    res.json({message:"Appointment status updated successfully.",appointment})
  }catch(err){
    console.error(err.message);
    res.status(500).send("Server error");
  }
}


// CancelAppointment
async function cancelAppointment(req, res) {
  try {
    const {appointmentId} = req.body;

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found." });
    }

    // Remove the appointment from user's appointments
    const user = await User.findById(appointment.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }
    user.appointments = user.appointments.filter((appt) => appt._id.toString() !== appointmentId);
    await user.save();

    // Remove the appointment from doctor's appointments
    const doctor = await Doctor.findById(appointment.doctorId);
    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found." });
    }
    doctor.userAppointments = doctor.userAppointments.filter((appt) => appt._id.toString() !== appointmentId);
    await doctor.save();

    // Update the availability status of the appointment's time slot
    const doctorAvailability = await DoctorAvailability.findOne({ doctorId: appointment.doctorId });
    if (!doctorAvailability) {
      return res.status(404).json({ message: "Doctor's availability not found." });
    }
    const selectedDateAvailability = doctorAvailability.availability.find(
      (availability) => availability.date.toDateString() === appointment.date.toDateString()
    );
    if (!selectedDateAvailability) {
      return res.status(400).json({ message: "Doctor's availability for the appointment not found." });
    }
    const selectedTimeSlot = selectedDateAvailability.slots.find(
      (slot) => slot.time === appointment.time
    );
    if(selectedTimeSlot){
      selectedTimeSlot.isAvailable=true,
      await doctorAvailability.save();
    }

    // Remove the appointment
    await Appointment.findByIdAndRemove(appointmentId);

    const transporter=nodemailer.createTransport({
      host:'smtp.mailtrap.io',
      port:2525,
      auth:{
        user:process.env.YOUR_EMAIL,
        pass:process.env.YOUR_PASSWORD,
      }
    });

    const mailOptions={
      from:user.email,
      to:doctor.email,
      subject:"Appointment Update",
      text:`Dear ${doctor.name},\n\n ${user.name} Cancelled his Appointment`,
    };
    const mailOptionsSelf={
      from:user.email,
      to:user.email,
      subject:"Appointment Update",
      text:`Dear ${user.name},\n\n You have Successfully Cancelled your Appointment`
    };

    transporter.sendMail(mailOptions,(err,info)=>{
      if(err){
        console.error("Email sending error:",err.message);
      }else{
        console.log("Email sent:",info.response,info.envelope);
      }
    })

    transporter.sendMail(mailOptionsSelf,(err,info)=>{
      if(err){
        console.error("Email sending error:",err.message);
      }else{
        console.log("Email sent:",info.response,info.envelope);
      }
    })

    res.json({ message: "Appointment cancelled successfully." });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error.");
  }
}



module.exports = {
  makeAppointment,
  updateAppointmentStatus,
  cancelAppointment,
};
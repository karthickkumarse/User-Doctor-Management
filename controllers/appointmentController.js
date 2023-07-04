const User = require("../models/user");
const Doctor = require("../models/doctor");
const Appointment = require("../models/appointment");
const DoctorAvailability = require("../models/doctorAvailability");


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
      status:"Pending",
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
    

    res.json({message:"Appointment status updated successfully.",appointment})
  }catch(err){
    console.error(err.message);
    res.status(500).send("Server error")
  }
}



module.exports = {
  makeAppointment,
  updateAppointmentStatus,
};
const Doctor = require("../models/doctor")
const DoctorAvailability = require("../models/doctorAvailability")


// Doctor Availability
async function setDoctorAvailability(req, res) {
    try {
      const doctorId = req.doctor.id;
      const { availability } = req.body;
  
      const doctor = await Doctor.findById(doctorId);
      if (!doctor) {
        return res.status(404).json({ message: "Doctor not found." });
      }
  
      let doctorAvailability = await DoctorAvailability.findOne({ doctorId: doctorId });
      if (!doctorAvailability) {
        doctorAvailability = new DoctorAvailability({
          doctorId: doctorId,
          availability: [],
        });
      }
  
      doctorAvailability.availability = availability;
      await doctorAvailability.save();
  
      res.json({ message: "Doctor availability set successfully.", doctorAvailability });
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server error.");
    }
  }


  
  module.exports = {
    setDoctorAvailability,
  };
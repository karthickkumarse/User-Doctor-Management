const mongoose = require('mongoose');
const doctorAvailabilitySchema=new mongoose.Schema({
    doctorId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Doctor"
    },
    availability: [
        {
          date: {
            type: Date,
            required: true,
          },
          slots: [
            {
              time: {
                type: String,
                required: true,
              },
              isAvailable: {
                type: Boolean,
                default: true,
              },
            },
          ],
        },
      ],
});



module.exports = mongoose.model("DoctorAvailability",doctorAvailabilitySchema);
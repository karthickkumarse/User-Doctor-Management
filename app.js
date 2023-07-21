const express = require("express");
const app = express();
app.use(express.json());


//Routes for Admin
const adminRoutes=require("./routes/adminRoutes");
app.use("/api/admin",adminRoutes);


// Routes for Users
const userRoutes = require("./routes/userRoutes");
app.use("/api/users", userRoutes);


// Routes for Doctors
const doctorRoutes = require("./routes/doctorRoutes");
app.use("/api/doctors", doctorRoutes);


// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on PORT ${PORT} . . .`);
});

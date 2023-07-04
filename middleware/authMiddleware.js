const jwt = require("jsonwebtoken");
const config = require("../config/config");


function authenticateUser(req, res, next) {
  // Get the token from the request header
  const token = req.header("Authorization");

  if (!token) {
    return res.status(401).json({ message: "Access denied.Token missing." });
  }

  try {
    const decoded = jwt.verify(token, config.jwtSecret);

    req.user = decoded.user;

    // Proceed to the next middleware/route
    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid token." });
  }
}


function authenticateDoctor(req, res, next) {
  // Get the token from the request header
  const token = req.header("Authorization");

  if (!token) {
    return res.status(401).json({ message: "Access denied.Token missing." });
  }

  try {
    const decoded = jwt.verify(token, config.jwtSecret);

    req.doctor = decoded.doctor;

    // Proceed to the next middleware/route
    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid token." });
  }
}



module.exports = {
  authenticateUser,
  authenticateDoctor,
};
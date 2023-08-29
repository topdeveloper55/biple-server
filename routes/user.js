var express = require("express"),
  router = express.Router(),
  verifyToken = require('../middlewares/authJWT'),
  {
    signup,
    signin,
    generateOTP,
    disableOTP,
    validateOTP,
    verifyOTP,
    checkEmail,
    updateUser,
    getUser
  } = require("../controllers/auth.controller.js");

router.post("/register", signup);
router.post("/checkmail", checkEmail)
router.post("/login", signin);
router.post("/update", verifyToken, updateUser)
router.post("/getuser", verifyToken, getUser)

router.get("/hiddencontent", verifyToken, function (req, res) {
  if (!req.user) {
    res.status(403)
      .send({
        message: "Invalid JWT token"
      });
  }
  if (req.user.role == "admin") {
    res.status(200)
      .send({
        message: "Congratulations! but there is no hidden content"
      });
  } else {
    res.status(403)
      .send({
        message: "Unauthorised access"
      });
  }
});
router.post("/otp/generate", verifyToken, generateOTP)
router.post("/otp/verify", verifyToken, verifyOTP)
router.post("/otp/validate", verifyToken, validateOTP)
router.post("/otp/disable", verifyToken, disableOTP)

module.exports = router;
var express = require("express"),
  router = express.Router(),
  verifyToken = require('../middlewares/authJWT'),
  {
    createServer,
    getServersBySearch,
    getServersByUser,
    joinServer,
    leaveServer,
    updateServer,
    deleteServer,
    updatePin
  } = require("../controllers/community.controller.js");

router.get("/user", verifyToken, getServersByUser);
router.get("/search", verifyToken, getServersBySearch);
router.post("/create", verifyToken, createServer);
router.post("/join", verifyToken, joinServer);
router.post("/leave", verifyToken, leaveServer);
router.post("/update", verifyToken, updateServer);
router.post("/delete", verifyToken, deleteServer);
router.post("/pin", verifyToken, updatePin);

module.exports = router;
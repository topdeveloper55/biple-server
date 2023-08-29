var jwt = require("jsonwebtoken");
var bcrypt = require("bcrypt");
var User = require("../models/user");
var Community = require("../models/community");
var speakeasy = require("speakeasy");

const addUser = (req, res, community = null) => {
  const user = new User({
    userName: req.body.userName,
    email: req.body.email,
    role: req.body.role,
    password: bcrypt.hashSync(req.body.password, 8),
    referralCode: req.body.referralCode,
  });

  user.save((err, user) => {
    if (err) {
      res.status(500).send({
        message: err,
      });
      return;
    } else {
      res.status(200).send({
        message: "User Registered successfully",
        community,
      });
    }
  });
};

exports.signup = (req, res) => {
  const referral = req.body.referral;
  if (referral) {
    Community.findOne({
      inviteLink: referral,
    }).exec((err, community) => {
      if (err) {
        res.status(500).send({
          message: err,
        });
        return;
      }
      if (!community) {
        return res.status(404).send({
          message: "Community not found with the referral link!",
        });
      }
      addUser(req, res, community);
    });
  } else {
    addUser(req, res);
  }
};
exports.checkEmail = (req, res) => {
  const { email } = req.body
  if (email) {
    User.findOne({
      email: email
    }).exec((err, user) => {
      if (err) {
        return res.status(500).send({
          message: err
        })
      }
      if (user) {
        return res.status(501).send({
          message: "Emall is already exist"
        })
      }
      return res.status(200).send({ available: true })
    })
  }
  else {
    res.status(500).send({
      message: err
    })
  }
}
const _signIn = (req, res, community = null) => {
  User.findOne({
    userName: req.body.userName,
  }).exec((err, user) => {
    if (err) {
      res.status(500).send({
        message: err,
      });
      return;
    }
    if (!user) {
      return res.status(404).send({
        message: "User Not found.",
      });
    }

    //comparing passwords
    var passwordIsValid = bcrypt.compareSync(req.body.password, user.password);
    // checking if password was valid and send response accordingly
    if (!passwordIsValid) {
      return res.status(401).send({
        accessToken: null,
        message: "Invalid Password!",
      });
    }
    //signing token with user id
    var token = jwt.sign(
      {
        id: user.id,
      },
      process.env.API_SECRET,
      {
        expiresIn: 86400,
      }
    );

    //responding to client request with user profile success message and  access token .
    res.status(200).send({
      user: {
        id: user._id,
        email: user.email,
        userName: user.userName,
        referralCode: user.referralCode,
        walletAddress: user.walletAddress,
        showNft: user.showNft,
        getAlerted: user.getAlerted,
        otp_auth_url: user.otp_auth_url,
        otp_enabled: user.otp_enabled,
        otp_base32: user.otp_base32,
        twitter: user.twitter,
        instagram: user.instagram,
        facebook: user.facebook,
        privateNoti: user.privateNoti,
        smartNoti: user.smartNoti,
        language: user.language
      },
      message: "Login successfull",
      accessToken: token,
      community,
    });
  });
};
exports.signin = (req, res) => {
  const referral = req.body.referral;
  if (referral) {
    Community.findOne({
      inviteLink: referral,
    }).exec((err, community) => {
      if (err) {
        res.status(500).send({
          message: err,
        });
        return;
      }
      if (!community) {
        return res.status(404).send({
          message: "Community not found with the referral link!",
        });
      }
      _signIn(req, res, community);
    });
  } else {
    console.log("before login");
    _signIn(req, res);
    console.log("after login")
  }
};
exports.updateUser = async (req, res) => {
  const data = req.body
  const user = req.user
  for (const property in data) {
    user[property] = data[property]
  }
  user.save((err, userData) => {
    if (err) {
      res.status(500).send({
        message: err,
      });
      return;
    } else {
      res.status(200).json({
        status: true,
        user: userData,
      });
    }
  });
}
exports.getUser = async(req, res) => {
  const {userName} = req.body
  User.findOne({userName}).exec((err, userData) => {
    if (err) {
      res.status(500).send({
        message: err,
      });
      return;
    } else {
      res.status(200).json({
        status: true,
        user: userData,
      });
    }
  })
}
exports.generateOTP = async (req, res) => {
  try {
    let user = req.user;
    const { generating } = req.body
    if (generating) {
      const { ascii, hex, base32, otpauth_url } = speakeasy.generateSecret({
        issuer: "Biples",
        name: user.email,
        length: 15,
      });
      user.otp_ascii = ascii;
      user.otp_auth_url = otpauth_url;
      user.otp_base32 = base32;
      user.otp_hex = hex;
    }
    else user.otp_enabled = true;
    user.save((err, userData) => {
      if (err) {
        res.status(500).send({
          message: err,
        });
        return;
      } else {
        res.status(200).json({
          base32: userData.otp_base32,
          otpauth_url: userData.otp_auth_url,
        });
      }
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

exports.verifyOTP = async (req, res) => {
  try {
    const user = req.user;
    const { token } = req.body;
    const message = "Token is invalid";
    const verified = speakeasy.totp.verify({
      secret: user.otp_base32,
      encoding: "base32",
      token,
    });

    if (!verified) {
      return res.status(401).json({
        status: "fail",
        message,
      });
    }

    user.otp_verified = true;
    user.save((err, data) => {
      if (err) {
        res.status(500).send({
          message: err,
        });
        return;
      } else {
        res.status(200).json({
          status: "success",
        });
      }
    });
  } catch (e) {
    res.status(500).json({
      status: "error",
      message: e.message,
    });
  }
};

exports.validateOTP = async (req, res) => {
  try {
    const { token } = req.body;
    const user = req.user;
    const message = "Verification code is invalid";
    const validToken = speakeasy.totp.verify({
      secret: user.otp_base32,
      encoding: "base32",
      token,
      window: 1,
    });
    if (!validToken) {
      return res.status(401).json({
        status: "fail",
        message,
      });
    }
    res.status(200).json({
      status: "success",
    });
  } catch (e) {
    res.status(500).json({
      status: "error",
      message: e.message,
    });
  }
};

exports.disableOTP = async (req, res) => {
  try {
    const user = req.user;
    user.otp_enabled = false;
    user.save((err, data) => {
      if (err) {
        res.status(500).send({
          message: err,
        });
        return;
      } else {
        res.status(200).json({
          status: "success",
        });
      }
    });
  } catch (e) {
    res.status(500).json({
      status: "error",
      message: e.message,
    });
  }
};

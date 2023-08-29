var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/**
 * User Schema
 */
var userSchema = new Schema({
  userName: {
    type: String,
    required: [true, "username not provided "],
    unique: [true, "username already exists in database!"],
    trim: true,
  },
  email: {
    type: String,
    unique: [true, "email already exists in database!"],
    lowercase: true,
    trim: true,
    required: [true, "email not provided"],
    validate: {
      validator: function (v) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      },
      message: '{VALUE} is not a valid email!'
    }

  },
  role: {
    type: String,
    enum: ["normal", "admin"],
    required: [true, "Please specify user role"]
  },
  password: {
    type: String,
    required: true
  },
  created: {
    type: Date,
    default: Date.now
  },
  referrer: { type: Schema.Types.ObjectId, ref: 'User' },
  referralCode: {
    type: String,
    unique: [true, "referral code is already exists"],
    required: [true, "referral code is not provided"],
  },
  referredTo: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  otp_enabled: {
    type: Boolean,
    default: false
  },
  otp_verified: {
    type: Boolean,
    default: false
  },
  otp_ascii: String,
  otp_hex: String,
  otp_base32: String,
  otp_auth_url: String,
  nft_visible: {
    type: Boolean,
    default: false
  },
  offer_alerted: {
    type: Boolean,
    default: false
  },
  walletAddress: {
    type: String,
    default: ''
  },
  showNft: {
    type: Boolean,
    default: false
  },
  getAlerted: {
    type: Boolean,
    default: false
  },
  twitter: {
    type: String,
    default: ''
  },
  facebook: {
    type: String,
    default: ''
  },
  instagram: {
    type: String,
    default: ''
  },
  language: {
    type: String,
    default: 'English'
  },
  privateNoti: {
    type: Boolean,
    default: true
  },
  smartNoti: {
    type: Boolean,
    default: false
  }
});

module.exports = mongoose.model('User', userSchema);
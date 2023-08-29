var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/**
 * Community Schema
 */
var communitySchema = new Schema({
  serverName: {
    type: String,
    required: [true, "servername not provided "],
    unique: [true, "servername already exists in database!"],
    trim: true,
  },
  description: {
    type: String,
    required: [true, "description not provided"],
  },
  image: {
    type: String,
    required: [true, "server image not provided"]
  },
  background: {
    type: String,
    required: [true, "background image not provided"]
  },
  twitter: {
    type: String,
    lowercase: true,
    trim: true,
    required: [true, "twitter link not provided"],
  },
  medium: {
    type: String,
    lowercase: true,
    trim: true,
  },
  website: {
    type: String,
    lowercase: true,
    trim: true,
  },
  inviteLink: {
    type: String,
    trim: true,
    required: [true, "invitation link not provided"],
  },
  network: {
    type: String,
    enum: ["eth", "sol"],
    required: [true, "Please specify network"]
  },
  created: {
    type: Date,
    default: Date.now
  },
  admin: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, "Please provide the admin of the community"]
  },
  joined: [{user: { type: Schema.Types.ObjectId, ref: 'User' }, date: Date, ping: Boolean}],
  verified: {
    type: Boolean,
    default: false,
  },
  roomId: {
    type: String,
    required: [true, "Please provide the room id"]
  },
  announcement: {
    type: String,
    required: [true, "Please provide the announcement room id"]
  },
  access: {
    type: String,
    default: 'public'
  },
  visibleTabs: {
    type: [String],
    default: []
  }
});

module.exports = mongoose.model('Community', communitySchema);
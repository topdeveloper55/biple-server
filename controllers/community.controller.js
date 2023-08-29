const Community = require("../models/community");
const fs = require('fs');
const path = require('path');

const isJoined = (user, joinedArr) => {
  let res = false;
  for (let i=0; i < joinedArr.length; i++) {
      if (joinedArr[i].user.toString() == user) {
          res = true;
          break;
      }
  }
  return res;
}

exports.createServer = async (req, res) => {
  try {
    const img = req.body.image
    const backImg = req.body.background
    const image = img.url
    const background = backImg.url
    const community = new Community({
      serverName: req.body.serverName,
      description: req.body.description,
      image: image,
      twitter: req.body.twitter,
      medium: req.body.medium,
      website: req.body.website,
      inviteLink: req.body.inviteLink,
      network: req.body.network,
      admin: req.user._id,
      joined: [{user: req.user._id, date: Date.now(), ping: false}],
      background: background,
      roomId: req.body.roomId,
      announcement: req.body.announcement
    });

    community.save((err, community) => {
      if (err) {
        console.log("error->>", err);
        res.status(500)
          .send({
            message: err
          });
        return;
      } else {
        res.status(200)
          .send({
            message: "Created a community successfully!"
          })
      }
    });
  } catch (e) {
    return res.status(500).send({
      message: "can't save file"
    })
  }
};

exports.updatePin = async (req, res) => {
  try {
    const communityId = req.body.id;
    const userId = req.user._id;
    const community = await Community.findById(communityId)
    if (community === null) {
      return res.status(500)
        .send({
          message: "Can't find community where you want to update pin!"
        });
    }
    if(!isJoined(userId, community.joined)) {
      return res.status(500)
      .send({
        message: "You didn't join to the communitiy!"
      });
    }
    for(let i = 0; i < community.joined.length ; i ++) {
      if(community.joined[i].user.toString() == userId.toString()) {
        community.joined[i].date = Date.now()
        community.joined[i].ping = !community.joined[i].ping;
        break
      }
    }
    community.save((err, data) => {
      if (err) {
        res.status(500)
          .send({
            message: err
          });
        return;
      } else {
        Community.find({ "joined": {$elemMatch: {user: userId}} }).exec((err, communities) => {
          if (err) {
            res.status(500)
              .send({
                message: err
              });
            return;
          }
          return res.json(communities)
        })
      }
    });
  } catch(e) {
    return res.status(500).send({
      message: "can't update pin"
    });
  }
}

exports.verifyServer = (req, res) => {

}

exports.getServersByUser = (req, res) => {
  const { userId } = req.query
  if (userId === undefined) return res.status(500).send({
    message: "UserId is not provided"
  })
  Community.find({ "joined": {$elemMatch: {user: userId}} }).exec((err, communities) => {
    if (err) {
      res.status(500)
        .send({
          message: err
        });
      return;
    }
    return res.json(communities)
  })
}

exports.getServersBySearch = (req, res) => {
  const { searchString } = req.query
  Community.find({ 'serverName': { $regex: new RegExp(searchString, 'i') } }).exec((err, communities) => {
    if (err) {
      res.status(500)
        .send({
          message: err
        });
      return;
    }
    return res.json(communities)
  })
}

exports.joinServer = async (req, res) => {
  const communityId = req.body.communityId
  const userId = req.user._id

  const community = await Community.findById(communityId)
  if (community === null)
    return res.status(500)
      .send({
        message: "Can't find community where you want to join!"
      });
  if (isJoined(userId, community.joined)) {
    return res.status(409)
      .send({
        message: "you have already joined to the community!"
      })
  }
  community.joined.push({user: userId, date: Date.now(), ping: false})
  community.save((err, community) => {
    if (err) {
      res.status(500)
        .send({
          message: err
        });
      return;
    } else {
      res.status(200)
        .send({
          message: "Joined to the community successfully!"
        })
    }
  });
}

exports.updateServer = async (req, res) => {
  const communityId = req.body.id
  const userId = req.user._id
  const { name, description, access, background, twitter, medium, website, visibleTabs } = req.body
  const community = await Community.findById(communityId)
  if (community === null)
    return res.status(404)
      .send({
        message: "Can't find community what you want to update!"
      });
  if (community.admin.toString() !== userId.toString()) {
    return res.status(500).send({
      message: "You don't have permission to update the server!"
    })
  }
  community.name = name
  community.description = description
  community.access = access
  community.background = background
  community.twitter = twitter
  community.medium = medium
  community.website = website
  community.visibleTabs = visibleTabs
  community.save((err, data) => {
    if (err) {
      res.status(500)
        .send({
          message: err
        });
      return;
    } else {
      res.status(200)
        .json(data)
    }
  });
}

exports.leaveServer = async (req, res) => {
  const communityId = req.body.communityId
  const userId = req.user._id
  const community = await Community.findById(communityId)
  if (community === null)
    return res.status(500)
      .send({
        message: "Can't find community where you want to leave!"
      });
  if (!community.joined.includes(userId)) {
    return res.status(409)
      .send({
        message: "you haven't joined to the community yet!"
      })
  }
  community.joined = community.joined.filter(id => id.toString() !== userId.toString())
  community.save((err, community) => {
    if (err) {
      res.status(500)
        .send({
          message: err
        });
      return;
    } else {
      res.status(200)
        .send({
          message: "Left the community successfully!"
        })
    }
  });
}

exports.deleteServer = async (req, res) => {
  const communityId = req.body.communityId
  const userId = req.user._id
  const community = await Community.findById(communityId)
  if (community === null)
    return res.status(500)
      .send({
        message: "Can't find community where you want to leave!"
      });

  if (community.admin.toString() !== userId.toString()) {
    return res.status(500).send({
      message: "You don't have permission to  the server!"
    })
  }
  if (!community.joined.includes(userId)) {
    return res.status(409)
      .send({
        message: "you haven't joined to the community yet!"
      })
  }
  community.remove((err) => {
    if (err) {
      res.status(500)
        .send({
          message: err
        });
      return;
    }
    return res.status(200)
      .send({
        message: "Deleted the server successfully!"
      })
  });
}
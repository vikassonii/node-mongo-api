import express from "express";
import User from "../models/User.js";
import bcrypt from "bcrypt";

const router = express.Router();

//update user
router.put("/:id", async (req, res) => {
  if (req.body.userId === req.params.id || req.body.isAdmin) {
    if (req.body.password) {
      try {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(req.body.password, salt);
      } catch (err) {
        res.status(500).json(`Internal server error: ${err}`);
      }
    }
    try {
      const user = await User.findByIdAndUpdate(req.params.id, {
        $set: req.body,
      });
      res.status(200).send(`Account updated successfully`);
    } catch (err) {
      res.status(500).json(`Internal server error: ${err}`);
    }
  } else {
    res.status(403).send("you can update only your account");
  }
});
//delete user
router.delete("/:id", async (req, res) => {
  if (req.body.userId === req.params.id || req.body.isAdmin) {
    try {
      const user = await User.findByIdAndDelete(req.params.id);
      res.status(200).send(`Account deleted successfully`);
    } catch (err) {
      res.status(500).json(`Internal server error: ${err}`);
    }
  } else {
    res.status(403).send("you can delete only your account");
  }
});
//get a user
router.get("/:id", async (req, res) => {
  if (req.params.id) {
    try {
      const user = await User.findById(req.params.id);
      const { password, updatedAt, ...others } = user._doc;
      res.status(200).json(others);
    } catch (err) {
      res.status(500).json(`Internal server error: ${err}`);
    }
  } else {
    res.status(403).send("you can delete only your account");
  }
});
//follow user
router.put("/:id/follow", async (req, res) => {
  if (req.body.userId !== req.params.id) {
    try {
      const user = await User.findById(req.params.id);
      const currentuser = await User.findById(req.body.userId);

      if (!user.followers.includes(req.body.userId)) {
        await user.updateOne({ $push: { followers: req.body.userId } });
        await currentuser.updateOne({ $push: { followings: req.params.id } });
        res.status(200).send(`user has been followed successfully`);
      } else {
        res.status(403).send(`you are already following`);
      }
    } catch (err) {
      res.status(500).json(`Internal server error: ${err}`);
    }
  } else {
    res.status(403).send("you can not follow yourself");
  }
});
//unfollow user
router.put("/:id/unfollow", async (req, res) => {
  if (req.body.userId !== req.params.id) {
    try {
      const user = await User.findById(req.params.id);
      const currentuser = await User.findById(req.body.userId);

      if (user.followers.includes(req.body.userId)) {
        await user.updateOne({ $pull: { followers: req.body.userId } });
        await currentuser.updateOne({ $pull: { followings: req.params.id } });
        res.status(200).send(`user has been unfollowed successfully`);
      } else {
        res.status(403).send(`you are not following the user`);
      }
    } catch (err) {
      res.status(500).json(`Internal server error: ${err}`);
    }
  } else {
    res.status(403).send("you can not unfollow yourself");
  }
});

export default router;

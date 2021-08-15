import express from "express";
import Post from "../models/Post.js";
import User from "../models/User.js";

const router = express.Router();

//create post
router.post("/", async (req, res) => {
  const newPost = new Post(req.body);

  try {
    const savedPost = await newPost.save();
    res.status(201).json(savedPost);
  } catch (err) {
    res.status(500).json(`Internal server error ${err}`);
  }
});

//update post
router.put("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (post.userId === req.params.id) {
      const updatePost = await Post.updateOne({ $set: req.body });
      res.status(200).json(updatePost);
    } else {
      res.status(403).json("you can update your posts only");
    }
  } catch (err) {
    res.status(500).json(`Internal server error ${err}`);
  }
});
//delete post
router.delete("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (post.userId === req.params.id) {
      const updatePost = await Post.findByIdAndDelete(req.params.id);
      res.status(200).json("post has been deleted");
    } else {
      res.status(403).json("you can delete your posts only");
    }
  } catch (err) {
    res.status(500).json(`Internal server error ${err}`);
  }
});
//get a post
router.get("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    res.status(200).json(post);
  } catch (err) {
    res.status(500).json(`Internal server error ${err}`);
  }
});
//like/dislike a post
router.put("/:id/like", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post.likes.includes(req.body.userId)) {
      await Post.updateOne({ $push: { likes: req.body.userId } });
      res.status(200).json("post has been liked");
    } else {
      await Post.updateOne({ $pull: req.body.userId });
      res.status(200).json("post has been disliked");
    }
  } catch (err) {
    res.status(500).json(`Internal server error ${err}`);
  }
});
//get timeline posts
router.get("/timeline/all", async (req, res) => {
  try {
    const currentUser = await User.findById(req.body.userId);
    const userPosts = await Post.find({ userId: currentUser._id });
    const friendsPosts = await Promise.all(
      currentUser.followings.map((friendId) => {
        return Post.find({ userId: friendId });
      })
    );
    res.status(200).json(userPosts.concat(...friendsPosts));
  } catch (err) {
    res.status(500).json(`Internal server error ${err}`);
  }
});

export default router;

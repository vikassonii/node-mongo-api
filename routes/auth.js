import express from "express";
import User from "../models/User.js";
import bcrypt from "bcrypt";
const router = express.Router();

//REGISTER NEW USER
router.post("/register", async (req, res) => {
  try {
    //Generate hashed password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    const newUser = await new User({
      username: req.body.username,
      email: req.body.email,
      password: hashedPassword,
    });

    const user = await newUser.save();
    res.status(201).send(user);
  } catch (err) {
    res.status(500).send(`Internal Server Error: ${err}`);
  }
});

//LOGIN A USER
router.post("/login", async (req, res) => {
  try {
    //Check Valid User
    const user = await User.findOne({ email: req.body.email });
    !user && res.status(404).send("user not found");

    //Check Valid Password
    const validPassword = await bcrypt.compare(
      req.body.password,
      user.password
    );
    !validPassword && res.status(404).send("wrong password");

    res.status(200).send(user);
  } catch (err) {
    res.status(500).send(`Internal Server Error: ${err}`);
  }
});

export default router;

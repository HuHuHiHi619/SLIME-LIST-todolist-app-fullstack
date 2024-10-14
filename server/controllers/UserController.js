const User = require("../Models/User");
const LoginHistory = require("../Models/loginHistory");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");
const { upload, UPLOADS_DIR } = require("../middleware/upload");
const path = require("path");
const { isValidObjectId , Types} = require("mongoose");
const { handleError } = require("./helperController");

const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET;
const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET;

// Register
exports.register = async (req, res) => {
  upload(req, res, async (error) => {
    if (error) {
      console.error("File upload error:", error);
      return res.status(400).json({ error: error.message });
    }
  });
  console.log("Recieved data:", req.body);
  console.log("Recieved file:", req.file);
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // ถ้า errors ไม่ empty
      console.log("Validation errors:", errors.array);
      return res.status(400).json({ error: errors.array() });
    }
    const { username, password,theme,notification,lastCompleted} = req.body;
    const lastCompletedDate = lastCompleted ? new Date(lastCompleted) : null
    console.log("Recieved data:", req.body, req.file);

    if (!password) {
      return res.status(400).json({ error: "Password is required" });
    }

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      console.error("User already exists!");
      return res.status(400).json({ error: "User already exists" });
    }
    let imageProfile = null;
    if (req.file) {
      imageProfile = path.join(UPLOADS_DIR, req.file.filename);
    }
    
    // create new user
    const newUser = new User({
      username,
      password,
      settings: {
        theme: theme || "dark",
        notification: notification !== undefined ? notification : true,
      },
      imageProfile: imageProfile || null,
      lastCompleted: lastCompletedDate
    });
    await newUser.save();

    res.status(201).send({
      message: "User registered succussfully",
      username: username,
      imageProfile: imageProfile || null,
      lastCompleted:lastCompletedDate || null
    });
  } catch (error) {
    console.error("Server error during registeration:", error);
    res.status(500).send("Server Error");
  }
};

// Login
exports.login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).send({ error: errors.array() });
    }
    const { username, password } = req.body;

    const user = await User.findOne({ username });
    console.log("Password from database:", user.password);

    if (!user) {
      return res.status(400).json({ error: "Invalid credentials 1" });
    }
    
    const isMatch = await bcrypt.compare(password, user.password);
    
    if (!isMatch) {
      console.log("Password is not match");
      return res.status(400).json({ error: "Invalid credentials , password" });
    }
    
    const payload = { userId: user._id };
    const accessToken = jwt.sign(payload, accessTokenSecret, {
      expiresIn: "15m",
      algorithm: "HS256",
    });
    const refreshToken = jwt.sign(payload, refreshTokenSecret, {
      expiresIn: "7d",
    });
   

    // check history
    const loginHistoryEntry = new LoginHistory({
      userId: user._id,
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
    });
    await loginHistoryEntry.save();
    console.log("Login history saved:");

    res.cookie('accessToken',accessToken,{
      httpOnly: true,
      secure:false,
      samesite: 'lax',
      maxAge: 15 * 60 * 1000 // 15m
    });

    res.cookie('refreshToken',refreshToken,{
      httpOnly: true,
      secure:false,
      samesite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7d
    });

    return res.status(200).json({
      message:'Login successful !',
      user: {
        id: user._id,
        username: user.username
      },
      accessToken, 
      refreshToken 
    });
  } catch (error) {
    console.error('Login error:',error);
    return res.status(500).json({error:'Server error',details: error.message});
  }
};

// Logout
exports.logout = async (req,res) => {
  try{
    res.clearCookie('accessToken', {
      httpOnly: true,
      sameSite: 'lax',
      secure: false,
      path: '/'
  });
  res.clearCookie('refreshToken', {
      httpOnly: true,
      sameSite: 'lax',
      secure: false,
      path: '/'
  });
  } catch(error) {
    console.error('Logout error:',error)
    return res.status(500).json({error:'Server error',details: error.message});
  }
  return res.status(200).json({message:'Log out successful!'})
}

// Refresh token
exports.refreshedToken = async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    return res.status(401).json({ error: "No refresh token provided" });
  }
  try {
    const decoded = jwt.verify(refreshToken, refreshTokenSecret);
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }
    const newAccessToken = jwt.sign({ userId: user._id }, accessTokenSecret, {
      expiresIn: "10m",
    });
    res.status(200).json({ accessToken: newAccessToken });
  } catch (error) {
    console.error("Refresh token Error", error.message);
    res
      .status(401)
      .json({ error: "Invalid or expired refresh token, please login again" });
  }
};

exports.getUserData = async (req,res) => {
    const formatUser = req.user && isValidObjectId(req.user.id) ? new Types.ObjectId(req.user.id) : null;
    if(!formatUser){
      return res.status(400).json({error:'Unauthorized'});
    }
    try{
      const userData = await User.findById(formatUser).select('-password');
      if(!userData){
        return res.status(404).json({ error: 'User not found'})
      }
      console.log('User found:',userData)
      return res.status(200).json(userData)
    } catch(error) {
      handleError(res,error)
    }
}
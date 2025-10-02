import { Router } from "express";
import { User } from "../schemas/userSchema.js";
import jwt from "jsonwebtoken";

const router = Router();
const cookieOptions = {
  httpOnly: true,
  secure: true,
};

// Middleware to verify JWT and extract user
const verifyJWT = async (req, res, next) => {
  try {
    // Get the access token from cookies or headers
    const accessToken =
      req.cookies?.accessToken || req.headers.authorization?.split(" ")[1];
    if (!accessToken) {
      return res.status(401).json({
        status: "error",
        message: "Unauthorized Access: No Access Token Provided",
      });
    }

    // Decode the access token to get user info stored in it
    const decodedToken = await jwt.verify(
      accessToken,
      process.env.ACCESS_TOKEN_SECRET
    );
    // If no valid user found, return Error
    const user = await User.findById(decodedToken._id).select(
      "-password -refreshToken"
    );
    if (!user) {
      return res.status(401).json({
        status: "error",
        message: "Unauthorized Access: Invalid Access Token",
      });
    }

    // Add the user info to the request to be used by the other middlewares/routes
    req.user = user;
    next();
  } catch (error) {
    console.error("Error in verifyJWT middleware:", error);
    return res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
};

// Normal routes
router.post("/register", async (req, res) => {
  try {
    const { username, password, zone } = req.body;

    if (!username || !password || !zone) {
      return res.status(400).json({
        status: "error",
        message: "Username, password and zone are required",
      });
    }

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res
        .status(400)
        .json({ status: "error", message: "Username already exists" });
    }

    const newUser = new User({ username, password, zone });
    await newUser.save();
    return res.status(201).json({
      status: "success",
      message: "User registered successfully",
      data: newUser,
    });
  } catch (error) {
    console.error("Error in /register:", error);
    return res
      .status(500)
      .json({ status: "error", message: "Internal server error" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        status: "error",
        message: "Username and password are required",
      });
    }

    // check if user exists
    const user = await User.findOne({ username });
    if (!user) {
      return res
        .status(400)
        .json({ status: "error", message: "User Not Found" });
    }

    // verify password
    if (!(await user.verifyPassword(password))) {
      return res
        .status(400)
        .json({ status: "error", message: "Invalid Password" });
    }

    // Generate Refresh Token and Access Token
    const refreshToken = user.generateRefreshToken();
    const accessToken = user.generateAccessToken();
    await User.findByIdAndUpdate(user._id, {
      refreshToken: refreshToken,
    });

    return res
      .cookie("refreshToken", refreshToken, cookieOptions)
      .cookie("accessToken", accessToken, cookieOptions)
      .status(200)
      .json({
        status: "success",
        message: "Login Successful",
        data: { user },
      });
  } catch (error) {
    console.error("Error in /login:", error);
    return res
      .status(500)
      .json({ status: "error", message: "Internal server error" });
  }
});

router.post("/logout", verifyJWT, async (req, res) => {
  try {
    const user = req.user;
    // Revoke Refresh Token of currently logged in User (verifyJWT handles user extraction)
    await User.findByIdAndUpdate(user._id, {
      refreshToken: null,
    });

    // Send Response
    return res.clearCookie("refreshToken").clearCookie("accessToken").json({
      status: "success",
      message: "Logout Successful",
    });
  } catch (error) {
    console.error("Error in /logout:", error);
    return res
      .status(500)
      .json({ status: "error", message: "Internal server error" });
  }
});

router.get("/renew-tokens", async (req, res) => {
  try {
    // Get refresh token sent in cookie
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) {
      return res.status(401).json({
        status: "error",
        message: "Unauthorised request! Refresh Token is Invalid",
      });
    }

    // Decode refresh token to get user_id stored in it
    const decodedToken = jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    // Get user and check validity of refresh token
    const user = await User.findById(decodedToken._id);
    if (!user || user?.refreshToken !== refreshToken) {
      return res.status(401).json({
        status: "error",
        message: "Unauthorised request! Refresh Token is Invalid",
      });
    }

    // Generate and send a new Access Token as httpOnpy cookie
    const newAccessToken = user.generateAccessToken();
    res.cookie("accessToken", newAccessToken, cookieOptions).status(200).json({
      status: "success",
      message: "Access Token renewed successfully",
    });
  } catch (error) {
    console.error("Error in /renew-tokens:", error);
    return res
      .status(500)
      .json({ status: "error", message: "Internal server error" });
  }
});

router.get("/me", verifyJWT, async (req, res) => {
  try {
    const user = req.user;
    return res.status(200).json({
      status: "success",
      data: { user },
    });
  } catch (error) {
    console.error("Error in /me:", error);
    return res
      .status(500)
      .json({ status: "error", message: "Internal server error" });
  }
});
export default router;

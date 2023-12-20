var express = require("express");

const helper = require('../../helper/fileUpload');

var authRouter = express.Router();

var passport = require("passport");

const GoogleStrategy = require('passport-google-oauth20').Strategy;


// Configure Passport to use Google strategy
passport.use(new GoogleStrategy({
    clientID: '1085886204402-k5qkjai2o16953puaekkojnafkb8mtm8.apps.googleusercontent.com',
    clientSecret: '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',
    callbackURL: 'http://localhost:7000/api/google/callback',
},
    (accessToken, refreshToken, profile, done) => {
        // Store user information in session
        console.log('accessToken', accessToken);
        console.log('refreshToken', refreshToken);
        return done(null, profile);
    }
));

// Serialize user information into session
passport.serializeUser((user, done) => {
    done(null, user);
});

// Deserialize user information from session
passport.deserializeUser((obj, done) => {
    done(null, obj);
});


const authController = require("../../controllers/authController");

authRouter.post("/signup", helper.upload.any(), authController.register);

authRouter.post("/signin", authController.login);

authRouter.get("/getUsers", authController.getUsers);

authRouter.post("/updateProfile/:userId", helper.upload.any(), authController.updateProfile);

authRouter.get("/logout/:userId", authController.logOut);

authRouter.get("/login", authController.loginWithContact);

authRouter.get("/verify", authController.verifyUser);

authRouter.post("/forgot-password", authController.forgetPassword);

authRouter.post("/reset-password", authController.resetPassword);

authRouter.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }),);

authRouter.get("/google/callback", passport.authenticate("google", { failureRedirect: "/" }), authController.callBackFunction);

module.exports = authRouter;






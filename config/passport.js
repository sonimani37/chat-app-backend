const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').OAuth2Strategy;
const { User } = require('../models');

// Configure Passport to use Google strategy
passport.use(new GoogleStrategy({
  clientID: '1085886204402-k5qkjai2o16953puaekkojnafkb8mtm8.apps.googleusercontent.com',
  clientSecret: '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',
  callbackURL: 'http://localhost:7000/api/google/callback',
},
  (accessToken, refreshToken, profile, done) => {
      // Store user information in session
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


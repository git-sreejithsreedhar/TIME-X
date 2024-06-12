// const passport = require('passport')
// const GoogleStrategy = require('passport-google-oauth20').Strategy;
// require('dotenv').config()
// const googleAuthUsers = require('../model/googleAuthUsers')


// passport.serializeUser((user, done) => {
//     done(null, user.id);
//   });
  
//   passport.deserializeUser(async (id, done) => {
//     try {
//       const user = await googleAuthUsers.findById(id);
//       done(null, user);
//     } catch (err) {
//       done(err, null);
//     }
//   });


//   passport.use(new GoogleStrategy({
//     clientID: process.env.GOOGLE_CLIENT_ID,
//     clientSecret: process.env.GOOGLE_CLIENT_SECRET,
//     callbackURL: process.env.GOOGLE_URL,

//   }, async (accessToken, refreshToken, profile, done) => {
//     try {
//       const existingUser = await googleAuthUsers.findOne({ googleId: profile.id })
  
//       if (existingUser) {
//         return done(null, existingUser);
//       }
  
//       const newUser = new googleAuthUsers({
//         googleId: profile.id,
//         displayName: profile.displayName,
//         email: profile.emails && profile.emails.length > 0 ? profile.emails[0].value : '',
//         // Add other user fields as needed
//       });
  
//       await newUser.save();
//       done(null, newUser);
//     } catch (err) {
//       done(err, null);
//     }
//   }));

//   const authController = {
    
//     googleAuth: passport.authenticate('google', {
//       scope: ['profile', 'email'],
      
//     }),
  
//     googleAuthCallback: passport.authenticate('google', {
//         failureRedirect: '/user/login',
//         successRedirect: '/userHome', // Redirect to your dashboard or home page
//       }),
    
//   };

// module.exports = authController;
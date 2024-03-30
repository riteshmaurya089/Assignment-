
const passport = require("passport");
const GoogleStrategy = require('passport-google-oauth2').Strategy;
const { google } = require('googleapis');

require("dotenv").config();

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:5500/auth/google/callback",
    // callbackURL: "https://reachinboxxxx-project.onrender.com/auth/google/callback",
    passReqToCallback: true
},
    function (request, accessToken, refreshToken, profile, done) {
        // Store the access token in the user object
        profile.tokens = { access_token: accessToken, refresh_token: refreshToken };

        // Optionally, you can fetch additional user information from the Google API
        // Example: Fetch user's Gmail profile
        const oauth2Client = new google.auth.OAuth2();
        oauth2Client.setCredentials({ access_token: accessToken });
        const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
        gmail.users.getProfile({ userId: 'me' }, (err, res) => {
            if (err) {
                console.error('Error fetching Gmail profile:', err);
                return done(err);
            }
            profile.gmailProfile = res.data;
            console.log('Gmail profile tada :', profile.gmailProfile);
            done(null, profile);
        });
    }
));

passport.serializeUser(function (user, done) {
    done(null, user);
});

passport.deserializeUser(function (user, done) {
    done(null, user);
});

module.exports = passport;

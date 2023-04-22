const passport =require("passport")
const dotenv = require("dotenv")
dotenv.config()
const GoogleStrategy = require('passport-google-oauth20').Strategy;
let redirect_host = process.env.PROD_HOST;
if (process.env.DEPLOY_ENV !== 'PROD') {
    redirect_host = process.env.DEV_HOST
}

passport.serializeUser(function(user, done) {
    done(null, user);
});

passport.deserializeUser(function(user, done) {
    done(null, user);
});

passport.use('google', new GoogleStrategy({
        clientID:process.env.CLIENT_APP_ID,
        clientSecret:process.env.CLIENT_APP_SECRET,
        callbackURL: `${redirect_host}${process.env.REDIRECT_URI}`,
        passReqToCallback   : true
    },
    function(request, accessToken, refreshToken, profile, done) {
        return done(null, profile);
    }
));
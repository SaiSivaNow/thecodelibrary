const passport = require('passport')
const GoogleStrategy = require('passport-google-oauth20').Strategy
const dotenv = require("dotenv")
const env = process.env.NODE_ENV || 'local';
const config = require(`../config/${env}.json`)
dotenv.config()
const express = require('express')
const router = express.Router()
const jwt = require('jsonwebtoken')
const JwtStrategy = require('passport-jwt').Strategy;
const base_url = config.BASE_URL;

let opts = {}
opts.jwtFromRequest = function(req) {
    let token = null;
    if (req && req.cookies)
    {
        token = req.cookies['jwt'];
    }
    return token;
};
opts.secretOrKey = 'secret';

passport.use(new JwtStrategy(opts, function(jwt_payload, done) {
    console.log("JWT BASED  VALIDATION GETTING CALLED")
    console.log("JWT", jwt_payload)
    return done(null, jwt_payload.data)
}));

passport.use(new GoogleStrategy({
        clientID: config.CLIENT_APP_ID,
        clientSecret: config.CLIENT_APP_SECRET,
        callbackURL: `${base_url}${config.REDIRECT_URI}`
    },
    function(accessToken, refreshToken, profile, cb) {
        //console.log(accessToken, refreshToken, profile)
        console.log("GOOGLE BASED OAUTH VALIDATION GETTING CALLED")
        return cb(null, profile)
    }
));

passport.serializeUser(function(user, cb) {
    console.log('I should have jack ')
    cb(null, user);
});

passport.deserializeUser(function(obj, cb) {
    console.log('I wont have jack shit')
    cb(null, obj);
});

router.get('/login', (req, res)=>{
    res.sendFile('login.html', {root: __dirname+'/../public'})
})

router.get('/google',  passport.authenticate('google', { scope: ['profile','email'] }))

router.get('/redirect', passport.authenticate('google'),(req, res)=>{
    console.log('redirected', req.user)
    console.log('redirected', req.user)
    let user = {
        displayName: req.user.displayName,
        name: req.user.name.givenName,
        email: req.user._json.email,
        provider: req.user.provider }
    console.log(user)

    let token = jwt.sign({
        data: user
    }, 'secret', { expiresIn: '4h' });
    res.cookie('jwt', token)
    res.sendFile('index.html', {root: __dirname+'/..'})
})

router.get('/logout', function(req, res, next){
    req.logout(function(err) {
        if (err) { return next(err); }
        res.clearCookie('jwt')
        res.redirect('/');
    });
});

module.exports=router;
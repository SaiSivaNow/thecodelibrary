const AWS = require('aws-sdk');
const s3 = new AWS.S3();
const express = require('express');
const dotenv = require("dotenv")
const passport = require('passport')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const session = require('express-session');
const bucketName = 'thecodelibrary-lite';
const objectKey = 'programming.mov';
const app = express();
dotenv.config()

app.use(bodyParser.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(passport.initialize());
app.use(session({
	resave: false,
	saveUninitialized: true,
	secret: 'secret'
}));

let redirect_host = process.env.PROD_HOST;
if (process.env.DEPLOY_ENV === 'DEV') {
	redirect_host = process.env.DEV_HOST
}
const port = process.env.PORT || 3000


app.get('/videoplayer', passport.authenticate('jwt', { session: false }),
	(req, res) => {
	const range = req.headers.range;
	const chunkSize = 1e6;

	const params = {
	  Bucket: bucketName,
	  Key: objectKey
	};

	s3.headObject(params, (err, metadata) => {
	  if (err) {
		console.error(err);
		res.sendStatus(500);
		return;
	  }

	  const videoSize = metadata.ContentLength;
	  const start = Number(range.replace(/\D/g, ''));
	  const end = Math.min(start + chunkSize, videoSize - 1);
	  const contentLength = end - start + 1;
	  const headers = {
		'Content-Range': `bytes ${start}-${end}/${videoSize}`,
		'Accept-Ranges': 'bytes',
		'Content-Length': contentLength,
		'Content-Type': 'video/mp4',
	  };
	  res.writeHead(206, headers);

	  const s3Stream = s3.getObject({
		Bucket: bucketName,
		Key: objectKey,
		Range: `bytes=${start}-${end}`
	  }).createReadStream();

	  s3Stream.on('error', (err) => {
		console.error(err);
		res.sendStatus(500);
	  });

	  s3Stream.pipe(res);
	});
  });

const jwt = require('jsonwebtoken')
var JwtStrategy = require('passport-jwt').Strategy
var ExtractJwt = require('passport-jwt').ExtractJwt;
var opts = {}
opts.jwtFromRequest = function(req) {
	var token = null;
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
		clientID: process.env.CLIENT_APP_ID,
		clientSecret: process.env.CLIENT_APP_SECRET,
		callbackURL: `${redirect_host}${process.env.REDIRECT_URI}`
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

app.get('/', (req, res)=>{
	res.sendFile('home.html', {root: __dirname+'/public'})
})

app.get('/login', (req, res)=>{
	res.sendFile('login.html', {root: __dirname+'/public'})
})

app.get('/auth/google',  passport.authenticate('google', { scope: ['profile','email'] }))

app.get('/profile', passport.authenticate('jwt', { session: false }) ,(req,res)=>{
	res.send(`THIS IS UR PROFILE MAAANNNN ${req.user.email}`)
})

app.get(process.env.REDIRECT_URI, passport.authenticate('google'),(req, res)=>{
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
	res.sendFile(__dirname + '/index.html')
})

app.get('/logout', function(req, res, next){
	req.logout(function(err) {
		if (err) { return next(err); }
		res.clearCookie('jwt')
		res.redirect('/');
	});
});

app.listen( port, ()=>{
	console.log(`Sever TheCodeLibrary listening on port ${port}`)
})

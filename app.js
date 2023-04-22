const AWS = require('aws-sdk');
const s3 = new AWS.S3();
const express = require('express');
const app = express();
const dotenv = require("dotenv")
dotenv.config()
app.set('view engine', 'ejs');
const db = require("./db");
db.connect();
const passport = require("passport");
require("./passportConfig")(passport);
const jwt = require("jsonwebtoken")


const bucketName = 'thecodelibrary-lite';
const objectKey = 'programming.mov';

app.get('/', function(req, res) {
	res.render('pages/auth');
});

app.get('/videoplayer',
	passport.authenticate("jwt", { session: false }),
	(req, res, next) => {
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


app.get(
	"/auth/google",
	passport.authenticate("google", { scope: ["email", "profile"] })
);

app.get(
	"/profile",
	passport.authenticate("jwt", { session: false }),
	(req, res, next) => {
		res.send("Welcome");
	}
);

app.get(
	"/auth/redirect",
	passport.authenticate("google", { session: false }),
	(req, res) => {
		jwt.sign(
			{ user: req.user },
			"secretKey",
			{ expiresIn: "1h" },
			(err, token) => {
				if (err) {
					res.redirect('/error', {});
				}
				res.render('pages/success', {user: req.user.google, token: token})
			}
		);
	}
);

app.get('/error', (req, res) => res.send("error logging in"));

app.get('/logout',
	function(req, res, next) {
	console.log("logged out!");
	res.redirect('/');
});

app.listen(3000, () => {
	console.log(`Listening on port 3000`);
});


const AWS = require('aws-sdk');
const s3 = new AWS.S3();
const express = require('express');
const app = express();
const dotenv = require("dotenv")
dotenv.config()
const utils = require ('./utils');

const bucketName = 'thecodelibrary-lite';
const objectKey = 'programming.mov';

app.get('/', (req, res) => {
	res.sendFile(__dirname + '/index.html');
})

app.get('/videoplayer', (req, res) => {
	const range = req.headers.range;
	const chunkSize = 1 * 1e6;

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
		return;
	  });

	  s3Stream.pipe(res);
	});
  });

	const range = req.headers.range
	const videoPath = './video.mov';
	const videoSize = fs.statSync(videoPath).size
	const chunkSize = 1e6;
	const start = Number(range.replace(/\D/g, ""))
	const end = Math.min(start + chunkSize, videoSize - 1)
	const contentLength = end - start + 1;
	const headers = {
		"Content-Range": `bytes ${start}-${end}/${videoSize}`,
		"Accept-Ranges": "bytes",
		"Content-Length": contentLength,
		"Content-Type": "video/mp4"
	}
	res.writeHead(206, headers)
	const stream = fs.createReadStream(videoPath, {
		start,
		end
	})
	stream.pipe(res)
})

app.get ('/auth', async (req, res) => {
	try {
		res.redirect (utils.request_get_auth_code_url);
	} catch (error) {
		res.sendStatus (500);
		console.log (error.message);
	}
});

app.get (process.env.REDIRECT_URI, async (req, res) => {
	const authorization_token = req.query;
	console.log ({auth_server_response: authorization_token});
	try {
		res.sendFile(__dirname + '/index.html');
	} catch (error) {
		console.log (error.message);
		res.sendStatus (500);
	}
});

app.listen(3000);


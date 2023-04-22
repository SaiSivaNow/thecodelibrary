const express = require('express');
const fs = require('fs');
const app = express();
const utils = require ('./utils');
const {get_access_token, get_profile_data} = require("./utils");

app.get('/', (req, res) => {
	res.sendFile(__dirname + '/index.html');
})

app.get('/videoplayer', (req, res) => {
	const range = req.headers.range
	const videoPath = './video.mov';
	const videoSize = fs.statSync(videoPath).size
	const chunkSize = 1 * 1e6;
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

app.get ('/auth/redirect', async (req, res) => {
	const authorization_token = req.query;
	console.log ({auth_server_response: authorization_token});
	try {
		// get access token using authorization token
		const response = await get_access_token (authorization_token.code);
		// get access token from payload
		const {access_token} = response.data;
		// get user profile data
		const user = await get_profile_data (access_token);
		const user_data = user.data;
		res.sendFile(__dirname + '/index.html');
		console.log (user_data);
	} catch (error) {
		console.log (error.message);
		res.sendStatus (500);
	}
});

app.listen(3000);


const AWS = require('aws-sdk');
const s3 = new AWS.S3();
const bucketName = 'thecodelibrary';
const objectKey = 'video.mov';

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
  
app.listen(3000);


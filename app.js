const AWS = require('aws-sdk');
const s3 = new AWS.S3();
const express = require('express');
const passport = require('passport');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const bucketName = 'thecodelibrary-lite';
const objectKey = 'programming.mov';
const app = express();
const dotenv = require("dotenv");
const env = process.env.NODE_ENV || 'local';
const config = require(`./config/${env}.json`);
dotenv.config();
const authRoute = require('./routes/auth');
const paymentRoute = require('./routes/payment');
const courseRoute = require('./routes/course');
const initDb = require('./database/db_config');
const port = config.PORT;

app.use(bodyParser.json());
app.use(cookieParser())
app.use(passport.initialize());
app.use(session({
    resave: false,
    saveUninitialized: true,
    secret: 'secret'
}));
app.use("/auth", authRoute)
app.use("/pay", paymentRoute)
app.use("/courses", courseRoute)
initDb();

app.get('/videoplayer', passport.authenticate('jwt', {session: false}),
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

app.get('/', (req, res) => {
    res.sendFile('home.html', {root: __dirname + '/public'})
})

app.get('/profile', passport.authenticate('jwt', {session: false}), (req, res) => {
    res.send(`THIS IS UR PROFILE MAAANNNN ${req.user.email}`)
})

app.listen(port, () => {
    console.log(`Sever TheCodeLibrary listening on port ${port}`)
})

process.on('SIGINT', () => {
    console.log('Received SIGINT signal. Shutting down gracefully...');
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('Received SIGTERM signal. Shutting down gracefully...');
    process.exit(0);
});
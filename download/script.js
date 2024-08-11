const AWS = require('aws-sdk');
const dotenv = require('dotenv');

dotenv.config();

const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

(async () => {
    s3.putObject({
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Key: 'uploaded-file.txt',
        Body: 'This is the content of the uploaded file.',
        ContentType: 'text/plain',
    }).promise()
})()
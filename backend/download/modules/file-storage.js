const AWS = require('aws-sdk');
const fs = require('fs');

class FileStorage {
    constructor(){
        this.s3 = new AWS.S3({
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        });
    }

    uploadFile(filePath, key) {
        return new Promise((resolve, reject) => {
            const fileStream = fs.createReadStream(filePath);
            fileStream.on('error', (err) => reject(err));

            const params = {
                Bucket: process.env.AWS_S3_BUCKET_NAME,
                Key: key,
                Body: fileStream
            };

            this.s3.upload(params, (err, data) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(data.Location);  // Return the URL of the uploaded file
                }
            });
        });
    }
}

module.exports = FileStorage;
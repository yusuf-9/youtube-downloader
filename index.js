const express = require('express');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(express.json());

// Directory to cache downloaded videos
const downloadDir = path.join(__dirname, 'downloads');
if (!fs.existsSync(downloadDir)) {
    fs.mkdirSync(downloadDir);
}

// Get metadata for a video or playlist
app.post('/metadata', (req, res) => {
    const { url } = req.body;
    const escapedUrl = `"${url}"`;

    exec(`yt-dlp --flat-playlist --dump-json ${escapedUrl}`, (error, stdout, stderr) => {
        if (error) {
            return res.status(500).send({ error: stderr });
        }

        try {
            const parsedData = JSON.parse(stdout);
            res.json(parsedData);
        } catch (parseError) {
            res.status(500).send({ error: 'Failed to parse JSON output.', log: parseError });
        }
    });
});

// Download video and cache it
app.post('/download', (req, res) => {
    const { videoId, format } = req.body;
    const url = `https://www.youtube.com/watch?v=${videoId}`;
    const outputFilePath = path.join(downloadDir, `${videoId}.${format}`);

    exec(`yt-dlp -f ${format} -o "${outputFilePath}" ${url}`, (error, stdout, stderr) => {
        if (error) {
            return res.status(500).send({ error: stderr });
        }

        // Check if the file was downloaded correctly
        const downloadedFile = fs.readdirSync(downloadDir).find(file => file === `${videoId}.${format}`);
        if (!downloadedFile) {
            return res.status(500).send({ error: 'File not found after download.' });
        }

        res.json({ message: 'Download complete', file: downloadedFile });
    });
});

// Convert the cached video to a specified format
app.post('/convert', (req, res) => {
    const { filename, format } = req.body;
    const inputFilePath = path.join(downloadDir, filename);
    const outputFilePath = path.join(downloadDir, `${path.parse(filename).name}.${format}`);

    if (!fs.existsSync(inputFilePath)) {
        return res.status(404).send({ error: 'File not found.' });
    }

    exec(`ffmpeg -i "${inputFilePath}" "${outputFilePath}"`, (error, stdout, stderr) => {
        if (error) {
            return res.status(500).send({ error: stderr });
        }
        res.json({ message: 'Conversion complete', file: path.basename(outputFilePath) });
    });
});

// Stream the converted file to the user
app.get('/stream/:filename', (req, res) => {
    const filename = req.params.filename;
    const filePath = path.join(downloadDir, filename);

    if (!fs.existsSync(filePath)) {
        return res.status(404).send({ error: 'File not found.' });
    }

    res.download(filePath);
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

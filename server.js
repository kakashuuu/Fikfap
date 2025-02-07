const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());

// Function to fetch .mp4 video URLs from FikFap
async function fetchMp4Urls() {
    const url = 'https://fikfap.com/';

    try {
        // Fetch HTML content
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });

        // Load HTML into Cheerio
        const $ = cheerio.load(response.data);
        const mp4Urls = [];

        // Find all <video> elements with .mp4 URLs
        $('video').each((_, element) => {
            const videoSrc = $(element).attr('src');
            if (videoSrc && videoSrc.endsWith('.mp4')) {
                mp4Urls.push(videoSrc.startsWith('http') ? videoSrc : `https://fikfap.com${videoSrc}`);
            }
        });

        return mp4Urls.length > 0 ? mp4Urls : null;
    } catch (error) {
        console.error(`Error fetching MP4 URLs: ${error.message}`);
        return null;
    }
}

// API Route to return MP4 links
app.get('/video-links', async (req, res) => {
    try {
        const videoLinks = await fetchMp4Urls();
        if (videoLinks) {
            res.json({ videos: videoLinks });
        } else {
            res.status(500).json({ error: 'No .mp4 videos found or site blocking bots.' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Server error.', details: error.message });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});

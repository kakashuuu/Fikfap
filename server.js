const express = require('express');
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const cors = require('cors');

puppeteer.use(StealthPlugin());

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());

// Function to fetch real MP4 URLs from FikFap
async function fetchMp4Urls() {
    const url = 'https://fikfap.com/random'; // Random video URL

    const browser = await puppeteer.launch({
        headless: "new",
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    try {
        const page = await browser.newPage();
        await page.setUserAgent(
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        );

        let videoUrls = [];

        // Intercept network requests to find MP4 links
        page.on('response', async (response) => {
            const url = response.url();
            if (url.includes('.mp4') && !url.includes('/audio/') && !url.includes('init.mp4')) {
                videoUrls.push(url);
            }
        });

        await page.goto(url, { waitUntil: 'networkidle2' });

        await new Promise(resolve => setTimeout(resolve, 5000)); // Wait for network requests

        await browser.close();

        // Remove duplicate URLs
        videoUrls = [...new Set(videoUrls)];

        return videoUrls.length > 0 ? videoUrls : null;
    } catch (error) {
        console.error(`Error fetching MP4 URLs: ${error.message}`);
        await browser.close();
        return null;
    }
}

// API Route
app.get('/video-links', async (req, res) => {
    try {
        const videoLinks = await fetchMp4Urls();
        if (videoLinks) {
            res.json({ videos: videoLinks });
        } else {
            res.status(500).json({ error: 'No full .mp4 videos found or site blocking bots.' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Server error.', details: error.message });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});

const express = require('express');
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const cors = require('cors');

puppeteer.use(StealthPlugin());

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());

// Function to scrape .mp4 video links using Puppeteer
async function getVideoLinks() {
    const url = 'https://fikfap.com/';

    const browser = await puppeteer.launch({
        headless: "new",
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    try {
        const page = await browser.newPage();

        // Set a real browser user-agent
        await page.setUserAgent(
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        );

        await page.goto(url, { waitUntil: 'networkidle2' });

        // Extract video URLs
        const videoUrls = await page.evaluate(() => {
            return Array.from(document.querySelectorAll('video')).map(video => video.src)
                .filter(src => src.endsWith('.mp4'));
        });

        await browser.close();

        return videoUrls.length > 0 ? videoUrls : null;
    } catch (error) {
        console.error('Error fetching video links:', error);
        await browser.close();
        return null;
    }
}

// API Route
app.get('/video-links', async (req, res) => {
    try {
        const videoLinks = await getVideoLinks();
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

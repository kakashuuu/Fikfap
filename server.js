const express = require('express');
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const cors = require('cors');

puppeteer.use(StealthPlugin());

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());

// Function to extract real .mp4 video URLs from FikFap
async function fetchMp4Urls() {
    const url = 'https://fikfap.com/random'; // Fetch a random video

    const browser = await puppeteer.launch({
        headless: "new",
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-blink-features=AutomationControlled'
        ]
    });

    try {
        const page = await browser.newPage();

        // Spoof User-Agent and disable Puppeteer detection
        await page.setUserAgent(
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        );
        await page.evaluateOnNewDocument(() => {
            delete navigator.__proto__.webdriver;
        });

        await page.goto(url, { waitUntil: 'networkidle2' });

        // Extract video source URL directly from the video element
        const videoUrl = await page.evaluate(() => {
            const videoElement = document.querySelector('video');
            return videoElement ? videoElement.src : null;
        });

        await browser.close();

        return videoUrl && videoUrl.startsWith('http') ? [videoUrl] : null;
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

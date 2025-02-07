import express from 'express';
import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import cors from 'cors';

// Use Puppeteer's stealth mode
puppeteer.use(StealthPlugin());

const app = express();
const port = process.env.PORT || 5000; // Use dynamic port to avoid conflicts

app.use(cors());

// Function to fetch a random video URL
async function getRandomVideo() {
    const url = 'https://fikfap.com/random';
    
    const browser = await puppeteer.launch({
        executablePath: '/usr/bin/chromium-browser', // Use system-installed Chromium
        headless: "new",
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    try {
        const page = await browser.newPage();

        // Set a user-agent to mimic a real browser
        await page.setUserAgent(
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        );

        await page.goto(url, { waitUntil: 'domcontentloaded' });

        // Wait for the video element to load
        await page.waitForSelector('video', { timeout: 10000 });

        const videoUrl = await page.evaluate(() => {
            const videoElement = document.querySelector('video');
            return videoElement ? videoElement.src : null;
        });

        await browser.close();

        // Handle blob URLs (not playable outside the browser)
        if (videoUrl && videoUrl.startsWith('blob:')) {
            return null;
        }

        return videoUrl;
    } catch (error) {
        console.error('Error fetching video:', error);
        await browser.close();
        return null;
    }
}

// API Route
app.get('/random-video', async (req, res) => {
    try {
        const videoUrl = await getRandomVideo();
        if (videoUrl) {
            res.json({ videoUrl });
        } else {
            res.status(500).json({ error: 'No playable video found. The site may be blocking bots.' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Server error.', details: error.message });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});

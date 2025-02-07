import express from 'express';
import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import cors from 'cors';

puppeteer.use(StealthPlugin());

const app = express();
const port = 5000;

app.use(cors());

async function getRandomVideo() {
    const url = 'https://fikfap.com/random';
    const browser = await puppeteer.launch({
        headless: "new",
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    try {
        const page = await browser.newPage();
        await page.goto(url, { waitUntil: 'domcontentloaded' });

        const videoUrl = await page.evaluate(() => {
            const videoElement = document.querySelector('video');
            return videoElement ? videoElement.src : null;
        });

        await browser.close();

        // Handling Blob URLs (these are not directly playable outside the browser)
        if (videoUrl && videoUrl.startsWith('blob:')) {
            return null; // Blob URLs cannot be used directly
        }

        return videoUrl;
    } catch (error) {
        console.error('Error fetching video:', error);
        await browser.close();
        return null;
    }
}

app.get('/random-video', async (req, res) => {
    try {
        const videoUrl = await getRandomVideo();
        if (videoUrl) {
            res.json({ videoUrl });
        } else {
            res.status(500).json({ error: 'No playable video found.' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Server error.', details: error.message });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});

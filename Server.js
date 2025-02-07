import express from 'express';
import puppeteer from 'puppeteer';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

app.get('/api/random-video', async (req, res) => {
    let browser;
    try {
        browser = await puppeteer.launch({
            headless: "new",  // Use "true" for full headless mode
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });

        const page = await browser.newPage();
        await page.goto('https://fikfap.com/', { waitUntil: 'networkidle2' });

        // Wait for videos to load
        await page.waitForSelector('video');

        // Extract video URLs
        const videos = await page.evaluate(() => {
            return Array.from(document.querySelectorAll('video')).map(video => video.src).filter(src => src);
        });

        if (videos.length === 0) {
            return res.status(404).json({ error: 'No videos found' });
        }

        // Pick a random video
        const randomVideo = videos[Math.floor(Math.random() * videos.length)];

        res.json({ video: randomVideo });

    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch videos', details: error.message });
    } finally {
        if (browser) await browser.close();
    }
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));

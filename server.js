import express from 'express';
import puppeteer from 'puppeteer';
import fetch from 'node-fetch';

const app = express();
const port = 5000;

// Helper function to get a random video URL from fikfap.com
async function getRandomVideo(): Promise<string | null> {
    const url = 'https://fikfap.com/random';
    const browser = await puppeteer.launch({
        executablePath: '/usr/bin/chromium-browser', // Path to Chromium, modify if needed
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    try {
        const page = await browser.newPage();
        await page.goto(url, { waitUntil: 'domcontentloaded' });

        const videoUrl = await page.evaluate(() => {
            // Assuming the random video link is inside a post URL in the page.
            const videoLink = document.querySelector('a[href^="https://fikfap.com/post/"]');
            return videoLink ? videoLink.href : null;
        });

        await browser.close();
        return videoUrl;
    } catch (error) {
        console.error('Error fetching random video:', error);
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
            res.status(500).json({ error: 'Error fetching random video.' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Error fetching random video.', details: error.message });
    }
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

import express from 'express';
import puppeteer from 'puppeteer';

const app = express();
const PORT = process.env.PORT || 3000;

// Welcome page
app.get('/', (req, res) => {
    res.send('Hello Kakashi');
});

// Random video endpoint
app.get('/api/random-video', async (req, res) => {
    try {
        const browser = await puppeteer.launch({ headless: true });
        const page = await browser.newPage();
        
        await page.goto('https://fikfap.com/', { waitUntil: 'networkidle2' });

        // Extract video URLs from the page
        const videoUrls = await page.evaluate(() => {
            return Array.from(document.querySelectorAll('video source')).map(v => v.src);
        });

        await browser.close();

        if (videoUrls.length === 0) {
            return res.status(404).json({ error: 'No videos found' });
        }

        const randomVideo = videoUrls[Math.floor(Math.random() * videoUrls.length)];
        res.json({ video: randomVideo });

    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

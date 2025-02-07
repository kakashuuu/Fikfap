import express from 'express';
import puppeteer from 'puppeteer';
import cheerio from 'cheerio';

const app = express();
const port = 3000;

// Set up route for homepage
app.get('/', (req, res) => {
  res.send('Hello Kakashi');
});

// Fetch random video from fikfap.com
app.get('/api/random-video', async (req, res) => {
  let browser;
  try {
    // Launch Puppeteer browser instance
    browser = await puppeteer.launch({
      headless: true,
      executablePath: '/usr/bin/chromium-browser',  // Use the correct path to chromium (Docker set up)
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();
    await page.goto('https://fikfap.com');  // Example URL

    // Wait for page content to load
    await page.waitForSelector('video');  // Adjust based on what video element you need

    const content = await page.content();
    const $ = cheerio.load(content);

    // Extract video URLs (you may need to adjust selector based on actual website structure)
    const videoURLs = [];
    $('video').each((index, element) => {
      const videoURL = $(element).attr('src');
      if (videoURL) {
        videoURLs.push(videoURL);
      }
    });

    // If no videos found, return an error
    if (videoURLs.length === 0) {
      return res.json({ error: 'No videos found' });
    }

    // Pick a random video URL
    const randomVideo = videoURLs[Math.floor(Math.random() * videoURLs.length)];

    // Return random video URL as JSON response
    res.json({ video: randomVideo });
  } catch (error) {
    console.error('Error fetching video:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  } finally {
    if (browser) {
      await browser.close();
    }
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

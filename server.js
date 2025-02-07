import express from 'express';
import puppeteer from 'puppeteer';
import * as cheerio from 'cheerio';  // Correct import

const app = express();
const port = 3000;
const baseURL = 'https://fikfap.com';  // Base URL of the site

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
      executablePath: '/usr/bin/chromium-browser',  // Correct path for chromium in Docker
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();
    await page.goto(baseURL);  // Go to the site

    // Wait for page content to load
    await page.waitForSelector('video');  // Wait for video element

    const content = await page.content();
    const $ = cheerio.load(content);

    // Extract video URLs (adjust selector if needed)
    const videoURLs = [];
    $('video').each((index, element) => {
      let videoURL = $(element).attr('src');
      if (videoURL) {
        // Check if videoURL is a relative URL, and prepend baseURL if necessary
        if (videoURL.startsWith('/')) {
          videoURL = baseURL + videoURL;
        }
        videoURLs.push(videoURL);
      }
    });

    // If no videos found, return an error
    if (videoURLs.length === 0) {
      return res.json({ error: 'No videos found' });
    }

    // Pick a random video URL
    const randomVideo = videoURLs[Math.floor(Math.random() * videoURLs.length)];

    // Return the random video URL as JSON response
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

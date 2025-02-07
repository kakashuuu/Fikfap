import express from 'express';
import puppeteer from 'puppeteer';
import * as cheerio from 'cheerio';

const app = express();
const port = 5000;

app.get('/api/random-video', async (req, res) => {
  const postId = 253599; // Change this to any valid post ID or make it dynamic from the request
  const url = `https://fikfap.com/post/${postId}`;

  try {
    // Launch a headless browser using Puppeteer
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'domcontentloaded' });

    // Scrape the page content
    const content = await page.content();
    const $ = cheerio.load(content);

    // Look for the video URL
    const videoURL = $('video').attr('src'); // Extract the URL from the <video> tag

    if (!videoURL) {
      return res.status(404).json({ error: 'Video not found on the page' });
    }

    // Return the video URL
    res.json({ video: videoURL });

    // Close the browser
    await browser.close();
  } catch (error) {
    console.error('Error fetching video:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

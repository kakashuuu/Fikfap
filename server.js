import express from 'express';
import puppeteer from 'puppeteer';
import * as cheerio from 'cheerio';  // Correct import for cheerio without 'default'

const app = express();
const port = 5000;

// Helper function to generate a random post ID between 1 and 100000
function getRandomPostId() {
  return Math.floor(Math.random() * 100000) + 1;
}

// Endpoint to fetch random video from Fikfap
app.get('/api/random-video', async (req, res) => {
  const postId = getRandomPostId(); // Generate a random post ID
  const url = `https://fikfap.com/post/${postId}`; // Construct URL for the post

  try {
    // Launch Puppeteer browser in headless mode
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'domcontentloaded' });

    // Extract page content using cheerio
    const content = await page.content();
    const $ = cheerio.load(content);

    // Extract the video URL from the page (Assuming it's inside a <video> tag)
    const videoURL = $('video').attr('src');  // Extract video URL from <video> tag

    // Check if video URL exists
    if (!videoURL) {
      // If no video is found, respond with a 404 error
      return res.status(404).json({
        error: 'No video found for this post.',
        postId: postId
      });
    }

    // Return the found video URL in JSON format
    res.json({
      video: videoURL
    });

    // Close the browser after scraping
    await browser.close();
  } catch (error) {
    console.error('Error fetching video:', error);
    res.status(500).json({
      error: 'Internal server error',
      details: error.message
    });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});

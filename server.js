import puppeteer from 'puppeteer';
import * as cheerio from 'cheerio';  // Correct import for cheerio without 'default'

const app = express();
const port = 5000;

function getRandomPostId() {
  return Math.floor(Math.random() * 100000) + 1;
}

app.get('/api/random-video', async (req, res) => {
  const postId = getRandomPostId();
  const url = `https://fikfap.com/post/${postId}`;

  try {
    const browser = await puppeteer.launch({
      headless: true,
      executablePath: '/usr/bin/chromium-browser' // Specify the correct Chromium path
    });
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'domcontentloaded' });

    const content = await page.content();
    const $ = cheerio.load(content);
    const videoURL = $('video').attr('src');

    if (!videoURL) {
      return res.status(404).json({
        error: 'No video found for this post.',
        postId: postId
      });
    }

    res.json({
      video: videoURL
    });

    await browser.close();
  } catch (error) {
    console.error('Error fetching video:', error);
    res.status(500).json({
      error: 'Internal server error',
      details: error.message
    });
  }
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});

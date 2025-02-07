import express from 'express';
import puppeteer from 'puppeteer';

const app = express();
const PORT = process.env.PORT || 5000;

app.get('/random-video', async (req, res) => {
  try {
    console.log("Launching Puppeteer...");
    const browser = await puppeteer.launch({
      executablePath: process.env.CHROME_PATH || '/usr/bin/google-chrome-stable', // Adjust path if needed
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    console.log("Browser launched, navigating to fikfap.com...");
    const page = await browser.newPage();
    
    // Navigate to the fikfap homepage
    await page.goto('https://fikfap.com', { waitUntil: 'networkidle2' });
    
    console.log("Scraping video links...");
    const videos = await page.evaluate(() => {
      const anchors = Array.from(document.querySelectorAll('a'));
      const videoAnchors = anchors.filter(a => {
        const href = a.getAttribute('href');
        return href && (/^\/post\/\d+/.test(href) || /^https:\/\/fikfap\.com\/post\/\d+/.test(href));
      });

      return videoAnchors.map(a => {
        const href = a.getAttribute('href');
        const title = a.getAttribute('title') || a.innerText.trim() || 'Random Video';
        return { title, url: href };
      });
    });
    
    await browser.close();
    
    if (!videos.length) {
      console.error("No video links found.");
      return res.status(404).json({ error: 'No video posts found.' });
    }
    
    const randomIndex = Math.floor(Math.random() * videos.length);
    let randomVideo = videos[randomIndex];
    
    if (randomVideo.url.startsWith('/')) {
      randomVideo.url = `https://fikfap.com${randomVideo.url}`;
    }
    
    console.log("Sending random video response...");
    res.json(randomVideo);
    
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ error: 'Error fetching random video.', details: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

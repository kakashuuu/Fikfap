import express from 'express';
import puppeteer from 'puppeteer';

const app = express();
const PORT = process.env.PORT || 5000;

app.get('/random-video', async (req, res) => {
  try {
    // Launch Puppeteer using your system-installed Chrome/Chromium.
    const browser = await puppeteer.launch({
      executablePath: process.env.CHROME_PATH || '/usr/bin/google-chrome-stable',
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    
    // Navigate to the homepage of fikfap.com.
    await page.goto('https://fikfap.com', { waitUntil: 'networkidle2' });
    
    // Scrape the page for links that match the /post/<number> pattern.
    const videos = await page.evaluate(() => {
      // Get all anchor tags on the page.
      const anchors = Array.from(document.querySelectorAll('a'));
      
      // Filter anchors whose href matches "/post/<number>" (handles both relative and absolute URLs).
      const videoAnchors = anchors.filter(a => {
        const href = a.getAttribute('href');
        return href && (/^\/post\/\d+/.test(href) || /^https:\/\/fikfap\.com\/post\/\d+/.test(href));
      });
      
      // Map to a simpler object with a title and URL.
      return videoAnchors.map(a => {
        const href = a.getAttribute('href');
        // Try to get a title attribute; otherwise, use trimmed innerText.
        const title = a.getAttribute('title') || a.innerText.trim() || 'Random Video';
        return { title, url: href };
      });
    });
    
    await browser.close();
    
    if (!videos.length) {
      return res.status(404).json({ error: 'No video posts found.' });
    }
    
    // Pick one video at random.
    const randomIndex = Math.floor(Math.random() * videos.length);
    let randomVideo = videos[randomIndex];
    
    // If the URL is relative, prepend the domain.
    if (randomVideo.url.startsWith('/')) {
      randomVideo.url = `https://fikfap.com${randomVideo.url}`;
    }
    
    res.json(randomVideo);
    
  } catch (error) {
    console.error('Error fetching random video:', error);
    res.status(500).json({ error: 'Error fetching random video.' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

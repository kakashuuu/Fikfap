const express = require('express');
const puppeteer = require('puppeteer');

const app = express();

// Example endpoint to fetch a page (adjust URL and logic as needed)
app.get('/video', async (req, res) => {
  try {
    const browser = await puppeteer.launch({
      // Use the system-installed Chrome/Chromium executable.
      // Update the executablePath if your Chrome/Chromium is located elsewhere.
      executablePath: '/usr/bin/google-chrome-stable',
      
      // Opt into the new headless mode
      headless: 'new',
      
      // Common flags for running in Linux environments
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();

    // Replace the URL with the desired target (e.g., the video page)
    await page.goto('https://example.com', { waitUntil: 'networkidle2' });
    
    // Here you can add any page interactions or processing code
    const content = await page.content();

    await browser.close();
    
    res.send(content);
  } catch (error) {
    console.error("Error fetching video:", error);
    res.status(500).send("Error fetching video.");
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});

const express = require('express');
const puppeteer = require('puppeteer');

const app = express();
const PORT = process.env.PORT || 5000;

async function fetchRandomCardId() {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    
    // Navigate to the Shoob.gg cards page and wait for the content to load
    await page.goto('https://shoob.gg/cards/', { waitUntil: 'domcontentloaded' });

    // Wait for the card links to be present on the page
    await page.waitForSelector('.card a');

    // Extract all card links and parse their IDs
    const cardIds = await page.evaluate(() => {
        const links = Array.from(document.querySelectorAll('.card a'));
        console.log(links.map(el => el.href)); // Log the links to the console for debugging
        return links.map(el => el.href.split('/').pop()); // Extract and return card IDs
    });

    await browser.close();

    if (cardIds.length === 0) throw new Error('No card IDs found');
    return cardIds[Math.floor(Math.random() * cardIds.length)];
}

app.get('/random-card', async (req, res) => {
    try {
        const id = await fetchRandomCardId();
        res.json({ id, url: `https://shoob.gg/cards/info/${id}` });
    } catch (error) {
        console.error(error); // Log the error for debugging
        res.status(500).json({ error: 'Failed to fetch card ID' });
    }
});

app.listen(PORT, () => console.log(`API running on port ${PORT}`));

const express = require('express');
const puppeteer = require('puppeteer');

const app = express();
const PORT = process.env.PORT || 3000;

async function fetchRandomCardId() {
    const browser = await puppeteer.launch({ 
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    await page.goto('https://shoob.gg/cards/', { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('.card a');

    const cardIds = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('.card a'))
            .map(el => el.href.split('/').pop());
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
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch card ID' });
    }
});

app.listen(PORT, () => console.log(`API running on port ${PORT}`));

import express from 'express';
import axios from 'axios';
import cheerio from 'cheerio';
import dotenv from 'dotenv';
import cors from 'cors';
import fs from 'fs';
import morgan from 'morgan';

// Load environment variables
dotenv.config();

// Express setup
const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS for all routes
app.use(cors());

// Logging middleware
const logStream = fs.createWriteStream('./logs/access.log', { flags: 'a' });
app.use(morgan('combined', { stream: logStream }));

// Function to fetch random videos from fikfap.com
async function fetchRandomVideo() {
    try {
        const response = await axios.get('https://fikfap.com/random');
        const $ = cheerio.load(response.data);

        // Extract video URLs (adjust selector as needed)
        const videoSrc = $('video source').attr('src');

        if (!videoSrc) throw new Error('No video found!');

        return {
            status: 'success',
            video_url: videoSrc
        };
    } catch (error) {
        console.error('Error fetching video:', error.message);
        return { status: 'error', message: error.message };
    }
}

// API route to fetch a random video
app.get('/api/random-video', async (req, res) => {
    const result = await fetchRandomVideo();
    res.json(result);
});

// Default route
app.get('/', (req, res) => {
    res.send('🎥 Welcome to the FikFap Random Video API!');
});

// Start the server
app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
});

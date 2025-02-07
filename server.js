import express from 'express';
import axios from 'axios';
import * as cheerio from 'cheerio'; // Fixed cheerio import
import dotenv from 'dotenv';
import cors from 'cors';
import fs from 'fs';
import morgan from 'morgan';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(morgan('dev'));

// Home route
app.get('/', (req, res) => {
    res.send('Hello Kakashi');
});

// Fetch random videos from fikfap.com
app.get('/api/random-video', async (req, res) => {
    try {
        const response = await axios.get('https://fikfap.com', {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
            },
        });

        const $ = cheerio.load(response.data);
        const videos = [];

        $('video source').each((_, element) => {
            const videoUrl = $(element).attr('src');
            if (videoUrl) videos.push(videoUrl);
        });

        if (videos.length === 0) {
            return res.status(404).json({ error: 'No videos found' });
        }

        // Pick a random video
        const randomVideo = videos[Math.floor(Math.random() * videos.length)];
        res.json({ video: randomVideo });

    } catch (error) {
        console.error('Error fetching videos:', error);
        res.status(500).json({ error: 'Failed to fetch videos' });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
});

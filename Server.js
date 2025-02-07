import express from 'express';
import axios from 'axios';
import cheerio from 'cheerio';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

app.get('/api/random-video', async (req, res) => {
    try {
        const response = await axios.get('https://fikfap.com/');
        const $ = cheerio.load(response.data);
        const videos = [];

        $('video').each((_, element) => {
            const videoUrl = $(element).attr('src');
            if (videoUrl) {
                videos.push(videoUrl);
            }
        });

        if (videos.length === 0) {
            return res.status(404).json({ error: 'No videos found' });
        }

        const randomVideo = videos[Math.floor(Math.random() * videos.length)];
        res.json({ video: randomVideo });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch videos' });
    }
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));

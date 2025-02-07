import Fastify from 'fastify';
import puppeteer from 'puppeteer';

const fastify = Fastify({
  logger: true,
});

// GET /video?url=<target-URL>
// Example: http://localhost:5000/video?url=https://example.com
fastify.get('/video', async (request, reply) => {
  const { url } = request.query;
  if (!url) {
    reply.status(400).send({ error: 'Missing required query parameter: url' });
    return;
  }

  try {
    const browser = await puppeteer.launch({
      // Use the system-installed Chrome/Chromium executable.
      // You can override this path using the CHROME_PATH environment variable.
      executablePath: process.env.CHROME_PATH || '/usr/bin/google-chrome-stable',
      // Opt into the new headless mode
      headless: 'new',
      // Additional arguments useful in Linux environments
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();

    // Navigate to the provided URL and wait until the network is idle
    await page.goto(url, { waitUntil: 'networkidle2' });
    const content = await page.content();

    await browser.close();

    reply.send({ content });
  } catch (error) {
    fastify.log.error(error);
    reply.status(500).send({ error: 'Failed to fetch video content.' });
  }
});

const start = async () => {
  try {
    // Listen on port 5000; adjust if needed
    await fastify.listen({ port: 5000, host: '0.0.0.0' });
    fastify.log.info(`Server is running at http://localhost:5000`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();

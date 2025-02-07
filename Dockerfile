# Use a lightweight Node.js image
FROM node:18-bullseye

# Set the working directory
WORKDIR /app

# Install necessary dependencies for Puppeteer
RUN apt-get update && apt-get install -y \
    chromium \
    libnss3 \
    libatk1.0-0 \
    libatk-bridge2.0-0 \
    libcups2 \
    libx11-xcb1 \
    libxcomposite1 \
    libxdamage1 \
    libxrandr2 \
    libgbm1 \
    libasound2 \
    libpangocairo-1.0-0 \
    libpango-1.0-0 \
    libgtk-3-0 \
    libxss1 \
    --no-install-recommends && rm -rf /var/lib/apt/lists/*

# Set Puppeteer to use system-installed Chromium
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm install
RUN npm install puppeteer-extra puppeteer-extra-plugin-stealth

# Copy application files
COPY . .

# Expose the port for Koyeb
EXPOSE 5000

# Start the application
CMD ["node", "server.js"]

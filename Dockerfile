# Use official Node.js image
FROM node:18-bullseye

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Install Chromium dependencies for Puppeteer
RUN apt-get update && apt-get install -y \
    libnss3 libatk1.0-0 libatk-bridge2.0-0 libcups2 libx11-xcb1 \
    libxcomposite1 libxdamage1 libxrandr2 libgbm1 libasound2 \
    libpangocairo-1.0-0 libpango-1.0-0 libgtk-3-0 libxss1 \
    --no-install-recommends && rm -rf /var/lib/apt/lists/*

RUN npm install puppeteer puppeteer-extra puppeteer-extra-plugin-stealth

RUN sudo apt install -y chromium-browser

# Copy the rest of the app files
COPY . .

# Expose the app port
EXPOSE 5000

# Start the application
CMD ["node", "server.js"]

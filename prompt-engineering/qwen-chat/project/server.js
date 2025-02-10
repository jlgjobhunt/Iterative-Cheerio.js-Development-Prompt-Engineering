const express = require('express');
const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = 3000;

// Middleware to parse JSON requests
app.use(express.json());
app.use(express.static('public'));

// Serve the main HTML file
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

// Handle crawling requests
io.on('connection', (socket) => {
    console.log('Client connected');

    socket.on('startCrawling', async ({ baseURL, pageURL, maxURLcount }) => {
        let browser;
        try {
            // Launch Puppeteer browser
            browser = await puppeteer.launch({
                headless: true,
                args: ['--no-sandbox', '--disable-setuid-sandbox'],
            });

            const discoveredURLs = new Set();
            const queue = [pageURL];
            let crawledCount = 0;

            while (queue.length > 0 && discoveredURLs.size < maxURLcount) {
                const currentURL = queue.shift();
                socket.emit('progress', `Crawling: ${currentURL}`);

                const page = await browser.newPage();
                await page.goto(currentURL, { waitUntil: 'networkidle2', timeout: 30000 });
                const html = await page.content();
                await page.close();

                const $ = cheerio.load(html);
                $('a[href]').each((_, a) => {
                    const href = $(a).attr('href');
                    try {
                        const resolvedURL = new URL(href, baseURL).href;
                        if (resolvedURL.startsWith(baseURL) && !discoveredURLs.has(resolvedURL)) {
                            discoveredURLs.add(resolvedURL);
                            queue.push(resolvedURL);
                        }
                    } catch (e) {
                        console.warn(`Invalid URL: ${href}`);
                    }
                });

                crawledCount++;
                socket.emit('progress', `Discovered ${discoveredURLs.size} unique URLs so far...`);
            }

            socket.emit('progress', `Crawling completed. Found ${discoveredURLs.size} unique URLs.`);
            socket.emit('results', Array.from(discoveredURLs));
        } catch (error) {
            console.error('Error during crawling:', error.message);
            socket.emit('progress', `Error: ${error.message}`);
        } finally {
            if (browser) {
                await browser.close();
            }
        }
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

// Start the server
server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
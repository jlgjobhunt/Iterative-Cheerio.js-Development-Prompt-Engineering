const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cheerio = require('cheerio');
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = 3000;

// Serve static files from the ./www/gui directory
app.use(express.static(path.join(__dirname, '../www/gui')));

// Endpoint to handle crawling requests
app.post('/crawl', async (req, res) => {
    try {
        // Parse form data sent as URL-encoded
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', async () => {
            const params = new URLSearchParams(body);
            const baseURL = params.get('baseURL');
            const pageURL = params.get('pageURL');
            const maxURLcount = parseInt(params.get('maxURLcount'), 10);

            // Validate inputs
            if (!baseURL || !pageURL || isNaN(maxURLcount) || maxURLcount <= 0) {
                return res.status(400).json({ error: 'Invalid input parameters.' });
            }

            // Perform crawling and emit progress updates via Socket.IO
            const discoveredURLs = await crawlSite(pageURL, baseURL, maxURLcount, io);

            // Send results back to the frontend
            res.json({ success: true, urls: Array.from(discoveredURLs) });
        });
    } catch (error) {
        console.error('Error during crawling:', error);
        res.status(500).json({ error: 'An error occurred during crawling.' });
    }
});

// Start the server
server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});

// Crawling functions
async function crawlPage(pageURL, baseURL) {
    try {
        const response = await fetch(pageURL);
        if (!response.ok) throw new Error(`Failed to fetch ${pageURL}: ${response.status}`);
        const html = await response.text();
        const $ = cheerio.load(html);
        const discoveredHTMLAElements = $('a[href]');
        const discoveredURLs = [];

        discoveredHTMLAElements.each((_, a) => {
            const href = $(a).attr('href');
            const resolvedURL = new URL(href, baseURL).href;
            discoveredURLs.push(resolvedURL);
        });

        return discoveredURLs.filter((url) => {
            try {
                const urlObj = new URL(url);
                const baseURLObj = new URL(baseURL);
                return urlObj.origin === baseURLObj.origin;
            } catch (e) {
                return false;
            }
        });
    } catch (error) {
        console.error(`Error crawling page ${pageURL}:`, error.message);
        return [];
    }
}

async function crawlSite(pageURL, baseURL, maxURLcount, io) {
    const pagesToCrawl = [pageURL];
    const pagesCrawled = new Set();
    const discoveredURLs = new Set();

    while (pagesToCrawl.length !== 0 && discoveredURLs.size < maxURLcount) {
        const page = pagesToCrawl.pop();
        const pageDiscoveredURLs = await crawlPage(page, baseURL);

        pageDiscoveredURLs.forEach(url => {
            discoveredURLs.add(url);
            if (!pagesCrawled.has(url) && url !== page) {
                pagesToCrawl.push(url);
            }
        });

        pagesCrawled.add(page);

        // Emit progress update to the frontend
        io.emit('progress', {
            crawled: pagesCrawled.size,
            total: discoveredURLs.size
        });
    }

    return discoveredURLs;
}


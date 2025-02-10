const express = require('express');
const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const http = require('http');
const { Server } = require('socket.io');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const fs = require('fs');

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
            // Validate input parameters.
            if (!baseURL || !pageURL || !maxURLcount || isNaN(maxURLcount)) {
                socket.emit('progress', 'Error: Invalid input parameters.');
                return;
            }

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

                // Block unnecessary resources.
                await page.setRequestInterception(true);
                page.on('request', (request) => {
                    if (['image', 'stylesheet', 'font', 'script'].includes(request.resourceType())) {
                        request.abort();
                    } else {
                        request.continue();
                    }
                });

                // Navigate to the page with increased timeout.
                try {
                    await page.goto(currentURL, { waitUntil: `networkidle2`, timeout: 60000 });
                 
                }   catch (error) {
                    console.warn(`Failed to load page: ${currentURL}. skipping...`);
                    continue; // Skip to the next URL.
                }
                
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
            
            // Export results to CSV.
            const csvWriter = createCsvWriter({
                path: 'results.csv',
                header: [{ id: 'url', title: 'URL' }],
            });
            
            const urlsArray = Array.from(discoveredURLs).map(url => ({ url }));
            await csvWriter.writeRecords(urlsArray);
            console.log('Results exported to results.csv');

            // Organize the Markdown file into sections based on URL categories.
            const categorizedLinks = {
                Domains: [],
                Tools: [],
                Hosting: [],
                Other: [],
            };

            urlsArray.forEach(({ url }) => {
                const hostname = new URL(url).hostname;
                const path = new URL(url).pathname;

                if (path.includes('domains')) {
                    categorizedLinks.Domains.push(`[${hostname}] (${url})`);
                } else if (path.includes('tools')) {
                    categorizedLinks.Tools.push(`[${hostname}] (${url})`);
                } else if (path.includes('hosting')) {
                    categorizedLinks.Hosting.push(`[${hostname}] (${url})`);
                } else {
                    categorizedLinks.Other.push(`[${hostname}] (${url}) `);
                }

            });

            /* Option 1: 
                const markdownContent = urlsArray.map(({ url }) => {
                    // Option 1: const linkText = new URL(url).hostname || 'Link';

                    // Option 2: Extract the last segment of the URL path for more descriptive links.
                    const linkText = new URL(url).pathname.split('/').pop() || 'Link';


                    return `[${linkText}]($(url))`;
                }).join('\n');
            */

            /* Option 2:
            |
            */
            let markdownContent = '';

            for (const [category, links] of Object.entries(categorizedLinks)) {
                markdownContent += `## ${category}\n\n${links.join('\n')}\n\n\r\n`;
            }


            // Option 1 & Option 2:
            fs.writeFileSync('results.md', markdownContent);
            console.log('Results exported to results.md .');

            // Send results to frontend.
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
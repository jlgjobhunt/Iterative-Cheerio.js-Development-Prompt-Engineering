// Alias the load function from Cheerio.js for web scraping.
const { load } = require('cheerio');

// Alias Node fs/promises for asynchronous file system operations.
const fs = require('fs/promises');

// Alias Node os for utilizing the EOL constant for end-of-line character.
const os = require('os');

async function crawlPage(pageURL, baseURL) {

    // Fetch the HTML document from the server.
    const response = await fetch(pageURL);

    // Parse the HTML document returned by the server and store it as html.
    const html = await response.text();

    // Load the HTML document stored as html into $ (identifier) for Cheerio operations.
    const $ = load(html);

    // Extract all hyperlinks from the HTML document loaded into $.
    // Cheerio's load object takes 'a[href]' as an argument to return only
    // the <a href=''></a> contents from the DOM of the HTML document.
    // The results are stored as discoveredHTMLAElements.
    const discoveredHTMLAElements = $('a[href]');

    // Create an array discoveredURLs for storing a list of hyperlinks.
    const discoveredURLs = [];

    /* Iterate over the hyperlinks in the HTML document stored in
    |  discoveredHTMLAElements using the Cheerio each() method and
    |  push each hyperlink to the discoveredURLs array.
    */ 
    discoveredHTMLAElements.each((_, a) => {
        discoveredURLs.push($(a).attr('href'));
    });

    // Print the URL array to see what data it contains.
    // It may still include references to /wp-admin or external domains.
    // This is useful for backlink counting in SEO.
    console.log(discoveredURLs);

    // Filter the hyperlinks that are for external domains and
    // filter out hyperlinks that refer to /wp-admin unless for wp-admin/admin-ajax.php.
    const filteredDiscoveredURLs = discoveredURLs.filter((url) => {
        return (
            url.startsWith(baseURL) &&
            (!url.startsWith(`${baseURL}/wp-admin`) || url === `${baseURL}/wp-admin/admin-ajax.php`)
        );
    });


    // Print the filtered URL array to see what data it contains.
    console.log(filteredDiscoveredURLs);


    return filteredDiscoveredURLs;
}

async function crawlSite(pageURL, baseURL, maxURLcount) {

    // Array of pages to crawl.
    const pagesToCrawl = [pageURL];

    // Array of pages crawled.
    const pagesCrawled = [];

    // Set (no redundant entries) of discovered URls.
    const discoveredURLs = new Set();


    // Implement the crawling logic.
    while (
        pagesToCrawl.length !== 0 &&
        discoveredURLs.size <= maxURLcount
    ) {
        // Select pageURL to craw from the pagesToCrawl array.
        const page = pagesToCrawl.pop();

        // Call crawlPage to get the robots.txt compliant hyperlinks.
        // They may still be redundant at this point.
        const pageDiscoveredURLs = await crawlPage(page, baseURL);

        /* Loop through Array retured by crawlPage and add them to
        |  the Set discoveredURLs to remove the redundant URLs
        |  in the pageDiscoveredURLs array by checking to see if
        |  the URL has been added to the pagesCrawled array.
        */
        pageDiscoveredURLs.forEach(url => {
            discoveredURLs.add(url)
            if (!pagesCrawled.includes(url) && url !== page
            ) {
                // Add the URL found to the pagesToCrawl array.
                pagesToCrawl.push(url);
            }
        });

        // Add the page crawled to the pagesCrawled array.
        pagesCrawled.push(page);
    }

    // Print the number of URLs found after removing redundancies.
    console.log(`${discoveredURLs.size} unique URLs found.`);


    // Convert the set to an array and join its values to generate CSV content.
    const csvContent = [...discoveredURLs].join(os.EOL);

    // Export the CSV string to an output file.
    await fs.writeFile('hyperlinks.csv', csvContent);

}


// Indicate the top-level url as baseURL.
const baseURL = 'https://scrapeme.live/';

// Indicate the page URL to discover URLs on.
const pageURL = 'https://scrapeme.live/shop';

// Indicate the maximum number of discovered URLs.
const maxURLcount = 300;

// Execute the crawlSite function.
crawlSite(pageURL, baseURL, maxURLcount);

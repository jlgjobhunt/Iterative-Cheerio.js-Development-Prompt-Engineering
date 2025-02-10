document.getElementById('crawlerForm').addEventListener('submit', async (event) => {
    event.preventDefault();

    // Get user inputs
    const baseURL = document.getElementById('baseURL').value.trim();
    const pageURL = document.getElementById('pageURL').value.trim();
    const maxURLcount = document.getElementById('maxURLcount').value.trim();

    // Validate inputs
    if (!baseURL || !pageURL || isNaN(maxURLcount) || maxURLcount <= 0) {
        alert('Please provide valid inputs.');
        return;
    }

    // Display loading message
    const resultLog = document.getElementById('resultLog');
    resultLog.textContent = 'Crawling in progress...';

    // Connect to the Socket.IO server
    const socket = io();

    // Listen for progress updates
    socket.on('progress', (data) => {
        document.getElementById('progressLog').textContent = `Crawled: ${data.crawled} / Total: ${data.total}`;
    });

    try {
        // Send POST request to the backend
        const response = await fetch('/crawl', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                baseURL: baseURL,
                pageURL: pageURL,
                maxURLcount: maxURLcount
            }).toString()
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();

        if (data.error) {
            resultLog.textContent = `Error: ${data.error}`;
        } else {
            resultLog.textContent = `Discovered ${data.urls.length} unique URLs:\n${data.urls.join('\n')}`;
        }
    } catch (error) {
        resultLog.textContent = `Error: ${error.message}`;
    }
});
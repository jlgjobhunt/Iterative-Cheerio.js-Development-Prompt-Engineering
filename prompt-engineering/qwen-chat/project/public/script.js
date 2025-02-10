document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('crawlerForm');
    const progressLog = document.getElementById('progressLog');
    const resultLog = document.getElementById('resultLog');

    const socket = io();

    form.addEventListener('submit', (event) => {
        event.preventDefault();

        // Clear previous logs
        progressLog.textContent = '';
        resultLog.textContent = '';

        // Get form values
        const baseURL = document.getElementById('baseURL').value.trim();
        const pageURL = document.getElementById('pageURL').value.trim();
        const maxURLcount = parseInt(document.getElementById('maxURLcount').value, 10);

        if (!baseURL || !pageURL || isNaN(maxURLcount) || maxURLcount < 1) {
            alert('Please fill out all fields correctly.');
            return;
        }

        // Notify the backend to start crawling
        socket.emit('startCrawling', { baseURL, pageURL, maxURLcount });
    });

    // Listen for progress updates
    socket.on('progress', (message) => {
        progressLog.textContent += message + '\n';
        progressLog.scrollTop = progressLog.scrollHeight; // Auto-scroll
    });

    // Listen for results
    socket.on('results', (urls) => {
        resultLog.textContent = urls.join('\n');
    });
});
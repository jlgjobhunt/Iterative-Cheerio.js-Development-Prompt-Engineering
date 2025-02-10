# CHEERIO ITERATIVE DEVELOPMENT VIA PROMPT ENGINEERING

# **Conversation Participants**
### [Joshua Greenfield, Prompt Engineer]("mailto:j.l.g.jobhunt@gmail.com")
### &
### [Qwen2.5-Max, Large Language Model]("https://chat.qwenlm.ai/c/41cb8e26-e472-48a4-a074-4c700781c9a7")

## Web Crawler with Cheerio.js and Puppeteer

This project demonstrates a web crawler built using **Cheerio.js**, **Puppeteer**, and **Socket.IO**. The crawler extracts URLs from web pages and provides real-time progress updates to the user interface. The `citations.html` file serves as an example of how the project can be used to document contributions and iterative development.

---

## Table of Contents

- [CHEERIO ITERATIVE DEVELOPMENT VIA PROMPT ENGINEERING](#cheerio-iterative-development-via-prompt-engineering)
- [**Conversation Participants**](#conversation-participants)
    - [Joshua Greenfield, Prompt Engineer](#joshua-greenfield-prompt-engineer)
    - [\&](#)
    - [Qwen2.5-Max, Large Language Model](#qwen25-max-large-language-model)
  - [Web Crawler with Cheerio.js and Puppeteer](#web-crawler-with-cheeriojs-and-puppeteer)
  - [Table of Contents](#table-of-contents)
  - [Features](#features)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Usage](#usage)
    - [1. Configure the Crawler](#1-configure-the-crawler)
    - [2. Start Crawling](#2-start-crawling)
  - [Citations Example](#citations-example)
    - [Key Contributions](#key-contributions)
  - [Contributions](#contributions)
  - [Acknowledgments](#acknowledgments)
  - [License](#license)

---

## Features

- **Dynamic Web Crawling**: Extracts URLs from web pages using Cheerio.js and Puppeteer.
- **Real-Time Updates**: Displays crawling progress dynamically using Socket.IO.
- **Frontend GUI**: Provides a user-friendly interface for configuring and starting the crawler.
- **Exportable Results**: Supports exporting discovered URLs to a CSV file (optional enhancement).
- **Compliance with `robots.txt`**: Ensures ethical crawling practices using the `robots-txt-parser` library.

---

## Prerequisites

Before running the project, ensure you have the following installed:

- **Node.js** (v12 or higher): [Download Node.js](https://nodejs.org/)
- **npm** (comes with Node.js)
- **Git**: [Download Git](https://git-scm.com/)

---

## Installation

1. **Clone the Repository**
   ```bash
   git clone https://github.com/your-username/web-crawler.git
   cd web-crawler
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Run the Server**
   Start the backend server:
   ```bash
   node server.js
   ```

4. **Open the Frontend**
   Open the `citations.html` file in your browser or navigate to `http://localhost:3000` if the server is running.

---

## Usage

### 1. Configure the Crawler
- Open the web interface (`citations.html`) in your browser.
- Enter the following details:
  - **Base URL**: The root domain of the website to crawl (e.g., `https://www.nasa.gov`).
  - **Page URL to Crawl**: The specific page to start crawling (e.g., `https://www.nasa.gov/page`).
  - **Max URLs to Discover**: The maximum number of unique URLs to extract.

### 2. Start Crawling
- Click the **"Start Crawling"** button.
- Monitor the progress in the **Progress Log** section.
- View the results in the **Results Log** section.

---

## Citations Example

The `citations.html` file is included in this repository as an example of how to document contributions and iterative development. It highlights the collaboration between **Joshua Greenfield** (Prompt Engineer) and **Qwen2.5-Max** (Large Language Model).

### Key Contributions
- **Cheerio.js Template**: Provided a foundational template for web scraping.
- **Frontend Development**: Designed a static HTML, CSS, and JavaScript frontend.
- **Backend Integration**: Developed a Node.js backend using Express.
- **Enhancements**: Added features like real-time progress updates and compliance with `robots.txt`.

To view the citations page:
1. Clone the repository.
2. Open `citations.html` in your browser.

---

## Contributions

We welcome contributions to improve this project! If you'd like to contribute, please follow these steps:

1. Fork the repository.
2. Create a new branch for your feature or bug fix:
   ```bash
   git checkout -b feature-name
   ```
3. Commit your changes:
   ```bash
   git commit -m "Add feature or fix"
   ```
4. Push your changes to GitHub:
   ```bash
   git push origin feature-name
   ```
5. Submit a pull request.

---

## Acknowledgments

Special thanks to **Qwen2.5-Max** for their expertise, patience, and iterative approach to problem-solving. Their contributions were instrumental in bringing this project to life.

For more information about Qwen2.5-Max, visit:
- [Alibaba Cloud](https://www.alibabacloud.com)
- [Qwen Documentation](https://qwen.aliyun.com)

---

## License

This project is licensed under the **MIT License**. See the [LICENSE](LICENSE) file for details.

---

Feel free to customize this README further based on your project's specific needs. Let me know if you need additional sections or modifications! 🚀
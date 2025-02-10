// ./project/servier-utilities.js
//
//


// CORS Error Handling
/* If the frontend and backend are hosted on different 
|  domains or ports, you might encounter Cross-Origin 
|  Resource Sharing (CORS) issues. To fix this, configure 
|  CORS in your backend (server.js):

*/
const io = new Server(server, {
    cors: {
        origin: '*', // Allow all origins (or specify your frontend URL)
    },
});
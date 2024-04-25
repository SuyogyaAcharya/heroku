// Importing required modules
const http = require('http');
const fs = require('fs');
const MongoClient = require('mongodb').MongoClient;
const querystring = require('querystring');

// MongoDB connection URL and database name
const url = "mongodb+srv://sachar05:Suyogya123@firstcluster.pmva5oy.mongodb.net/?retryWrites=true&w=majority&appName=FirstCluster";
const dbName = 'Stock';
const collectionName = 'PublicCompanies';

// Create a HTTP server
const server = http.createServer((req, res) => {
    if (req.method === 'GET') {
        // Serve the HTML form when accessed via HTTP GET
        fs.readFile('home.html', (err, data) => {
            if (err) {
                res.writeHead(500);
                res.end('Server error');
                console.error('Error reading HTML file:', err);
            } else {
                res.writeHead(200, { 'Content-Type': 'text/html' });
                res.end(data);
            }
        });
    } else if (req.method === 'POST') {
        // Handle form submission when accessed via HTTP POST
        let requestData = '';
        req.on('data', chunk => {
            requestData += chunk.toString();
        });
        req.on('end', () => {
            // Parse form data
            const formData = querystring.parse(requestData);
            // Call function to handle search
            handleSearch(formData, res);
        });
    }
});

// Function to handle search
async function handleSearch(formData, res) {
    const searchType = formData.searchType;
    const userInput = formData.userQuery;

    try {
        // Connect to MongoDB
        const client = await MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true });
        const db = client.db(dbName);
        const collection = db.collection(collectionName);

        let searchQuery = {};
        // Construct query based on search type
        if (searchType === 'ticker') {
            searchQuery = { ticker: userInput.toUpperCase() };
        } else if (searchType === 'name') {
            searchQuery = { name: new RegExp(userInput, 'i') }; 
        }

        // Perform search
        const results = await collection.find(searchQuery).toArray();
        // Close MongoDB connection
        await client.close();
        
        // Respond with search results
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.write('<html><body><h1>Search Results</h1>');
        results.forEach(stock => {
            res.write(`<p>Name: ${stock.name}, Ticker: ${stock.ticker}, Price: ${stock.price}</p>`);
        });
        res.end('</body></html>');
    } catch (error) {
        // Handle errors
        res.writeHead(500);
        res.end('Server error');
        console.error('Database connection error:', error);
    }
}

// Server setup
const port = process.env.PORT || 3000;
server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});

const http = require('http');
const fs = require('fs');
const MongoClient = require('mongodb').MongoClient;
const querystring = require('querystring');

const url = "mongodb+srv://sachar05:Suyogya123@firstcluster.pmva5oy.mongodb.net/?retryWrites=true&w=majority&appName=FirstCluster";
const client = new MongoClient(url);

const server = http.createServer(async (req, res) => {
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
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', async () => {
            const postData = querystring.parse(body);
            const searchType = postData.searchType;
            const searchQuery = postData.searchQuery;
            // Connect to MongoDB and perform search
            try {
                await client.connect();
                const db = client.db('Stock');
                const collection = db.collection('PublicCompanies');

                let query = {};
                if (searchType === 'ticker') {
                    query = { ticker: searchQuery.toUpperCase() };
                } else if (searchType === 'name') {
                    query = { name: new RegExp(searchQuery, 'i') };
                }

                const results = await collection.find(query).toArray();
                await client.close();
                // Respond with search results
                res.writeHead(200, { 'Content-Type': 'text/html' });
                res.write('<html><body><h1>Search Results</h1>');
                results.forEach(company => {
                    res.write(`<p>Name: ${company.name}, Ticker: ${company.ticker}, Price: ${company.price}</p>`);
                });
                res.end('</body></html>');
            } catch (error) {
                res.writeHead(500);
                res.end('Server error');
                console.error('Database connection error:', error);
            }
        });
    }
});

const port = 3000;
server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});

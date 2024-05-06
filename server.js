const express = require('express');
const bodyParser = require('body-parser');
const { MongoClient, ServerApiVersion } = require('mongodb');
const path = require('path');

const app = express();
const PORT = 3000;


const uri = "mongodb+srv://user:SfkdzfNNL7PoDTn9@budget.7mitxsw.mongodb.net/?retryWrites=true&w=majority";
//const mongoose = require('mongoose')
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

// Middleware to parse the body of POST requests
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

//connect to MongoDB before starting the server
async function connectDB() {
    try {
        await client.connect();
        console.log("Connected successfully to MongoDB");
    } catch (err) {
        console.error('Failed to connect to MongoDB', err);
        process.exit(1);
    }
}

connectDB();
// Endpoint to handle the form submission
app.post('/submit-budget', (req, res) => {
    const { name, date, price,dropdown } = req.body;
    console.log(req.body)
    console.log(`Name: ${name}, Date: ${date}, Price: ${price}`);

    // Here you can add your logic to process and store the data
    // For example, saving the data to a database
    
    createEntry(dropdown,name,date,price)
    console.log(`redirect link: ${req.protocol}://${req.get('host')}/testFrontEnd.html`)
    res.send(`
        <p>Budget submitted successfully!</p>
        <button onclick="window.location.href='${req.protocol}://${req.get('host')}/testFrontEnd.html'">Go Back</button>
    `);
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'testFrontEnd.html'));
});

app.get('/api/spendings', async (req, res) => {
    try {
        await client.connect();
        const db = client.db('Budget');
         // Fetching all collection names first
         const collections = await db.listCollections().toArray();
         const collectionNames = collections.map(c => c.name);
 
         // Array to hold all documents from all collections
         let allSpendings = [];
 
         // Loop through each collection and fetch its documents
         for (const collectionName of collectionNames) {
             const collection = db.collection(collectionName);
             const spendings = await collection.find({}).toArray();
             // Append collectionName to each document
            const spendingsWithCollectionName = spendings.map(document => ({
                ...document,
                collectionName: collectionName
            }));
            allSpendings = allSpendings.concat(spendingsWithCollectionName); // Concatenate results into allSpendings array
         }
         console.log(allSpendings)
         res.json(allSpendings)
    } catch (err) {
        console.error(err);
        res.status(500).send('Error fetching spendings');
    }
});

async function createEntry(categoryName,name, date,price){
    var obj = {'name': name, 'date': date, 'price': price}
    const db = await client.db('Budget');
    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);
    if (!collectionNames.includes(categoryName)) {
        createCategory(categoryName)
    }
    db.collection(categoryName).insertOne(obj, function(err,res){
        if(err) throw err;
        console.log("ITEM ADDED");
    });
    console.log("createEntry function exited")
  }


  async function createCategory(categoryName){
    try {
        const db = await client.db('Budget');
        await db.createCollection(collections.length +". "+categoryName); // Create collection using categoryName directly
        console.log(`Category created for ${categoryName}!`);
    }catch (error) {
        console.error('Error creating the collection:', error);
    }
}
app.get('/view', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'view.html'));
});

app.get('/collections', async (req, res) => {
    try {
        await client.connect();
        const db = await client.db('Budget');
        const collections = await db.listCollections().toArray();
        const collectionNames = collections.map(collection => collection.name);
        res.json(collectionNames);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error fetching collections');
    } finally {
        await client.close();
    }
});


app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

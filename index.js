const express = require("express");
const app = express();
const path = require("path");
const bodyParser = require("body-parser");
require("dotenv").config({ path: path.resolve(__dirname, '.env') }) 

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(__dirname + '/public'));
app.set("views", path.resolve(__dirname, "views"));
app.set("view engine", "ejs");

const URI = process.env.MONGO_CONNECTION_STRING;
const MERCURY_DB = process.env.DB;
const USER_COLLECTION = process.env.USER_COLLECTION;
const portNumber = 5000;

process.stdin.setEncoding("utf8")

const { MongoClient, ServerApiVersion } = require('mongodb');

let client;

async function main() {
    client = new MongoClient(URI, { serverApi: ServerApiVersion.v1 })
    try {
        await client.connect();
        app.listen(portNumber);
    } catch (e) {
        console.error(e);
    }
}

async function insertEntry(collection, entry) {
    await client.db(MERCURY_DB).collection(collection).insertOne(entry);
}

async function lookUpEntry(collection, filter) {
    const result = await client.db(MERCURY_DB).collection(collection).findOne(filter);

    if (result) {
        return result;
    } else {
        return null;
    }
}

async function lookUpMany(collection, gpa) {
    let filter = {gpa : { $gte: gpa}};
    const cursor = client.db(MERCURY_DB).collection(collection).find(filter);
    const result = await cursor.toArray();
    return result;
}

app.get("/", (req, res) => {
    const variables = { title: "Mercury", content: "Login to start!"};
    res.render("layout", variables);
});

main().catch(console.error);

console.log(`Web server started and running at http://localhost:${portNumber}/`);
const prompt = "Type stop to shutdown the server: ";
process.stdout.write(prompt);
process.stdin.on("readable", function () {
    const dataInput = process.stdin.read();
    if (dataInput !== null) {
        const command = dataInput.trim();
        if (command === "stop") {
            console.log("Shutting down the server");
            process.exit(0);
        } else {
            console.log("Invalid command: " + command);
        }
        process.stdout.write(prompt);
        process.stdin.resume();
    }
});
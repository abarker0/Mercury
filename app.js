const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const expressLayouts = require("express-ejs-layouts")
const bcrypt = require("bcrypt");

require("dotenv").config({ path: path.resolve(__dirname, ".env") }) 

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(__dirname + "/public"));
app.use(expressLayouts)
app.set("layout", "./layouts/layout")
app.set("views", path.resolve(__dirname, "views"));
app.set("view engine", "ejs");

const URI = process.env.MONGO_CONNECTION_STRING;
const MERCURY_DB = process.env.DB;
const USER_COLLECTION = process.env.USER_COLLECTION;
const PORT_NUMBER = 5000;
const SALT_ROUNDS = 10;

process.stdin.setEncoding("utf8")

const { MongoClient, ServerApiVersion } = require("mongodb");
const { lookup } = require("dns");

let client;

async function main() {
    client = new MongoClient(URI, { serverApi: ServerApiVersion.v1 })
    try {
        await client.connect();
        app.listen(PORT_NUMBER);
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

app.get("/", (req, res) => {
    res.render("index", { title: "Mercury" });
});

app.get("/login", (req, res) => {
    res.render("login", { title: "Login" })
});

app.post("/loginSuccess", (req, res) => {
    const { username, password } = req.body;
    lookUpEntry(USER_COLLECTION, { username: username} ).then((result) => {
        if (result) {
            if (bcrypt.compareSync(password, result.hashed)) {
                res.render("loginSuccess", { title: "Login" })
            } else {
                res.render("login", { title: "Login" })
                // alert("Incorrect password"); // CHANGE
            }
        } else {
            res.render("login", { title: "Login" })
            // alert("Incorrect username"); // CHANGE
        }
    });
});

app.get("/register", (req, res) => {
    res.render("register", { title: "Register" })
});

app.post("/registerSuccess", (req, res) => {
    const { username, password } = req.body;
    const salt = bcrypt.genSaltSync(SALT_ROUNDS);
    const hashed = bcrypt.hashSync(password, salt);
    insertEntry(USER_COLLECTION, { username: username, salt: salt, hashed: hashed })
    res.render("registerSuccess", { title: "Register" })
});

main().catch(console.error);

console.log(`Web server started and running at http://localhost:${PORT_NUMBER}/`);
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
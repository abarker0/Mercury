const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const expressLayouts = require("express-ejs-layouts");
const bcrypt = require("bcrypt");

require("dotenv").config({ path: path.resolve(__dirname, ".env") }) 

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(__dirname + "/public"));
app.use(expressLayouts)
app.set("layout", "./layouts/layout")
app.set("views", path.resolve(__dirname, "views"));
app.set("view engine", "ejs");
app.use(
    session({
      resave: true,
      saveUninitialized: false,
      secret: process.env.SESSION_SECRET,
    })
  );
app.use(function(req, res, next) {
    res.locals.user = req.session.user;
    next();
});

const degreePlan = require("./routes/degreePlan");
app.use("/degree-plan", degreePlan);

const URI = process.env.MONGO_CONNECTION_STRING;
const MERCURY_DB = process.env.DB;
const USER_COLLECTION = process.env.USER_COLLECTION;
const MAJOR_REQS_COLLECTION = process.env.MAJOR_REQS_COLLECTION;
const PORT_NUMBER = 5000;
const SALT_ROUNDS = 10;

process.stdin.setEncoding("utf8")

const { MongoClient, ServerApiVersion } = require("mongodb");
const { lookup } = require("dns");

let client;

async function main() {
    client = new MongoClient(URI, { serverApi: ServerApiVersion.v1 });
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
    res.render("home", { title: "Mercury" });
});

app.get("/login", (req, res) => {
    res.render("login", { title: "Login" });
});

app.get("/logout", (req, res) => {
    if (req.session.user != undefined) {
        req.session.destroy();
        res.redirect("/");
      } else {
        res.redirect("/");
      }
});

app.post("/process-login", async (req, res) => {
    const { username, password } = req.body;
    const result = await lookUpEntry(USER_COLLECTION, { username: username} );
    if (result) {
        if (bcrypt.compareSync(password, result.hashed)) {
            req.session.user = username;
            req.session.save();
            res.redirect("/");
        } else {
            res.render("login", { title: "Login", error: "Incorrect password." });
        }
    } else {
        res.render("login", { title: "Login", error: "Incorrect username." });
    }
});

app.get("/register", (req, res) => {
    res.render("register", { title: "Register" })
});

app.post("/process-registration", async (req, res) => {
    const { username, password } = req.body;
    const result = await lookUpEntry(USER_COLLECTION, { username: username} );
    if (result) { // account with same username already exists
        res.render("register", { title: "Register", error: "Account with the same username already exists." });
    } else {
        const salt = bcrypt.genSaltSync(SALT_ROUNDS);
        const hashed = bcrypt.hashSync(password, salt);
        insertEntry(USER_COLLECTION, { username: username, salt: salt, hashed: hashed });
        res.render("login", { title: "Login", success: "You've successfully created an account."});
    }
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
            console.log("Shutting down the server.");
            process.exit(0);
        } else {
            console.log("Invalid command: " + command);
        }
        process.stdout.write(prompt);
        process.stdin.resume();
    }
});
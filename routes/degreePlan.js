const express = require("express");
const router = express.Router();
const bodyParser = require("body-parser");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const expressLayouts = require("express-ejs-layouts");

router.get("/", (req, res) => {
    res.render("degreePlan", { title: "Degree Planner" });
});

router.get("/computer-science", (req, res) => {
    res.render("degreePlans/computerScience", { title: "Computer Science Planner" });
});

module.exports = router;
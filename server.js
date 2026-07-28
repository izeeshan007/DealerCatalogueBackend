require("dotenv").config();

const express = require("express");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const path = require("path");

const products = require("./products");

const app = express();
const cors = require("cors");
app.use(express.json());
app.use(cookieParser());


app.use(cors({
    origin: [
        "https://dealercatalogue.netlify.app",
        "https://dealer.eternalessence.in"
    ],
    credentials: true
}));

const PORT = process.env.PORT || 3000;
const SECRET = process.env.JWT_SECRET;

const DEALER_USERNAME = process.env.DEALER_USERNAME;
const DEALER_PASSWORD = process.env.DEALER_PASSWORD;

console.log("====================================");
console.log("Dealer Portal");
console.log("====================================");

console.log("Port     :", PORT);
console.log("====================================");



/*====================================
            AUTH MIDDLEWARE
====================================*/

function authenticate(req, res, next) {

    const token = req.cookies.dealerToken;

    if (!token) {

        return res.status(401).json({
            success: false,
            message: "Unauthorized"
        });

    }

    try {

        const decoded = jwt.verify(token, SECRET);

        req.user = decoded;

        next();

    }

    catch {

        return res.status(401).json({

            success: false,

            message: "Session Expired"

        });

    }

}


const dealers = [

    {
        username: "husain",
        password: "Husain@2026",
        name: "Husain"
    },

    {
        username: "asim",
        password: "Asim@2026",
        name: "Asim"
    },

    {
        username: "fardeen",
        password: "Fardeen@2026",
        name: "Fardeen"
    }

];


/*====================================
            LOGIN
====================================*/

app.post("/login", (req, res) => {

    const { username, password } = req.body;

    const dealer = dealers.find(
        d => d.username === username && d.password === password
    );

    if (!dealer) {

        return res.status(401).json({
            success: false,
            message: "Invalid Username or Password"
        });

    }

    const token = jwt.sign(

        {
            username: dealer.username,
            dealerName: dealer.name,
            discount: 0.70
        },

        SECRET,

        {
            expiresIn: "12h"
        }

    );

    res.cookie("dealerToken", token, {

        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        maxAge: 1000 * 60 * 60 * 12

    });

    res.json({
        success: true
    });

});



/*====================================
        VERIFY SESSION
====================================*/

app.get("/verify",

    authenticate,

    (req, res) => {

        res.json({

            success: true,

            user: req.user

        });

    }

);



/*====================================
        PRODUCTS
====================================*/

app.get(

    "/products",

    authenticate,

    (req, res) => {

        res.json({

            success: true,

            products

        });

    }

);



/*====================================
        LOGOUT
====================================*/

app.post("/logout",

    (req, res) => {

        res.clearCookie("dealerToken");

        res.json({

            success: true

        });

    }

);



/*====================================
        STATIC FILES
====================================*/

app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "Dealer Catalogue API is running"
    });
});


app.listen(PORT, () => {

    console.log("");

    console.log("====================================");

    console.log(`Dealer Portal Running`);

    console.log(`http://localhost:${PORT}`);

    console.log("====================================");

});
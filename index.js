const express = require("express");
const app = express();
const cors = require("cors");
const mongoose = require("mongoose");
const dotenv = require("dotenv").config();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");


const URL = process.env.DB || "mongodb://127.0.0.1:27017/fsd13";


mongoose.connect(URL)
    .then(() => console.log("Connected to Mongoose Atlas"))
    .catch(err => console.error("Connection error:", err));

const { Product } = require("./model/products");
const { Users } = require("./model/users");



app.use(express.json());
app.use(cors({ origin: "*" }));



function authenticate(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({ error: "Authorization header required" });
    }
    const token = authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({ error: "Token not found" });
    }
    try {
        const payload = jwt.verify(token, process.env.SECRET_KEY);
        req.user = payload;
        next();
    } catch (error) {
        res.status(401).json({ error: "Invalid or expired token" });
    }
}

app.post("/register", async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    if (name.length < 3 || name.length > 50) {
        return res.status(400).json({ error: "Name must be between 3 and 50 characters" });
    }

    if (!email.match(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)) {
        return res.status(400).json({ error: "Invalid email address" });
    }

    if (password.length < 8 || password.length > 128) {
        return res.status(400).json({ error: "Password must be between 8 and 128 characters" });
    }

    const existingUser  = await Users.findOne({ email });
    if (existingUser ) {
        return res.status(409).json({ error: "Email address already in use" });
    }

    try {
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(password, salt);

        await Users.create({
            name,
            email,
            password: hash
        });
        res.status(201).json({ message: "User Registered Successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


app.post("/login", async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    if (!email.match(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)) {
        return res.status(400).json({ error: "Invalid email address" });
    }

    if (password.length < 8 || password.length > 128) {
        return res.status(400).json({ error: "Password must be between 8 and 128 characters" });
    }

    const existingUser  = await Users.findOne({ email });
    if (!existingUser ) {
        return res.status(401).json({ error: "Invalid email or password" });
    }

    try {
        const isPasswordValid = await bcrypt.compare(password, existingUser .password);
        if (!isPasswordValid) {
            return res.status(401).json({ error: "Invalid email or password" });
        }

        let token = jwt.sign({ email: existingUser .email }, process.env.SECRET_KEY, { expiresIn: "1h" });
        res.json({ message: "Login Successful", token });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: error.message });
    }
});


app.get("/products", authenticate, async (req, res) => {
    const products = await Product.find();
    res.json(products);
});

app.get("/product/:id", authenticate, async (req, res) => {
    const id = req.params.id;
    if (!id) {
        return res.status(400).json({ error: "Missing required ID" });
    }
    if (!id.match(/^[a-f\d]{24}$/i)) {
        return res.status(400).json({ error: "Invalid ID" });
    }

    let product = await Product.findOne({ _id: id });
    res.json(product);
})

app.post("/product", authenticate, async (req, res) => {
    const { title, price } = req.body;
    if (!title || !price) {
        return res.status(400).json({ error: "Missing required fields" });
    }
    if (title.length < 1 || title.length > 255) {
        return res.status(400).json({ error: "Title must be between 1 and 255 characters" });
    }
    if (isNaN(price) || price < 0) {
        return res.status(400).json({ error: "Price must be a valid number" });
    }
    try {
        // let product = new Product({
        //     title: req.body.title,
        //     price: req.body.price
        // })
        // await product.save();

        await Product.create(req.body);

        res.json({ Message: "Product added successfully" });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }

});

app.put("/product/:id", authenticate, async (req, res) => {
    const id = req.params.id;
    const { title, price } = req.body;

    if (!id) {
        return res.status(400).json({ error: "Missing required ID" });
    }
    if (!id.match(/^[a-f\d]{24}$/i)) {
        return res.status(400).json({ error: "Invalid ID" });
    }
    if (title && (title.length < 1 || title.length > 255)) {
        return res.status(400).json({ error: "Title must be between 1 and 255 characters" });
    }
    if (price && (isNaN(price) || price < 0)) {
        return res.status(400).json({ error: "Price must be a valid number" });
    }

    try {
        await Product.findOneAndUpdate({ _id: id }, req.body);
        res.json({ message: "Product updated successfully" });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.delete("/product/:id", authenticate, async (req, res) => {
    const id = req.params.id;

    // Input validations
    if (!id) {
        return res.status(400).json({ error: "Missing required ID" });
    }
    if (!id.match(/^[a-f\d]{24}$/i)) {
        return res.status(400).json({ error: "Invalid ID" });
    }

    try {
        await Product.findOneAndDelete({ _id: id });
        res.json({ message: "Product deleted successfully" });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.listen(3001)
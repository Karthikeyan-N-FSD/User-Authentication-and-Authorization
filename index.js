const express = require("express");
const app = express();
const cors = require("cors");
const mongoose = require("mongoose");
const dotenv = require("dotenv").config();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");


// const URL = process.env.DB || "mongodb://127.0.0.1:27017/fsd13";
const URL = "mongodb://127.0.0.1:27017/fsd13";

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
    try {
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(req.body.password, salt);

        await Users.create({
            name: req.body.name,
            email: req.body.email,
            password: hash
        });
        res.status(201).json({ message: "User Registered Successfully" });
    } catch (error) {
        if (error.code === 11000) {
            res.status(409).json({ error: "Email already Registered" });
        } else {
            res.status(500).json({ error: error.message });
        }
    }
});

app.post("/login", async (req, res) => {
    try {
        let user = await Users.findOne({
            email: req.body.email
        });
        if (!user) return res.status(404).json({ error: "Email Not Registered" });

        const isPasswordValid = await bcrypt.compare(req.body.password, user.password);
        if (!isPasswordValid) return res.status(401).json({ error: "Wrong Password" });

        let token = jwt.sign({ email: user.email }, process.env.SECRET_KEY, { expiresIn: "1h" });
        res.json({ message: "Login Successful", token });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get("/products", authenticate, async (req, res) => {
    const products = await Product.find();
    res.json(products);
});

app.get("/product/:id", authenticate, async (req, res) => {

    let product = await Product.findOne({ _id: req.params.id });
    res.json(product);
})

app.post("/product", authenticate, async (req, res) => {

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
    await Product.findOneAndUpdate({ _id: req.params.id }, req.body);
    res.json({ Message: "Product Updated successfully" });
})

app.delete("/product/:id", authenticate, async (req, res) => {
    await Product.findOneAndDelete({ _id: req.params.id });
    res.json({ Message: "Product deleted successfully" });
})

app.listen(3001)
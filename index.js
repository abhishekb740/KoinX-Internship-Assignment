const express = require('express');
const app = express();
const { connectDB } = require("./config/db");
const Transaction = require("./models/Transaction");
const EthereumPrice = require("./models/EthereumPrices");

app.use(express.json());
connectDB();

const etherscanUrl = "https://api.etherscan.io/api";
const apiKey = process.env.ETHERSCAN_API_KEY;
const ethereumPriceUrl = "https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=inr";

const validateAddress = (req, res, next) => {
    const { address } = req.params;
    if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
        return res.status(400).json({ error: "Invalid Ethereum address" });
    }
    next();
};

const logErrors = (err, req, res, next) => {
    console.error("Error:", err.message);
    res.status(500).json({ error: "Internal Server Error" });
};

app.listen(3000, () => {
    console.log('Server is running on port 3000');
})
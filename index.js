const express = require('express');
const app = express();
const { connectDB } = require("./config/db");
const { config } = require("dotenv");
config();
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

app.get("/getNormalTransactions/:address", validateAddress, async (req, res, next) => {
    try {
        const { address } = req.params;
        const url = `${etherscanUrl}?module=account&action=txlist&address=${address}&apikey=${apiKey}`;
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error("Failed to fetch transactions");
        }

        const data = await response.json();
        if (data.status === "1") {
            const transactions = data.result;
            const newTransactions = [];
            for (const tx of transactions) {
                const existingTx = await Transaction.findOne({ hash: tx.hash });
                if (!existingTx) {
                    newTransactions.push(tx);
                }
            }
            if (newTransactions.length > 0) {
                await Transaction.insertMany(newTransactions);
            }
            res.json({ transactions: transactions });
        } else {
            throw new Error(data.message);
        }
    } catch (error) {
        next(error);
    }
});

const logErrors = (err, req, res, next) => {
    console.error("Error:", err.message);
    res.status(500).json({ error: "Internal Server Error" });
};

app.listen(3000, () => {
    console.log('Server is running on port 3000');
})
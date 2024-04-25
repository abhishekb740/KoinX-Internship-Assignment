const express = require("express");
const fetch = require("node-fetch").default;
const { config } = require("dotenv");
const { connectDB } = require("./config/db");
const Transaction = require("./models/Transaction");
const EthereumPrice = require("./models/EthereumPrices");
const cron = require("node-cron");
config();
const app = express();
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

app.get("/getUserDetails/:address", validateAddress, async (req, res, next) => {
    try {
        const { address } = req.params;

        const transactionsResponse = await fetch(`${etherscanUrl}?module=account&action=txlist&address=${address}&apikey=${apiKey}`);
        if (!transactionsResponse.ok) {
            throw new Error("Failed to fetch transactions");
        }
        const transactionsData = await transactionsResponse.json();
        if (transactionsData.status !== "1") {
            throw new Error(transactionsData.message);
        }
        const transactions = transactionsData.result;

        let balance = 0;
        transactions.forEach(tx => {
            if (tx.to.toLowerCase() === address.toLowerCase()) {
                balance += parseFloat(tx.value);
            }
            if (tx.from.toLowerCase() === address.toLowerCase()) {
                balance -= parseFloat(tx.value);
            }
        });

        const ethereumPriceResponse = await fetch(ethereumPriceUrl);
        if (!ethereumPriceResponse.ok) {
            throw new Error("Failed to fetch Ethereum price");
        }
        const ethereumPriceData = await ethereumPriceResponse.json();
        const ethereumPrice = ethereumPriceData.ethereum.inr;

        res.json({ balance, ethereumPrice });
    } catch (error) {
        next(error);
    }
});

const fetchAndStoreEthereumPrice = async () => {
    try {
        const ethereumPriceResponse = await fetch(ethereumPriceUrl);
        if (!ethereumPriceResponse.ok) {
            throw new Error("Failed to fetch Ethereum price");
        }
        const ethereumPriceData = await ethereumPriceResponse.json();
        const ethereumPrice = ethereumPriceData.ethereum.inr;

        const newEthereumPrice = new EthereumPrice({ price: ethereumPrice });
        await newEthereumPrice.save();
        console.log("Ethereum price fetched and stored successfully.");
        console.log(ethereumPrice);
    } catch (error) {
        console.error("Error fetching and storing Ethereum price:", error.message);
        res.status(500).json({ error: "Failed to fetch and store Ethereum price" }); // Send an error response to the client
    }
};


cron.schedule("*/10 * * * *", fetchAndStoreEthereumPrice);

app.use(logErrors);

const PORT = process.env.PORT || 6000;
app.listen(PORT, () => {
    console.log(`Server running on Port ${PORT}`);
});

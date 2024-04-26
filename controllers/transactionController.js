// controllers/transactionController.js
const Transaction = require("../models/Transaction");
const fetch = require("node-fetch").default;

const etherscanUrl = "https://api.etherscan.io/api";
const apiKey = process.env.ETHERSCAN_API_KEY;
const ethereumPriceUrl = "https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=inr";

const getNormalTransactions = async (req, res, next) => {
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
};

const getUserDetails = async (req, res, next) => {
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
            if ((tx.to.toLowerCase() === address.toLowerCase())) {
                balance += parseFloat(tx.value);
            }
            if ((tx.from.toLowerCase() === address.toLowerCase())) {
                balance -= parseFloat(tx.value);
            }
            
        });
        balance = balance/Math.pow(10, 18);

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
};

module.exports = { getNormalTransactions, getUserDetails };



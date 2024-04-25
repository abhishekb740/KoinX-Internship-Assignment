const express = require('express');
const app = express();
const { connectDB } = require("./config/db");

app.use(express.json());
connectDB();

const etherscanUrl = "https://api.etherscan.io/api";
const apiKey = process.env.ETHERSCAN_API_KEY;
const ethereumPriceUrl = "https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=inr";

app.listen(3000, () => {
    console.log('Server is running on port 3000');
})
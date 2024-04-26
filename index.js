// app.js
const express = require("express");
const { config } = require("dotenv");
const cron = require("node-cron");
const { connectDB } = require("./config/db");
const { getNormalTransactions, getUserDetails } = require("./controllers/transactionController");
const { fetchAndStoreEthereumPrice } = require("./controllers/ethereumPriceController");
const { logErrors } = require("./middleware/errorMiddleware");

config();
const app = express();
app.use(express.json());
connectDB();

cron.schedule("*/10 * * * *", fetchAndStoreEthereumPrice);

app.get("/",  (req, res) => {
    res.send("API Working!");
})
app.get("/getNormalTransactions/:address",  getNormalTransactions);
app.get("/getUserDetails/:address",  getUserDetails);

app.use(logErrors);

const PORT = process.env.PORT || 6000;
app.listen(PORT, () => {
    console.log(`Server running on Port ${PORT}`);
});

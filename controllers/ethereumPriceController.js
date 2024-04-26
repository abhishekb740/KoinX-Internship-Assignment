const EthereumPrice = require("../models/EthereumPrices");
const fetch = require("node-fetch").default;

const ethereumPriceUrl = "https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=inr";

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

module.exports = { fetchAndStoreEthereumPrice };
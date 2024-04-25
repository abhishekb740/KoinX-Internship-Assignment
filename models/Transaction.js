const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  hash: {
    type: String,
    required: true,
    unique: true
  },
  blockNumber: {
    type: Number,
    required: true
  },
  timeStamp: {
    type: Number,
    required: true
  },
  from: {
    type: String,
    required: true
  },
  to: {
    type: String,
    required: true
  },
  value: {
    type: String,
    required: true
  },
  gas: String,
  gasPrice: String,
  isError: String,
  txreceipt_status: String,
  input: String,
  contractAddress: String,
  cumulativeGasUsed: String,
  gasUsed: String,
  confirmations: String
});

const Transaction = mongoose.model('Transaction', transactionSchema);

module.exports = Transaction;

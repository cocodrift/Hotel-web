// utils/currencyConverter.js
const axios = require('axios');
require('dotenv').config();

async function convertCurrency(amount, fromCurrency, toCurrency) {
  const apiKey = process.env.APIKey; // Use environment variable for API key
  const url = `https://v6.exchangerate-api.com/v6/${apiKey}/latest/${fromCurrency}`;

  try {
    const response = await axios.get(url, {
      headers: {
        'Authorization': `Bearer ${apiKey}`
      }
    });
    const rate = response.data.rates[toCurrency];
    return amount * rate;
  } catch (error) {
    console.error('Error fetching exchange rates:', error);
    throw error;
  }
}

module.exports = convertCurrency;

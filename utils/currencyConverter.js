const axios = require('axios');

async function convertCurrency(amount, fromCurrency, toCurrency) {
    const apiKey = '8b86775a1db859a105e6cfef';
    const url = `https://v6.exchangerate-api.com/v6/${apiKey}/latest/${fromCurrency}`;

    try {
        const response = await axios.get(url);
        const rate = response.data.conversion_rates[toCurrency];
        return amount * rate;
    } catch (error) {
        console.error('Error fetching exchange rates:', error);
        throw error;
    }
}

module.exports = convertCurrency;

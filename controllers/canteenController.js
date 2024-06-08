// controllers/canteenController.js
const Item = require('../models/Item');

exports.renderCanteenPage = async (req, res, next) => {
  try {
    const items = await Item.find();
    res.render('canteen', { items });
  } catch (err) {
    next(err);
  }
};

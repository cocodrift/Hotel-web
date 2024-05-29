const Item = require('../models/Item');
const Order = require('../models/Order');

exports.getAddProduct = (req, res) => {
  res.render('addProducts');
};

exports.postAddProduct = async (req, res, next) => {
  const { name, category, imageUrl, priceInKES } = req.body;
  try {
    const newItem = new Item({ name, price: priceInKES, currency: 'KES', category, imageUrl, user: req.session.user });
    await newItem.save();
    res.redirect('/admin');
  } catch (error) {
    next(error);
  }
};

exports.getOrderSummary = async (req, res, next) => {
  try {
    const summary = await Order.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$placedAt" } },
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: "$totalPrice" }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    res.render('order-summary', { summary, user: req.session.user });
  } catch (err) {
    next(err);
  }
};

exports.getOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ status: 'active' }).sort({ placedAt: -1 });
    res.render('orders', { user: req.session.user, orders });
  } catch (err) {
    next(err);
  }
};

exports.getEditProduct = async (req, res, next) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) {
      return res.status(404).send('Product not found');
    }
    res.render('editProduct', { user: req.session.user, item });
  } catch (err) {
    next(err);
  }
};

exports.postEditProduct = async (req, res, next) => {
  const { id } = req.params;
  const { name, price, category, imageUrl, description } = req.body;
  try {
    const updatedProduct = await Item.findByIdAndUpdate(id, { name, price, category, imageUrl, description }, { new: true });
    if (!updatedProduct) {
      return res.status(404).send('Product not found');
    }
    res.redirect('/admin');
  } catch (error) {
    next(error);
  }
};

exports.deleteProduct = async (req, res, next) => {
  try {
    const item = await Item.findByIdAndDelete(req.params.id);
    if (!item) {
      return res.status(404).send('Product not found');
    }
    res.redirect('/admin');
  } catch (error) {
    next(error);
  }
};

exports.clearOrder = async (req, res) => {
  try {
    await Order.findByIdAndUpdate(req.params.id, { status: 'cleared' });
    res.redirect('/orders');
  } catch (err) {
    console.error('Error updating order status:', err);
    res.status(500).send('Internal Server Error');
  }
};

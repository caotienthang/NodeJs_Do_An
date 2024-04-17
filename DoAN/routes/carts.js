var express = require('express');
var session = require('express-session');
var router = express.Router();
var oderModel = require('../schemas/oder');
var protect = require('../middlewares/protect');
var productModel = require('../schemas/product');
var oderdetailModel = require('../schemas/oderdetail');

require('express-async-errors')

router.use(session({
    secret: 'thang123456', 
    resave: false,
    saveUninitialized: true
}));
router.get('/', (req, res) => {
    res.send(req.session.cart);
});
router.post('/add/:id', protect, async function (req, res, next) {
    var product = await productModel.findById(req.params.id).exec();
    const { _id: productId, name: productName, price: price,image:image } = product;
    if (!req.session.cart) {
        req.session.cart = [];
    }
    const existingProduct = req.session.cart.find(item => item.productId === req.params.id);
    if (existingProduct) {
        existingProduct.quantity += 1;
    } else {
        req.session.cart.push({ productId, productName, price,image, quantity: 1 });
    }
    res.send('Sản phẩm đã được thêm vào giỏ hàng');
  });
  router.post('/clear', (req, res) => {
    if (req.session.cart) {
        req.session.destroy((err) => {
            if (err) {
                console.error('Error clearing cart:', err);
                res.status(500).json({ error: 'Đã xảy ra lỗi khi xóa giỏ hàng' });
            } else {
                res.json({ message: 'Giỏ hàng đã được xóa thành công' });
            }
        });
    } else {
        res.json({ message: 'Giỏ hàng đã trống, không cần xóa' });
    }
});

router.delete('/:id', protect, async function (req, res, next) {
    const productId = req.params.id;
    if (req.session.cart) {
        // Tìm index của sản phẩm trong giỏ hàng
        const productIndex = req.session.cart.findIndex(item => item.productId === productId);
        if (productIndex !== -1) {
            // Xóa sản phẩm khỏi giỏ hàng
            req.session.cart.splice(productIndex, 1);
            res.send('Sản phẩm đã được xóa khỏi giỏ hàng');
        } else {
            res.status(404).send('Không tìm thấy sản phẩm trong giỏ hàng');
        }
    } else {
        res.status(404).send('Giỏ hàng không tồn tại');
    }
});
router.post('/oder',protect, async function (req, res, next) {
    let total = 0;

    if (req.session.cart) {
        req.session.cart.forEach(item => {
            total += item.price * item.quantity;
        });
    }
    try {
      let newOder = new oderModel({
        name: req.body.name,
        price: total,
        SDT: req.body.SDT,
        email: req.body.email,
        address: req.body.address,
        user: req.user._id
      });
      await newOder.save();
      req.session.cart.forEach(item => {
        let newOderdetail= new oderdetailModel({
          nameproduct: item.productName,
          price: item.price,
          image:item.image,
          quantity: item.quantity,
          oder: newOder._id
        });
        newOderdetail.save();
    });
      res.status(200).send(newOder);
    } catch (error) {
      res.status(404).send(error);
    }
  });
module.exports = router;

var express = require('express');
var router = express.Router();

/* GET home page. */
router.use('/users',require('./users'));
router.use('/auth',require('./auth'));
router.use('/products',require('./products'));
router.use('/oders',require('./oders'));
router.use('/carts',require('./carts'));
module.exports = router;

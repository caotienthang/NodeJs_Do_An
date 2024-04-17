var express = require('express');
var router = express.Router();
var productModel = require('../schemas/product')
var multer = require('multer');
var fs = require('fs');
var path = require('path');
var protect = require('../middlewares/protect')
var checkrole = require('../middlewares/checkrole')

require('express-async-errors')

//server.js

// SET STORAGE

  
router.get('/', async function (req, res, next) {
  let limit = req.query.limit ? req.query.limit : 6;
  let page = req.query.page ? req.query.page : 1;
  var queries = {};
  var exclude = ["sort", "page", "limit"];
  var stringFilter = ["name"];
  var numberFilter = ["year","price"];
  //{ page: '1', limit: '5', name: 'Hac,Ly', author: 'Cao' }
  for (const [key, value] of Object.entries(req.query)) {
    if (!exclude.includes(key)) {
      if (stringFilter.includes(key)) {
        queries[key] = new RegExp(value.replace(',', '|'), 'i');
      } else {
        if (numberFilter.includes(key)) {
          let string = JSON.stringify(value);
          let index = string.search(new RegExp('lte|gte|lt|gt', 'i'));
          if (index < 0) {
            queries[key] = value;
          } else {
            queries[key] = JSON.parse(string.slice(0, index) + "$" 
            + string.slice(2, string.length));
          }
        }
      }
    }
  }
  console.log(queries);
  queries.isDeleted = false;
  products = await productModel.find(queries)
    .skip((page - 1) * limit).limit(limit).exec();
  res.status(200).send(products);
});
router.get('/:id', async function (req, res, next) {
  var product = await productModel.findById(req.params.id).exec();
  res.status(200).send(product);
});

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
      const ext = path.extname(file.originalname);
      cb(null, file.fieldname + '-' + Date.now() + ext);
    }
  });
  
  const upload = multer({ storage: storage });
  
  router.post('/',protect, checkrole("ADMIN", "MODIFIER"), upload.single('image'), async function (req, res, next) {
    try {
      let newProduct = new productModel({
        name: req.body.name,
        year: req.body.year,
        price: req.body.price,
        image: req.file.path 
      });
      await newProduct.save();
      res.status(200).send(newProduct);
    } catch (error) {
      res.status(404).send(error);
    }
  });
  
  router.put('/:id',protect, checkrole("ADMIN", "MODIFIER"), upload.single('image'), async function (req, res, next) {
    try {
      var product = await productModel.findByIdAndUpdate(
        req.params.id,
        { $set: { ...req.body, image: req.file.path } }, // Updated this line
        { new: true }
      ).exec();
      res.status(200).send(product);
    } catch (error) {
      res.status(404).send(error);
    }
  });
  
router.delete('/:id',protect, checkrole("ADMIN", "MODIFIER"), async function (req, res, next) {
  try {
    var product = await productModel.findByIdAndDelete(req.params.id,
      {
        new: true
      }).exec();
    res.status(200).send(product);
  } catch (error) {
    res.status(404).send(error);
  }
});
module.exports = router;

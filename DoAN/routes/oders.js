var express = require('express');
var router = express.Router();
var oderModel = require('../schemas/oder');
var oderdetailModel = require('../schemas/oderdetail');
var protect = require('../middlewares/protect');

require('express-async-errors')

router.get('/',protect, async function (req, res, next) {
  let limit = req.query.limit ? req.query.limit : 5;
  let page = req.query.page ? req.query.page : 1;
  var queries = {};
  var exclude = ["sort", "page", "limit"];
  var stringFilter = ["name"];
  var numberFilter = ["price"];
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
  orders = await oderModel.find({ user: req.user._id, ...queries })
    .skip((page - 1) * limit)
    .limit(limit)
    .exec();

res.status(200).send(orders);

});
router.get('/:id',protect, async function (req, res, next) {
  var oder = await oderModel.findById(req.params.id).exec();
  var oderlist = await oderdetailModel.where({oder:req.params.id}).exec()
  res.status(200).send(oderlist);
});
  
router.delete('/:id', async function (req, res, next) {
  try {
    var oders = await oderModel.findByIdAndDelete(req.params.id,
      {
        new: true
      }).exec();
    res.status(200).send(oders);
  } catch (error) {
    res.status(404).send(error);
  }
});
module.exports = router;

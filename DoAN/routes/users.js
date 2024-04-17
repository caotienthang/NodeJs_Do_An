var express = require('express');
var router = express.Router();
var userModel = require('../schemas/user')
var ResHand = require('../helper/ResHandle')
var { validationResult } = require('express-validator');
var checkUser = require('../validators/user')
var protect = require('../middlewares/protect')
var checkrole = require('../middlewares/checkrole')

router.get('/', protect, checkrole("ADMIN", "MODIFIER"), async function (req, res, next) {
  let users = await userModel.find({}).exec();
  res.status(200).send(users);
});

router.get('/:id', protect, checkrole("ADMIN", "MODIFIER"), async function (req, res, next) {
  var user = await userModel.findById(req.params.id).exec();
  res.status(200).send(user);
});

router.post('/', protect, checkrole("ADMIN", "MODIFIER"), checkUser(), async function (req, res, next) {
  var result = validationResult(req);
  if (result.errors.length > 0) {
    ResHand(res, false, result.errors);
    return;
  }
  try {
    var newUser = new userModel({
      username: req.body.username,
      password: req.body.password,
      email: req.body.email,
      role: req.body.role
    })
    await newUser.save();
    res.status(200).send(newUser);
  } catch (error) {
    res.status(404).send(error);
  }
});
router.put('/:id', protect, checkrole("ADMIN", "MODIFIER"), async function (req, res, next) {
  try {
    var newUser = {
      username: req.body.username,
      password: req.body.password,
      email: req.body.email,
      role: req.body.role
  };
  let user = await userModel.findByIdAndUpdate(req.params.id, newUser,
      { new: true }
  ).exec();
  res.status(200).send(user);  
  } catch (error) {
    res.status(404).send(error);
  }
});


router.delete('/:id', protect, checkrole("ADMIN", "MODIFIER"), async function (req, res, next) {
  try {
    let user = await userModel.findByIdAndDelete
      (req.params.id, {
        status: false
      }, {
        new: true
      }).exec()
    res.status(200).send(user);
  } catch (error) {
    res.status(404).send(error);
  }
});

module.exports = router;
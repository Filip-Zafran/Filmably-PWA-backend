const bcrypt = require('bcryptjs');
const express = require('express');
const router = express.Router();
const User = require('../models/user');
const passport = require('passport');

//----------AUTHENTICATE ROUTER-----------------------

router.post('/login', (req, res, next) => {
  passport.authenticate('local', (err, user) => {
    if (err) throw err;
    if (!user) res.send({ message: 'No User Exists' });
    else {
      req.logIn(user, (err) => {
        if (err) throw err;
        res.send({
          message: 'Successfully Authenticated',
          user: { username: req.user.username },
        });
        console.log(req.user.username + ' logged in');
      });
    }
  })(req, res, next);
});

router.post('/register', (req, res) => {
  User.findOne({ username: req.body.username }, async (err, doc) => {
    try {
      if (err) throw err;
      if (doc) res.send('User Already Exists');
      if (!doc) {
        const hashedPassword = await bcrypt.hash(req.body.password, 10);

        const newUser = new User({
          username: req.body.username,
          password: hashedPassword,
        });
        await newUser.save();
        res.send('User Created');
      }
    } catch (error) {
      console.log(error);
    }
  });
});

router.get('/user', (req, res) => {
  res.send(req.user);
});

router.get('/logout', (req, res) => {
  res.send(req.user.username + ' Logged Out');
  console.log(req.user.username + ' Logged out');
  req.logout();
});

//----------LOADING FRIEND ROUTE----------

router.get('/Friends/users.json', (req, res) => {
  User.find({}, function (err, users) {
    try {
      if (err) throw err;

      if (users) {
        let loadsThreeLast = users.splice(users.length - 3, users.length - 1);
        res.send(loadsThreeLast);
      }
    } catch (err) {
      console.error('there was an error in users.json', error);
    }
  });
});

//----------SEARCH FRIENDS ROUTE----------
router.get('/Friends/FindPeople/:searchPeople', (req, res) => {
  let search = req.params.searchPeople;
  User.find({ $text: { $search: search } }, async (err, rs) => {
    try {
      if (err) throw err;
      if (rs) {
        res.send(rs);
      }
    } catch (err) {
      console.error('there is an error in search', err);
    }
  });
});

module.exports = router;

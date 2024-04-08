const express = require('express'); 
const exphbs  = require('express-handlebars');
const bcrypt = require('bcrypt');

const router  = express.Router(); 

const userController = require('../controllers/user'); 

router.get('/', userController.renderHome);

router.get('/signup', userController.renderNewUser);

router.post('/signup', userController.newUser); 

router.get('/login', userController.renderAuthUser);

router.post ('/login',userController.authUser);

router.get('/profile/:userId', userController.userProfile);

router.post('/profile/:userId', userController.profilePhoto);

//router.get('/profile/:userId', userController.userProfile);

router.post('/logout', userController.logoutUser);

router.get('/notifications', userController.notifications);

router.get('/messages', userController.messages);

router.get('/messages/:userId', userController.chat);

module.exports = router; 
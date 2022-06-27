const express = require('express');
const { sendMessage, allMessages } = require('../controllers/messageControllers');
const { protect } = require('../middlewares/authMiddlewares');
const router=express.Router();

//fetching all the messages of a chat
router.route('/:chatId').get(protect,allMessages);
//sending a new message to a chat
router.route('/').post(protect,sendMessage);

module.exports = router;
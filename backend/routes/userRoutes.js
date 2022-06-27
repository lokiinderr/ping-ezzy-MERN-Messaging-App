const express = require('express');
const { registerUser, authUser, allUsers } = require('../controllers/userControllers');
const { protect } = require('../middlewares/authMiddlewares');
const router=express.Router();

//now the end point which we provide to the request would be in 
// continuation to the /api/user/
router.route('/').post(registerUser).get(protect, allUsers);
router.post('/login',authUser);

module.exports=router;
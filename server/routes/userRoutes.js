const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');

const {
  getMyProfile,
  updateMyProfile,
  changeMyPassword,
  deleteMyAccount
} = require('../controllers/user/userProfileController');

router.use(protect);

router.get('/me', getMyProfile);
router.put('/me', updateMyProfile);
router.put('/me/password', changeMyPassword);
router.delete('/me', deleteMyAccount);

module.exports = router;

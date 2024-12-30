const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const multer = require('../middleware/multer-config')
const bookCtrl = require('../controllers/book');

router.post('/', auth, multer, bookCtrl.createBook);
router.get('/', bookCtrl.getAllBook);
router.get('/:id', bookCtrl.getOneBook);
router.get('/bestrating', bookCtrl.bestRatingBook);
router.put('/:id', auth, multer, bookCtrl.modifyOneBook);
router.delete('/:id', auth, bookCtrl.deleteBook);
router.post('/:id/rating', auth, bookCtrl.ratingBook);

module.exports = router;
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const multer = require('../middleware/multer-config')
const bookCtrl = require('../controllers/book');

router.post('/', auth, multer, bookCtrl.createBook);
router.post('/rating', auth, bookCtrl.ratingBook);
router.delete('/:id', auth, bookCtrl.deleteBook);
router.put('/:id', auth, multer, bookCtrl.modifyOneBook);
router.get('/bestrating', bookCtrl.bestRatingBook);
router.get('/:id', bookCtrl.getOneBook);
router.get('/', bookCtrl.getAllBook);

module.exports = router;
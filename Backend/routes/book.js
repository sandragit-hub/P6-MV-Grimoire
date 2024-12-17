const express = require('express');
const auth = require('../middleware/auth')
const bookCtrl = require('../controllers/book');
const router = express.Router();

router.post('/', auth, bookCtrl.createBook);
router.post('/bestrating', auth, bookCtrl.ratingBook);
router.delete('/:id', auth, bookCtrl.deleteBook);
router.put('/:id', auth, bookCtrl.modifyOneBook);
router.get('/bestrating', auth, bookCtrl.bestRatingBook);
router.get('/:id', auth, bookCtrl.getOneBook);
router.get('/', auth, bookCtrl.getAllBook);

module.exports = router;
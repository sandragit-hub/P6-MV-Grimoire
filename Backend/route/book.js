const express = require('express');
const router = express.Router();
const bookCtrl = require('../controllers/book');


router.post('/', bookCtrl.createBook);
router.delete('/:id', bookCtrl.deleteBook);
router.put('/:id', bookCtrl.modifyOneBook);
router.get('/bestrating', bookCtrl.ratingBook);
router.get('/:id', bookCtrl.getOneBook);
router.get('/', bookCtrl.getAllBook);

module.exports = router;
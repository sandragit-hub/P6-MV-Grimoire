const express = require('express');
const app = express();
const mongoose = require('mongoose');
const Book = require('./models/Book');

app.use(express.json()); //intercepte toute les requete avec content type json


app.post('/api/books', (req, res, next) => {
    const Book = new Book({
        ...req.body
    });
    Book.save()
        .then(() => res.status(201).json({ message: 'Objet enregistré !' }))
        .catch(error => res.status(400).json({ error }));
});

app.delete('/api/books/:id'), (req, res, next) => {
    Book.deleteOne({ _id: req.params.id }, { ...req.body, _id: req.params.id })
        .then(() => res.status(201).json({ message: 'Objet supprimé !' }))
        .catch(error => res.status(400).json({ error }));
}
app.put('/api/books/:id'), (req, res, next) => {
    Book.updateOne({ _id: req.params.id })
        .then(() => res.status(201).json({ message: 'Objet enregistré !' }))
        .catch(error => res.status(400).json({ error }));
}

app.get('/api/books/bestrating', (req, res, next) => {
    Book.find()
        .then(books => res.status(200).json(books))
        .catch(error => res.status(400).json({ error }));
});

app.get('/api/books/:id', (req, res, next) => {
    Book.findOne({ _id: req.params.id })
        .then(book => res.status(200).json(book))
        .catch(error => res.status(404).json({ error }));
});

app.get('/api/books', (req, res, next) => {
    Book.find()
        .then(books => res.status(200).json(books))
        .catch(error => res.status(400).json({ error }));
});

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next();
});

mongoose.connect('mongodb+srv://sandra17:gekZy9-ryfcoz-roczux@sandradata.e7zrm.mongodb.net/?retryWrites=true&w=majority&appName=SandraDATA',
    {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
    .then(() => console.log('Connexion à MongoDB réussie !'))
    .catch(() => console.log('Connexion à MongoDB échouée !'));

module.exports = app;
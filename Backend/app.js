const express = require('express');
const app = express();
const mongoose = require('mongoose');
const Book = require('./models/Book');

app.use(express.json());


app.post('/api/stuff', (req, res, next) => {
    delete req.body._id;
    const Book = new Book({
        ...req.body
    });
    Book.save()
        .then(() => res.status(201).json({ message: 'Objet enregistré !' }))
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
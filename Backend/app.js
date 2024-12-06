const express = require('express');

const app = express();

app.use((req, res, next) => {
    console.log('recu');
    next();
});

app.use((req, res, next) => {
    res.status(201);
    next();
});

app.use((req, res, next) => {
    res.json({ message: 'votre requete est good' });
    next();
});

app.use((req, res) => {
    console.log('Reponse envoyée avec succès!');
});
module.exports = app;
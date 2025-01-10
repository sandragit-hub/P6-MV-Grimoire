const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
require('dotenv').config(); // Charger les variables d'environnement depuis .env

// Ajoute le log pour vérifier si la variable est bien chargée
console.log("JWT_SECRET:", process.env.JWT_SECRET);

exports.signup = (req, res, next) => {
    // Regex pour valider une adresse e-mail
    const emailRegex = /^.+@.+\..{2,4}$/;

    // Vérifie si l'e-mail est valide
    if (!emailRegex.test(req.body.email)) {
        return res.status(400).json({ message: "Adresse e-mail invalide !" });
    }

    bcrypt.hash(req.body.password, 10)
        .then(hash => {
            const user = new User({
                email: req.body.email,
                password: hash
            });
            user.save()
                .then(() => res.status(201).json({ message: 'Utilisateur créé !' }))
                .catch(error => res.status(400).json({ error }));
        })
        .catch(error => res.status(500).json({ error }));
};


exports.login = (req, res, next) => {
    User.findOne({ email: req.body.email })
        .then(user => {
            if (!user) {
                console.log('Utilisateur non trouvé');
                return res.status(401).json({ message: 'Paire login/mot de passe incorrecte' });
            }
            bcrypt.compare(req.body.password, user.password)
                .then(valid => {
                    if (!valid) {
                        return res.status(401).json({ message: 'Paire login/mot de passe incorrecte' });
                    }
                    res.status(200).json({
                        userId: user._id,
                        token: jwt.sign(
                            { userId: user._id },
                            process.env.JWT_SECRET,
                            { expiresIn: '24h' }
                        )
                    });
                })
                .catch(error => res.status(500).json({ error }));
        })
        .catch(error => res.status(500).json({ error }));
};
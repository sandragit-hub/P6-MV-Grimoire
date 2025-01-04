const Book = require('../models/Book');
const fs = require('fs');
const sharp = require('sharp');

const MIME_TYPES = {
    'image/jpg': 'jpg',
    'image/jpeg': 'jpg',
    'image/png': 'png'
};

// Contrôleur de création de livre
exports.createBook = (req, res, next) => {
    const bookObject = JSON.parse(req.body.book);
    delete bookObject._id;
    delete bookObject._userId;

    // Nom du fichier redimensionné
    const name = req.file.originalname.split(' ').join('_');
    const extension = MIME_TYPES[req.file.mimetype];
    const originalFilename = name + Date.now() + '.' + extension

    // Chemin vers le fichier image redimensionné
    const resizedFilename = `resized_${originalFilename}`;
    const resizedFilePath = `images/${resizedFilename}`;

    // Utiliser Sharp pour redimensionner l'image
    sharp(req.file.buffer)
        .resize(400, 600) // Redimensionner l'image
        .toFile(resizedFilePath, (err) => {
            if (err) {
                console.error('Erreur lors du redimensionnement de l\'image :', err);
                return res.status(500).json({ error: 'Erreur lors du traitement de l\'image' });
            }
        });
    // Créer l'objet livre dans la base de données
    const book = new Book({
        ...bookObject,
        userId: req.auth.userId,
        imageUrl: `${req.protocol}://${req.get('host')}/images/${resizedFilename}`
    });

    book.save()
        .then(() => res.status(201).json({ message: 'Livre enregistré !' }))
        .catch(error => res.status(400).json({ error }));
};


exports.deleteBook = (req, res, next) => {
    Book.findOne({ _id: req.params.id })
        .then(book => {
            if (book.userId != req.auth.userId) {
                res.status(401).json({ message: 'Non authorisé' });
            } else {
                const filename = book.imageUrl.split('/images')[1];
                fs.unlink(`images/${filename}`, () => {
                    Book.deleteOne({ _id: req.params.id })
                        .then(() => res.status(201).json({ message: 'Livre supprimé !' }))
                        .catch(error => res.status(400).json({ error }));
                })
            }
        });
};

exports.modifyOneBook = (req, res, next) => {
    const bookObject = req.file
        ? { ...JSON.parse(req.body.book) }
        : { ...req.body };

    delete bookObject._userId;

    Book.findOne({ _id: req.params.id })
        .then((book) => {
            if (book.userId != req.auth.userId) {
                return res.status(401).json({ message: 'Non autorisé' });
            }

            if (req.file) {
                // Supprimer l'ancienne image
                const oldImagePath = `images/${book.imageUrl.split('/images/')[1]}`;
                fs.unlink(oldImagePath, (err) => {
                    if (err) {
                        console.error("Erreur lors de la suppression de l'ancienne image :", err);
                    }
                });

                // Nom du fichier redimensionné
                const name = req.file.originalname.split(' ').join('_');
                const extension = MIME_TYPES[req.file.mimetype];
                const resizedFilename = `resized_${name + Date.now()}.${extension}`;
                const resizedFilePath = `images/${resizedFilename}`;

                // Utiliser Sharp pour redimensionner l'image
                sharp(req.file.buffer)
                    .resize(400, 600)
                    .toFile(resizedFilePath, (err) => {
                        if (err) {
                            console.error("Erreur lors du redimensionnement de l'image :", err);
                            return res.status(500).json({ error: 'Erreur lors du traitement de l\'image' });
                        }

                        // Mettre à jour l'URL de l'image dans l'objet
                        bookObject.imageUrl = `${req.protocol}://${req.get('host')}/images/${resizedFilename}`;

                        // Mettre à jour le livre dans la base de données
                        Book.updateOne({ _id: req.params.id }, { ...bookObject, _id: req.params.id })
                            .then(() => res.status(200).json({ message: 'Livre modifié avec succès !' }))
                            .catch((error) => res.status(400).json({ error }));
                    });
            } else {
                // Si aucune image n'est fournie, mettre à jour les autres champs
                Book.updateOne({ _id: req.params.id }, { ...bookObject, _id: req.params.id })
                    .then(() => res.status(200).json({ message: 'Livre modifié avec succès !' }))
                    .catch((error) => res.status(400).json({ error }));
            }
        })
        .catch((error) => res.status(500).json({ error }));
};

exports.bestRatingBook = (req, res, next) => {
    Book.find()
        .sort({ rating: -1 }) // Tri décroissant par note
        .limit(3) // Limite à 3 livres
        .then(books => res.status(200).json(books))
        .catch(error => res.status(400).json({ error }));
};

exports.ratingBook = (req, res, next) => {

    // Vérifie que l'utilisateur est authentifié
    if (!req.auth.userId) {
        return res.status(401).json({ message: "Non autorisé" });
    }
    // Vérifie si l'ID du livre est présent
    if (!req.params.id) {
        return res.status(400).json({ message: 'L\'ID du livre est manquant !' });
    }
    // Crée la nouvelle note du livre
    const newRating = {
        userId: req.auth.userId,
        grade: req.body.rating,
    };

    // Vérifie si la note est un nombre et comprise entre 0 et 5
    if (typeof newRating.grade !== 'number' || newRating.grade < 0 || newRating.grade > 5) {
        return res.status(400).json({ message: 'La note doit être comprise entre 0 et 5 !' });
    }

    // Recherche le livre par son ID
    Book.findOne({ _id: req.params.id })
        .then(book => {

            // Vérifie si l'utilisateur a déjà voté
            const hasRated = book.ratings.find(rating => rating.userId === req.auth.userId);
            if (hasRated) {
                return res.status(400).json({ message: 'Vous avez déjà noté ce livre !' });
            }

            // Crée la nouvelle note et ajoute-la
            book.ratings.push(newRating);
            const totalRatings = book.ratings.reduce((sum, rating) => sum + rating.grade, 0);
            book.averageRating = totalRatings / book.ratings.length;

            // Sauvegarde le livre avec la nouvelle note
            return book.save()
                .then(updatedBook => {
                    res.status(200).json(updatedBook); // Renvoie le livre avec la nouvelle note
                })
                .catch(error => {
                    res.status(500).json({ error });
                });
        })
        .catch(error => {
            res.status(500).json({ error });
        });
};

exports.getOneBook = (req, res, next) => {
    Book.findOne({ _id: req.params.id })
        .then(book => res.status(200).json(book))
        .catch(error => res.status(404).json({ error }));
};

exports.getAllBook = (req, res, next) => {
    Book.find()
        .then(books => res.status(200).json(books))
        .catch(error => res.status(400).json({ error }));
};
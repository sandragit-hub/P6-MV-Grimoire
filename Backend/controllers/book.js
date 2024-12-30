const Book = require('../models/Book');
const fs = require('fs');
const sharp = require('sharp');

// Contrôleur de création de livre
exports.createBook = (req, res, next) => {
    const bookObject = JSON.parse(req.body.book);
    delete bookObject._id;
    delete bookObject._userId;

    // Nom du fichier de l'image originale
    const originalFilename = req.file.filename;

    // Chemin vers le fichier image redimensionné
    const resizedFilename = `resized_${originalFilename}`;
    const resizedFilePath = `images/${resizedFilename}`;

    // Utiliser Sharp pour redimensionner l'image
    sharp(req.file.path)
        .resize(300, 300) // Redimensionner l'image
        .toFile(resizedFilePath, (err) => {
            if (err) {
                console.error('Erreur lors du redimensionnement de l\'image :', err);
                return res.status(500).json({ error: 'Erreur lors du traitement de l\'image' });
            }

            // Supprimer l'image originale après traitement
            fs.unlink(req.file.path, (unlinkErr) => {
                if (unlinkErr) {
                    console.error('Erreur lors de la suppression du fichier original :', unlinkErr);
                }

                // Créer l'objet livre dans la base de données
                const book = new Book({
                    ...bookObject,
                    userId: req.auth.userId,
                    imageUrl: `${req.protocol}://${req.get('host')}/images/${resizedFilename}`
                });

                book.save()
                    .then(() => res.status(201).json({ message: 'Objet enregistré !' }))
                    .catch(error => res.status(400).json({ error }));
            });
        });
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
                        .then(() => res.status(201).json({ message: 'Objet supprimé !' }))
                        .catch(error => res.status(400).json({ error }));
                })
            }
        });
};

exports.modifyOneBook = (req, res, next) => {
    const bookObject = req.file ? {
        ...JSON.parse(req.body.book),
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    } : { ...req.body };

    delete bookObject._userId;
    Book.findOne({ _id: req.params.id })
        .then(book => {
            if (book.userId != req.auth.userId) {
                res.status(401).json({ message: 'Non autorisé' });
            } else {
                Book.updateOne({ _id: req.params.id }, { ...bookObject, _id: req.params.id })
                    .then(() => res.status(201).json({ message: 'Objet modifié !' }))
                    .catch(error => res.status(401).json({ error }));
            }
        })
        .catch((error) => {
            res.status(400).json({ error })
        });

};

exports.bestRatingBook = (req, res, next) => {
    Book.find()
        .sort({ rating: -1 }) // Tri décroissant par note
        .limit(3) // Limite à 3 livres
        .then(books => res.status(200).json(books))
        .catch(error => res.status(400).json({ error }));
};

exports.ratingBook = (req, res, next) => {
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
            // Vérifie si l'utilisateur est celui qui a ajouté le livre
            const userRated = book.ratings.some(rating => rating.userId === req.auth.userId);
            if (userRated) {
                return res.status(400).json({ message: 'Vous avez déjà noté ce livre !' });
            }

            // Vérifie si l'utilisateur a déjà voté
            const hasRated = book.ratings.some(rating => rating.userId === req.auth.userId);
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
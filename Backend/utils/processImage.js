const sharp = require('sharp');
const path = require('path');

const MIME_TYPES = {
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'image/webp': '.webp'
};

async function processImage(file, folder = 'images') {
    // Vérifie si le fichier est présent
    if (!file || !file.buffer) {
        throw new Error('Aucun fichier valide trouvé.');
    }

    const name = file.originalname.split(' ').join('_').split('.')[0]; // Sans extension
    const extension = MIME_TYPES[file.mimetype];

    // Vérifie si le type MIME est valide
    if (!extension) {
        throw new Error('Type MIME non pris en charge.');
    }

    const resizedFilename = `resized_${name}_${Date.now()}${extension}`;
    const resizedFilePath = path.join(folder, resizedFilename);

    try {
        // Redimensionner l'image avec sharp
        await sharp(file.buffer)
            .resize(400, 600, { fit: 'cover' }) // Ajuster selon vos besoins
            .toFile(resizedFilePath);

        return resizedFilePath; // Renvoie le chemin de l'image redimensionnée
    } catch (err) {
        throw new Error(`Erreur lors du traitement de l'image avec Sharp : ${err.message}`);
    }
}

module.exports = { processImage, MIME_TYPES };

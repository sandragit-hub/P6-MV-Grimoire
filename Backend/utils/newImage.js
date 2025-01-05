const sharp = require('sharp');
const path = require('path');

const MIME_TYPES = {
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'image/webp': '.webp'
};

function newImage(file, folder = 'images') {
    return new Promise((resolve, reject) => {
        if (!file || !file.buffer) {
            reject(new Error('Aucun fichier valide trouvé.'));
            return;
        }

        const name = file.originalname.split(' ').join('_').split('.')[0];
        const extension = MIME_TYPES[file.mimetype];
        if (!extension) {
            reject(new Error('Type MIME non pris en charge.'));
            return;
        }

        const resizedFilename = `resized_${name}_${Date.now()}${extension}`;
        const resizedFilePath = path.join(folder, resizedFilename);

        // Utiliser sharp pour redimensionner l'image
        sharp(file.buffer)
            .resize(400, 600, { fit: 'cover' })
            .toFile(resizedFilePath)
            .then(() => resolve(resizedFilePath))
            .catch(reject);
    });
}

module.exports = { newImage, MIME_TYPES };

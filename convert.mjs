import sharp from 'sharp';
import fs from 'fs';
const dir = 'public/images/';
fs.readdirSync(dir).forEach(file => {
    if (file.endsWith('.png') || file.endsWith('.jpg')) {
        sharp(dir+file).webp({quality:80}).toFile(dir+file.replace(/\.(png|jpg)$/, '.webp')).then(()=>console.log('Converted', file));
    }
});

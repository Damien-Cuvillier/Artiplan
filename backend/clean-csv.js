const fs = require('fs');
const path = require('path');

function cleanCsvFile(filePath) {
    console.log(`Nettoyage de ${filePath}...`);
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Supprimer les espaces après les virgules
    content = content.replace(/,\s+/g, ',');
    
    // Forcer les fins de ligne Windows
    content = content.replace(/\r?\n/g, '\r\n');
    
    // Écrire le fichier nettoyé
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Fichier nettoyé : ${filePath}`);
}

// Nettoyer tous les fichiers CSV
['clients.csv', 'utilisateurs.csv', 'chantiers.csv'].forEach(file => {
    cleanCsvFile(path.join(__dirname, file));
});

console.log('Nettoyage terminé !');
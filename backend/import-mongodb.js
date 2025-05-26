const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');

// Connexion à MongoDB
const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

async function readCsvFile(filePath) {
    console.log(`Lecture du fichier: ${filePath}`);
    let fileContent = fs.readFileSync(filePath, 'utf8');
    
    // Normaliser les fins de ligne
    fileContent = fileContent.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    
    console.log(`Contenu du fichier (premiers 200 caractères):\n${fileContent.substring(0, 200)}...`);

    const data = parse(fileContent, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
        relax_column_count: true  // Ajoutez cette ligne
    });

    console.log(`Données parsées (${data.length} entrées):`, JSON.stringify(data, null, 2));
    return data;
}

async function importData() {
    console.log("Début de l'importation...");
    try {
        console.log("Connexion à MongoDB...");
        await client.connect();
        console.log("Connecté à MongoDB");
        
        const db = client.db('gestion_chantiers');
        
        // Vérifier et importer les clients
        console.log("\n=== Traitement des clients ===");
        let clientsData;
        try {
            clientsData = await readCsvFile(path.join(__dirname, 'clients.csv'));
            if (!clientsData || clientsData.length === 0) {
                throw new Error("Aucune donnée client à importer");
            }
            
            console.log("Insertion des clients...");
            const clientsResult = await db.collection('clients').insertMany(clientsData);
            console.log(`✅ ${clientsResult.insertedCount} clients insérés`);
            
        } catch (error) {
            console.error("❌ Erreur lors de l'importation des clients:", error);
            throw error;
        }

        // Vérifier et importer les utilisateurs
        console.log("\n=== Traitement des utilisateurs ===");
        try {
            const utilisateursData = await readCsvFile(path.join(__dirname, 'utilisateurs.csv'));
            if (!utilisateursData || utilisateursData.length === 0) {
                throw new Error("Aucune donnée utilisateur à importer");
            }
            
            console.log("Insertion des utilisateurs...");
            const utilisateursResult = await db.collection('utilisateurs').insertMany(utilisateursData);
            console.log(`✅ ${utilisateursResult.insertedCount} utilisateurs insérés`);
            
        } catch (error) {
            console.error("❌ Erreur lors de l'importation des utilisateurs:", error);
            throw error;
        }

        // Vérifier et importer les chantiers
        console.log("\n=== Traitement des chantiers ===");
        try {
            const chantiersData = await readCsvFile(path.join(__dirname, 'chantiers.csv'));
            if (!chantiersData || chantiersData.length === 0) {
                throw new Error("Aucune donnée chantier à importer");
            }
            
            // Préparer les données des chantiers
            const chantiers = chantiersData.map(chantier => ({
                ...chantier,
                // Convertir les chaînes en nombres
                client_id: parseInt(chantier.client_id, 10),
                responsable_id: parseInt(chantier.responsable_id, 10),
                budget_prev: parseFloat(chantier.budget_prev),
                cout_actuel: parseFloat(chantier.cout_actuel),
                // Gérer les dates
                date_creation: new Date(chantier.date_creation),
                date_debut_prevue: new Date(chantier.date_debut_prevue),
                date_fin_prevue: new Date(chantier.date_fin_prevue),
                date_debut_reelle: chantier.date_debut_reelle ? new Date(chantier.date_debut_reelle) : null,
                date_fin_reelle: chantier.date_fin_reelle ? new Date(chantier.date_fin_reelle) : null,
                created_at: new Date(chantier.created_at),
                updated_at: new Date(chantier.updated_at),
                deleted_at: chantier.deleted_at ? new Date(chantier.deleted_at) : null
            }));

            console.log("Insertion des chantiers...");
            const chantiersResult = await db.collection('chantiers').insertMany(chantiers);
            console.log(`✅ ${chantiersResult.insertedCount} chantiers insérés`);
            
        } catch (error) {
            console.error("❌ Erreur lors de l'importation des chantiers:", error);
            throw error;
        }

        console.log("\n✅ Importation terminée avec succès !");

    } catch (err) {
        console.error("\n❌ Erreur critique lors de l'importation :", err);
    } finally {
        await client.close();
        console.log("Déconnexion de MongoDB");
    }
    
}

// Lancer l'importation
importData().catch(console.error);
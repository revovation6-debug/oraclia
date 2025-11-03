/**
 * SCRIPT DE CRÉATION D'ADMINISTRATEUR (EXEMPLE)
 * ---------------------------------------------
 *
 * ATTENTION : Ceci est un fichier d'exemple pour illustrer le concept.
 * Il ne fonctionnera PAS en l'état. Vous devez l'adapter à votre propre
 * backend, à votre base de données et à votre système d'authentification.
 *
 * Comment l'utiliser (après l'avoir adapté) :
 * node scripts/create-admin.js --username=admin --email=admin@oraclia.com --password=unmotdepassesecurise
 */

const bcrypt = require('bcrypt'); // Assurez-vous d'installer bcrypt : npm install bcrypt
// const { User } = require('../backend/models'); // Importez votre modèle User
// const db = require('../backend/database'); // Importez votre connexion à la base de données

const args = process.argv.slice(2).reduce((acc, arg) => {
    const [key, value] = arg.split('=');
    acc[key.substring(2)] = value;
    return acc;
}, {});

const createAdmin = async () => {
    const { username, email, password } = args;

    if (!username || !email || !password) {
        console.error('Erreur : Veuillez fournir --username, --email, et --password.');
        process.exit(1);
    }

    try {
        // --- ÉTAPE 1 : Connexion à la base de données ---
        // await db.connect(); // Exemple de connexion

        console.log('Vérification si l\'utilisateur existe déjà...');
        // const existingUser = await User.findOne({ where: { email } });
        // if (existingUser) {
        //     console.error(`Erreur : Un utilisateur avec l'email ${email} existe déjà.`);
        //     process.exit(1);
        // }

        // --- ÉTAPE 2 : Hachage du mot de passe ---
        console.log('Hachage du mot de passe...');
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // --- ÉTAPE 3 : Création de l'utilisateur dans la base de données ---
        console.log(`Création de l'utilisateur admin : ${username}...`);
        // const newAdmin = await User.create({
        //     username,
        //     email,
        //     password: hashedPassword,
        //     role: 'ADMIN', // Assurez-vous d'avoir une colonne 'role'
        //     status: 'ACTIVE'  // Activez le compte directement
        // });
        
        console.log('----------------------------------------------------');
        console.log('✅ Succès ! Administrateur créé.');
        // console.log(newAdmin.toJSON()); // Affiche l'utilisateur créé
        console.log('----------------------------------------------------');


    } catch (error) {
        console.error('❌ Une erreur est survenue lors de la création de l\'administrateur :', error);
    } finally {
        // --- ÉTAPE 4 : Fermeture de la connexion ---
        // await db.close(); // Fermez la connexion à la BDD
        process.exit(0);
    }
};

createAdmin();
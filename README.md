
# Oraclia - Plateforme de Tchat de Voyance en Ligne

Bienvenue dans le projet Oraclia ! Ceci est la base frontend d'une plateforme SAAS professionnelle de tchat de voyance en ligne, inspirée de kang.fr. L'application est construite avec React et TypeScript, et utilise Tailwind CSS pour un design moderne et responsive.

Ce document sert de guide complet pour comprendre l'état actuel du projet et les étapes nécessaires pour le transformer en une application de production entièrement fonctionnelle.

**État Actuel du Projet :** Le projet est actuellement un **prototype frontend entièrement fonctionnel**. L'interface utilisateur pour les trois rôles (Administrateur, Agent, Client) est complète et interactive. Toute la logique backend, la base de données, l'authentification et la communication en temps réel sont **simulées** via un fichier `mockApi.ts`.

## Table des matières

1.  [Fonctionnalités Implémentées (UI)](#fonctionnalités-implémentées-ui)
2.  [Démarrage Rapide (Local)](#démarrage-rapide-local)
3.  [Feuille de Route : Prochaines Étapes Cruciales](#feuille-de-route--prochaines-étapes-cruciales)
    -   [Étape 1 : Construction du Backend et de la Base de Données](#étape-1--construction-du-backend-et-de-la-base-de-données)
    -   [Étape 2 : Implémentation de l'Authentification Réelle](#étape-2--implémentation-de-lauthentification-réelle)
    -   [Étape 3 : Activation des E-mails Transactionnels](#étape-3--activation-des-e-mails-transactionnels)
    -   [Étape 4 : Intégration d'un Système de Tchat en Temps Réel](#étape-4--intégration-dun-système-de-tchat-en-temps-réel)
    -   [Étape 5 : Intégration du Paiement avec Stripe](#étape-5--intégration-du-paiement-avec-stripe)
    -   [Étape 6 : Création du Premier Compte Administrateur](#étape-6--création-du-premier-compte-administrateur)
4.  [Déploiement en Production](#déploiement-en-production)

---

## Fonctionnalités Implémentées (UI)

*   **Page d'accueil publique** avec sections "Experts", "Avis", "Tarifs".
*   **Modales d'inscription et de connexion** pour les clients.
*   **Tableau de bord Administrateur** complet avec :
    *   Vue des statistiques (visites, revenus, inscriptions).
    *   Gestion des clients et des agents (création/suppression).
    *   Gestion des profils de voyants (création/modification/assignation).
    *   Génération d'avis.
    *   Messagerie interne avec les agents.
*   **Tableau de bord Agent** avec :
    *   Interface de tchat pour discuter avec plusieurs clients.
    *   Vue des statistiques de performance.
    *   Consultation des profils de voyants assignés.
    *   Messagerie interne avec l'administrateur.
*   **Tableau de bord Client** avec :
    *   Interface de tchat avec minuteur et solde.
    *   Gestion du profil utilisateur.
    *   Historique des consultations et des paiements.
    *   Achat de packs de minutes.
*   **Thème Sombre et Clair** avec sauvegarde de la préférence.

---

## Démarrage Rapide (Local)

Pour lancer le projet sur votre machine, suivez ces étapes.

### Prérequis

*   [Node.js](https://nodejs.org/) (version 18 ou supérieure)
*   Un gestionnaire de paquets comme `npm` ou `yarn`.

### Installation

1.  **Clonez le dépôt (si vous l'avez sur GitHub) ou décompressez les fichiers** dans un nouveau dossier.

2.  **Installez les dépendances.** Le projet est actuellement configuré avec un `importmap` pour plus de simplicité, mais pour un développement robuste, il est recommandé d'utiliser `npm`. Un fichier `package.json` est fourni.
    ```bash
    # Naviguez dans le dossier du projet
    cd oraclia 

    # Installez les paquets
    npm install
    ```

3.  **Variables d'environnement.** Créez un fichier `.env` à la racine du projet. Même s'il n'est pas utilisé par l'API simulée, il sera essentiel pour la suite.
    ```
    # Clé publique de Stripe (commence par pk_test_...)
    VITE_STRIPE_PUBLIC_KEY=VOTRE_CLE_PUBLIQUE_STRIPE
    ```

4.  **Lancez le serveur de développement.**
    ```bash
    npm run dev
    ```
    Ouvrez votre navigateur et allez à l'adresse `http://localhost:5173` (ou celle indiquée dans votre terminal).

---

## Feuille de Route : Prochaines Étapes Cruciales

Voici le guide pas à pas pour transformer ce prototype en une application prête pour la production.

### Étape 1 : Construction du Backend et de la Base de Données

Le fichier `services/mockApi.ts` doit être entièrement remplacé par des appels à une véritable API que vous allez construire.

*   **Choix de la technologie :**
    *   **Backend :** Node.js avec Express.js (populaire en JavaScript), Django (Python), ou Ruby on Rails.
    *   **Base de données :** PostgreSQL (robuste et relationnel) ou MongoDB (flexible, NoSQL).

*   **Actions à réaliser :**
    1.  Mettre en place un nouveau projet pour votre backend.
    2.  Définir les modèles (schémas) pour vos données : `User`, `PsychicProfile`, `Conversation`, `Message`, `Review`, `Payment`, etc.
    3.  Créer des routes d'API (endpoints) pour chaque action actuellement simulée dans `mockApi.ts`. Par exemple : `POST /api/auth/register`, `GET /api/psychics`, `POST /api/chat/messages`.
    4.  Connecter votre backend à la base de données choisie.

### Étape 2 : Implémentation de l'Authentification Réelle

La sécurité est primordiale. L'authentification simulée doit être remplacée par un système sécurisé.

*   **Actions à réaliser :**
    1.  **Sur le backend :**
        *   Créez les routes `POST /api/auth/register` et `POST /api/auth/login`.
        *   Lors de l'inscription, **hachez les mots de passe** avec une bibliothèque comme `bcrypt` avant de les stocker dans la base de données. Ne stockez jamais de mots de passe en clair !
        *   Lors de la connexion, comparez le mot de passe fourni avec le hash stocké.
        *   Si la connexion réussit, générez un **JSON Web Token (JWT)**. Ce token contiendra des informations sur l'utilisateur (comme son ID et son rôle) et sera signé par une clé secrète.
    2.  **Sur le frontend :**
        *   Après une connexion réussie, stockez le JWT reçu dans le `localStorage` ou un cookie sécurisé.
        *   Pour chaque requête ultérieure vers une route protégée, incluez ce JWT dans l'en-tête `Authorization`.
        *   Le backend vérifiera la validité du JWT à chaque requête.

### Étape 3 : Activation des E-mails Transactionnels

Pour la vérification de compte et la réinitialisation de mot de passe.

*   **Choix de la technologie :** Un service d'envoi d'e-mails comme [**SendGrid**](https://sendgrid.com/), [**Mailgun**](https://www.mailgun.com/) ou [**Nodemailer**](https://nodemailer.com/) (si vous utilisez un backend Node.js).

*   **Actions à réaliser (pour la vérification) :**
    1.  Lors de l'inscription d'un nouvel utilisateur (`POST /api/auth/register`), le backend doit :
        *   Créer l'utilisateur avec un statut `PENDING_VERIFICATION`.
        *   Générer un **token de vérification unique** et à durée de vie limitée (ex: 24h).
        *   Stocker ce token dans la base de données, associé à l'utilisateur.
        *   Utiliser votre service d'e-mail pour envoyer un message à l'utilisateur contenant un lien, par exemple : `https://www.oraclia.fr/verify?token=VOTRE_TOKEN_UNIQUE`.
    2.  Le frontend a déjà la page `/verify/:token` (actuellement `/verify/:username` pour la démo). Il faudra l'adapter pour qu'elle envoie le token au backend.
    3.  Créez une route backend `POST /api/auth/verify-email`. Cette route :
        *   Reçoit le token.
        *   Vérifie s'il existe dans la base de données et s'il n'a pas expiré.
        *   Si le token est valide, change le statut de l'utilisateur à `ACTIVE` et supprime le token.
        *   Renvoie une réponse de succès au frontend.

### Étape 4 : Intégration d'un Système de Tchat en Temps Réel

Le tchat est le cœur d'Oraclia et nécessite une communication bidirectionnelle instantanée.

*   **Choix de la technologie :** Les **WebSockets** sont la solution standard. [**Socket.IO**](https://socket.io/) est une excellente bibliothèque (pour Node.js et le client) qui simplifie grandement la gestion des WebSockets.

*   **Actions à réaliser :**
    1.  **Sur le backend :**
        *   Intégrez un serveur Socket.IO à votre application Express.js.
        *   Lorsqu'un utilisateur se connecte au tchat, il rejoint une "room" spécifique à la conversation (par exemple, `conversation-123`).
        *   Lorsqu'un message est envoyé, le client l'émet au serveur.
        *   Le serveur reçoit le message, le sauvegarde dans la base de données, puis le **diffuse (broadcast)** à tous les autres membres de la "room" (c'est-à-dire l'autre participant au tchat).
    2.  **Sur le frontend :**
        *   Installez le client Socket.IO.
        *   Établissez une connexion avec le serveur WebSocket.
        *   Utilisez `socket.emit('sendMessage', ...)` pour envoyer des messages.
        *   Utilisez `socket.on('newMessage', ...)` pour écouter les nouveaux messages entrants et mettre à jour l'interface.

### Étape 5 : Intégration du Paiement avec Stripe

Pour un traitement des paiements sécurisé et fiable.

*   **Actions à réaliser :**
    1.  Créez un compte [**Stripe**](https://stripe.com/).
    2.  **Sur le backend :**
        *   Installez la bibliothèque Stripe pour votre langage (`stripe-node` pour Node.js).
        *   Créez une route `POST /api/payments/create-payment-intent`. Elle prendra l'ID du pack de minutes et calculera le montant. Elle utilisera l'API Stripe pour créer un "Payment Intent" et renverra son `client_secret` au frontend.
        *   Créez un **webhook** (`POST /api/stripe-webhook`) pour écouter les événements de Stripe. C'est **crucial**. Lorsque Stripe confirme qu'un paiement a réussi (`payment_intent.succeeded`), ce webhook mettra à jour le solde de minutes de l'utilisateur dans **votre base de données**.
    3.  **Sur le frontend :**
        *   Utilisez [**React Stripe.js**](https://stripe.com/docs/stripe-js/react).
        *   Dans la modale d'achat, lorsque l'utilisateur valide, appelez votre backend pour créer le Payment Intent.
        *   Utilisez le `client_secret` reçu et les éléments React Stripe pour soumettre de manière sécurisée les informations de carte bancaire directement à Stripe (elles ne transiteront jamais par votre serveur).

### Étape 6 : Création du Premier Compte Administrateur

Un compte admin ne peut pas être créé via le formulaire d'inscription public pour des raisons de sécurité.

*   **Action à réaliser :**
    1.  Créez un **script** dans votre projet backend. Ce script se connectera directement à votre base de données pour insérer le premier utilisateur administrateur.
    2.  Un fichier d'exemple `scripts/create-admin.js` est fourni pour illustrer le concept. Vous devrez l'adapter à votre backend et à votre base de données.
    3.  Vous l'exécuterez une seule fois depuis votre terminal sur le serveur :
        ```bash
        node scripts/create-admin.js --username=admin --email=votre@email.com --password=UN_MOT_DE_PASSE_TRES_SECURISE
        ```
    Ce script devra hacher le mot de passe avant de l'insérer.

---

## Déploiement en Production

Une fois le backend développé, vous devrez déployer les deux parties de l'application.

*   **Frontend (React) :**
    *   **Services recommandés :** [**Vercel**](https://vercel.com/) ou [**Netlify**](https://www.netlify.com/). Ils sont optimisés pour les applications frontend, offrent des déploiements continus via GitHub et sont très simples à configurer.
    *   **Processus :** Connectez votre dépôt GitHub, configurez la commande de build (`npm run build`) et le dossier de publication (`dist`).

*   **Backend (Node.js, etc.) :**
    *   **Services recommandés :** [**Render**](https://render.com/), [**Heroku**](https://www.heroku.com/) ou des services cloud plus avancés comme AWS ou Google Cloud.
    *   **Processus :**
        1.  Vous devrez configurer une base de données de production (ex: via les add-ons de Heroku/Render ou un service comme Neon/Supabase pour PostgreSQL).
        2.  Configurez vos variables d'environnement de production (clés d'API Stripe, secret JWT, URL de la base de données, etc.) dans l'interface de votre hébergeur. **Ne les mettez jamais en clair dans votre code.**

Bon développement ! Ce projet a des fondations solides, et avec cette feuille de route, vous avez toutes les clés en main pour en faire un succès.
![All rights reserved](https://img.shields.io/badge/license-All%20rights%20reserved-red)

## ⚠️ Propriété et droits d’auteur

Ce projet est la propriété exclusive de Damien Cuvillier.  
Le code source n’est pas libre de droits et ne peut pas être réutilisé, copié ou distribué sans l’accord explicite de l’auteur.

👨‍💻 Je suis ouvert à toute discussion pour un poste en CDI ou une collaboration professionnelle.  
N’hésitez pas à me contacter pour en savoir plus ou pour accéder à certaines parties du projet.

---

© 2024 Damien Cuvillier – Tous droits réservés.

# 🏗️ Chantier App - Application de Gestion de Chantiers

Une application complète de gestion de chantiers pour les entreprises de construction, rénovation et travaux publics.

## ✨ Fonctionnalités

### 🔐 Authentification & Gestion des Utilisateurs
- **Inscription/Connexion** sécurisée
- **Gestion des rôles** (Admin, Chef de chantier, Ouvrier)
- **Profils utilisateurs** personnalisables

### 📋 Gestion des Chantiers
- **Création et modification** de chantiers
- **Suivi en temps réel** du statut (Planification, En cours, Terminé)
- **Gestion des budgets** et des délais
- **Photos et documents** attachés
- **Géolocalisation** des chantiers

### 🛠️ Gestion des Interventions
- **Planification** des interventions
- **Suivi des tâches** par équipe
- **Rapports d'intervention** détaillés
- **Validation** des travaux effectués

### 📊 Tableau de Bord
- **Vue d'ensemble** des chantiers actifs
- **Statistiques** de progression
- **Alertes** et notifications
- **Graphiques** de performance

### 📱 Multi-Plateforme
- **Application Web** responsive
- **Application Desktop** (Electron)
- **Application Mobile** (PWA)
- **Synchronisation** en temps réel

### 📄 Génération de Documents
- **Devis** automatiques
- **Factures** personnalisées
- **Rapports** de chantier
- **Export PDF** professionnel

## 🛠️ Technologies Utilisées

### Frontend
- **React 19** - Interface utilisateur moderne
- **Vite** - Build tool ultra-rapide
- **Tailwind CSS** - Design responsive
- **Zustand** - Gestion d'état
- **React Router** - Navigation
- **React Hook Form** - Formulaires
- **React PDF** - Génération de documents

### Backend
- **Node.js** - Runtime JavaScript
- **Express.js** - Framework web
- **MongoDB** - Base de données NoSQL
- **JWT** - Authentification sécurisée
- **Multer** - Upload de fichiers
- **Bcrypt** - Hashage des mots de passe

### Déploiement
- **Electron** - Application desktop
- **PWA** - Application mobile
- **Docker** - Containerisation
- **Nginx** - Serveur web

## 🚀 Installation

### Prérequis
- Node.js 18+ 
- MongoDB 5+
- npm ou yarn

## 📦 Structure du Projet

```
chantier-app/
├── frontend/                 # Application React
│   ├── src/
│   │   ├── components/      # Composants réutilisables
│   │   ├── pages/          # Pages de l'application
│   │   ├── store/          # Gestion d'état (Zustand)
│   │   ├── services/       # Services API
│   │   └── utils/          # Utilitaires
│   ├── electron/           # Configuration Electron
│   └── public/             # Assets statiques
├── backend/                # API Node.js
│   ├── src/
│   │   ├── controllers/    # Contrôleurs API
│   │   ├── models/         # Modèles MongoDB
│   │   ├── routes/         # Routes API
│   │   └── middleware/     # Middleware Express
│   └── uploads/            # Fichiers uploadés
└── docs/                   # Documentation
```


### Base de Données

L'application utilise MongoDB avec les collections suivantes :
- `users` - Utilisateurs et authentification
- `chantiers` - Chantiers et projets
- `interventions` - Interventions et tâches
- `uploads` - Fichiers et documents


## 🎯 Cas d'Usage

### Entreprises de Construction
- **Gestion de chantiers** multiples
- **Suivi des équipes** en temps réel
- **Planification** des ressources
- **Reporting** client

### Artisans Indépendants
- **Gestion de projets** simples
- **Suivi des devis** et factures
- **Planning** des interventions
- **Communication** client

### Bureaux d'Études
- **Suivi technique** des chantiers
- **Gestion documentaire** complète
- **Validation** des travaux
- **Archivage** des projets

## 💰 Modèles de Vente

### Licence Standard
- **Application complète** (Web + Desktop + Mobile)
- **Code source** inclus
- **Documentation** détaillée
- **Support** 6 mois
- **Mises à jour** gratuites 1 an

### Licence Pro
- **Tout de la licence Standard**
- **Support** 12 mois
- **Formation** en ligne incluse
- **Personnalisation** basique
- **Déploiement** assisté

### Licence Entreprise
- **Tout de la licence Pro**
- **Support** illimité
- **Personnalisation** avancée
- **Formation** sur site
- **Intégration** avec vos systèmes

## 🔒 Sécurité

- **Authentification JWT** sécurisée
- **Validation** des données côté serveur
- **Protection CSRF** intégrée
- **Hashage** des mots de passe
- **Upload sécurisé** des fichiers
- **HTTPS** obligatoire en production

## 📞 Support

- **Documentation** complète incluse
- **Vidéos** de formation
- **Support technique** par email
- **Communauté** d'utilisateurs
- **Mises à jour** régulières

## 🎨 Personnalisation

L'application est entièrement personnalisable :
- **Thèmes** et couleurs
- **Logo** et branding
- **Modules** optionnels
- **Intégrations** tierces
- **Workflows** métier

## 📈 Roadmap

### Version 2.0 (Q2 2024)
- **Gestion des stocks** et matériaux
- **Planification** avancée
- **Intégration** comptabilité
- **API** publique

### Version 3.0 (Q4 2024)
- **IA** pour l'optimisation
- **Reality Capture** (photos 3D)
- **IoT** et capteurs
- **Blockchain** pour la traçabilité

## 📄 Licence

Ce projet est vendu sous licence commerciale. Voir le fichier `LICENSE` pour plus de détails.

## 🤝 Contribution

Pour les acheteurs de licence Pro et Entreprise :
- **Suggestions** de fonctionnalités
- **Tests** beta
- **Feedback** utilisateur
- **Développement** collaboratif

---

**Chantier App** - La solution complète pour la gestion de vos chantiers 🏗️

*Développé avec ❤️ pour les professionnels du bâtiment*

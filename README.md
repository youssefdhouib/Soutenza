<div align="center">
  <img src="https://img.icons8.com/color/96/000000/graduation-cap.png" alt="Soutenza Logo"/>
  <h1>🎓 Soutenza</h1>
  <p><strong>Plateforme complète de gestion des soutenances universitaires</strong></p>
  
  [![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.2-6DB33F?style=for-the-badge&logo=spring&logoColor=white)](https://spring.io/projects/spring-boot)
  [![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
  [![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?style=for-the-badge&logo=mysql&logoColor=white)](https://www.mysql.com/)
  [![JWT](https://img.shields.io/badge/JWT-Security-000000?style=for-the-badge&logo=JSON%20web%20tokens&logoColor=white)](https://jwt.io/)
</div>

<br />

Soutenza est une application web moderne conçue pour numériser et simplifier l'organisation des soutenances de fin d'études. Elle permet aux administrateurs, aux membres du jury et aux étudiants de collaborer de manière fluide depuis la planification jusqu'à la publication des résultats.

## ✨ Fonctionnalités Principales

- 👨‍💼 **Tableau de bord Administrateur** : Création automatisée des comptes (avec envoi du mot de passe par email), gestion des salles, affectation des jurys et planification des soutenances.
- 👨‍🏫 **Espace Jury & Enseignant** : Saisie des notes, consultation du planning des soutenances et évaluation des étudiants.
- 🎓 **Espace Étudiant** : Consultation du statut de la soutenance, affichage de la salle, du jury et du résultat final.
- 🔒 **Sécurité avancée** : Authentification par JWT, mots de passe cryptés, modification du mot de passe sécurisée et rôles stricts.

---

## 🚀 Comment lancer le projet en local ?

Le projet est divisé en deux parties : le Backend (Spring Boot / Java) et le Frontend (React / Vite). Vous devez démarrer les deux pour que l'application fonctionne.

### 📋 Prérequis

Avant de commencer, assurez-vous d'avoir installé :
- **Java 17 ou 21**
- **Node.js** (v16 ou +)
- **MySQL** (serveur de base de données en cours d'exécution)
- **Maven** (inclus dans le projet via `mvnw`)

---

### 1️⃣ Configuration et Démarrage du Backend (Java / Spring Boot)

1. Ouvrez un terminal et naviguez vers le dossier `back_end` :
   ```bash
   cd back_end
   ```

2. **Créer la base de données**  
   Ouvrez MySQL (via phpMyAdmin, MySQL Workbench ou terminal) et créez une base de données nommée `soutenza` :
   ```sql
   CREATE DATABASE soutenza;
   ```

3. **Définir les variables d'environnement**  
   Le backend nécessite un compte Gmail (avec un "Mot de passe d'application") pour envoyer les emails de bienvenue. Vous devez également spécifier votre version de Java.

   **Sur Windows (PowerShell) :**
   ```powershell
   $env:JAVA_HOME="C:\Program Files\Java\jdk-21"
   $env:PATH="$env:JAVA_HOME\bin;$env:PATH"
   $env:MAIL_USERNAME="votre-email@gmail.com"
   $env:MAIL_PASSWORD="votre-mot-de-passe-app-gmail"
   $env:MAIL_FROM="votre-email@gmail.com"
   ```
   *(Si votre mot de passe MySQL n'est pas `inter`, mettez-le à jour dans `back_end/src/main/resources/application.properties`)*

4. **Lancer le serveur Spring Boot**
   ```powershell
   .\mvnw spring-boot:run
   ```
   Le backend sera accessible sur : `http://localhost:9006`

---

### 2️⃣ Configuration et Démarrage du Frontend (React)

1. Ouvrez un **nouveau** terminal et naviguez vers le dossier `front_end` :
   ```bash
   cd front_end
   ```

2. **Installer les dépendances**
   ```bash
   npm install
   ```

3. **Lancer le serveur de développement**
   ```bash
   npm run dev
   ```
   Le frontend sera accessible sur : `http://localhost:5173`

---

## 🔑 Comptes de Démonstration par défaut

Une fois l'application lancée, la base de données sera automatiquement remplie (via Flyway) avec des données de test. Utilisez ces comptes pour vous connecter :

| Rôle | Email | Mot de passe |
| :--- | :--- | :--- |
| **Admin** | `admin@soutenza.local` | `password` |
| **Jury (Président)** | `kallel@soutenza.local` | `password` |
| **Étudiant** | `ahmed@soutenza.local` | `password` |

*(Une fois connecté, vous pourrez tester la nouvelle fonctionnalité de modification de mot de passe en haut à droite de l'écran).*

---

## 🛠️ Technologies Utilisées

### Backend
- **Java 21** / Spring Boot 3.2
- **Spring Security** (JWT Authentication)
- **Spring Data JPA** / Hibernate
- **Flyway** (Migrations de base de données)
- **JavaMailSender** (Envoi d'emails SMTP)
- **MySQL**

### Frontend
- **React 18** (Hooks, Context API)
- **Vite.js** (Bundler ultra-rapide)
- **Axios** (Requêtes HTTP avec intercepteurs JWT)
- **React Router Dom v6** (Navigation)
- **CSS3** (Variables CSS, Flexbox, Animations, UI Glassmorphism)

<div align="center">
  <p>Développé avec ❤️ pour l'excellence universitaire.</p>
</div>

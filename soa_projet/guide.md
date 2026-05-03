# Guide Soutenza

## Présentation

Soutenza est une application de gestion des soutenances académiques conçue en **monolithe modulaire orienté services**:

- un backend Spring Boot
- un frontend React
- une base relationnelle MySQL

## Architecture backend

Le backend est organisé par modules métier:

- `auth`
- `students`
- `teachers`
- `rooms`
- `defenses`
- `jury`
- `grades`
- `results`
- `publications`
- `conflicts`

Chaque module applique une structure couche contrôleur, service, repository, DTO.

## Règles métier principales

- Vérification d'existence des étudiants, encadrants et salles
- Détection de conflits temporels via la règle d'overlap:
  `new.start < existing.end AND new.end > existing.start`
- Contrôle des rôles de jury:
  - max 1 président
  - max 1 rapporteur
  - au moins 1 examinateur
- Saisie de note réservée aux membres du jury assignés
- Recalcul automatique de moyenne et mention
- Résultats visibles aux étudiants uniquement après publication

## Authentification / sécurité

- JWT stateless
- rôles: `ADMIN`, `STUDENT`, `JURY_MEMBER`, `SUPERVISOR`
- contrôle d'accès par endpoint via `@PreAuthorize`

## Base de données

- Schéma géré par **Flyway** (`db/migration`)
- scripts:
  - `V1__init_schema.sql`
  - `V2__seed_demo_data.sql`
- base cible: `soutenza`

## Frontend

UI React avec navigation par rôle:

- écran login
- espace admin (CRUD + planification + jury + publication)
- espace jury (soutenances assignées + notes)
- espace étudiant (planning + résultats publiés)

## Documentation API

Swagger disponible sur:

- `http://localhost:9006/swagger-ui.html`

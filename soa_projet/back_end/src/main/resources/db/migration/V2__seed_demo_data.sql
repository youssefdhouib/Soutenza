-- Demo password for all seeded users: password
-- BCrypt hash below corresponds to "password"

INSERT INTO users (id, email, password_hash, active, created_at, updated_at) VALUES
(1, 'admin@soutenza.local', '$2a$10$7EqJtq98hPqEX7fNZaFWoO5R3hQvM1J6QG2Hch6R7j7WvyaManIe', TRUE, NOW(), NOW()),
(2, 'etudiant1@soutenza.local', '$2a$10$7EqJtq98hPqEX7fNZaFWoO5R3hQvM1J6QG2Hch6R7j7WvyaManIe', TRUE, NOW(), NOW()),
(3, 'jury1@soutenza.local', '$2a$10$7EqJtq98hPqEX7fNZaFWoO5R3hQvM1J6QG2Hch6R7j7WvyaManIe', TRUE, NOW(), NOW()),
(4, 'supervisor1@soutenza.local', '$2a$10$7EqJtq98hPqEX7fNZaFWoO5R3hQvM1J6QG2Hch6R7j7WvyaManIe', TRUE, NOW(), NOW()),
(5, 'jury2@soutenza.local', '$2a$10$7EqJtq98hPqEX7fNZaFWoO5R3hQvM1J6QG2Hch6R7j7WvyaManIe', TRUE, NOW(), NOW());

INSERT INTO user_roles (user_id, role) VALUES
(1, 'ADMIN'),
(2, 'STUDENT'),
(3, 'JURY_MEMBER'),
(4, 'SUPERVISOR'),
(4, 'JURY_MEMBER'),
(5, 'JURY_MEMBER');

INSERT INTO students (id, student_code, first_name, last_name, email, department, level, active, user_id, created_at, updated_at) VALUES
(1, 'STU-2026-001', 'Amira', 'Ben Salah', 'etudiant1@soutenza.local', 'Informatique', 'M2', TRUE, 2, NOW(), NOW()),
(2, 'STU-2026-002', 'Youssef', 'Trabelsi', 'youssef.trabelsi@soutenza.local', 'Informatique', 'M2', TRUE, NULL, NOW(), NOW());

INSERT INTO teachers (id, first_name, last_name, email, rank_title, specialty, active, user_id, created_at, updated_at) VALUES
(1, 'Nadia', 'Krichen', 'supervisor1@soutenza.local', 'Professeure', 'Data Science', TRUE, 4, NOW(), NOW()),
(2, 'Karim', 'Mabrouk', 'jury1@soutenza.local', 'Maître de conférences', 'Sécurité', TRUE, 3, NOW(), NOW()),
(3, 'Leila', 'Saidi', 'jury2@soutenza.local', 'Professeure', 'Génie logiciel', TRUE, 5, NOW(), NOW()),
(4, 'Hichem', 'Baccar', 'hichem.baccar@soutenza.local', 'Professeur', 'IA', TRUE, NULL, NOW(), NOW());

INSERT INTO rooms (id, code, name, building, capacity, active, created_at, updated_at) VALUES
(1, 'A101', 'Salle A101', 'Bloc A', 45, TRUE, NOW(), NOW()),
(2, 'B202', 'Salle B202', 'Bloc B', 30, TRUE, NOW(), NOW());

INSERT INTO defenses (id, subject, description, student_id, supervisor_id, room_id, start_datetime, end_datetime, status, publication_status, final_average, final_mention, published_at, published_by, created_at, updated_at) VALUES
(1, 'Plateforme de suivi pédagogique', 'Application web de suivi pédagogique orientée services.', 1, 1, 1, '2026-06-10 09:00:00', '2026-06-10 10:30:00', 'PLANNED', 'UNPUBLISHED', NULL, NULL, NULL, NULL, NOW(), NOW()),
(2, 'Détection d anomalies réseau', 'Système d analyse intelligente des événements réseau.', 2, 1, 2, '2026-05-05 14:00:00', '2026-05-05 15:30:00', 'PUBLISHED', 'PUBLISHED', 14.50, 'BIEN', NOW(), 1, NOW(), NOW());

INSERT INTO defense_jury_assignments (id, defense_id, teacher_id, jury_role, created_at) VALUES
(1, 1, 1, 'RAPPORTEUR', NOW()),
(2, 1, 2, 'PRESIDENT', NOW()),
(3, 1, 3, 'EXAMINATEUR', NOW()),
(4, 2, 1, 'RAPPORTEUR', NOW()),
(5, 2, 2, 'PRESIDENT', NOW()),
(6, 2, 3, 'EXAMINATEUR', NOW());

INSERT INTO grades (id, defense_id, assignment_id, score, comment, submitted_at, updated_at) VALUES
(1, 2, 4, 14.00, 'Travail solide et bien structuré.', NOW(), NOW()),
(2, 2, 5, 15.00, 'Présentation claire avec une bonne maîtrise.', NOW(), NOW()),
(3, 2, 6, 14.50, 'Bonne discussion technique.', NOW(), NOW());

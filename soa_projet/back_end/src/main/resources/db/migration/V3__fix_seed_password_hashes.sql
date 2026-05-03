-- Fix invalid/truncated BCrypt hashes in seeded demo users.
-- Password for these accounts remains: password

UPDATE users
SET password_hash = '$2a$10$a1.zt0Py9hiOWwco/MS3l.8OwLNnfe3d2Y0A9JTBccnEzwOEXaBmK'
WHERE email IN (
    'admin@soutenza.local',
    'etudiant1@soutenza.local',
    'jury1@soutenza.local',
    'supervisor1@soutenza.local',
    'jury2@soutenza.local'
);

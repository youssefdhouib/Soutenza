CREATE TABLE users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(190) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL
);

CREATE TABLE user_roles (
    user_id BIGINT NOT NULL,
    role VARCHAR(50) NOT NULL,
    PRIMARY KEY (user_id, role),
    CONSTRAINT fk_user_roles_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE students (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    student_code VARCHAR(50) NOT NULL UNIQUE,
    first_name VARCHAR(120) NOT NULL,
    last_name VARCHAR(120) NOT NULL,
    email VARCHAR(190) NOT NULL UNIQUE,
    department VARCHAR(120) NOT NULL,
    level VARCHAR(120) NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    user_id BIGINT UNIQUE,
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL,
    CONSTRAINT fk_students_user FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE teachers (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    first_name VARCHAR(120) NOT NULL,
    last_name VARCHAR(120) NOT NULL,
    email VARCHAR(190) NOT NULL UNIQUE,
    rank_title VARCHAR(120) NOT NULL,
    specialty VARCHAR(160) NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    user_id BIGINT UNIQUE,
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL,
    CONSTRAINT fk_teachers_user FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE rooms (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(120) NOT NULL,
    building VARCHAR(120) NOT NULL,
    capacity INT NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL
);

CREATE TABLE defenses (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    subject VARCHAR(220) NOT NULL,
    description VARCHAR(2000) NOT NULL,
    student_id BIGINT NOT NULL,
    supervisor_id BIGINT NOT NULL,
    room_id BIGINT NOT NULL,
    start_datetime DATETIME NOT NULL,
    end_datetime DATETIME NOT NULL,
    status VARCHAR(30) NOT NULL,
    publication_status VARCHAR(30) NOT NULL,
    final_average DECIMAL(5,2),
    final_mention VARCHAR(30),
    published_at DATETIME,
    published_by BIGINT,
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL,
    CONSTRAINT fk_defenses_student FOREIGN KEY (student_id) REFERENCES students(id),
    CONSTRAINT fk_defenses_supervisor FOREIGN KEY (supervisor_id) REFERENCES teachers(id),
    CONSTRAINT fk_defenses_room FOREIGN KEY (room_id) REFERENCES rooms(id),
    CONSTRAINT fk_defenses_published_by FOREIGN KEY (published_by) REFERENCES users(id)
);

CREATE TABLE defense_jury_assignments (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    defense_id BIGINT NOT NULL,
    teacher_id BIGINT NOT NULL,
    jury_role VARCHAR(30) NOT NULL,
    created_at DATETIME NOT NULL,
    CONSTRAINT fk_assignments_defense FOREIGN KEY (defense_id) REFERENCES defenses(id) ON DELETE CASCADE,
    CONSTRAINT fk_assignments_teacher FOREIGN KEY (teacher_id) REFERENCES teachers(id),
    CONSTRAINT uk_defense_teacher UNIQUE (defense_id, teacher_id)
);

CREATE TABLE grades (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    defense_id BIGINT NOT NULL,
    assignment_id BIGINT NOT NULL,
    score DECIMAL(4,2) NOT NULL,
    comment VARCHAR(2000),
    submitted_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL,
    CONSTRAINT fk_grades_defense FOREIGN KEY (defense_id) REFERENCES defenses(id) ON DELETE CASCADE,
    CONSTRAINT fk_grades_assignment FOREIGN KEY (assignment_id) REFERENCES defense_jury_assignments(id) ON DELETE CASCADE,
    CONSTRAINT uk_grade_assignment UNIQUE (assignment_id)
);

CREATE INDEX idx_defense_room_schedule ON defenses(room_id, start_datetime, end_datetime);
CREATE INDEX idx_defense_student_schedule ON defenses(student_id, start_datetime, end_datetime);
CREATE INDEX idx_defense_supervisor_schedule ON defenses(supervisor_id, start_datetime, end_datetime);
CREATE INDEX idx_assignment_teacher ON defense_jury_assignments(teacher_id, defense_id);

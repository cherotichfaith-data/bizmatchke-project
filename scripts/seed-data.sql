-- Add admin user (password: admin123)
INSERT INTO users (name, email, password_hash, is_admin, created_at, updated_at)
VALUES 
('Admin User', 'admin@bizmatchke.co.ke', '$2a$10$JdvmIJDkXvLUCJRgRQGIQO8qJveGwGI9w0YrJqMHrR5BUMgQXJZMK', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (email) DO NOTHING;

-- Add regular user (password: user123)
INSERT INTO users (name, email, password_hash, bio, location, created_at, updated_at)
VALUES 
('John Doe', 'john@example.com', '$2a$10$JdvmIJDkXvLUCJRgRQGIQO8qJveGwGI9w0YrJqMHrR5BUMgQXJZMK', 'Regular user for testing', 'Nairobi', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (email) DO NOTHING;

-- Add skills
INSERT INTO skills (name, created_at)
VALUES 
('Web Development', CURRENT_TIMESTAMP),
('Marketing', CURRENT_TIMESTAMP),
('Finance', CURRENT_TIMESTAMP),
('Design', CURRENT_TIMESTAMP),
('Sales', CURRENT_TIMESTAMP)
ON CONFLICT (name) DO NOTHING;

-- Add interests
INSERT INTO interests (name, created_at)
VALUES 
('Technology', CURRENT_TIMESTAMP),
('Health', CURRENT_TIMESTAMP),
('Education', CURRENT_TIMESTAMP),
('Food', CURRENT_TIMESTAMP),
('Fashion', CURRENT_TIMESTAMP)
ON CONFLICT (name) DO NOTHING;

-- Add user skills (for John Doe)
INSERT INTO user_skills (user_id, skill_id, created_at)
SELECT 
    (SELECT id FROM users WHERE email = 'john@example.com'),
    id,
    CURRENT_TIMESTAMP
FROM skills
WHERE name IN ('Web Development', 'Marketing', 'Design')
ON CONFLICT DO NOTHING;

-- Add user interests (for John Doe)
INSERT INTO user_interests (user_id, interest_id, created_at)
SELECT 
    (SELECT id FROM users WHERE email = 'john@example.com'),
    id,
    CURRENT_TIMESTAMP
FROM interests
WHERE name IN ('Technology', 'Education', 'Food')
ON CONFLICT DO NOTHING;

-- Add resources
INSERT INTO resources (title, description, type, url, created_by, created_at, updated_at)
VALUES 
('Business Plan Template', 'A comprehensive business plan template for startups', 'template', 'https://example.com/business-plan', (SELECT id FROM users WHERE email = 'admin@bizmatchke.co.ke'), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Marketing Strategy Guide', 'Learn how to create an effective marketing strategy', 'guide', 'https://example.com/marketing', (SELECT id FROM users WHERE email = 'admin@bizmatchke.co.ke'), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT DO NOTHING;

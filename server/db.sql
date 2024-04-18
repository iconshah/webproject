Create TABLE users (id BIGSERIAL PRIMARY KEY NOT NULL,
					name VARCHAR(200) NOT NULL,
					email VARCHAR(200) NOT NULL ,
					password VARCHAR(200) NOT NULL,
				   UNIQUE (email));

INSERT INTO users (name, email, password) VALUES

('John Doe', 'john@example.com', 'password123'),
('Jane Smith', 'jane@example.com', 'securepassword456'),
('Alice Johnson', 'alice@example.com', 'strongpassword789');

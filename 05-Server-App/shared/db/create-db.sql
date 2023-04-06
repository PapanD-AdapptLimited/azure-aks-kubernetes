CREATE DATABASE IF NOT EXISTS todos_db;
USE todos_db; 
CREATE TABLE IF NOT EXISTS users(id INT PRIMARY KEY auto_increment, first_name VARCHAR(50) NOT NULL, last_name  VARCHAR(50) NOT NULL, email_id      VARCHAR(100) UNIQUE NOT NULL);
CREATE TABLE IF NOT EXISTS todos(tid INT PRIMARY KEY auto_increment, t_name VARCHAR(100) NOT NULL, t_status       ENUM('CREATED', 'DONE') DEFAULT 'CREATED', t_creator int(11) NOT NULL);
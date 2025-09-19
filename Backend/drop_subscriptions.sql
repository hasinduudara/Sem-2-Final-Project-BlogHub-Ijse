-- SQL script to remove subscription-related tables and constraints
-- Run this script in your MySQL database before starting the application

USE blogHub_db;

-- Drop foreign key constraints first
SET FOREIGN_KEY_CHECKS = 0;

-- Drop subscriptions table if it exists
DROP TABLE IF EXISTS subscriptions;

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- Verify the table is dropped
SHOW TABLES;

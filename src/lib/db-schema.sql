-- SQL Create Table Scripts for Transwise.in Application
-- This script provides the SQL statements to create the necessary tables
-- for the application based on the defined database schema.

-- 1. Users Table
-- Stores authentication and role information for every user.
CREATE TABLE Users (
    userId VARCHAR(255) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    passwordHash VARCHAR(255) NOT NULL,
    role ENUM('Admin', 'Company', 'Branch', 'employee') NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Profiles Table
-- Stores additional, non-sensitive profile information linked to a user.
CREATE TABLE Profiles (
    userId VARCHAR(255) PRIMARY KEY,
    firstName VARCHAR(255),
    lastName VARCHAR(255),
    companyId VARCHAR(255),
    branchId VARCHAR(255),
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES Users(userId) ON DELETE CASCADE
    -- Note: Foreign key constraints for companyId and branchId are added below
    -- to avoid circular dependency issues during table creation.
);

-- 3. Companies Table
-- Stores details for each company registered on the platform.
CREATE TABLE Companies (
    companyId VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    ownerId VARCHAR(255) NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ownerId) REFERENCES Users(userId)
);

-- 4. Branches Table
-- Holds information about individual branches associated with a company.
CREATE TABLE Branches (
    branchId VARCHAR(255) PRIMARY KEY,
    companyId VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    location VARCHAR(255),
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (companyId) REFERENCES Companies(companyId) ON DELETE CASCADE
);

-- Add remaining foreign key constraints to the Profiles table
ALTER TABLE Profiles ADD FOREIGN KEY (companyId) REFERENCES Companies(companyId) ON DELETE SET NULL;
ALTER TABLE Profiles ADD FOREIGN KEY (branchId) REFERENCES Branches(branchId) ON DELETE SET NULL;

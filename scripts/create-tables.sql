-- Create tables for TiDB Cloud Serverless
-- Run this SQL in TiDB Cloud SQL Editor after creating your database

CREATE TABLE IF NOT EXISTS `users` (
  `id` INT AUTO_INCREMENT NOT NULL,
  `openId` VARCHAR(64) NOT NULL,
  `name` TEXT,
  `email` VARCHAR(320),
  `loginMethod` VARCHAR(64),
  `role` ENUM('user','admin','staff') NOT NULL DEFAULT 'user',
  `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `lastSignedIn` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_openId_unique` (`openId`)
);

CREATE TABLE IF NOT EXISTS `staff_users` (
  `id` VARCHAR(64) NOT NULL,
  `username` VARCHAR(100) NOT NULL,
  `password` TEXT NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `phone` VARCHAR(20),
  `role` VARCHAR(50) NOT NULL DEFAULT 'staff',
  `department` VARCHAR(50) NOT NULL DEFAULT 'sales',
  `isActive` BOOLEAN NOT NULL DEFAULT TRUE,
  `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `lastLogin` TIMESTAMP NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `staff_users_username_unique` (`username`)
);

CREATE TABLE IF NOT EXISTS `categories` (
  `id` INT AUTO_INCREMENT NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `slug` VARCHAR(255) NOT NULL,
  `description` TEXT,
  `imageUrl` TEXT,
  `sortOrder` INT NOT NULL DEFAULT 0,
  `isActive` BOOLEAN NOT NULL DEFAULT TRUE,
  `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `categories_slug_unique` (`slug`)
);

CREATE TABLE IF NOT EXISTS `motorcycles` (
  `id` INT AUTO_INCREMENT NOT NULL,
  `name` VARCHAR(500) NOT NULL,
  `slug` VARCHAR(500) NOT NULL,
  `brand` VARCHAR(100) NOT NULL,
  `model` VARCHAR(200),
  `year` INT,
  `price` BIGINT NOT NULL,
  `originalPrice` BIGINT,
  `condition` ENUM('like_new','good','fair') NOT NULL DEFAULT 'good',
  `mileage` INT,
  `engineSize` VARCHAR(50),
  `color` VARCHAR(100),
  `description` TEXT,
  `features` TEXT,
  `images` TEXT,
  `categoryId` INT,
  `isAvailable` BOOLEAN NOT NULL DEFAULT TRUE,
  `isFeatured` BOOLEAN NOT NULL DEFAULT FALSE,
  `viewCount` INT NOT NULL DEFAULT 0,
  `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `motorcycles_slug_unique` (`slug`)
);

CREATE TABLE IF NOT EXISTS `contacts` (
  `id` INT AUTO_INCREMENT NOT NULL,
  `fullName` VARCHAR(255) NOT NULL,
  `phone` VARCHAR(20) NOT NULL,
  `message` TEXT,
  `status` ENUM('new','read','replied') NOT NULL DEFAULT 'new',
  `note` TEXT,
  `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
);

CREATE TABLE IF NOT EXISTS `conversations` (
  `id` INT AUTO_INCREMENT NOT NULL,
  `sessionId` VARCHAR(100) NOT NULL,
  `customerName` VARCHAR(255),
  `customerPhone` VARCHAR(20),
  `status` ENUM('ai','waiting_staff','staff','closed') NOT NULL DEFAULT 'ai',
  `lastMessage` TEXT,
  `assignedStaffId` VARCHAR(64),
  `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `conversations_sessionId_unique` (`sessionId`)
);

CREATE TABLE IF NOT EXISTS `messages` (
  `id` INT AUTO_INCREMENT NOT NULL,
  `conversationId` INT NOT NULL,
  `content` TEXT NOT NULL,
  `senderType` ENUM('customer','ai','staff') NOT NULL DEFAULT 'customer',
  `senderName` VARCHAR(255),
  `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
);

CREATE TABLE IF NOT EXISTS `policies` (
  `id` INT AUTO_INCREMENT NOT NULL,
  `title` VARCHAR(500) NOT NULL,
  `slug` VARCHAR(500) NOT NULL,
  `content` TEXT NOT NULL,
  `type` ENUM('warranty','installment','return','privacy','terms','guide') NOT NULL,
  `isActive` BOOLEAN NOT NULL DEFAULT TRUE,
  `sortOrder` INT NOT NULL DEFAULT 0,
  `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `policies_slug_unique` (`slug`)
);

CREATE DATABASE `carpool`;
USE `carpool`;
drop table `Rides`;
drop table `Users`;
drop table `Go`;
drop table `reviews`;
drop table `Alerts`;
DROP TABLE `messages`;
DROP TABLE `tokens`;

CREATE TABLE IF NOT EXISTS `Users` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(100) character set utf8 ,
    `email` VARCHAR(100) ,
    `phoneNumber` BIGINT ,
    `reviewScore` INT,
    `password` VARCHAR(100) ,
    `birthdate` DATE,
    `photo` VARCHAR(100),
    PRIMARY KEY(`id`)
);

CREATE TABLE IF NOT EXISTS `Rides` (
	`id` INT NOT NULL AUTO_INCREMENT,
    `destination` VARCHAR(100) NOT NULL,
    `driverId` INT NOT NULL,
    `freeSeats` INT NOT NULL,
    `passengers` INT,
    `startingPoint` VARCHAR(100) NOT NULL,
    `timeAndDate` DATE NOT NULL,
    `done` VARCHAR(100),
    PRIMARY KEY(`id`),
    FOREIGN KEY (`driverId`) REFERENCES Users(id)
);

CREATE TABLE IF NOT EXISTS `Go` (
    `driverId` INT NOT NULL,
    `passengerId` INT NOT NULL,
    `rideId` INT NOT NULL,
    `seats` INT NOT NULL,
    `reviewed` INT NOT NULL,
    PRIMARY KEY (`rideId`,`passengerId`),
    FOREIGN KEY (`driverId`) REFERENCES  Users(id),
    FOREIGN KEY (`passengerId`) REFERENCES Users(id),
    FOREIGN KEY (`rideId`) REFERENCES Rides(id)
);

CREATE TABLE IF NOT EXISTS `Reviews`(
    `reviewerId` INT NOT NULL,
    `revieweeId` INT NOT NULL,
    `rideId` INT NOT NULL,
    `reviewScore` INT NOT NULL,
    `reviewText` TINYTEXT,
    FOREIGN KEY (`reviewerId`) REFERENCES  Go(`passengerId`),
    FOREIGN KEY (`revieweeId`) REFERENCES Go(`driverId`),
    FOREIGN KEY (`rideId`) REFERENCES Go(rideId),
    PRIMARY KEY (`revieweeId`, `rideId`)
);

CREATE TABLE IF NOT EXISTS `Alerts` (
	`alertId` INT NOT NULL AUTO_INCREMENT,
    `userId` INT NOT NULL,
    `alertText` TINYTEXT,
    `alertRead` INT NOT NULL,
    `rideId` INT NOT NULL,
    `creatorId` INT NOT NULL,
    PRIMARY KEY (`alertId`),
    FOREIGN KEY (`userId`) REFERENCES Users(`id`),
    FOREIGN KEY (`rideId`) REFERENCES Rides(`id`),
    FOREIGN KEY (`creatorId`) REFERENCES Users(`id`)
);

CREATE TABLE IF NOT EXISTS `messages`(
    `id`         INT NOT NULL AUTO_INCREMENT,
    `senderId`   INT NOT NULL,
    `receiverId` INT NOT NULL,
    `message`    TEXT,
    `timestamp`  DATETIME,
    PRIMARY KEY (`id`),
    FOREIGN KEY (`senderId`) REFERENCES Users(`id`),
    FOREIGN KEY (`receiverId`) REFERENCES Users(`id`)
);

CREATE TABLE IF NOT EXISTS `tokens`(
    `id`     INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `userId` INT NOT NULL,
    `token`  TEXT NOT NULL,
    FOREIGN KEY (`userId`) REFERENCES Users(`id`)
);

ALTER DATABASE carpool CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

ALTER TABLE messages CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE messages MODIFY message TEXT CHARSET utf8mb4;
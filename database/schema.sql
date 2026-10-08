-- MySQL dump 10.13  Distrib 8.0.46, for Win64 (x86_64)
--
-- Host: localhost    Database: car_rental
-- ------------------------------------------------------
-- Server version	8.0.46

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Current Database: `car_rental`
--

CREATE DATABASE /*!32312 IF NOT EXISTS*/ `car_rental` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;

USE `car_rental`;

--
-- Table structure for table `bookings`
--

DROP TABLE IF EXISTS `bookings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `bookings` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `car_id` bigint NOT NULL,
  `car_image` longtext,
  `car_name` varchar(255) DEFAULT NULL,
  `date` varchar(255) DEFAULT NULL,
  `duration` int DEFAULT NULL,
  `duration_unit` varchar(255) DEFAULT NULL,
  `end_date` varchar(255) DEFAULT NULL,
  `package_id` varchar(36) NOT NULL,
  `package_name` varchar(255) DEFAULT NULL,
  `payment_method` varchar(20) NOT NULL,
  `start_date` varchar(255) DEFAULT NULL,
  `status` enum('CANCELLED','COMPLETED','CONFIRMED') NOT NULL,
  `timestamp` varchar(255) DEFAULT NULL,
  `total_amount` double DEFAULT NULL,
  `user_id` bigint NOT NULL,
  `amount` decimal(12,2) NOT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `end_at` datetime(6) NOT NULL,
  `payment_status` enum('PAID','PENDING','REFUNDED','REFUND_PENDING') DEFAULT NULL,
  `quantity` int NOT NULL,
  `start_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `pickup_location_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_booking_car_dates` (`car_id`,`start_at`,`end_at`,`status`),
  KEY `idx_booking_user` (`user_id`),
  KEY `FKsroodkhn00tes6l7ef6nj8pc6` (`pickup_location_id`),
  KEY `FKpsi0jsj8kjkqse44mspx80bk3` (`package_id`),
  CONSTRAINT `FKeyog2oic85xg7hsu2je2lx3s6` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `FKj1y19nc7wf0rdp24pyhomn7ck` FOREIGN KEY (`car_id`) REFERENCES `cars` (`id`),
  CONSTRAINT `FKpsi0jsj8kjkqse44mspx80bk3` FOREIGN KEY (`package_id`) REFERENCES `packages` (`id`),
  CONSTRAINT `FKsroodkhn00tes6l7ef6nj8pc6` FOREIGN KEY (`pickup_location_id`) REFERENCES `locations` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `car_features`
--

DROP TABLE IF EXISTS `car_features`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `car_features` (
  `car_id` bigint NOT NULL,
  `car_name` varchar(200) DEFAULT NULL,
  `feature` varchar(120) NOT NULL,
  KEY `FKm2wabn2clpmrh88peejarqbwr` (`car_id`),
  CONSTRAINT `FKm2wabn2clpmrh88peejarqbwr` FOREIGN KEY (`car_id`) REFERENCES `cars` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = cp850 */ ;
/*!50003 SET character_set_results = cp850 */ ;
/*!50003 SET collation_connection  = cp850_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_car_features_before_insert` BEFORE INSERT ON `car_features` FOR EACH ROW SET NEW.car_name = (SELECT CONCAT(make, ' ', model) FROM cars WHERE id = NEW.car_id) */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `cars`
--

DROP TABLE IF EXISTS `cars`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cars` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `available` bit(1) DEFAULT NULL,
  `features` text,
  `fuel` varchar(40) DEFAULT NULL,
  `image` longtext,
  `location` varchar(255) DEFAULT NULL,
  `make` varchar(80) NOT NULL,
  `model` varchar(100) NOT NULL,
  `price_per_day` double DEFAULT NULL,
  `price_per_hour` double DEFAULT NULL,
  `price_per_monthly` double DEFAULT NULL,
  `price_per_weekly` double DEFAULT NULL,
  `seats` int DEFAULT NULL,
  `spec_acceleration` varchar(255) DEFAULT NULL,
  `spec_engine` varchar(255) DEFAULT NULL,
  `spec_power` varchar(255) DEFAULT NULL,
  `transmission` varchar(40) DEFAULT NULL,
  `type` varchar(40) DEFAULT NULL,
  `year` int DEFAULT NULL,
  `daily_rate` decimal(12,2) DEFAULT NULL,
  `hourly_rate` decimal(12,2) DEFAULT NULL,
  `monthly_rate` decimal(12,2) DEFAULT NULL,
  `quantity` int DEFAULT NULL,
  `weekly_rate` decimal(12,2) DEFAULT NULL,
  `location_id` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FKotatcltd9hda79r9y01u1y1es` (`location_id`),
  CONSTRAINT `FKotatcltd9hda79r9y01u1y1es` FOREIGN KEY (`location_id`) REFERENCES `locations` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `locations`
--

DROP TABLE IF EXISTS `locations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `locations` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `packages`
--

DROP TABLE IF EXISTS `packages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `packages` (
  `id` varchar(36) NOT NULL,
  `description` varchar(500) DEFAULT NULL,
  `multiplier` double DEFAULT NULL,
  `name` varchar(100) NOT NULL,
  `discount` decimal(5,2) DEFAULT NULL,
  `hours` int DEFAULT NULL,
  `unit` enum('DAY','HOUR','MONTH','WEEK') DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK3q9siaodmu5ygas1gpys9ujav` (`unit`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `email` varchar(190) NOT NULL,
  `name` varchar(120) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('ADMIN','CUSTOMER') DEFAULT NULL,
  `phone` varchar(32) DEFAULT NULL,
  `status` enum('ACTIVE','BLOCKED') DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK6dotkott2kjsp8vw4d0m25fb7` (`email`),
  UNIQUE KEY `uk_users_email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=26 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping routines for database 'car_rental'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-10-08 11:55:57

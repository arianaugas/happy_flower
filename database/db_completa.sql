CREATE DATABASE  IF NOT EXISTS `happyflower_db` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `happyflower_db`;
-- MySQL dump 10.13  Distrib 8.0.45, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: happyflower_db
-- ------------------------------------------------------
-- Server version	9.6.0

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
SET @MYSQLDUMP_TEMP_LOG_BIN = @@SESSION.SQL_LOG_BIN;
SET @@SESSION.SQL_LOG_BIN= 0;

--
-- GTID state at the beginning of the backup 
--

SET @@GLOBAL.GTID_PURGED=/*!80000 '+'*/ 'a6f2e855-faf2-11f0-aa86-a8a159161be4:1-634';

--
-- Table structure for table `categorias`
--

DROP TABLE IF EXISTS `categorias`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `categorias` (
  `id_categoria` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `descripcion` varchar(255) DEFAULT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`id_categoria`),
  UNIQUE KEY `nombre` (`nombre`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categorias`
--

LOCK TABLES `categorias` WRITE;
/*!40000 ALTER TABLE `categorias` DISABLE KEYS */;
INSERT INTO `categorias` VALUES (1,'Rosas','Ramos y arreglos de rosas naturales y eternas',1),(2,'Girasoles','Ramos de girasoles frescos y tejidos',1),(3,'Cajas','Boxes y arreglos florales en caja decorativa',1),(4,'Cuadros','Cuadros fotográficos clásicos, encajonados y giratorios',1),(5,'Tulipanes','Ramos de tulipanes frescos en diferentes cantidades',1),(6,'Arreglos','Arreglos florales mixtos y personalizados',1),(7,'Cupula','Cúpulas decorativas con flores tejidas e iluminadas',1),(8,'Complementos','Chocolates, vinos y souvenirs de regalo',1);
/*!40000 ALTER TABLE `categorias` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `detalle_pedidos`
--

DROP TABLE IF EXISTS `detalle_pedidos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `detalle_pedidos` (
  `id_detalle` int NOT NULL AUTO_INCREMENT,
  `id_pedido` int NOT NULL,
  `id_producto` int NOT NULL,
  `cantidad` int NOT NULL DEFAULT '1',
  `precio_unit` decimal(10,2) NOT NULL,
  `subtotal` decimal(10,2) GENERATED ALWAYS AS ((`cantidad` * `precio_unit`)) STORED,
  PRIMARY KEY (`id_detalle`),
  KEY `fk_detalle_pedido` (`id_pedido`),
  KEY `fk_detalle_producto` (`id_producto`),
  CONSTRAINT `fk_detalle_pedido` FOREIGN KEY (`id_pedido`) REFERENCES `pedidos` (`id_pedido`),
  CONSTRAINT `fk_detalle_producto` FOREIGN KEY (`id_producto`) REFERENCES `productos` (`id_producto`)
) ENGINE=InnoDB AUTO_INCREMENT=44 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `detalle_pedidos`
--

LOCK TABLES `detalle_pedidos` WRITE;
/*!40000 ALTER TABLE `detalle_pedidos` DISABLE KEYS */;
INSERT INTO `detalle_pedidos` (`id_detalle`, `id_pedido`, `id_producto`, `cantidad`, `precio_unit`) VALUES (1,1,1,1,15.00),
(2,2,22,1,79.90),(3,3,49,1,29.00),(4,4,76,1,13.00),
(5,5,44,1,65.00),(6,5,85,1,59.00),(7,6,48,1,270.00),
(8,7,85,1,59.00),(9,7,34,1,85.00),(10,7,66,1,29.90),(11,8,13,1,49.00),
(12,9,54,1,59.00),(13,9,21,1,69.00),(14,10,75,1,6.00),(15,10,30,1,69.00),
(16,11,8,1,119.90),(17,11,2,1,120.00),(18,12,54,1,59.00),(19,13,17,1,69.00),
(20,14,45,1,85.00),(21,14,61,1,115.00),(22,15,78,1,35.00),(23,16,11,1,25.90),
(24,17,70,1,89.00),(25,17,50,1,35.00),(26,18,34,1,85.00),(27,19,6,1,75.00),
(28,19,76,1,13.00),(29,20,4,1,139.90),(30,21,26,1,69.90),(31,21,76,1,13.00),
(32,22,3,1,139.90),(33,23,26,1,69.90),(34,23,13,1,49.00),(35,23,78,1,35.00),
(36,24,7,1,89.90),(37,25,63,1,199.90),(38,26,53,1,85.00),(39,27,79,1,9.00),
(40,28,20,1,149.00),(41,29,1,1,15.00),(42,30,50,1,35.00),(43,30,41,1,85.00);
/*!40000 ALTER TABLE `detalle_pedidos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ganancias_productos`
--

DROP TABLE IF EXISTS `ganancias_productos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ganancias_productos` (
  `id_ganancia` int NOT NULL AUTO_INCREMENT,
  `id_producto` int NOT NULL,
  `id_categoria` int NOT NULL,
  `inversion` decimal(10,2) NOT NULL,
  `ganancia` decimal(10,2) NOT NULL,
  `fecha_registro` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_ganancia`),
  KEY `fk_ganancia_producto` (`id_producto`),
  KEY `fk_ganancia_categoria` (`id_categoria`),
  CONSTRAINT `fk_ganancia_categoria` FOREIGN KEY (`id_categoria`) REFERENCES `categorias` (`id_categoria`),
  CONSTRAINT `fk_ganancia_producto` FOREIGN KEY (`id_producto`) REFERENCES `productos` (`id_producto`)
) ENGINE=InnoDB AUTO_INCREMENT=87 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ganancias_productos`
--

LOCK TABLES `ganancias_productos` WRITE;
/*!40000 ALTER TABLE `ganancias_productos` DISABLE KEYS */;
INSERT INTO `ganancias_productos` VALUES (1,1,1,15.00,0.00,'2026-05-13 10:02:50'),(2,2,1,120.00,20.00,'2026-05-13 10:02:50'),
(3,3,1,139.90,40.10,'2026-05-13 10:02:50'),(4,4,1,45.00,15.00,'2026-05-13 10:02:50'),(5,5,1,60.00,15.00,'2026-05-13 10:02:50'),
(6,6,1,75.00,15.00,'2026-05-13 10:02:50'),(7,7,1,89.90,35.10,'2026-05-13 10:02:50'),(8,8,1,119.90,50.10,'2026-05-13 10:02:50'),
(9,9,1,170.00,90.00,'2026-05-13 10:02:50'),(10,10,1,390.00,100.00,'2026-05-13 10:02:50'),(11,11,2,25.00,4.90,'2026-05-13 10:02:54'),
(12,12,2,39.00,16.00,'2026-05-13 10:02:54'),(13,13,2,49.00,6.00,'2026-05-13 10:02:54'),(14,14,2,49.00,36.00,'2026-05-13 10:02:54'),
(15,15,2,70.00,19.90,'2026-05-13 10:02:54'),(16,16,2,65.00,14.90,'2026-05-13 10:02:54'),(17,17,2,69.00,11.00,'2026-05-13 10:02:54'),
(18,18,2,70.00,19.90,'2026-05-13 10:02:54'),(19,19,2,115.00,50.00,'2026-05-13 10:02:54'),(20,20,2,149.00,10.90,'2026-05-13 10:02:54'),
(21,21,3,69.00,20.00,'2026-05-13 10:02:59'),(22,22,3,79.90,10.00,'2026-05-13 10:02:59'),(23,23,3,99.00,20.00,'2026-05-13 10:02:59'),
(24,24,3,119.90,30.10,'2026-05-13 10:02:59'),(25,25,3,125.00,30.00,'2026-05-13 10:02:59'),(26,26,3,49.90,20.00,'2026-05-13 10:02:59'),
(27,27,3,159.90,25.10,'2026-05-13 10:02:59'),(28,28,3,219.90,10.00,'2026-05-13 10:02:59'),(29,29,3,49.90,20.00,'2026-05-13 10:02:59'),
(30,30,3,159.90,20.10,'2026-05-13 10:02:59'),(31,31,3,149.00,10.00,'2026-05-13 10:02:59'),(32,32,3,39.00,10.00,'2026-05-13 10:02:59'),
(33,33,3,105.00,20.00,'2026-05-13 10:02:59'),(34,34,3,65.00,20.00,'2026-05-13 10:02:59'),(35,35,3,70.00,20.00,'2026-05-13 10:02:59'),
(36,36,3,189.90,85.10,'2026-05-13 10:02:59'),(37,37,3,65.00,20.00,'2026-05-13 10:02:59'),(38,38,3,65.00,20.00,'2026-05-13 10:02:59'),
(39,39,3,119.00,11.00,'2026-05-13 10:02:59'),(40,40,3,129.90,19.10,'2026-05-13 10:02:59'),(41,41,3,79.90,19.10,'2026-05-13 10:02:59'),
(42,42,4,29.00,10.00,'2026-05-13 10:03:03'),(43,43,4,35.00,10.00,'2026-05-13 10:03:03'),(44,44,4,65.00,10.00,'2026-05-13 10:03:03'),
(45,45,5,85.00,14.00,'2026-05-13 10:03:06'),(46,46,5,165.00,14.00,'2026-05-13 10:03:06'),(47,47,5,195.00,14.00,'2026-05-13 10:03:06'),
(48,48,5,255.00,15.00,'2026-05-13 10:03:06'),(49,49,6,29.00,6.00,'2026-05-13 10:03:12'),(50,50,6,35.00,10.00,'2026-05-13 10:03:12'),
(51,51,6,39.90,20.10,'2026-05-13 10:03:12'),(52,52,6,39.90,15.10,'2026-05-13 10:03:12'),(53,53,6,85.00,14.00,'2026-05-13 10:03:12'),
(54,54,6,49.90,10.00,'2026-05-13 10:03:12'),(55,55,6,85.00,14.00,'2026-05-13 10:03:12'),(56,56,6,39.00,20.10,'2026-05-13 10:03:12'),
(57,57,6,79.90,10.10,'2026-05-13 10:03:12'),(58,58,6,85.00,10.00,'2026-05-13 10:03:12'),(59,59,6,20.00,10.00,'2026-05-13 10:03:12'),
(60,60,6,99.90,30.00,'2026-05-13 10:03:12'),(61,61,6,115.00,14.90,'2026-05-13 10:03:12'),(62,62,6,130.00,10.00,'2026-05-13 10:03:12'),
(63,63,6,189.00,50.00,'2026-05-13 10:03:12'),(64,64,6,45.00,10.00,'2026-05-13 10:03:12'),(65,65,6,50.00,10.00,'2026-05-13 10:03:12'),
(66,66,6,19.90,10.00,'2026-05-13 10:03:12'),(67,67,6,25.00,10.00,'2026-05-13 10:03:12'),(68,68,6,55.00,10.00,'2026-05-13 10:03:12'),
(69,69,6,23.00,10.00,'2026-05-13 10:03:12'),(70,70,6,69.00,20.00,'2026-05-13 10:03:12'),(71,71,6,59.90,10.00,'2026-05-13 10:03:12'),
(72,72,6,36.00,10.00,'2026-05-13 10:03:12'),(73,73,6,85.00,14.00,'2026-05-13 10:03:12'),(74,74,7,39.90,5.10,'2026-05-13 10:03:30'),
(75,75,8,4.00,2.00,'2026-05-13 10:03:36'),(76,76,8,11.00,2.00,'2026-05-13 10:03:36'),(77,77,8,18.00,2.00,'2026-05-13 10:03:36'),
(78,78,8,33.00,2.00,'2026-05-13 10:03:36'),(79,79,8,7.00,2.00,'2026-05-13 10:03:36'),(80,80,8,13.00,2.00,'2026-05-13 10:03:36'),
(81,81,8,8.00,2.00,'2026-05-13 10:03:36'),(82,82,8,28.00,2.00,'2026-05-13 10:03:36'),(83,83,8,58.00,2.00,'2026-05-13 10:03:36'),
(84,84,8,37.90,2.00,'2026-05-13 10:03:36'),(85,85,8,57.00,2.00,'2026-05-13 10:03:36'),(86,86,8,77.00,2.00,'2026-05-13 10:03:36');
/*!40000 ALTER TABLE `ganancias_productos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `historial_pedidos`
--

DROP TABLE IF EXISTS `historial_pedidos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `historial_pedidos` (
  `id_historial` int NOT NULL AUTO_INCREMENT,
  `id_pedido` int NOT NULL,
  `estado` varchar(30) NOT NULL,
  `descripcion` varchar(255) DEFAULT NULL,
  `registrado_en` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `registrado_por` int DEFAULT NULL,
  PRIMARY KEY (`id_historial`),
  KEY `fk_tracking_pedido` (`id_pedido`),
  KEY `fk_tracking_usuario` (`registrado_por`),
  CONSTRAINT `fk_tracking_pedido` FOREIGN KEY (`id_pedido`) REFERENCES `pedidos` (`id_pedido`),
  CONSTRAINT `fk_tracking_usuario` FOREIGN KEY (`registrado_por`) REFERENCES `usuarios` (`id_usuario`)
) ENGINE=InnoDB AUTO_INCREMENT=138 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `historial_pedidos`
--

LOCK TABLES `historial_pedidos` WRITE;
/*!40000 ALTER TABLE `historial_pedidos` DISABLE KEYS */;
INSERT INTO `historial_pedidos` VALUES (1,1,'pendiente','Pedido recibido correctamente.','2026-03-02 10:45:00',1),
(2,1,'preparacion','El pedido está siendo preparado.','2026-03-02 11:16:00',1),
(3,1,'listo','El arreglo está listo para despacho.','2026-03-02 11:38:00',1),
(4,1,'camino','El pedido está en camino al destino.','2026-03-02 12:16:00',1),
(5,1,'entregado','Pedido entregado con éxito.','2026-03-02 12:42:00',1),
(6,2,'pendiente','Pedido recibido correctamente.','2026-03-02 12:56:00',1),
(7,2,'preparacion','El pedido está siendo preparado.','2026-03-02 13:34:00',1),
(8,2,'listo','El arreglo está listo para despacho.','2026-03-02 14:23:00',1),
(9,2,'camino','El pedido está en camino al destino.','2026-03-02 14:43:00',1),
(10,2,'entregado','Pedido entregado con éxito.','2026-03-02 15:09:00',1),
(11,3,'pendiente','Pedido recibido correctamente.','2026-03-04 13:13:00',1),
(12,3,'preparacion','El pedido está siendo preparado.','2026-03-04 13:41:00',1),
(13,3,'listo','El arreglo está listo para despacho.','2026-03-04 14:11:00',1),
(14,3,'camino','El pedido está en camino al destino.','2026-03-04 14:50:00',1),
(15,3,'entregado','Pedido entregado con éxito.','2026-03-04 15:23:00',1),
(16,4,'pendiente','Pedido recibido correctamente.','2026-03-09 15:41:00',1),
(17,4,'preparacion','El pedido está siendo preparado.','2026-03-09 16:04:00',1),
(18,4,'listo','El arreglo está listo para despacho.','2026-03-09 16:35:00',1),
(19,4,'camino','El pedido está en camino al destino.','2026-03-09 17:17:00',1),
(20,4,'entregado','Pedido entregado con éxito.','2026-03-09 17:50:00',1),
(21,5,'pendiente','Pedido recibido correctamente.','2026-03-11 13:05:00',1),
(22,5,'preparacion','El pedido está siendo preparado.','2026-03-11 13:41:00',1),
(23,5,'listo','El arreglo está listo para despacho.','2026-03-11 14:08:00',1),
(24,5,'camino','El pedido está en camino al destino.','2026-03-11 14:45:00',1),
(25,5,'entregado','Pedido entregado con éxito.','2026-03-11 15:00:00',1),
(26,6,'pendiente','Pedido recibido correctamente.','2026-03-12 11:08:00',1),
(27,6,'preparacion','El pedido está siendo preparado.','2026-03-12 11:49:00',1),
(28,6,'listo','El arreglo está listo para despacho.','2026-03-12 12:26:00',1),
(29,6,'camino','El pedido está en camino al destino.','2026-03-12 13:06:00',1),
(30,6,'entregado','Pedido entregado con éxito.','2026-03-12 13:21:00',1),
(31,7,'pendiente','Pedido recibido correctamente.','2026-03-12 20:25:00',1),
(32,7,'preparacion','El pedido está siendo preparado.','2026-03-12 21:09:00',1),
(33,7,'listo','El arreglo está listo para despacho.','2026-03-12 21:59:00',1),
(34,7,'camino','El pedido está en camino al destino.','2026-03-12 22:47:00',1),
(35,7,'entregado','Pedido entregado con éxito.','2026-03-12 23:20:00',1),
(36,8,'pendiente','Pedido recibido correctamente.','2026-03-13 19:10:00',1),
(37,8,'preparacion','El pedido está siendo preparado.','2026-03-13 19:37:00',1),
(38,8,'listo','El arreglo está listo para despacho.','2026-03-13 19:58:00',1),
(39,8,'camino','El pedido está en camino al destino.','2026-03-13 20:38:00',1),
(40,8,'entregado','Pedido entregado con éxito.','2026-03-13 21:18:00',1),
(41,9,'pendiente','Pedido recibido correctamente.','2026-03-16 17:20:00',1),
(42,9,'preparacion','El pedido está siendo preparado.','2026-03-16 17:51:00',1),
(43,9,'listo','El arreglo está listo para despacho.','2026-03-16 18:19:00',1),
(44,9,'camino','El pedido está en camino al destino.','2026-03-16 18:51:00',1),
(45,9,'entregado','Pedido entregado con éxito.','2026-03-16 19:35:00',1),
(46,10,'pendiente','Pedido recibido correctamente.','2026-03-16 18:51:00',1),
(47,10,'preparacion','El pedido está siendo preparado.','2026-03-16 19:35:00',1),
(48,10,'listo','El arreglo está listo para despacho.','2026-03-16 20:23:00',1),
(49,10,'camino','El pedido está en camino al destino.','2026-03-16 20:38:00',1),
(50,10,'entregado','Pedido entregado con éxito.','2026-03-16 21:00:00',1),
(51,11,'pendiente','Pedido recibido correctamente.','2026-03-21 19:36:00',1),
(52,11,'preparacion','El pedido está siendo preparado.','2026-03-21 19:54:00',1),
(53,11,'listo','El arreglo está listo para despacho.','2026-03-21 20:34:00',1),
(54,11,'camino','El pedido está en camino al destino.','2026-03-21 20:51:00',1),
(55,11,'entregado','Pedido entregado con éxito.','2026-03-21 21:09:00',1),
(56,12,'pendiente','Pedido recibido correctamente.','2026-03-27 18:05:00',1),
(57,12,'preparacion','El pedido está siendo preparado.','2026-03-27 18:51:00',1),
(58,12,'listo','El arreglo está listo para despacho.','2026-03-27 19:16:00',1),
(59,12,'camino','El pedido está en camino al destino.','2026-03-27 19:48:00',1),
(60,12,'entregado','Pedido entregado con éxito.','2026-03-27 20:20:00',1),
(61,13,'pendiente','Pedido recibido correctamente.','2026-03-28 10:52:00',1),
(62,13,'preparacion','El pedido está siendo preparado.','2026-03-28 11:15:00',1),
(63,13,'listo','El arreglo está listo para despacho.','2026-03-28 11:38:00',1),
(64,13,'camino','El pedido está en camino al destino.','2026-03-28 12:02:00',1),
(65,13,'entregado','Pedido entregado con éxito.','2026-03-28 12:51:00',1),
(66,14,'pendiente','Pedido recibido correctamente.','2026-03-30 15:17:00',1),
(67,14,'preparacion','El pedido está siendo preparado.','2026-03-30 15:53:00',1),
(68,14,'listo','El arreglo está listo para despacho.','2026-03-30 16:35:00',1),
(69,14,'camino','El pedido está en camino al destino.','2026-03-30 17:02:00',1),
(70,14,'entregado','Pedido entregado con éxito.','2026-03-30 17:36:00',1),
(71,15,'pendiente','Pedido recibido correctamente.','2026-04-01 09:47:00',1),
(72,15,'preparacion','El pedido está siendo preparado.','2026-04-01 10:30:00',1),
(73,15,'listo','El arreglo está listo para despacho.','2026-04-01 10:50:00',1),
(74,15,'camino','El pedido está en camino al destino.','2026-04-01 11:15:00',1),
(75,15,'entregado','Pedido entregado con éxito.','2026-04-01 11:40:00',1),
(76,16,'pendiente','Pedido recibido correctamente.','2026-04-02 10:00:00',1),
(77,16,'preparacion','El pedido está siendo preparado.','2026-04-02 10:50:00',1),
(78,16,'listo','El arreglo está listo para despacho.','2026-04-02 11:23:00',1),
(79,16,'camino','El pedido está en camino al destino.','2026-04-02 11:56:00',1),
(80,16,'entregado','Pedido entregado con éxito.','2026-04-02 12:18:00',1),
(81,17,'pendiente','Pedido recibido correctamente.','2026-04-06 19:08:00',1),
(82,17,'cancelado','Pedido cancelado por el cliente.','2026-04-06 19:40:00',1),
(83,18,'pendiente','Pedido recibido correctamente.','2026-04-08 18:45:00',1),
(84,18,'preparacion','El pedido está siendo preparado.','2026-04-08 19:26:00',1),
(85,18,'listo','El arreglo está listo para despacho.','2026-04-08 19:44:00',1),
(86,18,'camino','El pedido está en camino al destino.','2026-04-08 20:12:00',1),
(87,18,'entregado','Pedido entregado con éxito.','2026-04-08 20:42:00',1),
(88,19,'pendiente','Pedido recibido correctamente.','2026-04-14 11:47:00',1),
(89,19,'preparacion','El pedido está siendo preparado.','2026-04-14 12:05:00',1),
(90,19,'listo','El arreglo está listo para despacho.','2026-04-14 12:36:00',1),
(91,19,'camino','El pedido está en camino al destino.','2026-04-14 13:02:00',1),
(92,19,'entregado','Pedido entregado con éxito.','2026-04-14 13:44:00',1),
(93,20,'pendiente','Pedido recibido correctamente.','2026-04-17 12:07:00',1),
(94,20,'cancelado','Pedido cancelado por el cliente.','2026-04-17 12:45:00',1),
(95,21,'pendiente','Pedido recibido correctamente.','2026-04-19 09:40:00',1),
(96,21,'preparacion','El pedido está siendo preparado.','2026-04-19 10:06:00',1),
(97,21,'listo','El arreglo está listo para despacho.','2026-04-19 10:37:00',1),
(98,21,'camino','El pedido está en camino al destino.','2026-04-19 11:02:00',1),
(99,21,'entregado','Pedido entregado con éxito.','2026-04-19 11:50:00',1),
(100,22,'pendiente','Pedido recibido correctamente.','2026-04-23 12:22:00',1),
(101,22,'preparacion','El pedido está siendo preparado.','2026-04-23 12:41:00',1),
(102,22,'listo','El arreglo está listo para despacho.','2026-04-23 13:11:00',1),
(103,22,'camino','El pedido está en camino al destino.','2026-04-23 13:42:00',1),
(104,22,'entregado','Pedido entregado con éxito.','2026-04-23 14:17:00',1),
(105,23,'pendiente','Pedido recibido correctamente.','2026-04-24 11:33:00',1),
(106,23,'preparacion','El pedido está siendo preparado.','2026-04-24 11:48:00',1),
(107,23,'listo','El arreglo está listo para despacho.','2026-04-24 12:36:00',1),
(108,23,'camino','El pedido está en camino al destino.','2026-04-24 13:09:00',1),
(109,23,'entregado','Pedido entregado con éxito.','2026-04-24 13:36:00',1),
(110,24,'pendiente','Pedido recibido correctamente.','2026-04-27 13:55:00',1),
(111,24,'preparacion','El pedido está siendo preparado.','2026-04-27 14:32:00',1),
(112,24,'listo','El arreglo está listo para despacho.','2026-04-27 15:01:00',1),
(113,24,'camino','El pedido está en camino al destino.','2026-04-27 15:25:00',1),
(114,24,'entregado','Pedido entregado con éxito.','2026-04-27 15:45:00',1),
(115,25,'pendiente','Pedido recibido correctamente.','2026-04-29 19:34:00',1),
(116,25,'cancelado','Pedido cancelado por el cliente.','2026-04-29 20:10:00',1),
(117,26,'pendiente','Pedido recibido correctamente.','2026-05-01 15:47:00',1),
(118,26,'preparacion','El pedido está siendo preparado.','2026-05-01 16:37:00',1),
(119,26,'listo','El arreglo está listo para despacho.','2026-05-01 17:16:00',1),
(120,26,'camino','El pedido está en camino al destino.','2026-05-01 18:06:00',1),
(121,26,'entregado','Pedido entregado con éxito.','2026-05-01 18:37:00',1),
(122,27,'pendiente','Pedido recibido correctamente.','2026-05-06 14:29:00',1),
(123,27,'preparacion','El pedido está siendo preparado.','2026-05-06 15:01:00',1),
(124,27,'listo','El arreglo está listo para despacho.','2026-05-06 15:35:00',1),
(125,27,'camino','El pedido está en camino al destino.','2026-05-06 16:05:00',1),
(126,27,'entregado','Pedido entregado con éxito.','2026-05-06 16:33:00',1),
(127,28,'pendiente','Pedido recibido correctamente.','2026-05-07 15:55:00',1),
(128,28,'preparacion','El pedido está siendo preparado.','2026-05-07 16:37:00',1),
(129,28,'listo','El arreglo está listo para despacho.','2026-05-07 17:12:00',1),
(130,29,'pendiente','Pedido recibido correctamente.','2026-05-11 17:02:00',1),
(131,29,'preparacion','El pedido está siendo preparado.','2026-05-11 17:38:00',1),
(132,29,'listo','El arreglo está listo para despacho.','2026-05-11 17:58:00',1),
(133,29,'camino','El pedido está en camino al destino.','2026-05-11 18:14:00',1),
(134,30,'pendiente','Pedido recibido correctamente.','2026-05-11 18:54:00',1),
(135,30,'preparacion','El pedido está siendo preparado.','2026-05-11 19:22:00',1),
(136,30,'listo','El arreglo está listo para despacho.','2026-05-11 19:43:00',1),
(137,30,'camino','El pedido está en camino al destino.','2026-05-11 19:58:00',1);
/*!40000 ALTER TABLE `historial_pedidos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pedidos`
--

DROP TABLE IF EXISTS `pedidos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pedidos` (
  `id_pedido` int NOT NULL AUTO_INCREMENT,
  `id_usuario` int DEFAULT NULL,
  `numero_pedido` varchar(30) NOT NULL,
  `estado` varchar(30) NOT NULL DEFAULT 'pendiente',
  `direccion_entrega` varchar(300) NOT NULL,
  `metodo_pago` varchar(50) NOT NULL,
  `numero_voucher` varchar(50) DEFAULT NULL,
  `total` decimal(10,2) NOT NULL,
  `creado_en` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `actualizado_en` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `nombre_invitado` varchar(100) DEFAULT NULL,
  `correo_invitado` varchar(150) DEFAULT NULL,
  `telefono_invitado` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`id_pedido`),
  UNIQUE KEY `numero_pedido` (`numero_pedido`),
  KEY `fk_pedido_usuario` (`id_usuario`),
  CONSTRAINT `fk_pedido_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`),
  CONSTRAINT `chk_estado_pedido` CHECK ((`estado` in (_utf8mb4'pendiente',_utf8mb4'preparacion',_utf8mb4'listo',_utf8mb4'camino',_utf8mb4'entregado',_utf8mb4'cancelado')))
) ENGINE=InnoDB AUTO_INCREMENT=31 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pedidos`
--

LOCK TABLES `pedidos` WRITE;
/*!40000 ALTER TABLE `pedidos` DISABLE KEYS */;
INSERT INTO `pedidos` VALUES (1,NULL,'HF-202603-0001','entregado','Calle Las Flores 890, San Borja','yape','529784',15.00,'2026-03-02 10:16:00','2026-03-02 10:16:00','María Condori','maria.condori@gmail.com','912345678'),
(2,10,'HF-202603-0002','entregado','Av. Colonial 1212, Pueblo Libre','yape','453826',79.90,'2026-03-02 12:15:00','2026-03-02 12:15:00',NULL,NULL,NULL),
(3,7,'HF-202603-0003','entregado','Jr. Huallaga 234, Rímac','plin','341392',29.00,'2026-03-04 12:38:00','2026-03-04 12:38:00',NULL,NULL,NULL),
(4,3,'HF-202603-0004','entregado','Jr. Huallaga 234, Rímac','plin','173061',13.00,'2026-03-09 14:52:00','2026-03-09 14:52:00',NULL,NULL,NULL),
(5,12,'HF-202603-0005','entregado','Calle Las Flores 890, San Borja','plin','497366',124.00,'2026-03-11 12:26:00','2026-03-11 12:26:00',NULL,NULL,NULL),
(6,6,'HF-202603-0006','entregado','Av. Brasil 321, Breña','transferencia','800256',270.00,'2026-03-12 10:39:00','2026-03-12 10:39:00',NULL,NULL,NULL),
(7,NULL,'HF-202603-0007','entregado','Calle Lima 333, Barranco','plin','804958',173.90,'2026-03-12 19:44:00','2026-03-12 19:44:00','Pedro Chávez','pedro.chavez@gmail.com','945678901'),
(8,NULL,'HF-202603-0008','entregado','Calle Los Pinos 456, Surquillo','yape','708709',49.00,'2026-03-13 18:37:00','2026-03-13 18:37:00','María Condori','maria.condori@gmail.com','912345678'),
(9,6,'HF-202603-0009','entregado','Calle Las Flores 890, San Borja','yape','568240',128.00,'2026-03-16 16:42:00','2026-03-16 16:42:00',NULL,NULL,NULL),
(10,8,'HF-202603-0010','entregado','Av. Universitaria 1011, Los Olivos','efectivo',NULL,75.00,'2026-03-16 18:21:00','2026-03-16 18:21:00',NULL,NULL,NULL),
(11,9,'HF-202603-0011','entregado','Av. Arequipa 1234, Miraflores','efectivo',NULL,239.90,'2026-03-21 19:13:00','2026-03-21 19:13:00',NULL,NULL,NULL),
(12,5,'HF-202603-0012','entregado','Calle Los Pinos 456, Surquillo','yape','978532',59.00,'2026-03-27 17:43:00','2026-03-27 17:43:00',NULL,NULL,NULL),
(13,3,'HF-202603-0013','entregado','Av. Brasil 321, Breña','efectivo',NULL,69.00,'2026-03-28 10:30:00','2026-03-28 10:30:00',NULL,NULL,NULL),
(14,NULL,'HF-202603-0014','entregado','Calle Las Flores 890, San Borja','plin','920281',200.00,'2026-03-30 14:59:00','2026-03-30 14:59:00','Pedro Chávez','pedro.chavez@gmail.com','945678901'),
(15,NULL,'HF-202604-0015','entregado','Calle Lima 333, Barranco','transferencia','113146',35.00,'2026-04-01 09:17:00','2026-04-01 09:17:00','María Condori','maria.condori@gmail.com','912345678'),
(16,7,'HF-202604-0016','entregado','Av. Colonial 1212, Pueblo Libre','yape','712729',25.90,'2026-04-02 09:27:00','2026-04-02 09:27:00',NULL,NULL,NULL),
(17,3,'HF-202604-0017','cancelado','Calle Las Flores 890, San Borja','efectivo',NULL,124.00,'2026-04-06 18:29:00','2026-04-06 18:29:00',NULL,NULL,NULL),
(18,10,'HF-202604-0018','entregado','Av. Arequipa 1234, Miraflores','plin','874844',85.00,'2026-04-08 17:57:00','2026-04-08 17:57:00',NULL,NULL,NULL),
(19,4,'HF-202604-0019','entregado','Jr. Ucayali 567, Cercado de Lima','plin','104528',88.00,'2026-04-14 11:13:00','2026-04-14 11:13:00',NULL,NULL,NULL),
(20,NULL,'HF-202604-0020','cancelado','Jr. Huallaga 234, Rímac','plin','177617',139.90,'2026-04-17 11:47:00','2026-04-17 11:47:00','Pedro Chávez','pedro.chavez@gmail.com','945678901'),
(21,5,'HF-202604-0021','entregado','Av. Universitaria 1011, Los Olivos','yape','850223',82.90,'2026-04-19 09:10:00','2026-04-19 09:10:00',NULL,NULL,NULL),
(22,10,'HF-202604-0022','entregado','Calle Lima 333, Barranco','yape','346142',139.90,'2026-04-23 11:32:00','2026-04-23 11:32:00',NULL,NULL,NULL),
(23,7,'HF-202604-0023','entregado','Jr. Ucayali 567, Cercado de Lima','transferencia','131038',153.90,'2026-04-24 11:02:00','2026-04-24 11:02:00',NULL,NULL,NULL),
(24,3,'HF-202604-0024','entregado','Jr. Huallaga 234, Rímac','yape','830431',89.90,'2026-04-27 13:39:00','2026-04-27 13:39:00',NULL,NULL,NULL),
(25,8,'HF-202604-0025','cancelado','Av. Javier Prado 789, San Isidro','plin','356856',199.90,'2026-04-29 19:05:00','2026-04-29 19:05:00',NULL,NULL,NULL),
(26,3,'HF-202605-0026','entregado','Jr. Huallaga 234, Rímac','yape','789425',85.00,'2026-05-01 15:05:00','2026-05-01 15:05:00',NULL,NULL,NULL),
(27,7,'HF-202605-0027','entregado','Calle Los Pinos 456, Surquillo','efectivo',NULL,9.00,'2026-05-06 14:08:00','2026-05-06 14:08:00',NULL,NULL,NULL),
(28,9,'HF-202605-0028','listo','Av. Colonial 1212, Pueblo Libre','transferencia','374647',149.00,'2026-05-07 15:12:00','2026-05-07 15:12:00',NULL,NULL,NULL),
(29,5,'HF-202605-0029','camino','Calle Lima 333, Barranco','yape','400453',15.00,'2026-05-11 16:16:00','2026-05-11 16:16:00',NULL,NULL,NULL),
(30,NULL,'HF-202605-0030','camino','Jr. Huallaga 234, Rímac','yape','543931',120.00,'2026-05-11 18:26:00','2026-05-11 18:26:00','María Condori','maria.condori@gmail.com','912345678');
/*!40000 ALTER TABLE `pedidos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `productos`
--

DROP TABLE IF EXISTS `productos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `productos` (
  `id_producto` int NOT NULL AUTO_INCREMENT,
  `id_categoria` int NOT NULL,
  `nombre` varchar(150) NOT NULL,
  `descripcion` varchar(500) DEFAULT NULL,
  `imagen` varchar(255) DEFAULT NULL,
  `precio_anterior` decimal(10,2) DEFAULT NULL,
  `precio_actual` decimal(10,2) NOT NULL,
  `stock` int NOT NULL DEFAULT '0',
  `activo` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`id_producto`),
  KEY `fk_producto_categoria` (`id_categoria`),
  CONSTRAINT `fk_producto_categoria` FOREIGN KEY (`id_categoria`) REFERENCES `categorias` (`id_categoria`)
) ENGINE=InnoDB AUTO_INCREMENT=89 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `productos`
--

LOCK TABLES `productos` WRITE;
/*!40000 ALTER TABLE `productos` DISABLE KEYS */;
INSERT INTO `productos` VALUES (1,1,'Rosa Natural / Rosa Eterna','Incluye tarjeta \"eres maravillosa\".','https://res.cloudinary.com/dwmmxzf5u/image/upload/v1778697375/happyflower/rosa_natural_eterna.jpg',NULL,15.00,50,1),
(2,1,'Ramo de 20 Rosas','Incluye tarjeta dedicatoria.','https://res.cloudinary.com/dwmmxzf5u/image/upload/v1778697376/happyflower/ramo_20_rosas.jpg',NULL,120.00,20,1),
(3,1,'Buchón 25 Rosas','Incluye tarjeta dedicatoria.','https://res.cloudinary.com/dwmmxzf5u/image/upload/v1778697377/happyflower/buchon_25_rosas.jpg',NULL,139.90,15,1),
(4,1,'6 Rosas','Incluye tarjeta dedicatoria.','https://res.cloudinary.com/dwmmxzf5u/image/upload/v1778697378/happyflower/ramo_6_rosas.jpg',NULL,139.90,25,1),(5,1,'9 Rosas','Incluye tarjeta dedicatoria.','https://res.cloudinary.com/dwmmxzf5u/image/upload/v1778697379/happyflower/ramo_9_rosas.jpg',NULL,60.00,25,1),(6,1,'12 Rosas','Incluye tarjeta dedicatoria.','https://res.cloudinary.com/dwmmxzf5u/image/upload/v1778697380/happyflower/ramo_12_rosas.jpg',NULL,75.00,20,1),(7,1,'20 Rosas','Incluye tarjeta dedicatoria.','https://res.cloudinary.com/dwmmxzf5u/image/upload/v1778697380/happyflower/20_rosas.jpg',NULL,89.90,20,1),
(8,1,'25 Rosas','Incluye tarjeta dedicatoria.','https://res.cloudinary.com/dwmmxzf5u/image/upload/v1778697381/happyflower/ramo_25_rosas.jpg',NULL,119.90,15,1),
(9,1,'50 Rosas','Incluye tarjeta dedicatoria.','https://res.cloudinary.com/dwmmxzf5u/image/upload/v1778697381/happyflower/ramo_50_rosas.jpg',NULL,170.00,10,1),
(10,1,'100 Rosas','Incluye tarjeta dedicatoria.','https://res.cloudinary.com/dwmmxzf5u/image/upload/v1778697382/happyflower/ramo_100_rosas.jpg',NULL,490.00,5,1),
(11,2,'Girasol Tejido','Girasol tejido artesanal, detalle duradero.','https://res.cloudinary.com/dwmmxzf5u/image/upload/v1778697383/happyflower/girasol_tejido.jpg',NULL,25.90,40,1),
(12,2,'Ramo 2 Girasoles','Incluye dos girasoles frescos, papel coreano y dedicatoria.','https://res.cloudinary.com/dwmmxzf5u/image/upload/v1778697383/happyflower/ramo_2_girasoles.jpg',NULL,39.00,30,1),
(13,2,'Ramo 3 Girasoles','Incluye papel coreano y dedicatoria impresa.','https://res.cloudinary.com/dwmmxzf5u/image/upload/v1778697384/happyflower/ramo_3_girasoles.jpg',NULL,49.00,30,1),(14,2,'5 Girasoles','Incluye papel coreano y dedicatoria impresa.','https://res.cloudinary.com/dwmmxzf5u/image/upload/v1778697385/happyflower/ramo_5_girasoles.jpg',NULL,49.00,25,1),(15,2,'6 Girasoles','Incluye papel coreano y dedicatoria impresa.','https://res.cloudinary.com/dwmmxzf5u/image/upload/v1778697386/happyflower/ramo_6_girasoles.jpg',NULL,70.00,20,1),(16,2,'Ramo Girasoles + Dedicatoria','Incluye cinco girasoles frescos, papel coreano y dedicatoria.','https://res.cloudinary.com/dwmmxzf5u/image/upload/v1778697386/happyflower/ramo_girasoles_dedicatoria.jpg',NULL,65.00,20,1),(17,2,'Ramo Girasoles - Día de la Mujer','Incluye seis girasoles frescos y tarjeta dedicatoria.','https://res.cloudinary.com/dwmmxzf5u/image/upload/v1778697387/happyflower/ramo_6_girasoles_dia_mujer.jpg',NULL,69.00,15,1),(18,2,'Ramo Girasoles - Flores Amarillas','Incluye seis girasoles frescos, papel coreano y dedicatoria.','https://res.cloudinary.com/dwmmxzf5u/image/upload/v1778697388/happyflower/ramo_girasoles_y_flores_amarillas.jpg',NULL,70.00,15,1),(19,2,'Ramo 12 Girasoles','Incluye papel coreano y dedicatoria impresa.','https://res.cloudinary.com/dwmmxzf5u/image/upload/v1778697389/happyflower/ramo_12_girasoles.jpg',NULL,115.00,10,1),(20,2,'12 Girasoles Frescos','Incluye dedicatoria impresa.','https://res.cloudinary.com/dwmmxzf5u/image/upload/v1778697389/happyflower/ramo_12_girasoles_frescos.jpg',NULL,149.00,10,1),(21,3,'Mini Box','7-8 rosas, incluye tarjeta.','https://res.cloudinary.com/dwmmxzf5u/image/upload/v1778697390/happyflower/mini_box.jpg',NULL,69.00,25,1),(22,3,'Mini Box Floral','4 rosas y astromelias, incluye tarjeta y globo personalizado.','https://res.cloudinary.com/dwmmxzf5u/image/upload/v1778697391/happyflower/mini_box_floral.jpg',NULL,79.90,20,1),(23,3,'Clasic Box','10-12 rosas, incluye topper de \"Feliz Cumpleaños\".','https://res.cloudinary.com/dwmmxzf5u/image/upload/v1778697392/happyflower/clasic_box.jpg',NULL,99.00,20,1),(24,3,'Box Mix','8 rosas + flores + caja reutilizable, incluye tarjeta.','https://res.cloudinary.com/dwmmxzf5u/image/upload/v1778697393/happyflower/box_mix.jpg',NULL,119.90,15,1),(25,3,'Golden Box','18-24 rosas, incluye tarjeta.','https://res.cloudinary.com/dwmmxzf5u/image/upload/v1778697394/happyflower/golden_box.jpg',NULL,125.00,10,1),(26,3,'Box Amor Teddy','Oso + caja personalizada + trofeo + chocolates.','https://res.cloudinary.com/dwmmxzf5u/image/upload/v1778697394/happyflower/box_amor_teddy.jpg',NULL,69.90,20,1),(27,3,'Box Magia Premium','24-20 rosas + 8 chocolates.','https://res.cloudinary.com/dwmmxzf5u/image/upload/v1778697395/happyflower/box_magia_premium.jpg',NULL,159.90,10,1),(28,3,'Box Tulipán','10 tulipanes + follaje, incluye tarjeta dedicatoria.','https://res.cloudinary.com/dwmmxzf5u/image/upload/v1778697396/happyflower/box_tulipan.jpg',NULL,219.90,8,1),(29,3,'Box Cerveza Mix','Box reutilizable + cerveza + galletas y chocolate, incluye tarjeta.','https://res.cloudinary.com/dwmmxzf5u/image/upload/v1778697397/happyflower/box_cerveza_mix.jpg',NULL,69.00,15,1),(30,3,'Box Rosas + Tulipanes','Incluye 5 rosas + 5 tulipanes + tarjeta.','https://res.cloudinary.com/dwmmxzf5u/image/upload/v1778697397/happyflower/box_rosas_mas_tulipanes.png',NULL,69.00,15,1),(31,3,'Box Corazon','Incluye 7-8 rosas frescas + claveles + 1 peluche + chocolates + globo + 1 tarjeta dedicatoria.','https://res.cloudinary.com/dwmmxzf5u/image/upload/v1778697398/happyflower/box_corazon.png',NULL,69.00,15,1),(32,3,'Box Pingüino','Incluye pingüino + caja personalizada.','https://res.cloudinary.com/dwmmxzf5u/image/upload/v1778697399/happyflower/box_pinguino.png',NULL,69.00,15,1),(33,3,'Box Burbuja','Incluye 10-12 rosas + globo + tarjeta.','https://res.cloudinary.com/dwmmxzf5u/image/upload/v1778697400/happyflower/box_burbuja.png',NULL,119.00,15,1),(34,3,'Box Snoopy','Incluye un peluche de snoopy + una caja personalizada y fotos impresas.','https://res.cloudinary.com/dwmmxzf5u/image/upload/v1778697401/happyflower/box_snoopy.png',NULL,85.00,15,1),(35,3,'Box Burbuja Osito','Incluye box reutilizable + oso + papas + globo + cerveza y destapador.','https://res.cloudinary.com/dwmmxzf5u/image/upload/v1778697402/happyflower/box_burbuja_osito.png',NULL,90.00,15,1),(36,3,'Box Girasoles Premium','Incluye 18-20 girasoles + tarjeta.','https://res.cloudinary.com/dwmmxzf5u/image/upload/v1778697403/happyflower/box_girasoles_premium.png',NULL,189.90,15,1),(37,3,'Box Goku','Incluye un peluche de Goku + un carrito personalizado + foto impresa y papas.','https://res.cloudinary.com/dwmmxzf5u/image/upload/v1778697404/happyflower/box_goku.png',NULL,85.00,15,1),(38,3,'Box Araña','Incluye un peluche de Spider-man + un carrito personalizado + foto impresa y papas.','https://res.cloudinary.com/dwmmxzf5u/image/upload/v1778697404/happyflower/box_ara%C3%B1a.png',NULL,85.00,15,1),(39,3,'Box 8 rosas + 3 girasoles','Incluye 8 rosas + 3 girasoles + follaje + tarjeta.','https://res.cloudinary.com/dwmmxzf5u/image/upload/v1778697406/happyflower/box_8_rosas.png',NULL,119.00,15,1),(40,3,'Box Magia Classic','Incluye 10-12 rosas + 8 chocolates + tarjeta.','https://res.cloudinary.com/dwmmxzf5u/image/upload/v1778697407/happyflower/box_magic_classic.png',NULL,139.00,15,1),(41,3,'Box Girasoles','Incluye 2 girasoles frescas + mix + 1 globo + caja reutilizable + 1 tarjeta dedicatoria impresa.','https://res.cloudinary.com/dwmmxzf5u/image/upload/v1778697407/happyflower/box_girsoles.png',NULL,85.00,15,1),(42,4,'Cuadro Clásico','Medida 20x15 cm, incluye diseño y caja. De regalo un bononon.','https://res.cloudinary.com/dwmmxzf5u/image/upload/v1778697408/happyflower/cuadro_clasico.jpg',NULL,39.00,30,1),(43,4,'Cuadro Encajonado','Marco de pino 20x15 cm, incluye diseño y caja. De regalo un bononon.','https://res.cloudinary.com/dwmmxzf5u/image/upload/v1778697409/happyflower/cuadro_encajonado.jpg',NULL,45.00,25,1),(44,4,'Cuadro Giratorio','Marco de pino 27 cm, incluye dos fotos y caja.','https://res.cloudinary.com/dwmmxzf5u/image/upload/v1778697410/happyflower/cuadro_giratorio.jpg',NULL,65.00,20,1),(45,5,'5 Tulipanes','Tarjeta de dedicatoria impresa.','https://res.cloudinary.com/dwmmxzf5u/image/upload/v1778697411/happyflower/5_tulipanes.jpg',NULL,85.00,15,1),(46,5,'10 Tulipanes','Tarjeta de dedicatoria impresa.','https://res.cloudinary.com/dwmmxzf5u/image/upload/v1778697411/happyflower/10_tulipanes.jpg',NULL,165.00,12,1),(47,5,'15 Tulipanes','Tarjeta de dedicatoria impresa.','https://res.cloudinary.com/dwmmxzf5u/image/upload/v1778697412/happyflower/15_tulipanes.jpg',NULL,195.00,10,1),(48,5,'20 Tulipanes','Tarjeta de dedicatoria impresa.','https://res.cloudinary.com/dwmmxzf5u/image/upload/v1778697413/happyflower/20_tulipanes.jpg',NULL,270.00,8,1),(49,6,'Mini Ramo','Incluye rosas y astromelias.','https://res.cloudinary.com/dwmmxzf5u/image/upload/v1778697414/happyflower/mini_ramo.jpg',NULL,29.00,30,1),(50,6,'Mini Ramo 2','Incluye girasol + astromelia.','https://res.cloudinary.com/dwmmxzf5u/image/upload/v1778697415/happyflower/mini_ramo_2.jpg',NULL,35.00,30,1),(51,6,'Ramo Mix','Incluye astromelias + girasol + mix floral.','https://res.cloudinary.com/dwmmxzf5u/image/upload/v1778697416/happyflower/ramo_mix.jpg',NULL,39.90,25,1),(52,6,'Ramo 1','Incluye astromelias + margaritas + claveles.','https://res.cloudinary.com/dwmmxzf5u/image/upload/v1778697417/happyflower/ramo_1.jpg',NULL,39.00,25,1),(53,6,'Flores Amarillas','Incluye girasoles + rosas + follaje + dedicatoria.','https://res.cloudinary.com/dwmmxzf5u/image/upload/v1778697418/happyflower/flores_amarillas.jpg',NULL,85.00,15,1),(54,6,'Ramo Kitty','Incluye un peluche + 3 rosas + tarjeta.','https://res.cloudinary.com/dwmmxzf5u/image/upload/v1778697419/happyflower/ramo_kitty.jpg',NULL,59.00,20,1),(55,6,'Ramo Eterno Kitty','Incluye 7-8 rosas eternas + peluche kitty + papel + mariposa + incluye tarjeta.','https://res.cloudinary.com/dwmmxzf5u/image/upload/v1778697419/happyflower/ramo_eterno_kitty.jpg',NULL,85.00,15,1),(56,6,'Ramo Vara de Lirios','Girasol + astromelias + follaje, incluye tarjeta.','https://res.cloudinary.com/dwmmxzf5u/image/upload/v1778697420/happyflower/ramo_vara_lirios.jpg',NULL,39.00,20,1),(57,6,'Ramo Mamá','Incluye 6 rosas + astromelias + 5 bombones + papel coreano + globo + tarjeta dedicatoria impresa.','https://res.cloudinary.com/dwmmxzf5u/image/upload/v1778697421/happyflower/ramo_mama.png',NULL,79.90,20,1),(58,6,'Ramo 3 Rosas','Incluye 3 rosas frescas + 6 girasoles + papel coreano + tarjeta dedicatoria impresa.','https://res.cloudinary.com/dwmmxzf5u/image/upload/v1778697421/happyflower/ramo_3_rosas.png',NULL,89.90,20,1),(59,6,'Ramo carro','Incluye un carro hot wheels + papel coreano.','https://res.cloudinary.com/dwmmxzf5u/image/upload/v1778697422/happyflower/ramo_carro.png',NULL,30.00,20,1),(60,6,'Ramo 6 carros','Incluye 6 carros hot wheels + papel coreano.','https://res.cloudinary.com/dwmmxzf5u/image/upload/v1778697423/happyflower/ramo_6_carros.png',NULL,39.00,20,1),(61,6,'Ramo Espejo Eterno','Incluye 12-13 rosas eternas + espejo personalizado.','https://res.cloudinary.com/dwmmxzf5u/image/upload/v1778697424/happyflower/ramo_espejo.png',NULL,115.00,20,1),(62,6,'Ramo Espejo Natural','Incluye 6 rosas frescas + gerberas + 1 girasol + mix floral + 1 espejo personalizado.','https://res.cloudinary.com/dwmmxzf5u/image/upload/v1778697425/happyflower/ramo_espejo_natural.png',NULL,130.00,20,1),(63,6,'Buchon 25 rosas + 5 girasoles','Incluye 25 rosas + 5 girasoles + corona + papel coreano + 3 chocolates + tarjeta dedicatoria impresa.','https://res.cloudinary.com/dwmmxzf5u/image/upload/v1778697426/happyflower/ramo_buchon_25.png',NULL,199.90,20,1),(64,6,'Ramo Mom','Incluye astromelias + margaritas + claveles + papel coreano + tarjeta dedicatoria impresa.','https://res.cloudinary.com/dwmmxzf5u/image/upload/v1778697427/happyflower/ramo_mom.png',NULL,45.00,20,1),(65,6,'Ramo Mom 2','Incluye astromelias + 1 girasol + mix floral + papel coreano + tarjeta dedicatoria impresa.','https://res.cloudinary.com/dwmmxzf5u/image/upload/v1778697428/happyflower/ramo_mom2.png',NULL,50.00,20,1),(66,6,'Ramito 1','Incluye 1 rosa + astromelias + tarjeta dedicatoria impresa.','https://res.cloudinary.com/dwmmxzf5u/image/upload/v1778697429/happyflower/ramito_1.png',NULL,29.90,20,1),(67,6,'Ramito 2','Incluye astromelias + 1 girasol + mix floral + papel coreano + tarjeta dedicatoria impresa.','https://res.cloudinary.com/dwmmxzf5u/image/upload/v1778697430/happyflower/ramito_2.png',NULL,35.00,20,1),(68,6,'Ramo 2 carritos','Incluye 2 carros Hot Wheels + papel coreano.','https://res.cloudinary.com/dwmmxzf5u/image/upload/v1778697431/happyflower/ramo_2_carritos.png',NULL,55.00,20,1),(69,6,'Ramo carro + chocolate','Incluye 1 carro + papel coreano + chocolate ferrero.','https://res.cloudinary.com/dwmmxzf5u/image/upload/v1778697432/happyflower/ramo_carro_ferrero.png',NULL,39.00,20,1),(70,6,'Ramo Pingüino','Incluye un peluche pingüinos + 3 rosas + orea + chocmac + globo + papel coreano.','https://res.cloudinary.com/dwmmxzf5u/image/upload/v1778697434/happyflower/ramo_pinguino.png',NULL,89.00,20,1),(71,6,'Ramo 3 carrito + ferrero','Incluye tres carritos + papel coreano + tarjeta dedicatoria impresa + chocolate ferrero.','https://res.cloudinary.com/dwmmxzf5u/image/upload/v1778697434/happyflower/ramo_3_carrito.png',NULL,69.90,20,1),(72,6,'Ramo hot wheels','Incluye carrito + papel coreano + 1 bebida pilsen.','https://res.cloudinary.com/dwmmxzf5u/image/upload/v1778697435/happyflower/ramo_pilsen.png',NULL,46.00,20,1),(73,6,'Cartera Floral','Incluye gerberas + rosas + claveles + mix + 1 peluche + 3 chocolates + 1 tarjeta dedicatoria impresa.','https://res.cloudinary.com/dwmmxzf5u/image/upload/v1778697436/happyflower/cartera_floral.png',NULL,85.00,20,1),(74,7,'Cúpula de Girasol Tejido','Girasol tejido artesanal dentro de cúpula decorativa, incluye luces LED.','https://res.cloudinary.com/dwmmxzf5u/image/upload/v1778697437/happyflower/cupula_girasol.jpg',NULL,39.90,20,1),(75,8,'Chocolate Ferrero','Ferrero Rocher individual, ideal para complementar cualquier arreglo.','https://res.cloudinary.com/dwmmxzf5u/image/upload/v1778697438/happyflower/chocolate_ferrero.jpg',NULL,6.00,100,1),(76,8,'Chocolate Ferrero 3 Uni','Caja de 3 unidades de Ferrero Rocher.','https://res.cloudinary.com/dwmmxzf5u/image/upload/v1778697439/happyflower/chocolate_ferrero_3_uni.jpg',NULL,13.00,80,1),(77,8,'Chocolate Ferrero 4 Uni','Caja de 4 unidades de Ferrero Rocher.','https://res.cloudinary.com/dwmmxzf5u/image/upload/v1778697440/happyflower/chocolate_ferrero_4_uni.jpg',NULL,20.00,60,1),(78,8,'Chocolate Ferrero 8 Uni','Caja de 8 unidades de Ferrero Rocher.','https://res.cloudinary.com/dwmmxzf5u/image/upload/v1778697442/happyflower/chocolate_ferrero_8_uni.jpg',45.00,23.00,40,1),(79,8,'Chocolate Monfer 3 Uni','Caja de 3 unidades de chocolate Monfer.','https://res.cloudinary.com/dwmmxzf5u/image/upload/v1778697442/happyflower/chocolate_monfer_3_uni.jpg',NULL,9.00,80,1),(80,8,'Chocolate Monfer 5 Uni','Caja de 5 unidades de chocolate Monfer.','https://res.cloudinary.com/dwmmxzf5u/image/upload/v1778697444/happyflower/chocolate_monfer_5_uni.jpg',NULL,15.00,60,1),(81,8,'Chocolate Vizzio','Chocolate Vizzio, sabor premium.','https://res.cloudinary.com/dwmmxzf5u/image/upload/v1778697445/happyflower/vizzio.jpg',NULL,10.00,70,1),(82,8,'Vino','Vino de mesa tamaño estándar, ideal para combinar con arreglos.','https://res.cloudinary.com/dwmmxzf5u/image/upload/v1778697446/happyflower/vino_peque.jpg',NULL,30.00,30,1),(83,8,'Vino Grande','Vino de mesa tamaño grande.','https://res.cloudinary.com/dwmmxzf5u/image/upload/v1778697446/happyflower/vino_grande.jpg',NULL,60.00,20,1),(84,8,'Hot Wheels','Auto coleccionable Hot Wheels, ideal de regalo para niños.','https://res.cloudinary.com/dwmmxzf5u/image/upload/v1778697447/happyflower/hot_wheels.jpg',NULL,39.00,25,1),(85,8,'2 Hot Wheels','Pack de 2 autos coleccionables Hot Wheels.','https://res.cloudinary.com/dwmmxzf5u/image/upload/v1778697448/happyflower/hot_wheels_2_uni.jpg',NULL,59.00,15,1),(86,8,'3 Hot Wheels','Pack de 3 autos coleccionables Hot Wheels.','https://res.cloudinary.com/dwmmxzf5u/image/upload/v1778697449/happyflower/hot_wheels_3_uni.jpg',NULL,79.00,10,1);
/*!40000 ALTER TABLE `productos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `roles`
--

DROP TABLE IF EXISTS `roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `roles` (
  `id_rol` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(50) NOT NULL,
  PRIMARY KEY (`id_rol`),
  UNIQUE KEY `nombre` (`nombre`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `roles`
--

LOCK TABLES `roles` WRITE;
/*!40000 ALTER TABLE `roles` DISABLE KEYS */;
INSERT INTO `roles` VALUES (2,'admin'),(1,'usuario');
/*!40000 ALTER TABLE `roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sessions`
--

DROP TABLE IF EXISTS `sessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sessions` (
  `session_id` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `expires` int unsigned NOT NULL,
  `data` mediumtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin,
  PRIMARY KEY (`session_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sessions`
--

LOCK TABLES `sessions` WRITE;
/*!40000 ALTER TABLE `sessions` DISABLE KEYS */;
INSERT INTO `sessions` VALUES ('3JOR-gcWdw1OoL0am355UnUS4bbS6MuY',1778722403,'{\"cookie\":{\"originalMaxAge\":28800000,\"expires\":\"2026-05-14T01:33:14.715Z\",\"secure\":false,\"httpOnly\":true,\"path\":\"/\",\"sameSite\":\"lax\"},\"usuario\":{\"id_usuario\":1,\"id_rol\":2,\"nombre\":\"Julissa\",\"correo\":\"flowerhappy404@gmail.com\"}}'),('pwUEUDxdyBbnhyFK01ZmtHIcyoYMmD3z',1778723210,'{\"cookie\":{\"originalMaxAge\":28800000,\"expires\":\"2026-05-14T01:45:41.941Z\",\"secure\":false,\"httpOnly\":true,\"path\":\"/\",\"sameSite\":\"lax\"},\"usuario\":{\"id_usuario\":null,\"id_rol\":1,\"nombre\":\"Invitado\",\"correo\":null}}');
/*!40000 ALTER TABLE `sessions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usuarios`
--

DROP TABLE IF EXISTS `usuarios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuarios` (
  `id_usuario` int NOT NULL AUTO_INCREMENT,
  `id_rol` int NOT NULL DEFAULT '1',
  `nombre` varchar(100) NOT NULL,
  `apellido` varchar(100) DEFAULT NULL,
  `correo` varchar(150) NOT NULL,
  `telefono` varchar(20) DEFAULT NULL,
  `contrasena` varchar(255) NOT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`id_usuario`),
  UNIQUE KEY `correo` (`correo`),
  KEY `fk_usuario_rol` (`id_rol`),
  CONSTRAINT `fk_usuario_rol` FOREIGN KEY (`id_rol`) REFERENCES `roles` (`id_rol`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuarios`
--

LOCK TABLES `usuarios` WRITE;
/*!40000 ALTER TABLE `usuarios` DISABLE KEYS */;
INSERT INTO `usuarios` VALUES (1,2,'Julissa','Zamora','flowerhappy404@gmail.com','991 419 078','$2b$10$2P9nYdq9logTvBPT0.1gsOyZrRkjWZR9SN5/xtmY9oeMmkk04TcWu',1),(2,1,'Camila','Torres','camila.torres@gmail.com','987654321','$2b$10$TDdXRuevdd/UAyuKs2i2nuArBgScQ.19.7MgOWsufFwuYxxTfC5cK',1),(3,1,'Lucía','Mamani','lucia.mamani@hotmail.com','976543210','$2b$10$Gy47JCeTjPHsuAUc7W0p/u/E7uuY0UPmPMmOybdM4GSBQBttrrBnC',1),(4,1,'Sofía','Quispe','sofia.quispe@gmail.com','965432109','$2b$10$o1gHzJPPRf9oCAwvAzR1xOiR9DF3cq7QqcWQ61creHxfjTGddFCHu',1),(5,1,'Valentina','Cruz','valentina.cruz@gmail.com','954321098','$2b$10$wV40ezcI4U8Get4t7ovGVejlOgh/0iK2WAuAtjNvTlGY4gIh/D.9e',1),(6,1,'Fernanda','López','fernanda.lopez@outlook.com','943210987','$2b$10$pQSt4OHkxdmuz1L6FzW3h.7X1399oCE/bbr8dqxf24RcU/.g3tKkK',1),(7,1,'Daniela','Ramos','daniela.ramos@gmail.com','932109876','$2b$10$8epSMMTJq9CQ7Ky25e23s.c8Io76a9OP7b3cKSuh8OoMuDA0BV5T.',1),(8,1,'Gabriela','Flores','gabriela.flores@gmail.com','921098765','$2b$10$O.7PT/JcWAyxHXqnbn6fV.lZzad/MgW9ECi.xikOhw3tS53CkeuiC',1),(9,1,'Paola','Vargas','paola.vargas@gmail.com','910987654','$2b$10$A3Mo5QobRIROwLGtjI/Usuvp.lLCcG9jcZ9L8Rv.sy.ogUHte5oRe',1),(10,1,'Andrea','Mendoza','andrea.mendoza@hotmail.com','909876543','$2b$10$WKOWLoI6frPt2XW4/RbqV.shZRTZjW5dcv2GdAuCz14sxUtWnnDC6',1),(11,1,'Karla','Huanca','karla.huanca@gmail.com','998765432','$2b$10$b7BZ.2qp6JO8TzdsgDUUm.Zs.wzaPUZBuvwWBe4xcD5KNrF3/y10O',1),(12,1,'Miguel','Soto','miguel.soto@gmail.com','987123456','$2b$10$m5yg6jBUyu9IYaw9kEPXXuWbTAOCMDWbeS6CyW1zU4dboGEgv/X8S',1);
/*!40000 ALTER TABLE `usuarios` ENABLE KEYS */;
UNLOCK TABLES;
SET @@SESSION.SQL_LOG_BIN = @MYSQLDUMP_TEMP_LOG_BIN;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-05-13 14:06:53

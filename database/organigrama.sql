-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Gazdă: 127.0.0.1
-- Timp de generare: feb. 22, 2024 la 08:40 AM
-- Versiune server: 10.4.28-MariaDB
-- Versiune PHP: 8.2.4

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Bază de date: `organigrama`
--

-- --------------------------------------------------------

--
-- Structură tabel pentru tabel `nodes`
--

CREATE TABLE `nodes` (
  `id` int(11) NOT NULL,
  `node_name` varchar(100) NOT NULL,
  `parent_node_id` int(11) DEFAULT NULL,
  `username` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Eliminarea datelor din tabel `nodes`
--

INSERT INTO `nodes` (`id`, `node_name`, `parent_node_id`, `username`) VALUES
(0, 'CEO', NULL, 'John Doe'),
(1, 'CTO', 0, 'Jane Smith'),
(2, 'CFO', 0, 'Michael Johnson'),
(3, 'Software Development Manager', 1, 'Emily Davis'),
(4, 'Network Engineer', 1, 'David Brown'),
(5, 'Database Administrator', 2, 'Sarah Wilson'),
(6, 'Security Analyst', 2, 'Daniel Taylor'),
(7, 'Senior Software Engineer', 3, 'Olivia Martinez'),
(8, 'Junior Software Engineer', 3, 'James Anderson'),
(9, 'System Administrator', 4, 'Sophia Thomas'),
(10, 'IT Support Specialist', 4, 'Matthew Jackson'),
(11, 'UI/UX Designer', 5, 'Isabella White'),
(12, 'Quality Assurance Engineer', 5, 'Ethan Harris'),
(13, 'Business Analyst', 6, 'Ava Martin'),
(14, 'Project Manager', 6, 'Alexander Thompson');

--
-- Indexuri pentru tabele eliminate
--

--
-- Indexuri pentru tabele `nodes`
--
ALTER TABLE `nodes`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT pentru tabele eliminate
--

--
-- AUTO_INCREMENT pentru tabele `nodes`
--
ALTER TABLE `nodes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=181;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

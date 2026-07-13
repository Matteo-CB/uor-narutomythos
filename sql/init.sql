-- Script SQL d'initialisation de la base pour le site Naruto Mythos
-- Cours UOR, exercice 5.1
-- Matteo Chante-Biyikli, ID 82507085, L1 IED Paris 8
--
-- Cible : MySQL 8.x chez AlwaysData (hebergement free tier).
--
-- Usage : a importer dans phpMyAdmin via "Importer", ou via le
-- terminal SSH AlwaysData :
--   mysql -u <USER> -p -h mysql-<USER>.alwaysdata.net <USER>_naruto < init.sql
--
-- La base et l'utilisateur sont crees au prealable dans la console
-- AlwaysData (onglet "Bases de donnees > MySQL"). Ce script ne fait
-- que creer la table des inscriptions et y inserer des donnees de test.

-- 1. On se place dans la base qui a ete creee depuis la console AlwaysData
--    (le nom exact suit le pattern <USER>_naruto)
-- USE matteocb-uor_naruto;

-- 2. Table des inscriptions a la newsletter
DROP TABLE IF EXISTS inscriptions;

CREATE TABLE inscriptions (
  id         INT UNSIGNED       NOT NULL AUTO_INCREMENT,
  pseudo     VARCHAR(40)        NOT NULL,
  email      VARCHAR(120)       NOT NULL,
  set_pref   ENUM('KS','SS','AK','aucun') NOT NULL,
  niveau     ENUM('debutant','intermediaire','competitif') NOT NULL,
  message    TEXT               NULL,
  cree_le    DATETIME           NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  UNIQUE KEY uq_inscriptions_email (email),
  KEY idx_inscriptions_set_pref (set_pref),
  KEY idx_inscriptions_niveau (niveau)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Quelques inscriptions de test pour verifier que tout marche
INSERT INTO inscriptions (pseudo, email, set_pref, niveau, message) VALUES
  ('Matteo-CB',  'kutxyt@example.com',   'KS', 'competitif',    'Hate du set SS, vivement.'),
  ('Daiki0',  'daiki@example.com',    'AK', 'intermediaire', 'Le simulateur est top.'),
  ('Konoha7', 'konoha7@example.com',  'KS', 'debutant',      NULL);

-- 4. Verification : doit afficher 3 lignes
SELECT id, pseudo, email, set_pref, niveau, cree_le
FROM inscriptions
ORDER BY cree_le DESC;

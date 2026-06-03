/*
=============================================================
Initialisation des Schémas (Architecture Medallion)
=============================================================
Objectif du script :
    Ce script crée les trois schémas 'bronze', 'silver', et 'gold' 
    dans la base de données actuelle.
    
Note sur l'infrastructure (Docker) :
    La création et la suppression de la base de données entière 
    (DataWarehouse) sont désormais gérées par docker-compose.
    Pour réinitialiser complètement la base, utilisez le terminal :
    docker-compose down -v
=============================================================
*/

-- Création de la couche d'ingestion brute
CREATE SCHEMA IF NOT EXISTS bronze;

-- Création de la couche de données nettoyées et filtrées
CREATE SCHEMA IF NOT EXISTS silver;

-- Création de la couche métier (prête pour l'analytique et l'API)
CREATE SCHEMA IF NOT EXISTS gold;
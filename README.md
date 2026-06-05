# sql-data-warehouse-project
Building a dataWarehouse project using postgreSQL
# Data Warehouse Project - Architecture Medallion (PostgreSQL)

## 📌 Description du Projet
Ce projet est la construction d'un Data Warehouse moderne en suivant l'architecture Medallion (Bronze, Silver, Gold). 
Initialement basé sur un tutoriel utilisant Microsoft SQL Server et SSMS, ce projet a été entièrement **refactorisé et modernisé** pour utiliser une stack Open Source et conteneurisée, reflétant les standards actuels de l'ingénierie des données.

## 🛠️ Stack Technique
* **Base de données :** PostgreSQL 16
* **Interface de gestion :** pgAdmin 4
* **ETL / Pipeline :** Python 3.11 (psycopg2)
* **Infrastructure :** Docker & Docker Compose (Multi-conteneurs)
* **Contrôle de version :** Git / GitHub

## 🏗️ Architecture Docker
Le projet s'exécute dans un réseau virtuel isolé (`data_network`) composé de 3 conteneurs :
1. `postgres_db` : Le moteur de base de données.
2. `pgadmin_gui` : L'interface web (accessible sur le port 5050).
3. `etl_pipeline` : L'environnement Python isolé pour exécuter les scripts d'ingestion avec un montage de volume en temps réel pour le développement.

## 🚀 Avancement du Projet

- [x] **Infrastructure as Code** : Création du `docker-compose.yml` et du `Dockerfile` Python.
- [x] **Initialisation (DDL)** : 
  - Remplacement des requêtes propriétaires T-SQL par du SQL Standard.
  - Création des schémas `bronze`, `silver`, `gold`.
  - Création des tables brutes de la couche Bronze.
- [x] **Ingestion des données (Bronze Layer)** : 
  - Remplacement de la procédure stockée `BULK INSERT` par un script Python robuste.
  - Utilisation de la méthode optimisée `COPY` de `psycopg2` pour charger massivement les fichiers CSV locaux vers la base PostgreSQL dans Docker.

## 💻 Comment exécuter le projet en local ?

**1. Démarrer l'infrastructure :**
```bash
docker-compose up -d --build
# Data Warehouse Project - Architecture Medallion (PostgreSQL)

## 📌 Description du Projet
Ce projet consiste à concevoir et implémenter un Data Warehouse moderne en suivant l'architecture Medallion (Bronze, Silver, Gold). 
Initialement basé sur un environnement propriétaire Microsoft SQL Server (T-SQL / SSMS), ce projet a été entièrement **refactorisé et modernisé** pour s'appuyer sur une stack Open Source, conteneurisée et découplée, correspondant aux standards actuels de l'ingénierie des données.

## 🛠️ Stack Technique
* **Base de données :** PostgreSQL 16
* **Interface de gestion :** pgAdmin 4
* **Orchestration & ETL :** Python 3.11 (psycopg2)
* **Infrastructure :** Docker & Docker Compose (Multi-conteneurs)
* **Contrôle de version :** Git / GitHub

## 🏗️ Architecture Docker & Réseau
Le projet s'exécute dans un réseau virtuel privé et isolé (`data_network`) composé de 3 conteneurs spécialisés :
1. `postgres_db` : Le moteur de base de données relationnel.
2. `pgadmin_gui` : L'interface web d'administration de la base (port 5050).
3. `etl_pipeline` : L'environnement Python isolé pour l'exécution des scripts de traitement, doté d'un montage de volume en temps réel pour le développement.

---

## 🚀 Avancement du Projet

### 📥 1. Couche Bronze (Ingestion Brute)
* **Objectif** : Stocker une copie conforme et brute des fichiers sources (fichiers CSV locaux).
* **Implémentation** : 
  - Remplacement des procédures de suppression/création propriétaires T-SQL par du SQL Standard (ANSI).
  - Remplacement de la procédure stockée `BULK INSERT` par un pipeline Python robuste.
  - Utilisation de la méthode native et hautement optimisée `COPY` (`copy_expert` de `psycopg2`) pour charger massivement les fichiers sans saturer la mémoire.

### 🧹 2. Couche Silver (Nettoyage & Transformation)
* **Objectif** : Transformer les données brutes de la couche Bronze en données propres, typées, dédupliquées et prêtes pour l'analyse.
* **Philosophie Modern-ELT** : Découplage total entre l'**orchestration** (gérée par Python) et la **computation** (gérée par PostgreSQL).
* **Transformations clés implémentées** :
  - **Déduplication** : Utilisation de fenêtrages SQL (`ROW_NUMBER() OVER (PARTITION BY ... ORDER BY ...)`) pour ne conserver que la version la plus récente.
  - **Normalisation** : Uniformisation des formats de chaînes textuelles (`TRIM`, standardisation via des blocs `CASE WHEN`).
  - **Gestion des dates** : Conversion des formats `YYYYMMDD` en vrais types temporels SQL (`TO_DATE`), et calcul dynamique des fins de validité (`LEAD`).
  - **Qualité des données** : Nettoyage des valeurs aberrantes et traitement des valeurs manquantes (`COALESCE`, `NULLIF`).

### 🌟 3. Couche Gold (Modélisation Métier & Analytique)
* **Objectif** : Fournir des données prêtes à être consommées par des outils de Business Intelligence (PowerBI, Tableau) via un modèle en **Schéma en Étoile** (Star Schema).
* **Implémentation** :
  - Utilisation de **Vues SQL (`VIEW`)** pour structurer la couche analytique sans dupliquer physiquement les données, garantissant des requêtes en temps réel sur la couche Silver.
  - **Tables de Dimensions (`dim_`)** : Création de `dim_customers` et `dim_products` avec génération de **Clés de Substitution (Surrogate Keys)** via `ROW_NUMBER()`. Gestion des conflits de sources de données (ex: consolidation du genre client entre le CRM et l'ERP via `COALESCE`).
  - **Table de Faits (`fact_`)** : Création de `fact_sales` agrégeant les métriques clés (ventes, quantités, prix) et connectée aux dimensions via les Surrogate Keys.

---

## 💻 Comment exécuter le projet en local ?

**1. Démarrer l'infrastructure conteneurisée :**
```bash
docker-compose up -d
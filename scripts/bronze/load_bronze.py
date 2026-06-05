import psycopg2
import time
import os

# ==============================================================================
# Script Python : Chargement de la Couche Bronze
# Objectif : Vider les tables et utiliser la commande COPY (équivalent de BULK INSERT)
#            pour charger les CSV locaux vers la base PostgreSQL dans Docker.
# ==============================================================================

# Paramètres de connexion à la base de données Docker
DB_PARAMS = {
    "host": "postgres_db", 
    "port": "5432",
    "dbname": "bid_project_db",
    "user": "admin",
    "password": "mysecretpassword"
}

# Dictionnaire de configuration : { "nom_table": "chemin_relatif_du_csv" }
# IMPORTANT : Adaptez les chemins vers vos fichiers CSV !
TABLES_TO_LOAD = {
    # Tables CRM
    "bronze.crm_cust_info": "datasets/source_crm/cust_info.csv",
    "bronze.crm_prd_info": "datasets/source_crm/prd_info.csv",
    "bronze.crm_sales_details": "datasets/source_crm/sales_details.csv",
    
    # Tables ERP
    "bronze.erp_loc_a101": "datasets/source_erp/LOC_A101.csv",
    "bronze.erp_cust_az12": "datasets/source_erp/CUST_AZ12.csv",
    "bronze.erp_px_cat_g1v2": "datasets/source_erp/PX_CAT_G1V2.csv"
}

def load_bronze_layer():
    total_start_time = time.time()
    print("================================================")
    print("Loading Bronze Layer")
    print("================================================\n")

    try:
        # 1. Connexion à la base
        conn = psycopg2.connect(**DB_PARAMS)
        cur = conn.cursor()

        # 2. Boucle sur chaque table à charger
        for table_name, csv_path in TABLES_TO_LOAD.items():
            # Vérifier si le fichier CSV existe en local
            if not os.path.exists(csv_path):
                print(f"[ERREUR] Fichier introuvable : {csv_path}")
                continue

            print(f"------------------------------------------------")
            print(f"Traitement de : {table_name}")
            start_time = time.time()

            # Étape A : Vider la table (TRUNCATE)
            print(f">> Truncating Table: {table_name}")
            cur.execute(f"TRUNCATE TABLE {table_name};")

            # Étape B : Bulk Insert (COPY)
            print(f">> Inserting Data Into: {table_name} (depuis {csv_path})")
            
            # La magie est ici : copy_expert ouvre le fichier local et le "stream" vers Postgres
            with open(csv_path, 'r', encoding='utf-8') as f:
                # copy_expert est la méthode optimisée pour l'ingestion massive
                sql_copy = f"COPY {table_name} FROM STDIN WITH CSV HEADER DELIMITER ',';"
                cur.copy_expert(sql=sql_copy, file=f)

            # Étape C : Mesure du temps
            end_time = time.time()
            duration = end_time - start_time
            print(f">> Load Duration: {duration:.2f} seconds")
        
        # 3. Valider toutes les transactions (Commit)
        conn.commit()

        total_end_time = time.time()
        print("\n==========================================")
        print("Loading Bronze Layer is Completed")
        print(f"   - Total Load Duration: {total_end_time - total_start_time:.2f} seconds")
        print("==========================================")

    except Exception as e:
        print("\n==========================================")
        print("ERROR OCCURRED DURING LOADING BRONZE LAYER")
        print(f"Message d'erreur : {e}")
        # En cas d'erreur, on annule tout (Rollback)
        if 'conn' in locals():
            conn.rollback()
        print("==========================================")

    finally:
        # 4. Toujours fermer la connexion
        if 'cur' in locals(): cur.close()
        if 'conn' in locals(): conn.close()

# Point d'entrée du script
if __name__ == "__main__":
    load_bronze_layer()
"""
=============================================================
Analytics Layer — Automation Script
=============================================================
Executes all SQL files in the analytics folder in numeric
order to create the full Analytics Layer on PostgreSQL.

Usage (inside Docker):
    docker-compose exec etl_pipeline python scripts/analytics/load_analytics.py

Database: bid_project_db
Schema created: analytics
=============================================================
"""

import os
import psycopg2


DB_PARAMS = {
    "host": "postgres_db",
    "port": "5432",
    "dbname": "bid_project_db",
    "user": "admin",
    "password": "mysecretpassword"
}


def get_sql_files(sql_directory: str) -> list[str]:
    """
    Return all SQL files from the analytics directory,
    sorted by filename to preserve execution order.
    Excludes non-SQL files such as README.md and Python scripts.
    """
    return sorted(
        file_name
        for file_name in os.listdir(sql_directory)
        if file_name.endswith(".sql")
    )


def execute_sql_file(cursor, file_path: str) -> None:
    """
    Read and execute a single SQL file using the given cursor.
    """
    with open(file_path, "r", encoding="utf-8") as sql_file:
        sql_script = sql_file.read()

    cursor.execute(sql_script)


def main() -> None:
    print("=" * 60)
    print("🚀 Starting Analytics Layer Creation")
    print("=" * 60)

    # Detect the directory where this script lives (scripts/analytics/)
    current_dir = os.path.dirname(os.path.abspath(__file__))
    sql_files = get_sql_files(current_dir)

    if not sql_files:
        print("❌ No SQL files found in analytics directory.")
        return

    print("\n📂 SQL directory detected:")
    print(current_dir)

    connection = None

    try:
        print("\n🔌 Connecting to PostgreSQL...")
        connection = psycopg2.connect(**DB_PARAMS)
        cursor = connection.cursor()
        print("✅ Connection established successfully.")

        for sql_file in sql_files:
            file_path = os.path.join(current_dir, sql_file)

            print(f"\n▶️  Executing: {sql_file}")

            try:
                execute_sql_file(cursor, file_path)
                connection.commit()
                print(f"✅ Success: {sql_file}")

            except Exception as file_error:
                connection.rollback()
                print(f"❌ Failed while executing: {sql_file}")
                print(f"   Error: {file_error}")
                raise

        print("\n" + "=" * 60)
        print("✅ Analytics Layer created successfully.")
        print("=" * 60)

    except Exception as error:
        print("\n" + "=" * 60)
        print("❌ Analytics Layer creation failed.")
        print("=" * 60)
        print(f"Error: {error}")

    finally:
        if connection is not None:
            cursor.close()
            connection.close()
            print("\n🔒 PostgreSQL connection closed.")


if __name__ == "__main__":
    main()

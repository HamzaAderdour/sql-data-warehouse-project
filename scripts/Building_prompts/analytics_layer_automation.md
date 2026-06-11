# Analytics Layer Automation — Implementation Instructions

## Objective

Automate the execution of the Analytics Layer SQL scripts using a Python script.

Currently, the Analytics Layer SQL files are executed manually in pgAdmin.
The objective is to create a clean and professional automation script that executes all SQL files in the correct order.

---

## Current Analytics Structure

The project currently contains:

```text
Sales_Intelligence_Platform/
│
└── scripts/
    └── analytics/
        ├── 01_create_analytics_schema.sql
        ├── 02_kpi_overview.sql
        ├── 03_sales_trend.sql
        ├── 04_country_performance.sql
        ├── 05_margin_analysis.sql
        ├── 06_product_pareto.sql
        ├── 07_customer_retention.sql
        ├── 08_customer_rfm.sql
        ├── 09_customer_profile.sql
        ├── 10_business_insights.sql
        └── README.md
```

---

## Required Change

Create one new Python script inside the same folder:

```text
scripts/analytics/load_analytics.py
```

Final structure:

```text
Sales_Intelligence_Platform/
│
└── scripts/
    └── analytics/
        ├── 01_create_analytics_schema.sql
        ├── 02_kpi_overview.sql
        ├── 03_sales_trend.sql
        ├── 04_country_performance.sql
        ├── 05_margin_analysis.sql
        ├── 06_product_pareto.sql
        ├── 07_customer_retention.sql
        ├── 08_customer_rfm.sql
        ├── 09_customer_profile.sql
        ├── 10_business_insights.sql
        ├── load_analytics.py
        └── README.md
```

---

## Important Rules

Do not modify existing SQL files.

Do not modify Bronze, Silver, Gold, Tests, or Business Analysis folders.

Only create:

```text
scripts/analytics/load_analytics.py
```

Optionally update:

```text
scripts/analytics/README.md
```

to document how to run the automation script.

---

## Database Connection Parameters

Use the following PostgreSQL connection parameters:

```python
DB_PARAMS = {
    "host": "postgres_db",
    "port": "5432",
    "dbname": "bid_project_db",
    "user": "admin",
    "password": "mysecretpassword"
}
```

---

## Script Requirements

The script `load_analytics.py` must:

1. Connect to PostgreSQL using `psycopg2`.
2. Locate the current folder where the script is stored.
3. Find all `.sql` files in `scripts/analytics/`.
4. Exclude non-SQL files such as `README.md` and Python files.
5. Sort SQL files alphabetically so numeric prefixes are respected.
6. Execute files in this order:

```text
01_create_analytics_schema.sql
02_kpi_overview.sql
03_sales_trend.sql
04_country_performance.sql
05_margin_analysis.sql
06_product_pareto.sql
07_customer_retention.sql
08_customer_rfm.sql
09_customer_profile.sql
10_business_insights.sql
```

7. Print clear logs before and after each file execution.
8. Commit after successful execution.
9. Roll back and display the error if any SQL file fails.
10. Close the database connection properly.
11. Be executable from inside the Docker container.

---

## Expected Command

The script must be runnable with:

```bash
docker-compose exec etl_pipeline python scripts/analytics/load_analytics.py
```

---

## Expected Console Output Example

```text
============================================================
🚀 Starting Analytics Layer Creation
============================================================

🔌 Connecting to PostgreSQL...
✅ Connection established successfully.

📂 SQL directory detected:
scripts/analytics

▶️ Executing: 01_create_analytics_schema.sql
✅ Success: 01_create_analytics_schema.sql

▶️ Executing: 02_kpi_overview.sql
✅ Success: 02_kpi_overview.sql

▶️ Executing: 03_sales_trend.sql
✅ Success: 03_sales_trend.sql

▶️ Executing: 04_country_performance.sql
✅ Success: 04_country_performance.sql

▶️ Executing: 05_margin_analysis.sql
✅ Success: 05_margin_analysis.sql

▶️ Executing: 06_product_pareto.sql
✅ Success: 06_product_pareto.sql

▶️ Executing: 07_customer_retention.sql
✅ Success: 07_customer_retention.sql

▶️ Executing: 08_customer_rfm.sql
✅ Success: 08_customer_rfm.sql

▶️ Executing: 09_customer_profile.sql
✅ Success: 09_customer_profile.sql

▶️ Executing: 10_business_insights.sql
✅ Success: 10_business_insights.sql

============================================================
✅ Analytics Layer created successfully.
============================================================
```

---

## Recommended Python Implementation

Create `scripts/analytics/load_analytics.py` with this code:

```python
import os
import psycopg2
from psycopg2 import sql


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
    """
    return sorted(
        file_name
        for file_name in os.listdir(sql_directory)
        if file_name.endswith(".sql")
    )


def execute_sql_file(cursor, file_path: str) -> None:
    """
    Read and execute a SQL file.
    """
    with open(file_path, "r", encoding="utf-8") as sql_file:
        sql_script = sql_file.read()

    cursor.execute(sql_script)


def main() -> None:
    print("=" * 60)
    print("🚀 Starting Analytics Layer Creation")
    print("=" * 60)

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

            print(f"\n▶️ Executing: {sql_file}")

            try:
                execute_sql_file(cursor, file_path)
                connection.commit()
                print(f"✅ Success: {sql_file}")

            except Exception as file_error:
                connection.rollback()
                print(f"❌ Failed while executing: {sql_file}")
                print(f"Error: {file_error}")
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
```

---

## README Update

Update `scripts/analytics/README.md` by adding this section:

````md
---

## Automation

The Analytics Layer can be created automatically using the Python script:

```bash
docker-compose exec etl_pipeline python scripts/analytics/load_analytics.py
````

This script:

* Connects to PostgreSQL.
* Detects all SQL files in the analytics folder.
* Executes them in numerical order.
* Commits each file after successful execution.
* Rolls back the transaction if an error occurs.
* Prints execution logs for traceability.

The execution order is controlled by the numeric prefixes of the SQL files.

````

---

## Final Expected Result

After implementation, the folder must contain:

```text
scripts/analytics/
├── 01_create_analytics_schema.sql
├── 02_kpi_overview.sql
├── 03_sales_trend.sql
├── 04_country_performance.sql
├── 05_margin_analysis.sql
├── 06_product_pareto.sql
├── 07_customer_retention.sql
├── 08_customer_rfm.sql
├── 09_customer_profile.sql
├── 10_business_insights.sql
├── load_analytics.py
└── README.md
````

The project will then support an automated pipeline:

```text
Bronze → Silver → Gold → Analytics
```

without manually executing each SQL file in pgAdmin.

"""
=============================================================
Sales Intelligence Platform — Database Connection Module
=============================================================
Provides PostgreSQL connection helpers for the FastAPI backend.
All queries use RealDictCursor to return rows as dictionaries.
=============================================================
"""

import psycopg2
from psycopg2.extras import RealDictCursor


DB_PARAMS = {
    "host": "postgres_db",
    "port": "5432",
    "dbname": "bid_project_db",
    "user": "admin",
    "password": "mysecretpassword"
}


def get_connection():
    """
    Create and return a new PostgreSQL database connection.
    The host 'postgres_db' refers to the Docker service name.
    """
    return psycopg2.connect(**DB_PARAMS)


def fetch_all(query: str):
    """
    Execute a SELECT query and return all rows as a list of dictionaries.
    Opens and closes a fresh connection for every call.
    """
    connection = None

    try:
        connection = get_connection()

        with connection.cursor(cursor_factory=RealDictCursor) as cursor:
            cursor.execute(query)
            results = cursor.fetchall()
            return [dict(row) for row in results]

    finally:
        if connection is not None:
            connection.close()


def fetch_one(query: str):
    """
    Execute a SELECT query and return a single row as a dictionary.
    Returns an empty dict if no row is found.
    """
    connection = None

    try:
        connection = get_connection()

        with connection.cursor(cursor_factory=RealDictCursor) as cursor:
            cursor.execute(query)
            result = cursor.fetchone()
            return dict(result) if result else {}

    finally:
        if connection is not None:
            connection.close()

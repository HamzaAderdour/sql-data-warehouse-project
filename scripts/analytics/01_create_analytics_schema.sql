-- =============================================================
-- Analytics Layer
-- File: 01_create_analytics_schema.sql
-- Purpose: Create the PostgreSQL schema dedicated to analytical business views
-- Depends on: Gold Layer (gold.fact_sales, gold.dim_customers, gold.dim_products)
-- =============================================================

CREATE SCHEMA IF NOT EXISTS analytics;

-- =============================================================
-- Analytics Layer
-- File: 02_kpi_overview.sql
-- Purpose: Global KPI view used by the Executive Overview dashboard
-- View: analytics.kpi_overview
-- Depends on: gold.fact_sales
-- =============================================================

CREATE OR REPLACE VIEW analytics.kpi_overview AS
SELECT
    SUM(sales_amount) AS total_revenue,
    COUNT(DISTINCT order_number) AS total_orders,
    COUNT(DISTINCT customer_key) AS total_customers,
    COUNT(DISTINCT product_key) AS sold_products,
    SUM(quantity) AS total_quantity,
    ROUND(SUM(sales_amount)::numeric / NULLIF(COUNT(DISTINCT order_number), 0), 2) AS average_order_value,
    ROUND(SUM(sales_amount)::numeric / NULLIF(COUNT(DISTINCT customer_key), 0), 2) AS revenue_per_customer,
    MIN(order_date) AS first_order_date,
    MAX(order_date) AS last_order_date
FROM gold.fact_sales
WHERE order_date IS NOT NULL;

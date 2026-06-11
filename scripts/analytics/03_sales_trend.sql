-- =============================================================
-- Analytics Layer
-- File: 03_sales_trend.sql
-- Purpose: Monthly sales trend view for revenue, orders and quantity analysis
-- View: analytics.sales_trend
-- Depends on: gold.fact_sales
-- =============================================================

CREATE OR REPLACE VIEW analytics.sales_trend AS
SELECT
    DATE_TRUNC('month', order_date)::date AS sales_month,
    EXTRACT(YEAR FROM order_date)::int AS sales_year,
    EXTRACT(MONTH FROM order_date)::int AS month_number,
    SUM(sales_amount) AS revenue,
    COUNT(DISTINCT order_number) AS orders,
    SUM(quantity) AS quantity_sold,
    ROUND(SUM(sales_amount)::numeric / NULLIF(COUNT(DISTINCT order_number), 0), 2) AS average_order_value
FROM gold.fact_sales
WHERE order_date IS NOT NULL
GROUP BY
    DATE_TRUNC('month', order_date),
    EXTRACT(YEAR FROM order_date),
    EXTRACT(MONTH FROM order_date)
ORDER BY sales_month;

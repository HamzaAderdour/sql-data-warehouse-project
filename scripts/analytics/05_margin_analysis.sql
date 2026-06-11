-- =============================================================
-- Analytics Layer
-- File: 05_margin_analysis.sql
-- Purpose: Profitability view by category and subcategory
-- View: analytics.margin_analysis
-- Depends on: gold.fact_sales, gold.dim_products
-- =============================================================

CREATE OR REPLACE VIEW analytics.margin_analysis AS
SELECT
    p.category,
    p.subcategory,
    SUM(f.sales_amount) AS revenue,
    SUM(f.quantity * p.cost) AS estimated_cost,
    SUM(f.sales_amount) - SUM(f.quantity * p.cost) AS estimated_margin,
    ROUND(
        (SUM(f.sales_amount) - SUM(f.quantity * p.cost))::numeric
        / NULLIF(SUM(f.sales_amount), 0) * 100,
        2
    ) AS margin_percentage,
    SUM(f.quantity) AS quantity_sold,
    COUNT(DISTINCT f.order_number) AS orders
FROM gold.fact_sales f
JOIN gold.dim_products p
    ON f.product_key = p.product_key
GROUP BY
    p.category,
    p.subcategory
ORDER BY estimated_margin DESC;

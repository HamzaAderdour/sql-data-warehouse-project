-- =============================================================
-- Analytics Layer
-- File: 06_product_pareto.sql
-- Purpose: Product concentration and Pareto analysis view
-- View: analytics.product_pareto
-- Depends on: gold.fact_sales, gold.dim_products
-- =============================================================

CREATE OR REPLACE VIEW analytics.product_pareto AS
WITH product_revenue AS (
    SELECT
        p.product_key,
        p.product_name,
        p.category,
        p.subcategory,
        SUM(f.sales_amount) AS revenue,
        SUM(f.quantity) AS quantity_sold,
        COUNT(DISTINCT f.order_number) AS orders
    FROM gold.fact_sales f
    JOIN gold.dim_products p
        ON f.product_key = p.product_key
    GROUP BY
        p.product_key,
        p.product_name,
        p.category,
        p.subcategory
),
ranked_products AS (
    SELECT
        product_key,
        product_name,
        category,
        subcategory,
        revenue,
        quantity_sold,
        orders,
        SUM(revenue) OVER () AS total_revenue,
        SUM(revenue) OVER (
            ORDER BY revenue DESC
            ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
        ) AS cumulative_revenue,
        ROW_NUMBER() OVER (ORDER BY revenue DESC) AS product_rank
    FROM product_revenue
)
SELECT
    product_rank,
    product_key,
    product_name,
    category,
    subcategory,
    revenue,
    quantity_sold,
    orders,
    ROUND(revenue::numeric / NULLIF(total_revenue, 0) * 100, 2) AS revenue_percentage,
    ROUND(cumulative_revenue::numeric / NULLIF(total_revenue, 0) * 100, 2) AS cumulative_revenue_percentage
FROM ranked_products
ORDER BY product_rank;

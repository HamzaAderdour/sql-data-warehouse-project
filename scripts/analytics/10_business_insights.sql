-- =============================================================
-- Analytics Layer
-- File: 10_business_insights.sql
-- Purpose: Strategic summary view containing the most important business insights
-- View: analytics.business_insights
-- Depends on: gold.fact_sales, gold.dim_customers, gold.dim_products
-- =============================================================

CREATE OR REPLACE VIEW analytics.business_insights AS
WITH total_revenue AS (
    SELECT SUM(sales_amount) AS revenue
    FROM gold.fact_sales
),
bikes_revenue AS (
    SELECT SUM(f.sales_amount) AS revenue
    FROM gold.fact_sales f
    JOIN gold.dim_products p
        ON f.product_key = p.product_key
    WHERE p.category = 'Bikes'
),
best_country AS (
    SELECT
        c.country,
        SUM(f.sales_amount) AS revenue,
        COUNT(DISTINCT c.customer_key) AS customers,
        ROUND(SUM(f.sales_amount)::numeric / NULLIF(COUNT(DISTINCT c.customer_key), 0), 2) AS revenue_per_customer
    FROM gold.fact_sales f
    JOIN gold.dim_customers c
        ON f.customer_key = c.customer_key
    GROUP BY c.country
    ORDER BY revenue_per_customer DESC
    LIMIT 1
),
best_margin_category AS (
    SELECT
        p.category,
        SUM(f.sales_amount) AS revenue,
        SUM(f.quantity * p.cost) AS estimated_cost,
        SUM(f.sales_amount) - SUM(f.quantity * p.cost) AS estimated_margin,
        ROUND(
            (SUM(f.sales_amount) - SUM(f.quantity * p.cost))::numeric
            / NULLIF(SUM(f.sales_amount), 0) * 100,
            2
        ) AS margin_percentage
    FROM gold.fact_sales f
    JOIN gold.dim_products p
        ON f.product_key = p.product_key
    GROUP BY p.category
    ORDER BY margin_percentage DESC
    LIMIT 1
),
customer_frequency AS (
    SELECT
        customer_key,
        COUNT(DISTINCT order_number) AS frequency
    FROM gold.fact_sales
    GROUP BY customer_key
),
retention AS (
    SELECT
        COUNT(*) AS total_customers,
        COUNT(*) FILTER (WHERE frequency = 1) AS one_time_customers,
        COUNT(*) FILTER (WHERE frequency <= 2) AS low_frequency_customers
    FROM customer_frequency
),
growth_year AS (
    SELECT
        EXTRACT(YEAR FROM order_date)::int AS sales_year,
        SUM(sales_amount) AS revenue
    FROM gold.fact_sales
    WHERE order_date IS NOT NULL
    GROUP BY EXTRACT(YEAR FROM order_date)
    ORDER BY revenue DESC
    LIMIT 1
)
SELECT
    tr.revenue AS total_revenue,
    ROUND(br.revenue::numeric / NULLIF(tr.revenue, 0) * 100, 2) AS bikes_revenue_percentage,
    bc.country AS best_country,
    bc.revenue_per_customer AS best_country_revenue_per_customer,
    bmc.category AS highest_margin_category,
    bmc.margin_percentage AS highest_margin_percentage,
    r.one_time_customers,
    ROUND(r.one_time_customers::numeric / NULLIF(r.total_customers, 0) * 100, 2) AS one_time_customers_percentage,
    r.low_frequency_customers,
    ROUND(r.low_frequency_customers::numeric / NULLIF(r.total_customers, 0) * 100, 2) AS low_frequency_customers_percentage,
    gy.sales_year AS best_revenue_year,
    gy.revenue AS best_year_revenue
FROM total_revenue tr
CROSS JOIN bikes_revenue br
CROSS JOIN best_country bc
CROSS JOIN best_margin_category bmc
CROSS JOIN retention r
CROSS JOIN growth_year gy;

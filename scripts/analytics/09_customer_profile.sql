-- =============================================================
-- Analytics Layer
-- File: 09_customer_profile.sql
-- Purpose: Demographic customer profile view by gender, marital status and age group
-- View: analytics.customer_profile
-- Depends on: gold.dim_customers, gold.fact_sales
-- =============================================================

CREATE OR REPLACE VIEW analytics.customer_profile AS
SELECT
    c.gender,
    c.marital_status,
    CASE
        WHEN c.birthdate IS NULL THEN 'Unknown'
        WHEN EXTRACT(YEAR FROM AGE(c.birthdate)) < 25 THEN 'Under 25'
        WHEN EXTRACT(YEAR FROM AGE(c.birthdate)) BETWEEN 25 AND 34 THEN '25-34'
        WHEN EXTRACT(YEAR FROM AGE(c.birthdate)) BETWEEN 35 AND 44 THEN '35-44'
        WHEN EXTRACT(YEAR FROM AGE(c.birthdate)) BETWEEN 45 AND 54 THEN '45-54'
        WHEN EXTRACT(YEAR FROM AGE(c.birthdate)) >= 55 THEN '55+'
        ELSE 'Unknown'
    END AS age_group,
    COUNT(DISTINCT c.customer_key) AS customers,
    COUNT(DISTINCT f.order_number) AS orders,
    SUM(f.sales_amount) AS revenue,
    ROUND(SUM(f.sales_amount)::numeric / NULLIF(COUNT(DISTINCT c.customer_key), 0), 2) AS revenue_per_customer
FROM gold.dim_customers c
LEFT JOIN gold.fact_sales f
    ON c.customer_key = f.customer_key
GROUP BY
    c.gender,
    c.marital_status,
    age_group
ORDER BY revenue DESC NULLS LAST;

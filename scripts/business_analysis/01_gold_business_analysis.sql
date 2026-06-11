    /* ============================================================
   DATA WAREHOUSE PROJECT - GOLD LAYER BUSINESS ANALYSIS
   Objectif :
   Ce script documente les analyses exploratoires réalisées sur
   la couche Gold afin d'identifier les axes de valeur métier :
   ventes, produits, clients, pays, marge et fidélisation.

   Auteur : Hamza ADERDOUR
   ============================================================ */


/* ============================================================
   1. Volume global des tables Gold
   Objectif :
   Vérifier la taille des tables analytiques et confirmer que
   les dimensions et la table de faits contiennent bien des données.
   ============================================================ */

SELECT 'dim_customers' AS table_name, COUNT(*) AS rows_count
FROM gold.dim_customers

UNION ALL

SELECT 'dim_products' AS table_name, COUNT(*) AS rows_count
FROM gold.dim_products

UNION ALL

SELECT 'fact_sales' AS table_name, COUNT(*) AS rows_count
FROM gold.fact_sales;


/* ============================================================
   2. Période couverte par les ventes
   Objectif :
   Identifier l'horizon temporel disponible pour les analyses
   de tendance et de croissance commerciale.
   ============================================================ */

SELECT
    MIN(order_date) AS first_order_date,
    MAX(order_date) AS last_order_date,
    COUNT(DISTINCT order_number) AS total_orders,
    COUNT(DISTINCT customer_key) AS active_customers,
    COUNT(DISTINCT product_key) AS sold_products
FROM gold.fact_sales;


/* ============================================================
   3. Contrôle d'intégrité entre faits et dimensions
   Objectif :
   Vérifier que chaque vente est bien reliée à un client et
   à un produit. Cela garantit la fiabilité du modèle en étoile.
   ============================================================ */

SELECT
    COUNT(*) AS total_sales_rows,
    COUNT(c.customer_key) AS matched_customers,
    COUNT(p.product_key) AS matched_products,
    COUNT(*) - COUNT(c.customer_key) AS missing_customers,
    COUNT(*) - COUNT(p.product_key) AS missing_products
FROM gold.fact_sales f
LEFT JOIN gold.dim_customers c
    ON f.customer_key = c.customer_key
LEFT JOIN gold.dim_products p
    ON f.product_key = p.product_key;


/* ============================================================
   4. Indicateurs globaux des ventes
   Objectif :
   Calculer les premiers KPIs commerciaux :
   chiffre d'affaires, quantité vendue, panier moyen et prix moyen.
   ============================================================ */

SELECT
    SUM(sales_amount) AS total_revenue,
    SUM(quantity) AS total_quantity,
    COUNT(DISTINCT order_number) AS total_orders,
    ROUND(SUM(sales_amount)::numeric / COUNT(DISTINCT order_number), 2) AS average_order_value,
    ROUND(AVG(price), 2) AS average_unit_price,
    MIN(sales_amount) AS min_sales_amount,
    MAX(sales_amount) AS max_sales_amount
FROM gold.fact_sales;


/* ============================================================
   5. Évolution annuelle du chiffre d'affaires
   Objectif :
   Identifier les années de croissance ou de baisse afin de
   comprendre la dynamique commerciale globale.
   ============================================================ */

SELECT
    EXTRACT(YEAR FROM order_date) AS sales_year,
    SUM(sales_amount) AS revenue,
    COUNT(DISTINCT order_number) AS orders,
    SUM(quantity) AS quantity_sold
FROM gold.fact_sales
WHERE order_date IS NOT NULL
GROUP BY EXTRACT(YEAR FROM order_date)
ORDER BY sales_year;


/* ============================================================
   6. Évolution mensuelle du chiffre d'affaires
   Objectif :
   Préparer l'analyse de tendance mensuelle qui sera utilisée
   dans le dashboard exécutif.
   ============================================================ */

SELECT
    DATE_TRUNC('month', order_date)::date AS sales_month,
    SUM(sales_amount) AS revenue,
    COUNT(DISTINCT order_number) AS orders,
    SUM(quantity) AS quantity_sold
FROM gold.fact_sales
WHERE order_date IS NOT NULL
GROUP BY DATE_TRUNC('month', order_date)
ORDER BY sales_month;


/* ============================================================
   7. Performance par catégorie et sous-catégorie
   Objectif :
   Identifier les familles de produits qui génèrent le plus de
   chiffre d'affaires et de marge estimée.
   ============================================================ */

SELECT
    p.category,
    p.subcategory,
    COUNT(DISTINCT f.order_number) AS orders,
    SUM(f.sales_amount) AS revenue,
    SUM(f.quantity) AS quantity_sold,
    SUM(f.quantity * p.cost) AS estimated_cost,
    SUM(f.sales_amount) - SUM(f.quantity * p.cost) AS estimated_margin
FROM gold.fact_sales f
JOIN gold.dim_products p
    ON f.product_key = p.product_key
GROUP BY
    p.category,
    p.subcategory
ORDER BY revenue DESC;


/* ============================================================
   8. Analyse de marge par catégorie
   Objectif :
   Comparer les catégories selon leur chiffre d'affaires et leur
   taux de marge. Cette analyse permet d'identifier les produits
   à forte rentabilité.
   ============================================================ */

SELECT
    p.category,
    SUM(f.sales_amount) AS revenue,
    SUM(f.quantity * p.cost) AS estimated_cost,
    SUM(f.sales_amount) - SUM(f.quantity * p.cost) AS estimated_margin,
    ROUND(
        (
            SUM(f.sales_amount) - SUM(f.quantity * p.cost)
        )::numeric / NULLIF(SUM(f.sales_amount), 0) * 100,
        2
    ) AS margin_percentage
FROM gold.fact_sales f
JOIN gold.dim_products p
    ON f.product_key = p.product_key
GROUP BY p.category
ORDER BY estimated_margin DESC;


/* ============================================================
   9. Top produits par chiffre d'affaires
   Objectif :
   Identifier les produits stars qui contribuent le plus au revenu.
   Ces produits seront utilisés dans l'analyse Pareto.
   ============================================================ */

SELECT
    p.product_name,
    p.category,
    p.subcategory,
    COUNT(DISTINCT f.order_number) AS orders,
    SUM(f.quantity) AS quantity_sold,
    SUM(f.sales_amount) AS revenue,
    SUM(f.sales_amount) - SUM(f.quantity * p.cost) AS estimated_margin
FROM gold.fact_sales f
JOIN gold.dim_products p
    ON f.product_key = p.product_key
GROUP BY
    p.product_name,
    p.category,
    p.subcategory
ORDER BY revenue DESC
LIMIT 20;


/* ============================================================
   10. Analyse Pareto des produits
   Objectif :
   Mesurer la concentration du chiffre d'affaires sur les produits.
   Cette analyse permet d'évaluer la dépendance de l'entreprise
   à un nombre limité de produits.
   ============================================================ */

WITH product_revenue AS (
    SELECT
        p.product_name,
        SUM(f.sales_amount) AS revenue
    FROM gold.fact_sales f
    JOIN gold.dim_products p
        ON f.product_key = p.product_key
    GROUP BY p.product_name
),
ranked_products AS (
    SELECT
        product_name,
        revenue,
        SUM(revenue) OVER () AS total_revenue,
        SUM(revenue) OVER (
            ORDER BY revenue DESC
            ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
        ) AS cumulative_revenue
    FROM product_revenue
)
SELECT
    product_name,
    revenue,
    ROUND(revenue::numeric / total_revenue * 100, 2) AS revenue_percentage,
    ROUND(cumulative_revenue::numeric / total_revenue * 100, 2) AS cumulative_revenue_percentage
FROM ranked_products
ORDER BY revenue DESC;


/* ============================================================
   11. Performance commerciale par pays
   Objectif :
   Identifier les marchés les plus importants en chiffre d'affaires,
   volume de clients et revenu moyen par client.
   ============================================================ */

SELECT
    c.country,
    COUNT(DISTINCT c.customer_key) AS customers,
    COUNT(DISTINCT f.order_number) AS orders,
    SUM(f.sales_amount) AS revenue,
    ROUND(
        SUM(f.sales_amount)::numeric / NULLIF(COUNT(DISTINCT c.customer_key), 0),
        2
    ) AS revenue_per_customer
FROM gold.fact_sales f
JOIN gold.dim_customers c
    ON f.customer_key = c.customer_key
GROUP BY c.country
ORDER BY revenue_per_customer DESC;


/* ============================================================
   12. Chiffre d'affaires par pays et catégorie
   Objectif :
   Comprendre quels types de produits performent dans chaque pays.
   Cette analyse permet d'adapter la stratégie commerciale par marché.
   ============================================================ */

SELECT
    c.country,
    p.category,
    SUM(f.sales_amount) AS revenue
FROM gold.fact_sales f
JOIN gold.dim_customers c
    ON f.customer_key = c.customer_key
JOIN gold.dim_products p
    ON f.product_key = p.product_key
GROUP BY
    c.country,
    p.category
ORDER BY
    c.country,
    revenue DESC;


/* ============================================================
   13. Analyse client par genre et statut marital
   Objectif :
   Identifier les segments démographiques les plus contributeurs
   au chiffre d'affaires.
   ============================================================ */

SELECT
    c.gender,
    c.marital_status,
    COUNT(DISTINCT c.customer_key) AS customers,
    COUNT(DISTINCT f.order_number) AS orders,
    SUM(f.sales_amount) AS revenue,
    ROUND(
        SUM(f.sales_amount)::numeric / NULLIF(COUNT(DISTINCT c.customer_key), 0),
        2
    ) AS revenue_per_customer
FROM gold.dim_customers c
LEFT JOIN gold.fact_sales f
    ON c.customer_key = f.customer_key
GROUP BY
    c.gender,
    c.marital_status
ORDER BY revenue DESC NULLS LAST;


/* ============================================================
   14. Analyse client par tranche d'âge
   Objectif :
   Identifier les groupes d'âge les plus importants pour orienter
   les actions marketing et commerciales.
   ============================================================ */

SELECT
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
    SUM(f.sales_amount) AS revenue
FROM gold.dim_customers c
LEFT JOIN gold.fact_sales f
    ON c.customer_key = f.customer_key
GROUP BY age_group
ORDER BY revenue DESC NULLS LAST;


/* ============================================================
   15. Année d'acquisition des clients
   Objectif :
   Mesurer la croissance de la base client en identifiant l'année
   de première commande de chaque client.
   ============================================================ */

WITH first_purchase AS (
    SELECT
        customer_key,
        MIN(order_date) AS first_order_date
    FROM gold.fact_sales
    WHERE order_date IS NOT NULL
    GROUP BY customer_key
)
SELECT
    EXTRACT(YEAR FROM first_order_date) AS acquisition_year,
    COUNT(*) AS new_customers
FROM first_purchase
GROUP BY EXTRACT(YEAR FROM first_order_date)
ORDER BY acquisition_year;


/* ============================================================
   16. Distribution du nombre de commandes par client
   Objectif :
   Évaluer la fidélisation client en mesurant combien de clients
   achètent une seule fois, deux fois ou plusieurs fois.
   ============================================================ */

SELECT
    frequency,
    COUNT(*) AS customers
FROM (
    SELECT
        customer_key,
        COUNT(DISTINCT order_number) AS frequency
    FROM gold.fact_sales
    GROUP BY customer_key
) t
GROUP BY frequency
ORDER BY frequency;


/* ============================================================
   17. Indicateurs de fidélisation client
   Objectif :
   Résumer la rétention client avec des KPIs simples :
   clients uniques, clients récurrents, clients à achat unique.
   ============================================================ */

WITH customer_frequency AS (
    SELECT
        customer_key,
        COUNT(DISTINCT order_number) AS frequency
    FROM gold.fact_sales
    GROUP BY customer_key
)
SELECT
    COUNT(*) AS total_customers,
    COUNT(*) FILTER (WHERE frequency = 1) AS one_time_customers,
    COUNT(*) FILTER (WHERE frequency > 1) AS repeat_customers,
    ROUND(
        COUNT(*) FILTER (WHERE frequency = 1)::numeric / COUNT(*) * 100,
        2
    ) AS one_time_customer_percentage,
    ROUND(
        COUNT(*) FILTER (WHERE frequency > 1)::numeric / COUNT(*) * 100,
        2
    ) AS repeat_customer_percentage
FROM customer_frequency;


/* ============================================================
   18. Analyse RFM brute
   Objectif :
   Préparer une segmentation client selon :
   - Recency : délai depuis la dernière commande
   - Frequency : nombre de commandes
   - Monetary : montant total dépensé

   Remarque :
   On utilise la date maximale des ventes comme date de référence,
   et non CURRENT_DATE, car le dataset couvre une période historique.
   ============================================================ */

WITH max_date AS (
    SELECT MAX(order_date) AS reference_date
    FROM gold.fact_sales
),
rfm AS (
    SELECT
        c.customer_key,
        c.customer_number,
        c.country,
        MAX(f.order_date) AS last_order_date,
        max_date.reference_date - MAX(f.order_date) AS recency_days,
        COUNT(DISTINCT f.order_number) AS frequency,
        SUM(f.sales_amount) AS monetary
    FROM gold.fact_sales f
    JOIN gold.dim_customers c
        ON f.customer_key = c.customer_key
    CROSS JOIN max_date
    GROUP BY
        c.customer_key,
        c.customer_number,
        c.country,
        max_date.reference_date
)
SELECT *
FROM rfm
ORDER BY monetary DESC
LIMIT 50;


/* ============================================================
   19. Segmentation RFM simple
   Objectif :
   Transformer les indicateurs RFM en segments métiers lisibles :
   VIP, Loyal Customer, Recent Customer, At Risk, Regular Customer.
   ============================================================ */

WITH max_date AS (
    SELECT MAX(order_date) AS reference_date
    FROM gold.fact_sales
),
rfm AS (
    SELECT
        c.customer_key,
        c.customer_number,
        c.country,
        max_date.reference_date - MAX(f.order_date) AS recency_days,
        COUNT(DISTINCT f.order_number) AS frequency,
        SUM(f.sales_amount) AS monetary
    FROM gold.fact_sales f
    JOIN gold.dim_customers c
        ON f.customer_key = c.customer_key
    CROSS JOIN max_date
    GROUP BY
        c.customer_key,
        c.customer_number,
        c.country,
        max_date.reference_date
),
segmented AS (
    SELECT
        *,
        CASE
            WHEN monetary >= 10000 AND frequency >= 4 THEN 'VIP Customer'
            WHEN frequency >= 3 THEN 'Loyal Customer'
            WHEN recency_days <= 90 THEN 'Recent Customer'
            WHEN recency_days > 365 THEN 'At Risk Customer'
            ELSE 'Regular Customer'
        END AS customer_segment
    FROM rfm
)
SELECT
    customer_segment,
    COUNT(*) AS customers,
    SUM(monetary) AS revenue,
    ROUND(AVG(monetary), 2) AS avg_monetary,
    ROUND(AVG(frequency), 2) AS avg_frequency,
    ROUND(AVG(recency_days), 2) AS avg_recency_days
FROM segmented
GROUP BY customer_segment
ORDER BY revenue DESC;


/* ============================================================
   20. Analyse logistique
   Objectif :
   Vérifier si les délais d'expédition apportent une information
   exploitable. Dans ce dataset, le délai est constant, ce qui rend
   cette analyse peu pertinente pour le dashboard final.
   ============================================================ */

SELECT
    ROUND(AVG(shipping_date - order_date), 2) AS avg_shipping_delay_days,
    MIN(shipping_date - order_date) AS min_shipping_delay_days,
    MAX(shipping_date - order_date) AS max_shipping_delay_days,
    COUNT(*) FILTER (WHERE shipping_date > due_date) AS late_orders,
    COUNT(*) AS total_rows
FROM gold.fact_sales
WHERE order_date IS NOT NULL
  AND shipping_date IS NOT NULL
  AND due_date IS NOT NULL;


/* ============================================================
   21. Qualité métier des données de vente
   Objectif :
   Identifier les valeurs invalides ou manquantes qui peuvent
   impacter les analyses décisionnelles.
   ============================================================ */

SELECT
    COUNT(*) FILTER (WHERE sales_amount IS NULL OR sales_amount <= 0) AS invalid_sales_amount,
    COUNT(*) FILTER (WHERE quantity IS NULL OR quantity <= 0) AS invalid_quantity,
    COUNT(*) FILTER (WHERE price IS NULL OR price <= 0) AS invalid_price,
    COUNT(*) FILTER (WHERE order_date IS NULL) AS missing_order_date,
    COUNT(*) FILTER (WHERE shipping_date IS NULL) AS missing_shipping_date,
    COUNT(*) FILTER (WHERE due_date IS NULL) AS missing_due_date
FROM gold.fact_sales;


/* ============================================================
   22. Synthèse automatique des insights business
   Objectif :
   Produire une synthèse directement exploitable dans le rapport
   et dans le futur dashboard.
   ============================================================ */

WITH revenue_total AS (
    SELECT SUM(sales_amount) AS total_revenue
    FROM gold.fact_sales
),
category_revenue AS (
    SELECT
        p.category,
        SUM(f.sales_amount) AS revenue
    FROM gold.fact_sales f
    JOIN gold.dim_products p
        ON f.product_key = p.product_key
    GROUP BY p.category
),
best_country AS (
    SELECT
        c.country,
        SUM(f.sales_amount) AS revenue,
        COUNT(DISTINCT c.customer_key) AS customers,
        ROUND(
            SUM(f.sales_amount)::numeric / COUNT(DISTINCT c.customer_key),
            2
        ) AS revenue_per_customer
    FROM gold.fact_sales f
    JOIN gold.dim_customers c
        ON f.customer_key = c.customer_key
    GROUP BY c.country
    ORDER BY revenue_per_customer DESC
    LIMIT 1
),
customer_frequency AS (
    SELECT
        customer_key,
        COUNT(DISTINCT order_number) AS frequency
    FROM gold.fact_sales
    GROUP BY customer_key
)
SELECT
    rt.total_revenue,
    ROUND(
        (SELECT revenue FROM category_revenue WHERE category = 'Bikes')::numeric
        / rt.total_revenue * 100,
        2
    ) AS bikes_revenue_percentage,
    bc.country AS best_country_by_revenue_per_customer,
    bc.revenue_per_customer,
    COUNT(*) FILTER (WHERE cf.frequency = 1) AS one_time_customers,
    ROUND(
        COUNT(*) FILTER (WHERE cf.frequency = 1)::numeric / COUNT(*) * 100,
        2
    ) AS one_time_customers_percentage
FROM revenue_total rt
CROSS JOIN best_country bc
CROSS JOIN customer_frequency cf
GROUP BY
    rt.total_revenue,
    bc.country,
    bc.revenue_per_customer;
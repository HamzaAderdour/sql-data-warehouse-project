## 📊 Business Analysis from Gold Layer

### Overview

Once the Medallion Architecture (Bronze → Silver → Gold) was successfully implemented, an exploratory business analysis was conducted on the Gold Layer to validate the analytical model and identify valuable business insights.

The objective of this phase was to move beyond the technical implementation of the Data Warehouse and evaluate how the curated data could support strategic decision-making.

The analysis was performed directly on the Star Schema composed of:

* `gold.fact_sales`
* `gold.dim_customers`
* `gold.dim_products`

A dedicated SQL analysis script was created:

```text
sql/analysis/01_gold_business_analysis.sql
```

This script contains all exploratory queries used to assess sales performance, customer behavior, product profitability, market performance, and customer retention.

---

## Dataset Summary

| Metric          |         Value |
| --------------- | ------------: |
| Customers       |        18,484 |
| Products        |           295 |
| Sales Records   |        60,398 |
| Orders          |        27,659 |
| Revenue         | 29.36 Million |
| Analysis Period |   2010 - 2014 |

The integrity checks confirmed that all sales records are successfully linked to both customer and product dimensions, ensuring full referential consistency across the Star Schema.

---

## Key Business Findings

### 1. Revenue Is Highly Concentrated on Bikes

Analysis of product categories revealed that Bikes generate nearly all company revenue.

| Category    | Revenue |
| ----------- | ------: |
| Bikes       |  28.3 M |
| Accessories |   0.7 M |
| Clothing    |  0.34 M |

Bikes account for approximately **96.4% of total revenue**, making them the primary revenue driver of the business.

---

### 2. Accessories Generate the Highest Margins

Although Accessories contribute a relatively small portion of total revenue, they provide the highest profit margins.

| Category    | Margin Percentage |
| ----------- | ----------------: |
| Accessories |            62.76% |
| Clothing    |            40.23% |
| Bikes       |            39.23% |

This finding suggests that cross-selling accessories alongside bike purchases could significantly increase profitability.

---

### 3. Australia Is the Most Valuable Market

Revenue per customer was calculated for each country.

| Country        | Revenue per Customer |
| -------------- | -------------------: |
| Australia      |                 2523 |
| United Kingdom |                 1773 |
| Germany        |                 1626 |
| France         |                 1461 |
| United States  |                 1225 |

Although the United States has the largest customer base, Australian customers generate more than twice the revenue per customer, making Australia the most valuable market.

---

### 4. Strong Dependency on a Small Number of Products

Product-level analysis revealed that a limited number of products generate a significant portion of total revenue.

The best-performing products belong mainly to the:

* Mountain-200 Series
* Road-150 Series

This indicates a high level of revenue concentration and potential business risk if demand for these products declines.

---

### 5. Significant Customer Growth in 2013

Customer acquisition analysis revealed rapid growth during 2013.

| Acquisition Year | New Customers |
| ---------------- | ------------: |
| 2010             |            14 |
| 2011             |         2,216 |
| 2012             |         3,225 |
| 2013             |        12,521 |
| 2014             |           506 |

The customer base expanded dramatically during 2013, representing the strongest growth period in the dataset.

---

### 6. Customer Retention Represents a Major Opportunity

Purchase frequency analysis showed that most customers buy only once or twice.

| Number of Orders | Customers |
| ---------------- | --------: |
| 1 Order          |    11,619 |
| 2 Orders         |     5,454 |

Approximately:

* 63% of customers placed only one order.
* 92% of customers placed one or two orders.

This indicates that improving customer retention may generate more value than acquiring new customers.

---

### 7. Female Customers Represent a High-Value Segment

Revenue analysis by gender showed that female customers contribute slightly more revenue than male customers.

This insight suggests opportunities for targeted marketing campaigns and product recommendations aimed at female customer segments.

---

## Business Recommendations

Based on the analysis, the following strategic recommendations were identified:

1. Increase investment in the Australian market due to its high revenue per customer.
2. Promote accessory bundles and cross-selling strategies to leverage high-margin products.
3. Reduce dependency on a limited number of bike models by diversifying revenue sources.
4. Improve customer retention through loyalty programs and post-purchase engagement campaigns.
5. Investigate the drivers behind the significant growth observed during 2013.
6. Develop customer segmentation strategies using RFM analysis to personalize marketing efforts.

---

## Next Step: Analytics Layer

The insights extracted from the Gold Layer serve as the foundation for the next phase of the project.

The upcoming Analytics Layer will transform these findings into reusable business views, KPIs, and dashboards through:

```text
Gold Layer
    ↓
Analytics Layer
    ↓
REST API
    ↓
Interactive Business Dashboard
```

This evolution transforms the project from a technical Data Warehouse implementation into a complete Decision Support System.

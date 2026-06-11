"""
=============================================================
Sales Intelligence Platform — FastAPI Backend
=============================================================
Exposes the PostgreSQL Analytics Layer as REST API endpoints.

Endpoints:
    GET /                         → API root
    GET /health                   → Health check
    GET /api/kpis                 → analytics.kpi_overview
    GET /api/sales/trend          → analytics.sales_trend
    GET /api/countries/performance→ analytics.country_performance
    GET /api/margins              → analytics.margin_analysis
    GET /api/products/pareto      → analytics.product_pareto
    GET /api/customers/retention  → analytics.customer_retention
    GET /api/customers/rfm        → analytics.customer_rfm
    GET /api/customers/profile    → analytics.customer_profile
    GET /api/business/insights    → analytics.business_insights

Swagger UI: http://localhost:8000/docs
=============================================================
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from database import fetch_all, fetch_one


app = FastAPI(
    title="Sales Intelligence Platform API",
    description="REST API exposing Analytics Layer views from PostgreSQL.",
    version="1.0.0"
)

# Allow all origins so the future frontend dashboard can consume the API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ------------------------------------------------------------------
# Root & Health
# ------------------------------------------------------------------

@app.get("/", tags=["General"])
def root():
    """API entry point — returns basic service information."""
    return {
        "message": "Sales Intelligence Platform API",
        "status": "running",
        "docs": "/docs"
    }


@app.get("/health", tags=["General"])
def health_check():
    """
    Verify that the API is running and the database connection is healthy.
    Returns HTTP 500 if the database is unreachable.
    """
    try:
        result = fetch_one("SELECT 1 AS database_status;")
        return {
            "api_status": "healthy",
            "database_status": result.get("database_status")
        }
    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=f"Database connection failed: {error}"
        )


# ------------------------------------------------------------------
# KPIs
# ------------------------------------------------------------------

@app.get("/api/kpis", tags=["KPIs"])
def get_kpis():
    """Return global executive KPIs from analytics.kpi_overview."""
    return fetch_one("SELECT * FROM analytics.kpi_overview;")


# ------------------------------------------------------------------
# Sales
# ------------------------------------------------------------------

@app.get("/api/sales/trend", tags=["Sales"])
def get_sales_trend():
    """Return monthly revenue, orders and quantity trend from analytics.sales_trend."""
    return fetch_all("SELECT * FROM analytics.sales_trend ORDER BY sales_month;")


# ------------------------------------------------------------------
# Countries
# ------------------------------------------------------------------

@app.get("/api/countries/performance", tags=["Markets"])
def get_country_performance():
    """Return country-level performance metrics from analytics.country_performance."""
    return fetch_all("SELECT * FROM analytics.country_performance ORDER BY revenue DESC;")


# ------------------------------------------------------------------
# Margins
# ------------------------------------------------------------------

@app.get("/api/margins", tags=["Products"])
def get_margin_analysis():
    """Return revenue and margin analysis by category from analytics.margin_analysis."""
    return fetch_all("SELECT * FROM analytics.margin_analysis ORDER BY estimated_margin DESC;")


# ------------------------------------------------------------------
# Products
# ------------------------------------------------------------------

@app.get("/api/products/pareto", tags=["Products"])
def get_product_pareto():
    """Return Pareto product concentration analysis from analytics.product_pareto."""
    return fetch_all("SELECT * FROM analytics.product_pareto ORDER BY product_rank;")


# ------------------------------------------------------------------
# Customers
# ------------------------------------------------------------------

@app.get("/api/customers/retention", tags=["Customers"])
def get_customer_retention():
    """Return purchase frequency distribution from analytics.customer_retention."""
    return fetch_all("SELECT * FROM analytics.customer_retention ORDER BY purchase_frequency;")


@app.get("/api/customers/rfm", tags=["Customers"])
def get_customer_rfm():
    """Return RFM customer segmentation from analytics.customer_rfm."""
    return fetch_all("SELECT * FROM analytics.customer_rfm ORDER BY monetary DESC;")


@app.get("/api/customers/profile", tags=["Customers"])
def get_customer_profile():
    """Return demographic customer profile from analytics.customer_profile."""
    return fetch_all("SELECT * FROM analytics.customer_profile ORDER BY revenue DESC NULLS LAST;")


# ------------------------------------------------------------------
# Business Insights
# ------------------------------------------------------------------

@app.get("/api/business/insights", tags=["Insights"])
def get_business_insights():
    """Return strategic business summary from analytics.business_insights."""
    return fetch_one("SELECT * FROM analytics.business_insights;")

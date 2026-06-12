export interface Kpis {
  total_revenue: number;
  total_orders: number;
  total_customers: number;
  sold_products: number;
  total_quantity: number;
  average_order_value: number;
  revenue_per_customer: number;
  first_order_date: string;
  last_order_date: string;
}

export interface BusinessInsights {
  total_revenue: number;
  bikes_revenue_percentage: number;
  best_country: string;
  best_country_revenue_per_customer: number;
  highest_margin_category: string;
  highest_margin_percentage: number;
  one_time_customers: number;
  one_time_customers_percentage: number;
  low_frequency_customers: number;
  low_frequency_customers_percentage: number;
  best_revenue_year: number;
  best_year_revenue: number;
}

export interface CountryPerformance {
  country: string;
  customers: number;
  orders: number;
  revenue: number;
  quantity_sold: number;
  revenue_per_customer: number;
  average_order_value: number;
}

export interface SalesTrendPoint {
  sales_month: string;
  sales_year: number;
  month_number: number;
  revenue: number;
  orders: number;
  quantity_sold: number;
  average_order_value: number;
}

export interface MarginRow {
  category: string;
  subcategory: string;
  revenue: number;
  estimated_cost: number;
  estimated_margin: number;
  margin_percentage: number;
  quantity_sold: number;
  orders: number;
}

export interface ParetoRow {
  product_rank: number;
  product_key: number;
  product_name: string;
  category: string;
  subcategory: string;
  revenue: number;
  quantity_sold: number;
  orders: number;
  revenue_percentage: number;
  cumulative_revenue_percentage: number;
}

export interface RetentionRow {
  purchase_frequency: number;
  customers: number;
  revenue: number;
  customer_percentage: number;
}

export interface RfmCustomer {
  customer_key: number;
  customer_number: string;
  first_name: string;
  last_name: string;
  country: string;
  recency_days: number;
  frequency: number;
  monetary: number;
  customer_segment: string;
}

export interface CustomerProfileRow {
  gender: string;
  marital_status: string;
  age_group: string;
  customers: number;
  orders: number;
  revenue: number;
  revenue_per_customer: number;
}

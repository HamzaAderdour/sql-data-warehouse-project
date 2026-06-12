import type {
  BusinessInsights,
  CountryPerformance,
  CustomerProfileRow,
  Kpis,
  MarginRow,
  ParetoRow,
  RetentionRow,
  RfmCustomer,
  SalesTrendPoint,
} from "./types";

export const demoKpis: Kpis = {
  total_revenue: 29351258,
  total_orders: 27657,
  total_customers: 18482,
  sold_products: 130,
  total_quantity: 60404,
  average_order_value: 1061.26,
  revenue_per_customer: 1588.1,
  first_order_date: "2010-12-29",
  last_order_date: "2014-01-28",
};

export const demoInsights: BusinessInsights = {
  total_revenue: 29356250,
  bikes_revenue_percentage: 96.46,
  best_country: "Australia",
  best_country_revenue_per_customer: 2523.02,
  highest_margin_category: "Accessories",
  highest_margin_percentage: 62.76,
  one_time_customers: 11619,
  one_time_customers_percentage: 62.86,
  low_frequency_customers: 17073,
  low_frequency_customers_percentage: 92.37,
  best_revenue_year: 2013,
  best_year_revenue: 16344878,
};

export const demoCountries: CountryPerformance[] = [
  { country: "United States", customers: 7482, orders: 9230, revenue: 9162327, quantity_sold: 20481, revenue_per_customer: 1224.58, average_order_value: 992.67 },
  { country: "Australia", customers: 3591, orders: 5915, revenue: 9061000, quantity_sold: 13345, revenue_per_customer: 2523.02, average_order_value: 1531.95 },
  { country: "United Kingdom", customers: 1913, orders: 3391, revenue: 3391712, quantity_sold: 6906, revenue_per_customer: 1772.98, average_order_value: 1000.21 },
  { country: "Germany", customers: 1780, orders: 2769, revenue: 2894312, quantity_sold: 5625, revenue_per_customer: 1626.02, average_order_value: 1045.25 },
  { country: "France", customers: 1810, orders: 2828, revenue: 2644017, quantity_sold: 5559, revenue_per_customer: 1460.78, average_order_value: 935.0 },
  { country: "Canada", customers: 1906, orders: 3524, revenue: 1977890, quantity_sold: 8488, revenue_per_customer: 1037.72, average_order_value: 561.26 },
];

function buildSalesTrend(): SalesTrendPoint[] {
  const points: SalesTrendPoint[] = [];
  const start = new Date(2010, 11, 1);
  const end = new Date(2014, 0, 1);
  let seed = 42;
  const rand = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
  const d = new Date(start);
  while (d <= end) {
    const year = d.getFullYear();
    const month = d.getMonth() + 1;
    // Growth curve: ramps up over time, peaks in 2013
    const monthsFromStart = (year - 2010) * 12 + (month - 12);
    const growth = Math.min(1, monthsFromStart / 30);
    const seasonal = 1 + 0.25 * Math.sin((month / 12) * Math.PI * 2);
    const base = 80000 + growth * 1500000;
    const revenue = Math.round(base * seasonal * (0.85 + rand() * 0.3));
    const aov = 700 + rand() * 900;
    const orders = Math.max(10, Math.round(revenue / aov));
    points.push({
      sales_month: `${year}-${String(month).padStart(2, "0")}-01`,
      sales_year: year,
      month_number: month,
      revenue,
      orders,
      quantity_sold: Math.round(orders * (1 + rand() * 1.4)),
      average_order_value: Math.round((revenue / orders) * 100) / 100,
    });
    d.setMonth(d.getMonth() + 1);
  }
  return points;
}

export const demoSalesTrend: SalesTrendPoint[] = buildSalesTrend();

export const demoMargins: MarginRow[] = [
  { category: "Bikes", subcategory: "Road Bikes", revenue: 14519438, estimated_cost: 9219075, estimated_margin: 5300363, margin_percentage: 36.51, quantity_sold: 8068, orders: 8068 },
  { category: "Bikes", subcategory: "Mountain Bikes", revenue: 9952255, estimated_cost: 6518000, estimated_margin: 3434255, margin_percentage: 34.51, quantity_sold: 6311, orders: 6311 },
  { category: "Bikes", subcategory: "Touring Bikes", revenue: 3844697, estimated_cost: 2611000, estimated_margin: 1233697, margin_percentage: 32.09, quantity_sold: 2754, orders: 2754 },
  { category: "Accessories", subcategory: "Tires and Tubes", revenue: 245529, estimated_cost: 91500, estimated_margin: 154029, margin_percentage: 62.74, quantity_sold: 18412, orders: 9120 },
  { category: "Accessories", subcategory: "Helmets", revenue: 225336, estimated_cost: 84000, estimated_margin: 141336, margin_percentage: 62.72, quantity_sold: 6440, orders: 6190 },
  { category: "Accessories", subcategory: "Bottles and Cages", revenue: 56798, estimated_cost: 21100, estimated_margin: 35698, margin_percentage: 62.85, quantity_sold: 11500, orders: 7320 },
  { category: "Clothing", subcategory: "Jerseys", revenue: 172950, estimated_cost: 96000, estimated_margin: 76950, margin_percentage: 44.49, quantity_sold: 3420, orders: 3260 },
  { category: "Clothing", subcategory: "Shorts", revenue: 71318, estimated_cost: 39800, estimated_margin: 31518, margin_percentage: 44.19, quantity_sold: 1450, orders: 1380 },
  { category: "Clothing", subcategory: "Gloves", revenue: 35021, estimated_cost: 19600, estimated_margin: 15421, margin_percentage: 44.03, quantity_sold: 1480, orders: 1410 },
];

function buildPareto(): ParetoRow[] {
  const names = [
    "Mountain-200 Black- 46", "Mountain-200 Silver- 42", "Road-150 Red- 56", "Mountain-200 Black- 42",
    "Road-150 Red- 48", "Mountain-200 Silver- 38", "Road-250 Black- 48", "Touring-1000 Blue- 60",
    "Mountain-200 Black- 38", "Road-350-W Yellow- 48", "Touring-1000 Yellow- 54", "Road-250 Red- 52",
    "Mountain-200 Silver- 46", "Road-550-W Yellow- 44", "Touring-3000 Blue- 62", "Road-250 Black- 44",
    "Mountain-100 Silver- 44", "Road-650 Red- 58", "Touring-2000 Blue- 54", "Road-550-W Yellow- 38",
  ];
  const cats: [string, string][] = [
    ["Bikes", "Mountain Bikes"], ["Bikes", "Road Bikes"], ["Bikes", "Touring Bikes"],
  ];
  let cumulative = 0;
  const total = 29351258;
  return names.map((name, i) => {
    const pct = Math.max(0.6, 4.8 - i * 0.22);
    const revenue = Math.round((pct / 100) * total);
    cumulative += pct;
    const [category, subcategory] = cats[i % 3];
    return {
      product_rank: i + 1,
      product_key: 100 + i,
      product_name: name,
      category,
      subcategory,
      revenue,
      quantity_sold: Math.round(revenue / 2200),
      orders: Math.round(revenue / 2200),
      revenue_percentage: Math.round(pct * 100) / 100,
      cumulative_revenue_percentage: Math.round(cumulative * 100) / 100,
    };
  });
}

export const demoPareto: ParetoRow[] = buildPareto();

export const demoRetention: RetentionRow[] = [
  { purchase_frequency: 1, customers: 11619, revenue: 6747035, customer_percentage: 62.86 },
  { purchase_frequency: 2, customers: 3892, revenue: 5210400, customer_percentage: 21.06 },
  { purchase_frequency: 3, customers: 1562, revenue: 4980210, customer_percentage: 8.45 },
  { purchase_frequency: 4, customers: 781, revenue: 3920180, customer_percentage: 4.23 },
  { purchase_frequency: 5, customers: 412, revenue: 3010500, customer_percentage: 2.23 },
  { purchase_frequency: 6, customers: 216, revenue: 2982933, customer_percentage: 1.17 },
];

function buildRfm(): RfmCustomer[] {
  const segments = ["VIP Customer", "Loyal Customer", "Recent Customer", "At Risk Customer", "Lost Customer"];
  const countries = ["Australia", "United States", "United Kingdom", "Germany", "France", "Canada"];
  const first = ["Jon", "Eugene", "Ruben", "Christy", "Elizabeth", "Julio", "Marco", "Rob", "Shannon", "Jacquelyn", "Curtis", "Lauren", "Ian", "Sydney", "Chloe", "Wyatt", "Shawna", "Clarence", "Luke", "Jordan"];
  const last = ["Yang", "Huang", "Torres", "Zhu", "Johnson", "Ruiz", "Mehta", "Verhoff", "Carlson", "Suarez", "Lu", "Walker", "Jenkins", "Bennett", "Young", "Hughes", "Carter", "Gao", "Foster", "Reed"];
  let seed = 7;
  const rand = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
  return Array.from({ length: 60 }, (_, i) => {
    const segIndex = Math.min(4, Math.floor(rand() * 5));
    const segment = segments[segIndex];
    const recency = segment.includes("Recent") ? Math.round(rand() * 60) : segment.includes("At Risk") ? 200 + Math.round(rand() * 200) : Math.round(rand() * 365);
    const frequency = segment.includes("VIP") || segment.includes("Loyal") ? 3 + Math.round(rand() * 5) : 1 + Math.round(rand() * 2);
    const monetary = segment.includes("VIP") ? 6000 + Math.round(rand() * 8000) : 500 + Math.round(rand() * 4000);
    return {
      customer_key: i + 1,
      customer_number: `AW${String(11000 + i).padStart(8, "0")}`,
      first_name: first[i % first.length],
      last_name: last[i % last.length],
      country: countries[Math.floor(rand() * countries.length)],
      recency_days: recency,
      frequency,
      monetary,
      customer_segment: segment,
    };
  });
}

export const demoRfm: RfmCustomer[] = buildRfm();

export const demoProfiles: CustomerProfileRow[] = (() => {
  const rows: CustomerProfileRow[] = [];
  const genders = ["Male", "Female"];
  const maritals = ["Married", "Single"];
  const ages = ["18-24", "25-34", "35-44", "45-54", "55+"];
  let seed = 13;
  const rand = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
  for (const gender of genders) {
    for (const marital of maritals) {
      for (const age of ages) {
        const customers = 400 + Math.round(rand() * 2800);
        const orders = Math.round(customers * (1.2 + rand()));
        const revenue = Math.round(orders * (800 + rand() * 700));
        rows.push({
          gender,
          marital_status: marital,
          age_group: age,
          customers,
          orders,
          revenue,
          revenue_per_customer: Math.round((revenue / customers) * 100) / 100,
        });
      }
    }
  }
  return rows;
})();

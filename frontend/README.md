# Sales Intelligence Platform

Plateforme d'aide à la décision (Business Intelligence / Decision Support System) destinée aux dirigeants et analystes. L'application fournit une vue exécutive complète des ventes, marchés, produits et clients à partir d'un backend FastAPI existant, avec un repli automatique sur des données de démonstration lorsque l'API n'est pas accessible.

---

## Sommaire

1. [Stack technique](#stack-technique)
2. [Démarrage rapide](#démarrage-rapide)
3. [Variables d'environnement](#variables-denvironnement)
4. [Architecture du projet](#architecture-du-projet)
5. [Couche de données (API + repli démo)](#couche-de-données-api--repli-démo)
6. [Endpoints consommés](#endpoints-consommés)
7. [Description des tableaux de bord](#description-des-tableaux-de-bord)
8. [Composants réutilisables](#composants-réutilisables)
9. [Thème et design system](#thème-et-design-system)
10. [Conventions de routing](#conventions-de-routing)
11. [Guide pour le développeur futur](#guide-pour-le-développeur-futur)

---

## Stack technique

| Domaine | Choix |
| --- | --- |
| Framework | TanStack Start v1 (React 19, SSR/SSG, routing par fichiers) |
| Build | Vite 7 |
| Langage | TypeScript (strict) |
| Styles | Tailwind CSS v4 (via `src/styles.css`, tokens `oklch`) |
| Composants UI | shadcn/ui (Radix UI) |
| Data fetching | TanStack Query (React Query) + Axios |
| Graphiques | Recharts |
| Icônes | lucide-react |
| Thème clair/sombre | `ThemeProvider` maison (persisté en `localStorage`) |

---

## Démarrage rapide

```bash
# 1. Installer les dépendances
bun install        # ou npm install

# 2. Configurer l'URL de l'API
cp .env.example .env
# éditer .env si nécessaire (par défaut http://localhost:8000)

# 3. Lancer le serveur de développement
bun run dev        # ou npm run dev
```

Scripts disponibles (voir `package.json`) :

| Script | Rôle |
| --- | --- |
| `dev` | Serveur de développement Vite |
| `build` | Build de production |
| `build:dev` | Build en mode développement |
| `preview` | Prévisualiser le build |
| `lint` | ESLint |
| `format` | Prettier |

> **CORS** : pour consommer la vraie API depuis le navigateur, le serveur FastAPI doit autoriser les requêtes cross-origin du frontend.

---

## Variables d'environnement

| Variable | Défaut | Description |
| --- | --- | --- |
| `VITE_API_BASE_URL` | `http://localhost:8000` | URL de base du backend FastAPI. Toute variable exposée au client doit être préfixée par `VITE_`. |

Quand l'API répond, les données réelles sont utilisées automatiquement. Sinon, l'application bascule sur des données de démonstration et affiche un badge **« Demo Data »** dans la barre supérieure.

---

## Architecture du projet

```text
src/
├── routes/                  # Routing par fichiers (TanStack Router)
│   ├── __root.tsx           # Shell de l'app : providers (Query, Theme, Sidebar) + Outlet
│   ├── index.tsx            # / · Dashboard Overview
│   ├── sales.tsx            # /sales · Sales Analytics
│   ├── markets.tsx          # /markets · Market Intelligence
│   ├── products.tsx         # /products · Product Intelligence
│   ├── customers.tsx        # /customers · Customer Intelligence
│   └── insights.tsx         # /insights · Executive Insights
│
├── components/
│   ├── layout/
│   │   ├── app-sidebar.tsx  # Navigation latérale repliable
│   │   ├── top-bar.tsx      # Barre supérieure : recherche ⌘K, thème, badge démo
│   │   └── page-header.tsx  # En-tête de page (titre + description + actions)
│   ├── charts/
│   │   ├── charts.tsx       # Wrappers Recharts (Trend, RankedBar, Grouped, Donut, Pareto)
│   │   ├── chart-theme.ts   # Couleurs des graphes lues depuis les variables CSS
│   │   └── chart-tooltip.tsx
│   ├── kpi-card.tsx         # Carte d'indicateur clé (KPI)
│   ├── chart-card.tsx       # Conteneur titré pour un graphique
│   ├── alert-card.tsx       # Carte d'alerte (opportunity / attention / risk)
 │   ├── business-insights-panel.tsx # Panneau d'observations métier dérivées des données analytiques
│   ├── states.tsx           # Loading / Error / Empty / ChartSkeleton
│   └── theme-provider.tsx   # Gestion du thème clair/sombre
│
├── hooks/
│   └── use-sales-data.ts    # Hooks React Query (1 par endpoint) + queryOptions
│
├── lib/
│   ├── api/
│   │   ├── client.ts        # Axios + fetchWithFallback (repli démo)
│   │   ├── sales-api.ts     # Fonctions d'appel typées des 9 endpoints
│   │   ├── types.ts         # Interfaces TypeScript des réponses API
│   │   ├── demo-data.ts     # Données de démonstration réalistes
│   │   └── demo-store.ts    # Drapeau global indiquant l'usage de données démo
│   └── format.ts            # Formatage devise / nombre / pourcentage / mois
│
├── styles.css               # Tokens du design system (couleurs, thème, graphes)
└── router.tsx               # Configuration du routeur
```

---

## Couche de données (API + repli démo)

Le flux de données est centralisé et robuste :

1. **`src/lib/api/client.ts`** — instance Axios configurée avec `VITE_API_BASE_URL` et un `timeout` court (échec rapide si le backend est injoignable). La fonction `fetchWithFallback<T>(path, demo)` tente l'appel réel ; en cas d'échec elle marque l'endpoint comme « démo » (`markDemo`) et renvoie les données de secours.
2. **`src/lib/api/sales-api.ts`** — expose `salesApi` avec une fonction typée par endpoint, chacune fournissant son jeu de données de démo associé.
3. **`src/hooks/use-sales-data.ts`** — un hook React Query par endpoint (`useKpis`, `useSalesTrend`, `useCountries`, …) plus les `queryOptions` réutilisables dans les `loader` de routes.
4. **`src/lib/api/demo-store.ts`** — suit globalement si au moins un endpoint sert des données de démonstration, ce qui pilote l'affichage du badge **« Demo Data »**.

> Tous les appels sont côté client (navigateur → FastAPI local), donc les vraies données se chargent automatiquement en environnement local.

---

## Endpoints consommés

| Endpoint | Hook | Type de réponse |
| --- | --- | --- |
| `GET /api/kpis` | `useKpis` | `Kpis` |
| `GET /api/business/insights` | `useInsights` | `BusinessInsights` |
| `GET /api/sales/trend` | `useSalesTrend` | `SalesTrendPoint[]` |
| `GET /api/countries/performance` | `useCountries` | `CountryPerformance[]` |
| `GET /api/margins` | `useMargins` | `MarginRow[]` |
| `GET /api/products/pareto` | `usePareto` | `ParetoRow[]` |
| `GET /api/customers/retention` | `useRetention` | `RetentionRow[]` |
| `GET /api/customers/rfm` | `useRfm` | `RfmCustomer[]` |
| `GET /api/customers/profile` | `useProfiles` | `CustomerProfileRow[]` |

Les interfaces complètes sont définies dans `src/lib/api/types.ts`.

---

## Description des tableaux de bord

### 1. Dashboard Overview — `/`
Vue exécutive synthétique. Affiche **6 cartes KPI** (chiffre d'affaires total, commandes, clients, produits vendus, panier moyen, revenu par client) issues de `/api/kpis`, une **tendance du chiffre d'affaires** (aire), le **revenu par pays** (barres classées), le **revenu par catégorie** (dérivé de `/api/margins`), des **cartes d'insights stratégiques** (`/api/business/insights` : meilleur marché, catégorie à plus forte marge, meilleure année, risque de rétention) et un **panneau Business Insights**.

### 2. Sales Analytics — `/sales`
Analyse temporelle détaillée des ventes à partir de `/api/sales/trend` : tendances mensuelles du **chiffre d'affaires**, des **commandes**, du **panier moyen** et des **quantités**. Filtre par **année** géré via les *search params* d'URL (état partageable). Le panneau Business Insights résume automatiquement la période sélectionnée (totaux, pic, variation).

### 3. Market Intelligence — `/markets`
Performance par marché à partir de `/api/countries/performance` : revenu par pays, **revenu par client**, panier moyen, **tableau de classement** des pays, distinction **marchés leaders vs sous-performants**, graphiques en barres classées (visualisation propre sans dépendance cartographique).

### 4. Product Intelligence — `/products`
Analyse produits via `/api/margins` et `/api/products/pareto` : **marge par catégorie/sous-catégorie**, **diagramme de Pareto** avec courbe cumulée (analyse 80/20), tableau des meilleurs produits, et commentaire auto-généré (« Le top 20 des produits génère X % du chiffre d'affaires »).

### 5. Customer Intelligence — `/customers`
Connaissance client combinant trois sources :
- `/api/customers/retention` — distribution des fréquences d'achat, clients uniques vs récurrents ;
- `/api/customers/rfm` — segmentation **RFM** (VIP / Fidèle / Récent / À risque) + tableau ;
- `/api/customers/profile` — répartitions démographiques (genre, statut marital, tranche d'âge).
Observations automatiques générées à partir des données.

### 6. Executive Insights — `/insights`
Synthèse stratégique pour la direction à partir de `/api/business/insights` : **résumé exécutif** rédigé en langage naturel, puis **cartes d'alerte** colorées par niveau (vert = opportunité, jaune = attention, rouge = risque) couvrant concentration du chiffre d'affaires, opportunités de marge, risque de rétention, expansion de marché et dépendance produit.

> Chaque route possède ses propres métadonnées SEO (`head()`), ses composants `errorComponent` / `notFoundComponent` et un panneau Business Insights.

---

## Composants réutilisables

| Composant | Rôle |
| --- | --- |
| `KpiCard` | Indicateur clé : libellé, valeur formatée, icône, variation optionnelle |
| `ChartCard` | Conteneur titré (titre + description + barre d'outils) pour un graphique |
| `charts.tsx` | `TrendChart`, `RankedBarChart`, `GroupedBarChart`, `DonutChart`, `ParetoChart` |
| `AlertCard` | Carte d'alerte colorée (`opportunity` / `attention` / `risk`) |
| `BusinessInsightsPanel` | Observations métier (déterministes) dérivées des données analytiques de la page |
| `states.tsx` | `LoadingSkeleton`, `ErrorState`, `EmptyState`, `ChartSkeleton` |
| `PageHeader` | En-tête de page standardisé |
| `AppSidebar` / `TopBar` | Shell de navigation (sidebar repliable, recherche ⌘K, thème, badge démo) |

Helpers de formatage dans `src/lib/format.ts` : `formatCurrency`, `formatNumber`, `formatPercent`, `formatMonth`.

---

## Thème et design system

- **Tokens** définis dans `src/styles.css` en `oklch` : primaire indigo (`#4f46e5`), neutres slate (`#0f172a` / `#64748b`), accent vert (`#22c55e`), plus couleurs de graphes et couleurs de risque (vert / jaune / rouge), en versions claire et sombre.
- **Règle stricte** : ne jamais utiliser de classes de couleur brutes (`text-white`, `bg-black`, …). Toujours passer par les tokens sémantiques (`bg-background`, `text-foreground`, `bg-primary`, …).
- **Graphiques** : les couleurs Recharts lisent les variables CSS (`var(--color-chart-1)`, …) pour s'adapter au mode clair/sombre.
- **Bascule de thème** : `ThemeProvider` applique la stratégie par classe et persiste le choix en `localStorage`.

---

## Conventions de routing

Routing **par fichiers** (TanStack Router) dans `src/routes/` :

| Fichier | URL |
| --- | --- |
| `index.tsx` | `/` |
| `sales.tsx` | `/sales` |
| `markets.tsx` | `/markets` |
| `products.tsx` | `/products` |
| `customers.tsx` | `/customers` |
| `insights.tsx` | `/insights` |
| `__root.tsx` | shell racine (providers + `<Outlet />`) |

> **Ne jamais éditer `src/routeTree.gen.ts`** : ce fichier est généré automatiquement. Ne pas créer de dossier `src/pages/` (convention d'un autre framework).

---

## Guide pour le développeur futur

**Ajouter un nouveau tableau de bord**
1. Créer `src/routes/ma-page.tsx` avec `createFileRoute`, un `head()` (SEO), un `loader` (`ensureQueryData`), un `errorComponent` et un `notFoundComponent`.
2. Ajouter l'entrée correspondante dans `navItems` de `src/components/layout/app-sidebar.tsx`.

**Brancher un nouvel endpoint**
1. Ajouter l'interface de réponse dans `src/lib/api/types.ts`.
2. Ajouter un jeu de données démo dans `src/lib/api/demo-data.ts`.
3. Exposer une fonction typée dans `src/lib/api/sales-api.ts` via `fetchWithFallback`.
4. Créer le hook React Query + ses `queryOptions` dans `src/hooks/use-sales-data.ts`.

**Ajouter un type de graphique** : étendre `src/components/charts/charts.tsx` en réutilisant les tokens de `chart-theme.ts`.

**Bonnes pratiques**
- Toujours gérer les états de chargement / erreur / vide via `states.tsx`.
- Garder les composants petits et focalisés ; réutiliser `ChartCard`, `KpiCard`, `AlertCard`.
- Respecter le design system (tokens sémantiques uniquement).
- Les calculs d'insights restent côté frontend (déterministes), dérivés des données de l'API.

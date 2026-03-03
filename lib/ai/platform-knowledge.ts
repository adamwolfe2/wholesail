/**
 * Static platform knowledge injected into every AI Assistant system prompt.
 * Describes all admin pages, key workflows, and platform conventions.
 * Update this as you add pages/features.
 */
export const PLATFORM_KNOWLEDGE = `
## Wholesail Admin Platform — Page Map

### Dashboard & Analytics
- /admin — Main dashboard. KPIs: revenue, orders, clients, AOV. Quick links to everything.
- /admin/analytics — Charts: revenue over time, top products, order volume, tier breakdown.
- /admin/ceo — CEO-level rollup: LTV, retention, growth metrics.

### Orders
- /admin/orders — Full order table. Filter by status, org, date. Export to CSV. Bulk status updates.
- /admin/orders/[id] — Order detail: items, payments, shipment, invoice, 3-step delivery checklist, distributor assignment, internal notes, audit timeline.
- /admin/fulfillment/[orderId]/pick-list — Pick list for packing an order.

### Clients & Organizations
- /admin/clients — All client orgs. Tier badges (NEW/REPEAT/VIP), search, filter by tier/wholesaler.
- /admin/clients/[id] — Client detail: contact info, order history, invoices, tier, notes, loyalty points, account manager assignment, edit business profile.

### Invoices & Quotes
- /admin/invoices — All invoices with aging report. Filter by status: DRAFT/PENDING/PAID/OVERDUE.
- /admin/quotes — All quotes. Status: DRAFT/SENT/ACCEPTED/DECLINED/EXPIRED. Convert to order.

### Products & Pricing
- /admin/products — Full product catalog. Edit pricing, availability, category.
- /admin/products/[id] — Product detail: pricing history, inventory levels.
- /admin/pricing — Tier-based pricing rules: NEW/REPEAT/VIP discount percentages by category.
- /admin/inventory — Stock levels, reserved quantities, low-stock alerts.

### Sales & Reps
- /admin/reps — Sales rep list. Build carts on behalf of clients.
- /admin/tasks — Rep task management. Assign, prioritize, track completion.

### Marketing & Drops
- /admin/drops — Product availability calendar. Create drops, send alert blasts.
- /admin/leads — Giveaway leads and CRM pipeline. Status: NEW/CONTACTED/QUALIFIED/CONVERTED/LOST.

### Wholesale & Suppliers
- /admin/wholesale — Wholesale partner applications. Review, approve, reject, convert to org.
- /admin/suppliers — Ingredient supplier submissions. Review, approve, link to products.

### Operations
- /admin/shipments — All shipments with live tracking status.
- /admin/messages — Client messaging inbox. Two-way conversations.
- /admin/settings — Admin settings, billing reminder configuration.

## Key Workflows

### New Order Flow
Client places order → Order created (PENDING) → Admin confirms via delivery checklist (adminConfirmedAt) → Admin assigns distributor → Distributor confirms fulfillment (distributorConfirmedAt) → Client confirms delivery received (clientConfirmedAt)

### Client Onboarding
Wholesale application submitted → Admin reviews at /admin/wholesale → Approve → org created with isWholesaler=true → Client invited via Clerk → Client claims account at /claim

### Quote to Order
Create quote at /admin/quotes → Set to SENT → Client receives email → Client accepts at /client-portal/quotes/[id] → Converts to order

### Inventory Alerts
Products have stock levels. When quantityOnHand < lowStockThreshold → shows in /admin/inventory as low stock

## Data Model Key Facts
- Organizations: the primary client entity. Has tier (NEW/REPEAT/VIP), isWholesaler flag, credit limit, payment terms, loyalty points
- Orders: status enum is PENDING → CONFIRMED → PACKED → SHIPPED → DELIVERED (or CANCELLED)
- Delivery checklist: adminConfirmedAt, distributorConfirmedAt, clientConfirmedAt — 3-step internal tracking
- Invoice status: DRAFT → PENDING → PAID (or OVERDUE)
- Quote status: DRAFT → SENT → ACCEPTED/DECLINED/EXPIRED
- Users have roles: CLIENT, SALES_REP, OPS, ADMIN
- Loyalty points: earned on delivery, redeemable at checkout

## Pricing System
- 3 tiers: NEW (0% off), REPEAT (configurable), VIP (configurable)
- Discounts configurable per category via /admin/pricing
- Delivery fee: $25 flat, free over $500
- Sales tax: calculated by shipping state

## Distribution Partner System
- Distributors = Organizations with isWholesaler=true
- Admin assigns a distributorOrgId to each order
- Distributors see their queue at /client-portal/fulfillment
- Receive notifications when assigned to orders
`

export const ADMIN_PAGES_QUICK_LINKS: Record<string, string> = {
  dashboard: '/admin',
  orders: '/admin/orders',
  clients: '/admin/clients',
  analytics: '/admin/analytics',
  invoices: '/admin/invoices',
  quotes: '/admin/quotes',
  products: '/admin/products',
  pricing: '/admin/pricing',
  inventory: '/admin/inventory',
  shipments: '/admin/shipments',
  wholesale: '/admin/wholesale',
  suppliers: '/admin/suppliers',
  drops: '/admin/drops',
  leads: '/admin/leads',
  reps: '/admin/reps',
  tasks: '/admin/tasks',
  messages: '/admin/messages',
  fulfillment: '/admin/fulfillment',
  settings: '/admin/settings',
  ceo: '/admin/ceo',
}

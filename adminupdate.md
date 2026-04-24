# Admin Panel Updates — Phase 3+

## Completed ✅
- Phase 1: Logo, theme (light by default), basic structure
- Phase 2: Subscription column, plan badges with expiry countdown, status/plan filtering

## In Progress / To Do

### 1. AI Monitor Improvements
- [ ] Fetch and display real daily token consumption data (last 7 days)
- [ ] Show token cost calculation
- [ ] Provider switching should persist in backend
- [ ] Highlight anomalies (users > 5k tokens)
- [ ] Add export functionality for AI usage

### 2. Finance & Payments
- [ ] Show subscription plans per organization (Free/Pro/School)
- [ ] Display next billing date for active subscriptions
- [ ] Implement payment retry UI for failed payments
- [ ] Add revenue forecast based on active subs
- [ ] Show churn analysis (expiring subscriptions this month)

### 3. Organization Management
- [ ] Show actual seat usage percentage with progress bar
- [ ] Display all users in organization
- [ ] Bulk actions: change plan, extend expiry, block users
- [ ] Org activity timeline
- [ ] Subscription history per org

### 4. Advanced Search & Filtering
- [ ] Global search across teachers, orgs, payments
- [ ] Save filter presets
- [ ] Search by school, expiry date range, plan
- [ ] Quick stats: "X teachers expiring this month", "Y orgs", etc.

### 5. System & Logs
- [ ] Searchable/filterable audit logs
- [ ] Log export (PDF/CSV)
- [ ] System health dashboard (DB, API, background jobs)
- [ ] Admin activity timeline

### 6. Bulk User Operations
- [ ] Bulk plan upgrade/downgrade
- [ ] Bulk extend subscription
- [ ] Bulk block/unblock
- [ ] Bulk delete with confirmation

### 7. Export & Reporting
- [ ] Export teachers with subscription info
- [ ] Export organizations with seat usage
- [ ] Org billing report
- [ ] Monthly financial summary

## Priority Order
1. AI Monitor real data (quick win, useful)
2. Org seat visualization + users list
3. Finance: subscription plans + next billing date
4. Bulk operations for selected teachers
5. Advanced search

## Backend Status
- Teachers API ✅ returns plan, expires_at
- Orgs API ✅ returns expires_at, seat info
- Payments API ✅ functional
- Audit logs ✅ functional
- Daily tokens data — check if available
- Subscription plans — check if available per org

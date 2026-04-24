# Admin Panel Updates — Phase 3+

## Completed ✅
- Phase 1: Logo, theme (light by default), basic structure
- Phase 2: Subscription column, plan badges with expiry countdown, status/plan filtering

## Completed ✅

### Phase 2
- ✅ Subscription column with plan badges and expiry countdown
- ✅ Status/plan filtering for teachers
- ✅ Functional filter dropdown menu

### Phase 3
- ✅ AI Monitor: Daily token consumption (7 days) with cost calculation
- ✅ Organization users modal with subscription status
- ✅ Backend endpoint: GET /organizations/{org_id}/users
- ✅ Bulk operations: change plan, extend subscription
- ✅ Dashboard alerts for expiring/expired subscriptions
- ✅ Seat usage button showing used/total seats

## In Progress / To Do

### 1. Finance & Payments
- [ ] Show subscription plans per organization (Free/Pro/School)
- [ ] Display next billing date for active subscriptions
- [ ] Implement payment retry UI for failed payments
- [ ] Add revenue forecast based on active subs
- [ ] Show churn analysis (expiring subscriptions this month)

### 2. Organization Management
- [ ] Org activity timeline
- [ ] Subscription history per org
- [ ] Extended org statistics (token usage, activity patterns)

### 3. Advanced Search & Filtering
- [ ] Global search across teachers, orgs, payments
- [ ] Save filter presets
- [ ] Search by school, expiry date range, plan
- [ ] Date range filtering

### 4. System & Logs
- [ ] Searchable/filterable audit logs with date range
- [ ] Log export (PDF/CSV)
- [ ] System health dashboard (DB, API, background jobs)
- [ ] Admin activity timeline

### 5. Export & Reporting
- [ ] Export teachers with subscription info (CSV/DOCX with expires_at)
- [ ] Export organizations with seat usage
- [ ] Org billing report
- [ ] Monthly financial summary

### 6. Analytics & Insights
- [ ] Daily active users chart
- [ ] Plan distribution pie chart
- [ ] Revenue per plan breakdown
- [ ] Teacher churn rate

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

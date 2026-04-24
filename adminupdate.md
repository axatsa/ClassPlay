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

## Now Implementing — Final Push

### 1. Finance View — Show Real Subscription Data
- [ ] Add organization subscription plans to org list
- [ ] Show next billing/expiry date
- [ ] Color-coded status badges (Active/Expiring/Expired)
- [ ] Payment status summary
- [ ] Revenue per plan breakdown

### 2. Export Improvements
- [ ] Teachers export with subscription info (expires_at)
- [ ] Orgs export with seat usage percentage
- [ ] Payments with org subscription plans

### 3. Audit Logs Enhancements
- ✅ Add date range filter
- ✅ Add action type filter
- [ ] Add target filter (user/org/system)
- [ ] Show counts per action type
- [ ] Quick view modal for log details

### 4. Quick Analytics
- [ ] Plan distribution pie chart (Free/Pro/School counts)
- [ ] Subscription status summary (Active/Expiring/Expired)
- [ ] Payment status pie chart (Paid/Pending/Failed)
- [ ] Organizations by status pie chart

### 5. Teacher Search Improvements
- ✅ Search by school name
- ✅ Filter by expiry date range (Today, This week, This month, Expired)
- ✅ Combined filters working together

## Implementation Order (High → Low Impact)
1. ✨ Finance: Org subscription info display
2. 📊 Quick analytics charts (pie charts)
3. 📅 Date range filter for logs
4. 📤 Better exports (with subscription data)
5. 🔍 Advanced teacher search (by school, date range)

## Backend Status
- Teachers API ✅ returns plan, expires_at
- Orgs API ✅ returns expires_at, seat info
- Payments API ✅ functional
- Audit logs ✅ functional
- Daily tokens data — check if available
- Subscription plans — check if available per org

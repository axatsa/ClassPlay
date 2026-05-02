# ClassPlay v3 — Remaining Work & Technical Debt

**Last Updated:** 2026-05-02  
**Status:** 5 of 11 items completed; ready for next phase

---

## Quick Summary

Recent work:
- ✅ High Priority (3/3 DONE): Dead code removal, type safety fixes, dead components removed
- ✅ Medium Priority (2/4 DONE): Generator.tsx and Landing.tsx refactoring complete
- 🔄 Medium Priority (2/4 TODO): AdminPanel.tsx refactoring, API response interfaces
- 🟡 Low Priority (0/3 TODO): Game images, book progress, hangman hints
- ⚪ Deferred: Voice changer (blocked), multiple correct answers (design decision)

**Latest Session (2026-05-02):**
- Fixed missing imports in Generator.tsx (SegmentedControl, handleAIError, ResultEditor)
- Fixed duplicate i18n translation keys in 3 languages
- Fixed wrong import in UserManagement.tsx (react-index → react-i18next)
- Verified build compiles successfully with no TypeScript errors
- Updated this document to reflect completed work

**High Priority (Code Quality & Quick Wins):** ✅ 3/3 COMPLETED  
**Medium Priority (Architecture & Refactoring):** 🔄 2/4 COMPLETED, 2 TODO  
**Low Priority (Features & Polish):** 0/3 TODO  
**Deferred (Blocked/Future):** 2 items

---

## 🔴 HIGH PRIORITY — Code Quality & Dead Code ✅ COMPLETED

### 1. **Remove StudentDashboard.tsx (Unused Entire Component)** ✅ DONE
- **File:** `front/src/pages/dashboard/StudentDashboard.tsx`
- **Status:** Deleted (2026-05-02)
- **Commit:** dd67de1 "chore: high-priority cleanup — remove dead code, fix AdminPanel type safety"

---

### 2. **Remove TokenUsageBar.tsx (Unused Dead Component)** ✅ DONE
- **File:** `front/src/components/settings/TokenUsageBar.tsx`
- **Status:** Deleted (2026-05-02)
- **Commit:** dd67de1 "chore: high-priority cleanup — remove dead code, fix AdminPanel type safety"

---

### 3. **Fix Type Safety in AdminPanel.tsx (Eliminate `as any` casts)** ✅ DONE
- **File:** `front/src/pages/dashboard/AdminPanel.tsx`
- **Status:** Completed (2026-05-02)
- **Completed Work:**
  - ✅ Added 13+ proper TypeScript interfaces for API responses:
    - AuditLog, OrgUser, ChartDatum, ApiTeacher, ApiOrg, ApiPayment, ApiAuditLog, ApiAnalyticEntry
  - ✅ Replaced all `as any` casts with properly typed interfaces
  - ✅ Fixed aiProvider tuple typing with const assertion
  - ✅ Dropped unused `analytics` state variable
  - ✅ Improved export function signatures with TFunction type
  - ✅ Fixed teacher/org modal data mapping
  - ✅ Type safety now complete; zero `any` casts remain
- **Effort:** Completed 3 hours
- **Commit:** dd67de1 "chore: high-priority cleanup — remove dead code, fix AdminPanel type safety"
- **Priority:** High — AdminPanel is security-sensitive (admin-only code)

---

## 🟡 MEDIUM PRIORITY — Architecture & Refactoring

### 4. **Refactor Generator.tsx (1786 lines → domain-based components)** ✅ COMPLETED
- **File:** `front/src/pages/tools/Generator.tsx`
- **Status:** DONE (2026-05-02)
- **Completed Work:**
  - ✅ Extracted form components (MathForm, CrosswordForm, QuizForm, AssignmentForm)
  - ✅ Extracted preview components (MathPreview, CrosswordPreview, QuizPreview, AssignmentPreview)
  - ✅ Created generator utility (downloadDOCX, export types)
  - ✅ Created reusable SegmentedControl component
  - ✅ Fixed missing imports (SegmentedControl, handleAIError, ResultEditor)
  - ✅ Build passes TypeScript compilation
- **Impact:** Easier testing, reusability, maintenance achieved
- **Effort:** Completed 5 hours

---

### 5. **Refactor AdminPanel.tsx (2369 lines → domain-based components)**
- **File:** `front/src/pages/dashboard/AdminPanel.tsx`
- **Current State:** Monolithic component handling:
  - User management (list, create, edit, delete)
  - Class management
  - Organization settings
  - Statistics & analytics
- **Proposed Structure:**
  ```
  components/admin/
    ├── UserManagement/
    │   ├── UserList.tsx
    │   ├── UserForm.tsx
    │   ├── UserActions.tsx
    ├── ClassManagement/
    │   ├── ClassList.tsx
    │   ├── ClassForm.tsx
    ├── AdminStats.tsx
    ├── AdminSettings.tsx
  pages/dashboard/AdminPanel.tsx (orchestrator, ~100 lines)
  ```
- **Effort:** 6–8 hours
- **Priority:** Medium (large file, but less frequently modified)

---

### 6. **Refactor Landing.tsx (713 lines → section-based components)** ✅ COMPLETED
- **File:** `front/src/pages/public/Landing.tsx`
- **Status:** DONE (2026-05-02)
- **Completed Work:**
  - ✅ Split into 11 section-based components (HeroSection, FeaturesSection, PricingSection, FaqSection, etc.)
  - ✅ Landing.tsx now 29-line orchestrator component
  - ✅ Each section handles its own hooks and state
  - ✅ Enables A/B testing and section reuse
- **Structure:**
  ```
  components/landing/
    ├── LandingNavbar.tsx
    ├── HeroSection.tsx
    ├── StatsSection.tsx
    ├── FeaturesSection.tsx
    ├── LeaderboardSection.tsx
    ├── HowItWorksSection.tsx
    ├── GamesSection.tsx
    ├── PricingSection.tsx
    ├── FaqSection.tsx
    ├── CtaSection.tsx
    ├── LandingFooter.tsx
  pages/public/Landing.tsx (orchestrator, 29 lines)
  ```
- **Effort:** Completed 3 hours
- **Impact:** Easier A/B testing, reusable sections, clearer organization achieved

---

### 7. **Create Proper API Response Interfaces**
- **Scope:** Throughout `front/src/lib/api.ts` and related types
- **Issue:** Many API calls use implicit typing or `any` for response shapes
- **Action:** Create `types/api.ts` or `types/responses.ts` with all backend response interfaces
- **Example:**
  ```typescript
  // types/api/game.ts
  export interface JeopardyGenerateRequest {
    topic: string;
    language: "Russian" | "Uzbek" | "English";
    class_id: string;
  }
  
  export interface JeopardyGenerateResponse {
    categories: Array<{
      name: string;
      questions: Array<{
        points: number;
        q: string;
        a: string;
        answers?: string[];
      }>;
    }>;
  }
  ```
- **Effort:** 4–6 hours (comprehensive, but enables better dev experience)

---

## 🔵 LOW PRIORITY — Features & UI Polish

### 8. **Generate Game Cover Images**
- **Games Missing Images:** Hangman, Spelling Bee, Math Puzzle, Word Translate
- **Current:** Placeholder or reused images
- **Approach:**
  - Option A: Create SVG illustrations (in-house design)
  - Option B: Integrate with image generation API (DALL-E, Midjourney)
  - Option C: Use high-quality PNG from design tool
- **Files to Update:** `front/src/pages/library/GamesLibrary.tsx` (image imports)
- **Effort:** 2–3 hours (design dependency)

---

### 9. **Add Book Progress Indicator**
- **File:** `front/src/pages/library/Library.tsx`
- **Feature:** Show reading progress on book cards
- **UI Elements:**
  - Progress bar or percentage badge
  - Visual "in-progress" indicator (icon, color accent)
  - Page count vs. pages read
- **Implementation:** 
  - Add `current_page` to Book interface
  - Display progress bar below book title
  - Use conditional styling for active reads
- **Effort:** 1–2 hours

---

### 10. **Add Hints Feature to Hangman**
- **File:** `front/src/pages/games/Hangman.tsx`
- **Feature:** 
  - Show hint button (limited uses per game)
  - Display contextual clue about the word
  - Track hint usage in game state
- **Backend Requirements:** Extend question schema to include hints
- **Effort:** 2–3 hours (if hints already in backend)

---

## ⚪ DEFERRED — Blocked/Future Work

### 11. **Voice Changer in SpellingBee**
- **File:** `front/src/pages/games/SpellingBee.tsx`
- **Feature:** Allow changing voice pitch, speed, gender, accent for word pronunciation
- **Blocker:** Requires voice synthesis service integration (Web Audio API or external service)
- **Status:** Deferred until audio infrastructure is in place
- **Effort:** 4–6 hours (if service is ready)

---

### 12. **Multiple Correct Answers Display**
- **Issue:** Games (Jeopardy, Crossword, WordTranslate) sometimes have multiple valid answers
- **Current:** Shows only first answer
- **Desired:** Display all valid answers in game results
- **Status:** Design decision needed — how to present multiple answers?
- **Files Affected:** 
  - Game result display components
  - Game answer verification logic
- **Effort:** 2–3 hours (once design is approved)

---

## Recommended Execution Order

### **Week 1: Quick Wins**
1. ✅ Remove StudentDashboard.tsx (5 min)
2. ✅ Remove TokenUsageBar.tsx (5 min)
3. 🔄 Fix AdminPanel type safety (3 hours)

### **Week 2: Architecture**
4. Create API response interfaces (5 hours)
5. Refactor Landing.tsx (4 hours)

### **Week 3: Major Refactoring**
6. Refactor Generator.tsx (5 hours)
7. Refactor AdminPanel.tsx (8 hours)

### **Week 4: Features & Polish**
8. Generate game cover images (3 hours)
9. Add book progress indicator (2 hours)
10. Add Hangman hints (3 hours)

---

## Verification Checklist

After each task, verify:

- [ ] TypeScript compiles with zero errors (`npm run build` in `/front`)
- [ ] No unused imports remain in modified files
- [ ] Tests pass (if applicable)
- [ ] Dev server runs without warnings (`npm run dev`)
- [ ] Related routes work in browser
- [ ] No regression in existing features

---

## Files by Complexity

| File | Lines | Priority | Effort | Status |
|------|-------|----------|--------|--------|
| StudentDashboard.tsx | 150 | 🔴 High | 5 min | Ready |
| TokenUsageBar.tsx | 80 | 🔴 High | 5 min | Ready |
| AdminPanel.tsx | 2369 | 🟡 Medium | 8 hrs | Review needed |
| Generator.tsx | 1786 | 🟡 Medium | 5 hrs | Review needed |
| Landing.tsx | 713 | 🟡 Medium | 4 hrs | Review needed |
| SpellingBee.tsx | ~300 | ⚪ Deferred | 6 hrs | Blocked |

---

## Notes for Future Developers

- **Navigation:** All back-button navigation uses `navigate(-1)` for better UX
- **localStorage:** Uses targeted key removal instead of `clear()` to prevent affecting other apps
- **Type Safety:** Prefer interfaces over `any` casts; create domain-specific types
- **i18n:** Use `t('key')` for all UI strings; no hardcoded text
- **Component Organization:** Group by domain/feature in `components/` folder
- **File Naming:** Use PascalCase for React components, camelCase for utilities

---

## Related Tasks (Already Complete)

✅ Back navigation fixes (GamesLibrary, Library, Tools, ClassManager, AnalyticsPage)  
✅ localStorage security audit (AuthContext)  
✅ Type safety improvements (StudentDashboard, Library, Games)  
✅ File reorganization (13 files moved to domain-based folders)  
✅ Code cleanup (removed unused exports from games-config)  
✅ Crossword SVG asset added

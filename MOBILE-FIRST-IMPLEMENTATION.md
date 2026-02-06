# Mobile-First Implementation - Portal GenBI UNSIKA

## Overview

Implementasi mobile-first design untuk portal-genbi-unsika dengan fokus pada 80% pengguna mobile. Refactoring dilakukan secara sistematis untuk mengatasi dua masalah utama:

1. **Layout terlalu padat** - Perlu rebalancing spacing dan padding
2. **Font terlalu besar** - Menyebabkan layout berantakan di mobile

## Breakpoint System (Tailwind CSS)

```
sm: 640px  - Small tablets, large phones landscape
md: 768px  - Tablets
lg: 1024px - Desktop
```

## Pattern Mobile-First yang Diterapkan

### Typography Sizing

```css
/* Headings */
text-lg sm:text-xl md:text-2xl    /* H1 */
text-base sm:text-lg md:text-xl   /* H2 */
text-sm sm:text-base md:text-lg   /* H3 */

/* Body */
text-xs sm:text-sm                 /* Standard */
text-[10px] sm:text-xs            /* Very small */
```

### Spacing Pattern

```css
/* Padding */
p-2 sm:p-3 md:p-4          /* Compact */
p-3 sm:p-4 md:p-6          /* Standard */

/* Gaps */
gap-2 sm:gap-3 md:gap-4    /* Grid gaps */
space-y-3 sm:space-y-4     /* Vertical spacing */
```

### Grid Layouts

```css
/* Stats Grid - 2 col mobile, 4 col desktop */
grid-cols-2 md:grid-cols-4

/* Card Grid - 2 col mobile, 3-4 col desktop */
grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4

/* Form Fields */
grid sm:grid-cols-2
```

### Button Patterns

```css
/* Full width mobile, auto desktop */
w-full sm:w-auto

/* Stack mobile, row desktop */
flex flex-col-reverse sm:flex-row

/* Touch target minimum 44px */
p-2 sm:p-2.5 (with proper sizing)
```

### Navigation Patterns

```css
/* Horizontal scroll on mobile */
flex overflow-x-auto lg:flex-col lg:overflow-visible

/* Tab buttons */
flex-shrink-0 px-2.5 sm:px-3 py-2 sm:py-2.5
```

## Files Refactored

### Global Styles

- **`src/index.css`** - Mobile-first typography system, utility classes

### Layout

- **`src/shell/AppLayout.jsx`** - Main layout padding

### Pages

| File                  | Changes                                 |
| --------------------- | --------------------------------------- |
| `Dispensasi.jsx`      | Page header, form, history, admin stats |
| `Home.jsx`            | Hero card, stats grid, events, calendar |
| `Leaderboard.jsx`     | Header, stats, manage section           |
| `Profile.jsx`         | Tabs horizontal scroll, forms           |
| `Calendar.jsx`        | Navigation, search, event list          |
| `RekapitulasiKas.jsx` | Header, stats, search                   |
| `Anggota.jsx`         | Division grid, modal                    |
| `DivisionDetail.jsx`  | Member grid, modal                      |
| `Shortcuts.jsx`       | Page header                             |

### Components

| File               | Changes                 |
| ------------------ | ----------------------- |
| `DivisionCard.jsx` | Banner, content, action |
| `MemberCard.jsx`   | Image, content, badge   |

## CSS Utility Classes Added

```css
/* Page Container System */
.page-container { ... }
.page-header { ... }
.page-title { ... }
.page-subtitle { ... }

/* Stats */
.stat-value { ... }
.stat-label { ... }

/* Cards */
.card-grid { ... }
.card-compact { ... }

/* Filters */
.filter-chips { ... }
.filter-chip { ... }

/* Buttons */
.icon-btn { ... }
.action-group { ... }

/* Mobile Table */
.table-as-cards { ... }

/* Forms */
.form-compact { ... }
.section-compact { ... }
```

## Best Practices

1. **Start with mobile** - Base styles are for mobile, add `sm:`, `md:`, `lg:` for larger screens
2. **Touch targets** - Minimum 44x44px for interactive elements
3. **Text truncation** - Use `truncate` or `line-clamp-*` with `min-w-0`
4. **Safe areas** - Use `.safe-area-bottom` for notched devices
5. **Scrollable content** - Use `overflow-x-auto` for horizontal scroll on mobile

## Testing Checklist

- [ ] Test on 320px width (iPhone SE)
- [ ] Test on 375px width (iPhone 12/13)
- [ ] Test on 390px width (iPhone 14)
- [ ] Test on 768px width (iPad)
- [ ] Check touch target sizes
- [ ] Verify text readability
- [ ] Test horizontal scroll on tabs/filters
- [ ] Check modal display on mobile

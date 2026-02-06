# Typography Design System

## Overview

Portal GenBI Unsika menggunakan Typography Design System yang konsisten untuk memastikan sizing font yang seragam di semua device (mobile, tablet, desktop).

## Typography Classes

Semua class typography didefinisikan di `src/index.css` dan menggunakan pendekatan **mobile-first** dengan responsive scaling.

### Headings/Titles

| Class            | Mobile (base) | Tablet (640px+) | Desktop (1024px+) | Use Case                     |
| ---------------- | ------------- | --------------- | ----------------- | ---------------------------- |
| `.text-title-lg` | 20px          | 24px            | 28px              | Page titles, major headings  |
| `.text-title`    | 16px          | 18px            | 20px              | Section headers, card titles |
| `.text-title-sm` | 15px          | 16px            | 18px              | Subsection headers           |

### Body Text

| Class            | Mobile (base) | Tablet (640px+) | Desktop (1024px+) | Use Case                |
| ---------------- | ------------- | --------------- | ----------------- | ----------------------- |
| `.text-subtitle` | 13px          | 14px            | 16px              | Subtitles, descriptions |
| `.text-body`     | 14px          | 15px            | 16px              | Main body text          |
| `.text-body-sm`  | 13px          | 14px            | 15px              | Secondary body text     |

### Captions/Labels

| Class              | Mobile (base) | Tablet (640px+) | Desktop (1024px+) | Use Case                  |
| ------------------ | ------------- | --------------- | ----------------- | ------------------------- |
| `.text-caption`    | 12px          | 13px            | 14px              | Labels, badges, meta info |
| `.text-caption-sm` | 11px          | 12px            | 13px              | Small labels, timestamps  |

### Stats/Numbers

| Class           | Mobile (base) | Tablet (640px+) | Desktop (1024px+) | Use Case            |
| --------------- | ------------- | --------------- | ----------------- | ------------------- |
| `.text-stat`    | 24px          | 30px            | 36px              | Large stat numbers  |
| `.text-stat-sm` | 20px          | 24px            | 28px              | Medium stat numbers |

### Form Elements

| Class         | Mobile (base) | Tablet (640px+) | Desktop (1024px+) | Use Case              |
| ------------- | ------------- | --------------- | ----------------- | --------------------- |
| `.text-input` | 13px          | 14px            | 15px              | Input fields, selects |
| `.text-btn`   | 13px          | 14px            | 15px              | Button text           |

## Usage Examples

### Page Header

```jsx
<h1 className="text-title-lg font-bold text-neutral-900">Dashboard</h1>
<p className="text-subtitle text-neutral-500">Welcome back!</p>
```

### Card Component

```jsx
<div className="card">
  <h3 className="text-title font-semibold">Card Title</h3>
  <p className="text-body-sm text-neutral-600">Description here...</p>
  <span className="text-caption text-neutral-500">Meta info</span>
</div>
```

### Stat Card

```jsx
<div className="stat-card">
  <span className="text-caption text-neutral-500">Total Users</span>
  <span className="text-stat-sm font-bold text-neutral-900">1,234</span>
</div>
```

### Form Fields

```jsx
<label className="block text-caption-sm font-medium text-neutral-700">
  Email Address
</label>
<input className="text-input border rounded-lg px-3 py-2" />
<button className="text-btn font-medium bg-primary-600 text-white">
  Submit
</button>
```

## Migration Guide

### Old Patterns → New Classes

| Old Pattern                      | New Class                      |
| -------------------------------- | ------------------------------ |
| `text-[9px] sm:text-xs`          | `text-caption-sm`              |
| `text-[10px] sm:text-xs`         | `text-caption-sm`              |
| `text-[11px] sm:text-sm`         | `text-caption`                 |
| `text-[12px] sm:text-sm`         | `text-caption`                 |
| `text-[13px] sm:text-base`       | `text-body-sm`                 |
| `text-xs sm:text-sm`             | `text-caption` or `text-btn`   |
| `text-sm sm:text-base`           | `text-body` or `text-subtitle` |
| `text-base sm:text-lg`           | `text-title`                   |
| `text-lg sm:text-xl md:text-2xl` | `text-title-lg`                |

### Placeholder Text

Use `placeholder:text-caption-sm` instead of `placeholder:text-[10px] placeholder:sm:text-xs`.

## Files Updated

The typography system has been applied to:

- ✅ `index.css` - Typography class definitions
- ✅ `Home.jsx` - Dashboard page
- ✅ `Profile.jsx` - Profile page with InputField, SelectField, InfoCard
- ✅ `Leaderboard.jsx` - Leaderboard and tracker detail
- ✅ `Dispensasi.jsx` - Dispensation request page
- ✅ `Calendar.jsx` - Event calendar
- ✅ `RekapitulasiKas.jsx` - Treasury recap
- ✅ `DivisionDetail.jsx` - Division detail page
- ✅ `DivisionCard.jsx` - Division card component
- ✅ `MemberCard.jsx` - Member card component
- ✅ `Modal.jsx` - Modal component

## Best Practices

1. **Always use semantic classes** - Use `text-title`, `text-body`, `text-caption` instead of arbitrary values
2. **Mobile-first** - Classes are optimized for mobile, scaling up for larger screens
3. **Consistency** - Use the same class for the same type of content across pages
4. **No arbitrary pixel values** - Avoid `text-[Xpx]` patterns, use design system classes instead

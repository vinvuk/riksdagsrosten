# Riksdagsrösten Design System

This document defines the visual language and component patterns used throughout the application.

## Foundation

### Color Palette

We use Tailwind's zinc scale as our neutral palette, with semantic colors for vote outcomes.

#### Neutrals (Zinc)

| Token | Light | Dark | Usage |
|-------|-------|------|-------|
| `zinc-50` | Background hover | - | List item hover |
| `zinc-100` | Background subtle | - | Desktop app background |
| `zinc-200` | Border light | - | Card borders, dividers |
| `zinc-400` | Text muted | Text muted | Icons, metadata |
| `zinc-500` | Text secondary | Text secondary | Sublabels |
| `zinc-700` | Text primary | - | Headings |
| `zinc-800` | - | Background hover | Dark mode hover |
| `zinc-900` | Text primary | Background | Main content area |
| `zinc-950` | - | Desktop background | Outer shell |

#### Semantic Colors

| Purpose | Color | Light Class | Dark Class |
|---------|-------|-------------|------------|
| **Yes/Bifall** | Emerald | `text-emerald-600`, `bg-emerald-500` | `text-emerald-400` |
| **No/Avslag** | Red | `text-red-600`, `bg-red-500` | `text-red-400` |
| **Abstain/Avstår** | Amber | `text-amber-600`, `bg-amber-400` | `text-amber-400` |
| **Absent/Frånvarande** | Zinc | `bg-zinc-300` | `bg-zinc-600` |
| **Links** | Blue | `text-blue-600` | `text-blue-400` |
| **Active tab** | Blue | `border-blue-500`, `text-blue-600` | `border-blue-400`, `text-blue-400` |

#### Party Colors

Defined in `src/lib/constants.ts`:

| Code | Party | Hex | Text |
|------|-------|-----|------|
| S | Socialdemokraterna | `#E8112D` | white |
| M | Moderaterna | `#52BDEC` | gray-900 |
| SD | Sverigedemokraterna | `#DDDD00` | gray-900 |
| KD | Kristdemokraterna | `#000077` | white |
| L | Liberalerna | `#006AB3` | white |
| C | Centerpartiet | `#009933` | white |
| MP | Miljöpartiet | `#83CF39` | gray-900 |
| V | Vänsterpartiet | `#DA291C` | white |

### Typography

Using Geist font family (sans-serif).

| Element | Classes |
|---------|---------|
| Page heading | `text-2xl font-bold` |
| Section heading | `text-lg font-semibold` |
| Card title | `text-sm font-semibold` or `text-sm/6 font-semibold` |
| Body text | `text-sm` |
| Metadata | `text-xs` or `text-xs/5` |
| Stats number | `text-xl font-semibold` or `text-2xl font-semibold` |

### Spacing

Using Tailwind's default spacing scale. Common patterns:

| Context | Value | Class |
|---------|-------|-------|
| Page padding | 32px | `px-4 py-8 sm:px-6 lg:px-8` |
| Section gap | 32px | `mt-8` |
| Card padding | 16px / 24px | `p-4` / `p-6` |
| List item padding | 16px | `px-4 py-4` |
| Component gap | 16px | `gap-4` |
| Inline gap | 8px | `gap-2` |

### Border Radius

| Element | Value | Class |
|---------|-------|-------|
| Cards, lists | 8px | `rounded-lg` |
| Sidebar items | 6px | `rounded-md` |
| Badges, pills | Full | `rounded-full` |
| Buttons | 6px | `rounded-md` |

---

## Components

### Cards (Stats)

```tsx
<div className="rounded-lg bg-white dark:bg-zinc-900 p-4 ring-1 ring-zinc-200 dark:ring-zinc-700">
  <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Label</p>
  <p className="mt-1 text-xl font-semibold text-zinc-900 dark:text-zinc-100">
    Value
  </p>
</div>
```

Grid: `grid grid-cols-2 gap-4 sm:grid-cols-4` or `sm:grid-cols-5`

### Lists (Stacked)

```tsx
<ul role="list" className="divide-y divide-zinc-100 dark:divide-zinc-800 rounded-lg ring-1 ring-zinc-200 dark:ring-zinc-700 overflow-hidden">
  <li>
    <Link className="flex items-center gap-x-4 bg-white dark:bg-zinc-900 px-4 py-4 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
      {/* Content */}
      <ChevronRight className="size-5 flex-none text-zinc-400 dark:text-zinc-500" />
    </Link>
  </li>
</ul>
```

### Badges

#### Status Badge (Vote Outcome)

```tsx
<span className={cn(
  "inline-flex items-center gap-x-1.5 rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset",
  // Bifall
  "bg-emerald-500/10 text-emerald-700 ring-emerald-500/20 dark:text-emerald-400",
  // Avslag
  "bg-red-500/10 text-red-700 ring-red-500/20 dark:text-red-400",
  // Avstår
  "bg-amber-500/10 text-amber-700 ring-amber-500/20 dark:text-amber-400"
)}>
  <svg className="size-1.5 fill-current"><circle r={3} cx={3} cy={3} /></svg>
  Label
</span>
```

#### Filter Pill (Active/Inactive)

```tsx
// Active
<button className="inline-flex items-center justify-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium shrink-0 transition-colors ring-1 ring-inset bg-blue-600 text-white ring-blue-600 hover:bg-blue-500">

// Inactive
<button className="... bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 ring-zinc-300 dark:ring-zinc-600 hover:bg-zinc-50 dark:hover:bg-zinc-800">
```

### Buttons

#### Secondary (Pagination)

```tsx
<button className={cn(
  "inline-flex items-center gap-1 rounded-md px-3 py-1.5 text-sm font-medium",
  "ring-1 ring-inset ring-zinc-300 dark:ring-zinc-600",
  "text-zinc-700 dark:text-zinc-300",
  "hover:bg-zinc-50 dark:hover:bg-zinc-800",
  "disabled:opacity-50 disabled:cursor-not-allowed"
)}>
```

### Back Link

```tsx
<Link
  href="/parent"
  className="inline-flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 hover:underline mb-6"
>
  <ArrowLeft className="size-4" />
  Back label
</Link>
```

### Tabs (Underline)

```tsx
<div className="border-b border-zinc-200 dark:border-zinc-700">
  <nav className="-mb-px flex space-x-8">
    <button className={cn(
      "flex border-b-2 px-1 py-4 text-sm font-medium whitespace-nowrap",
      isActive
        ? "border-blue-500 text-blue-600 dark:border-blue-400 dark:text-blue-400"
        : "border-transparent text-zinc-500 dark:text-zinc-400 hover:border-zinc-200 dark:hover:border-zinc-600"
    )}>
      Tab Label
      <span className={cn(
        "ml-3 rounded-full px-2.5 py-0.5 text-xs font-medium",
        isActive
          ? "bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400"
          : "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-300"
      )}>
        Count
      </span>
    </button>
  </nav>
</div>
```

### Input with Icon

```tsx
<InputGroup>
  <Search data-slot="icon" />
  <Input
    type="search"
    placeholder="Sök..."
    value={query}
    onChange={(e) => setQuery(e.target.value)}
  />
</InputGroup>
```

### Pagination

Use `ClientPagination` component for all client-side paginated lists:

```tsx
<ClientPagination
  currentPage={page}
  totalPages={totalPages}
  totalItems={items.length}
  itemsPerPage={ITEMS_PER_PAGE}
  onPageChange={setPage}
  className="mt-4"
/>
```

Standard items per page: **20** (votes), **25** (members)

---

## Layout

### Sidebar

Dark background (`bg-zinc-900`) with light text. Uses Catalyst sidebar primitives:

- `Sidebar` → flex column container
- `SidebarHeader` → h-16 logo area
- `SidebarBody` → scrollable nav
- `SidebarSection` → grouped items
- `SidebarHeading` → section label
- `SidebarList` → ul wrapper
- `SidebarItem` → nav link (rounded-md, px-3 py-2, font-semibold)
- `SidebarSpacer` → pushes content to bottom
- `SidebarFooter` → bottom section with border-t

### Main Content

- Desktop: `lg:pl-72` offset for fixed sidebar
- Content wrapper: `bg-white dark:bg-zinc-900 lg:rounded-lg`
- Page padding: `px-4 py-8 sm:px-6 lg:px-8`

### Mobile

- Sidebar becomes HeadlessUI Dialog drawer
- Top navbar with hamburger menu
- Search icon links to /sok or opens ⌘K

---

## Dark Mode

Controlled via `data-theme` attribute on `<html>`:

```tsx
// Toggle implementation
document.documentElement.setAttribute("data-theme", theme);
localStorage.setItem("theme", theme);
```

Pattern: Always define both light and dark variants:

```tsx
className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100"
```

---

## Icons

Using **Lucide React**. Standard sizes:

| Context | Size | Class |
|---------|------|-------|
| Navigation | 24px | `size-6` |
| Inline | 20px | `size-5` |
| Small | 16px | `size-4` |

Common icons:
- `Home`, `Users`, `Vote`, `Landmark`, `BookOpen` - navigation
- `Search`, `ChevronRight`, `ChevronLeft`, `ArrowLeft` - UI
- `MapPin`, `Calendar`, `Info` - metadata

---

## File Structure

```
src/components/
├── ui/                    # Base UI primitives
│   ├── Sidebar.tsx        # Sidebar components
│   ├── SidebarLayout.tsx  # Responsive layout
│   ├── Navbar.tsx         # Mobile navbar
│   ├── ClientPagination.tsx
│   ├── Pagination.tsx     # URL-based (unused)
│   └── ThemeToggle.tsx
├── catalyst/              # Catalyst UI Kit
│   ├── input.tsx
│   ├── select.tsx
│   ├── badge.tsx
│   └── ...
├── layout/
│   └── AppShell.tsx       # Main app wrapper
├── vote/                  # Vote-specific
│   ├── VoteResultBar.tsx
│   ├── VoteOutcomeBadge.tsx
│   └── VoteExplorerClient.tsx
├── mp/                    # Member-specific
│   ├── PortraitImage.tsx
│   ├── MpVoteHistory.tsx
│   └── LedamoterClient.tsx
├── party/
│   └── PartyBadge.tsx
└── search/
    └── CommandPalette.tsx
```

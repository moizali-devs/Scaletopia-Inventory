---
name: upgrade-dashboard-with-framer-motion
description: Procedure for upgrading a dashboard hand-built with custom SVG charts to use framer-motion with scroll-triggered animations, interactive tooltips, and spring-powered transitions.
source: auto-skill
extracted_at: '2026-06-25T12:13:40.735Z'
---

# Upgrade Dashboard with Framer Motion

When upgrading an existing dashboard (custom SVG charts, CSS-only animations) to use framer-motion for richer interactivity and spring physics.

## Install

```bash
npm install framer-motion
```

**Critical:** Import from `'framer-motion'` — NOT `'motion/react'`:
```tsx
import { motion, AnimatePresence, useInView } from "framer-motion";
```

## Scroll-Triggered Animations

Use `useInView` for elements to animate when they enter the viewport:

```tsx
import { motion, useInView } from "framer-motion";
import { useRef } from "react";

function MyComponent() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-20px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 16 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
    >
      {children}
    </motion.div>
  );
}
```

### Staggered Children

Add incremental delays based on index:
```tsx
items.map((item, i) => (
  <motion.div
    key={item.id}
    initial={{ opacity: 0, x: -8 }}
    animate={isInView ? { opacity: 1, x: 0 } : {}}
    transition={{ delay: 0.05 + i * 0.04, duration: 0.3 }}
  />
))
```

## Wrapping Non-Motion Components

**Gotcha:** shadcn/ui components (like `Card`) are regular React components — they do NOT accept framer-motion props (`initial`, `animate`, `transition`).

✅ **Correct** — Wrap with motion.div:
```tsx
<motion.div ref={ref} initial={{ opacity: 0 }} animate={isInView ? { opacity: 1 } : {}}>
  <Card className="...">content</Card>
</motion.div>
```

❌ **Wrong** — Pass motion props directly to `Card`:
```tsx
<Card initial={{ opacity: 0 }} animate={{ opacity: 1 }}> {/* TS error */}
```

## SVG Chart Upgrades

### AreaChart — Interactive Tooltips

Use `AnimatePresence` for smooth tooltip enter/exit:
```tsx
const [tooltip, setTooltip] = useState<TooltipData | null>(null);

// In SVG dots:
<motion.g onMouseEnter={(e) => handleDotHover(pt, i, color, e)} onMouseLeave={() => setTooltip(null)}>
  <circle cx={d.x} cy={d.y} r="1.5" />
</motion.g>

// Tooltip overlay:
<AnimatePresence>
  {tooltip && (
    <motion.div
      initial={{ opacity: 0, y: 4, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 4, scale: 0.95 }}
      transition={{ duration: 0.15 }}
      style={{ left: tooltip.x, top: tooltip.y - 60 }}
    >
      <div className="rounded-lg border bg-card px-3 py-2 shadow-lg">{/* tooltip content */}</div>
    </motion.div>
  )}
</AnimatePresence>
```

### BarChart — Grow Animation

```tsx
<motion.div
  style={{ height: `${heightPct}%`, transformOrigin: "bottom" }}
  initial={isInView ? { scaleY: 0, opacity: 0 } : {}}
  animate={isInView ? { scaleY: 1, opacity: 1 } : {}}
  transition={{ delay: 0.2 + i * 0.08, duration: 0.5, ease: [0.25, 1, 0.5, 1] }}
  whileHover={{ scaleY: 1.05, boxShadow: `0 0 20px ${GLOW_COLOR}60` }}
/>
```

### DonutChart — Slice Draw

```tsx
<motion.circle
  strokeDasharray={`${s.dash} ${CIRC - s.dash}`}
  initial={{ strokeDasharray: `0 ${CIRC}`, opacity: 0 }}
  animate={isInView ? { strokeDasharray: `${s.dash} ${CIRC - s.dash}`, opacity: 1 } : {}}
  transition={{ delay: 0.2 + i * 0.1, duration: 0.6 }}
/>
```

## SVG Event Handling

**Gotcha:** When handling hover on SVG elements, `e.currentTarget` typing differs from JSX elements.

For tooltip positioning in SVG, get the SVG rect from the event target:
```tsx
const handleDotHover = useCallback(
  (_pt: ChartPoint, idx: number, _color: string, e: React.MouseEvent) => {
    const target = e.target as SVGElement | null;
    const svgEl = target?.ownerSVGElement;
    if (svgEl) {
      const rect = svgEl.getBoundingClientRect();
      const leftPos = (coords[idx].x / 100) * rect.width;
      // ...
    }
  },
  [...],
);
```

## Active Indicator with Layout Animation

Use `layoutId` for smooth active state transitions in navigation:
```tsx
{active ? (
  <motion.span
    layoutId="sidebar-active-indicator"
    className="absolute left-0 h-4 w-1 rounded-full bg-stamp"
    transition={{ type: "spring", stiffness: 300, damping: 30 }}
  />
) : null}
```

## CSS Animation Additions

When adding new `@keyframes`, avoid CSS `@property` rules (Houdini) — they are not well-supported and can break Tailwind v4 builds.

Standard keyframes work fine:
```css
@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
```

## Hover Lift Utility

```css
.hover-lift {
  transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.2s ease;
}
.hover-lift:hover {
  transform: translateY(-2px);
  box-shadow: var(--card-shadow-hover);
}
```

## Spring Physics Best Practices

- **Entry animations**: `{ type: "spring", stiffness: 300, damping: 25 }`
- **Icon hover**: `{ type: "spring", stiffness: 400, damping: 20 }`
- **Small elements**: `{ type: "spring", stiffness: 400, damping: 25 }`
- **Layout shifts**: `{ type: "spring", stiffness: 300, damping: 30 }`

## Type Checking

Always verify with `npx tsc --noEmit` after changes. Common issues to watch:
- `motion/react` → `framer-motion` (import path)
- Card/div components receiving framer-motion props (must be motion.div or motion component)
- SVG event typing (`e.target as SVGElement` vs e.currentTarget)
- CSS color variable names — verify they match `:root` definitions (e.g., `--ink-mute` not `--ink-muted`)

# Hobort Auto Parts Express (HAPE) - Gravity Build

## 🚀 Project Overview
HAPE is a Next.js application built on the **Gravity** boilerplate (Wireframe Mode). It solves the auto parts supply chain issue in Ghana by providing a transparent "Request for Quote" platform.

**Current State:** 🚧 **Wireframe Mode** (UI/UX only, Database disabled).

## 🎨 Design System
* **Font:** `Inter` (Google Fonts)
* **Primary Colors:**
    * Orange: `#fe8323` (Buttons, Active States)
    * Blue: `#1b4e6f` (Nav, Headings, Primary Text)
* **Icons:** `lucide-react` (Stroke width: 1.5px)

## 🛠 Tech Stack
* **Framework:** Next.js 15+ (App Router)
* **React Compiler:** Enabled and Configured
* **Styling:** Tailwind CSS 4 (Theme-first)
* **Icons:** Lucide React

## 📂 Project Architecture
/src
  /app
    (marketing)      # Public pages (Home, About, Services, Quote)
    (dashboard)      # Auth pages (Dashboard, Agent, Track)
  /components
    /ui              # Primitives (ResponsiveModal, Button)
    /marketing       # Layout components (Navbar, Footer)
  /lib
    /mock-data.ts    # JSON constants for Wireframing
    /utils.ts        # cn() helper
  /hooks
    /use-media-query.ts # Device detection

## 🧩 Key Features
1. **Responsive Sourcing Wizard:** A 3-step form for VIN and part details.
2. **Dual-Device Modal:** Adapts between Dialog (Desktop) and Drawer (Mobile).
3. **Agent Portal:** High-density table (MSC style) for B2B fleet management.
4. **Order Tracking:** Visual timeline modeled after CH Robinson.

## 🏃 Run Development
```bash
cd hape
npm install
npm run dev
```

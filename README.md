# 🗾 日本オタクショップマップ — Japan Otaku Map

<div align="center">

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178C6?logo=typescript)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite)](https://vite.dev)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4-06B6D4?logo=tailwindcss)](https://tailwindcss.com)
[![Leaflet](https://img.shields.io/badge/Leaflet-1.9-199900?logo=leaflet)](https://leafletjs.com)

**An interactive pilgrimage map for anime & otaku shops across Japan — explore, filter, and plan your next 聖地巡礼.**

[🌐 Live Demo](https://9dk9jptv8h-hue.github.io/japan-otaku-map/) &nbsp;|&nbsp; [🐛 Report Bug](https://github.com/9dk9jptv8h-hue/japan-otaku-map/issues) &nbsp;|&nbsp; [✨ Request Feature](https://github.com/9dk9jptv8h-hue/japan-otaku-map/issues)

</div>

---

## 📖 About

Japan Otaku Map is a beautifully crafted, interactive web application that maps over **50+ anime and otaku specialty shops** across Japan. Whether you are planning an アニメ聖地巡礼 (anime pilgrimage) or just browsing, this tool helps you discover iconic stores like **Animate**, **Melonbooks**, and **Mandarake** across every region — from Hokkaido to Okinawa.

Each location includes real ratings, visit counts, addresses, and city photography sourced from Wikipedia — making it a practical travel companion as well as a visual delight.

### Why This Exists

For anime fans visiting Japan, finding the best otaku shops can be overwhelming. Google Maps lists shops but lacks the curated, fan-focused context. This project brings together:

- **Curated data** — Tiered rankings based on real Google Maps reviews and store significance
- **Cultural aesthetic** — Sumi-e ink wash, sakura petals, and hanko stamp design language
- **Multiple store chains** — Animate, Melonbooks, and Mandarake, each color-coded
- **Bilingual support** — Japanese shop names with English transliterations

---

## 📸 Screenshots

<div align="center">

### Welcome Screen
<img src="https://raw.githubusercontent.com/9dk9jptv8h-hue/japan-otaku-map/master/public/screenshots/welcome-screen.png" alt="Japan Otaku Map Welcome Screen" width="640">

*Anime-inspired welcome screen with sakura petals, sumi-e ink aesthetics, and hanko stamps*

### Interactive Map
<img src="https://raw.githubusercontent.com/9dk9jptv8h-hue/japan-otaku-map/master/public/screenshots/map-interface.png" alt="Japan Otaku Map Interface" width="640">

*Full interactive map with custom markers, filtering sidebar, and dark/light theme support*

</div>

---

## ✨ Features

| Category | Details |
|----------|---------|
| 🗺️ **Interactive Map** | Full Japan coverage via Leaflet with Bing Maps tile layer, zoom-to-city, and custom animated markers |
| 🎨 **Anime-Style Welcome Screen** | Sakura petal animations, sumi-e ink-wash background, Japanese map silhouette, hanko stamps |
| 🌓 **Dark / Light Theme** | Persisted theme preference, automatically adapts welcome screen and map tiles |
| 🔍 **Search & Filter** | Full-text search across name, description, tags, and address; filter by store chain |
| 📊 **Smart Sorting** | Sort by rating, name, most recent, or visit count |
| 🏬 **Three Store Categories** | Animate (pink), Melonbooks (teal), Mandarake (orange) — each with distinct markers |
| 🖼️ **City Photography** | Wikipedia-sourced city photos in location cards for visual context |
| 📱 **Responsive Design** | Collapsible sidebar, mobile-friendly drawer, works from desktop to phone |
| ⚡ **Performance** | Zustand state management, lazy loading, GPU-accelerated CSS animations |
| 🌐 **GitHub Pages Ready** | Pre-configured `base` path for instant deployment |

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|------------|
| **Framework** | [React 19](https://react.dev) with functional components & hooks |
| **Language** | [TypeScript 6](https://www.typescriptlang.org) — strict mode |
| **Build Tool** | [Vite 8](https://vite.dev) — sub-second HMR |
| **Styling** | [TailwindCSS 4](https://tailwindcss.com) — utility-first, dark mode |
| **Map Engine** | [Leaflet 1.9](https://leafletjs.com) + [react-leaflet 5](https://react-leaflet.js.org) |
| **Map Tiles** | Bing Maps (leaflet-bing-layer) |
| **State** | [Zustand 5](https://zustand.docs.pmnd.rs) — lightweight, persisted |
| **Icons** | [Lucide React](https://lucide.dev) |
| **Font** | Noto Sans SC (Google Fonts) |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** >= 18
- **npm** >= 9

### Installation

```bash
# Clone the repository
git clone git@github.com:9dk9jptv8h-hue/japan-otaku-map.git
cd japan-otaku-map

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:5173/japan-otaku-map/](http://localhost:5173/japan-otaku-map/) in your browser.

### Build for Production

```bash
npm run build
npm run preview
```

The production build outputs to the `dist/` directory.

---

## 📁 Project Structure

```
src/
├── components/
│   ├── layout/          # AppShell, sidebar, header
│   ├── map/             # Map container, markers, popups
│   ├── sidebar/         # Filter panel, location cards
│   ├── shared/          # Shared UI components
│   └── ui/              # ErrorBoundary, buttons, etc.
├── constants/
│   ├── mockData.ts      # 50+ curated shop locations
│   ├── mapDefaults.ts   # Map center, zoom, tile config
│   └── theme.ts         # Category colors & metadata
├── hooks/               # useDebounce, useMediaQuery, useTheme
├── store/               # Zustand stores (UI, filter, map)
│   ├── useUIStore.ts    # Sidebar, theme (persisted)
│   ├── useFilterStore.ts # Search, category filter, sort
│   └── useMapStore.ts   # Viewport, selected location
├── types/               # TypeScript type definitions
├── utils/
│   ├── markers.ts       # Custom Leaflet icon factory
│   ├── city-photo.ts    # Wikipedia city photo mapping
│   └── bing-tiles.ts    # Bing Maps tile configuration
├── App.tsx              # Root component + Welcome Screen
├── main.tsx             # Entry point
└── index.css            # Global styles + animations
```

---

## 🎨 Design Philosophy

The UI draws from traditional Japanese aesthetics:

- **水墨 (Sumi-e)** — Ink wash gradients and subtle textures create depth without clutter
- **桜 (Sakura)** — Falling cherry blossom petals on the welcome screen evoke the transient beauty of もののあはれ
- **判子 (Hanko)** — Stamp-style category badges mimic the personal seals used across Japan
- **和紙 (Washi)** — Subtle paper-texture overlay adds warmth and tactility

The welcome screen is an intentional "loading experience" — treating the initial load as a moment of visual delight rather than a spinner.

---

## 📊 Data Sources

Shop data is curated from:

- [Animate Official Shop List](https://www.animate.co.jp/shop/)
- Google Maps ratings & review counts
- Wikipedia (city photography, CC-licensed)

The dataset is currently **mock data** (`src/constants/mockData.ts`). Real data integration (Supabase / headless CMS) is planned for future releases.

---

## 🗺️ Roadmap

- [ ] Real-time data via Supabase / PostgreSQL
- [ ] User-submitted shop reviews & photos
- [ ] Multi-language i18n (EN / 中文 / 日本語 / 한국어)
- [ ] Route planning between shops
- [ ] PWA offline support
- [ ] Shop inventory & event calendar integration
- [ ] Community-editable wiki for each location

---

## 🤝 Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on:

- Reporting bugs
- Suggesting features
- Submitting pull requests
- Development workflow

---

## 📄 License

This project is licensed under the MIT License — see [LICENSE](LICENSE) for details.

---

<div align="center">

Made with ❤️ by otaku, for otaku.

*アニメは国境を越える — Anime transcends borders*

</div>

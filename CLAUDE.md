# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Personal portfolio website for Mohammed Shahin Kamarudeen (Software Engineer at Microsoft). Built with vanilla HTML, CSS, and JavaScript - no frameworks, build tools, or package managers.

## Development

**No build process required.** Edit files directly and view in browser.

To develop locally, open `index.html` in a browser or use any static file server:
```bash
python3 -m http.server 8000
# or
npx serve .
```

## Architecture

**Three-file structure:**
- `index.html` - Complete page markup with semantic HTML5
- `styles.css` - All styling with CSS custom properties for theming
- `script.js` - Client-side interactivity and animations

### Theme System

CSS variables define 4 theme palettes (Classic, Modern, Creative, Zen). The Zen theme is currently active. Theme variables are defined at the top of `styles.css` under `:root`.

### JavaScript Features

- **Custom cursor**: Disabled automatically on touch devices
- **Particle system**: Animated background particles using requestAnimationFrame
- **Scroll animations**: IntersectionObserver for fade-in effects
- **Pun generator**: Cycling programming puns in the footer
- **Konami code easter egg**: ↑↑↓↓←→←→BA triggers rainbow animation

### Responsive Breakpoints

- Desktop: default
- Tablet: 1024px
- Mobile: 768px
- Small mobile: 480px

## Deployment

Deploy as-is to any static hosting (GitHub Pages, Netlify, Vercel). No build step needed.

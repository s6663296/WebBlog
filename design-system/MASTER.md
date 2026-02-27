# Nebula Notes Design System

## Product Direction

- Product type: Personal blog + portfolio + admin CMS
- Style: Modern dark cinematic glassmorphism
- Tone: Technical, clean, high-contrast, interactive

## Color Tokens

- Background: `#05060D`
- Surface: `#0C1020`
- Surface soft: `#10182E`
- Primary text: `#E6ECFF`
- Secondary text: `#9AA8D1`
- Accent: `#67E8F9`
- Accent strong: `#22D3EE`

## Typography

- Heading: `Space Grotesk`
- Body: `Noto Sans TC`

## Core UI Patterns

- Floating frosted navigation with full keyboard focus states
- Glass cards with subtle border + blur for content grouping
- Animated ambient orbs and pointer spotlight
- Motion reveal effects with reduced motion fallback

## Accessibility Rules Applied

- Body font size >= 16px on mobile
- Focus ring on interactive controls
- Cursor pointer on actionable controls
- Reduced-motion support via `prefers-reduced-motion`
- Form labels explicitly bound by `htmlFor`

## Admin UX Principles

- Clear section hierarchy (dashboard, posts, profile)
- Inline validation feedback via error states
- Submit buttons disable during pending state
- Minimal friction post editing with markdown support

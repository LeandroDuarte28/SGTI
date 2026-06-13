import type { Config } from "tailwindcss";

const config: Config = {
  // ─── Content sources ──────────────────────────────────────────────────────
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
    "./hooks/**/*.{ts,tsx}",
  ],

  // ─── Dark mode ────────────────────────────────────────────────────────────
  darkMode: ["class"],

  theme: {
    extend: {
      // ─── SGTI Corporate Color System ────────────────────────────────────
      // All colors map to CSS variables defined in globals.css.
      // This enables shadcn/ui compatibility and theming via next-themes.
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",

        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",

        // ── Chart colors (dashboards) ────────────────────────────────────
        chart: {
          "1": "hsl(var(--chart-1))",
          "2": "hsl(var(--chart-2))",
          "3": "hsl(var(--chart-3))",
          "4": "hsl(var(--chart-4))",
          "5": "hsl(var(--chart-5))",
        },

        // ── Sidebar ──────────────────────────────────────────────────────
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },

        // ── ITIL Priority / Status semantic colors ──────────────────────
        priority: {
          critical: "hsl(var(--priority-critical))",
          high: "hsl(var(--priority-high))",
          medium: "hsl(var(--priority-medium))",
          low: "hsl(var(--priority-low))",
        },
        status: {
          open: "hsl(var(--status-open))",
          "in-progress": "hsl(var(--status-in-progress))",
          resolved: "hsl(var(--status-resolved))",
          closed: "hsl(var(--status-closed))",
          pending: "hsl(var(--status-pending))",
        },
        sla: {
          ok: "hsl(var(--sla-ok))",
          warning: "hsl(var(--sla-warning))",
          breach: "hsl(var(--sla-breach))",
        },
      },

      // ─── Border Radius ─────────────────────────────────────────────────
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },

      // ─── Typography ────────────────────────────────────────────────────
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },

      // ─── Animations ────────────────────────────────────────────────────
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-in": {
          from: { opacity: "0", transform: "translateY(4px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "slide-in-right": {
          from: { transform: "translateX(100%)" },
          to: { transform: "translateX(0)" },
        },
        pulse: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.5" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.2s ease-out",
        "slide-in-right": "slide-in-right 0.3s ease-out",
      },

      // ─── Spacing extras ────────────────────────────────────────────────
      spacing: {
        "sidebar-width": "var(--sidebar-width)",
        "sidebar-collapsed": "var(--sidebar-width-icon)",
      },

      // ─── Z-index ───────────────────────────────────────────────────────
      zIndex: {
        sidebar: "40",
        header: "50",
        modal: "100",
        toast: "200",
      },
    },
  },

  plugins: [],
};

export default config;

import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          foreground: "var(--secondary-foreground)",
        },
        destructive: {
          DEFAULT: "var(--destructive)",
          foreground: "var(--destructive-foreground)",
        },
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          foreground: "var(--accent-foreground)",
        },
        popover: {
          DEFAULT: "var(--popover)",
          foreground: "var(--popover-foreground)",
        },
        card: {
          DEFAULT: "var(--card)",
          foreground: "var(--card-foreground)",
        },
        chart: {
          "1": "var(--chart-1)",
          "2": "var(--chart-2)",
          "3": "var(--chart-3)",
          "4": "var(--chart-4)",
          "5": "var(--chart-5)",
        },
        brand: {
          50: "var(--brand-50)",
          100: "var(--brand-100)",
          500: "var(--brand-500)",
          600: "var(--brand-600)",
          700: "var(--brand-700)",
          foreground: "var(--brand-foreground)",
        },
        gold: {
          500: "var(--gold-500)",
          foreground: "var(--gold-foreground)",
        },
        status: {
          lost: {
            DEFAULT: "var(--status-lost-bg)",
            fg: "var(--status-lost-fg)",
            border: "var(--status-lost-border)",
          },
          found: {
            DEFAULT: "var(--status-found-bg)",
            fg: "var(--status-found-fg)",
            border: "var(--status-found-border)",
          },
          pending: {
            DEFAULT: "var(--status-pending-bg)",
            fg: "var(--status-pending-fg)",
            border: "var(--status-pending-border)",
          },
          approved: {
            DEFAULT: "var(--status-approved-bg)",
            fg: "var(--status-approved-fg)",
            border: "var(--status-approved-border)",
          },
          returned: {
            DEFAULT: "var(--status-returned-bg)",
            fg: "var(--status-returned-fg)",
            border: "var(--status-returned-border)",
          },
          claimed: {
            DEFAULT: "var(--status-claimed-bg)",
            fg: "var(--status-claimed-fg)",
            border: "var(--status-claimed-border)",
          },
          expired: {
            DEFAULT: "var(--status-expired-bg)",
            fg: "var(--status-expired-fg)",
            border: "var(--status-expired-border)",
          },
          new: {
            DEFAULT: "var(--status-new-bg)",
            fg: "var(--status-new-fg)",
          },
        },
      },
      borderRadius: {
        lg: "var(--radius-lg)",
        md: "var(--radius-md)",
        sm: "var(--radius-sm)",
        xl: "var(--radius-xl)",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
        heading: ["var(--font-heading)", "var(--font-sans)", "ui-sans-serif", "system-ui"],
      },
      fontSize: {
        display: ["2.75rem", { lineHeight: "1.1", letterSpacing: "-0.02em", fontWeight: "600" }],
        overline: ["0.6875rem", { lineHeight: "1.4", letterSpacing: "0.08em", fontWeight: "600" }],
      },
      boxShadow: {
        card: "var(--shadow-card)",
        "card-hover": "var(--shadow-card-hover)",
      },
      spacing: {
        section: "var(--spacing-section)",
        page: "var(--spacing-page)",
      },
      transitionTimingFunction: {
        brand: "var(--motion-ease)",
      },
      transitionDuration: {
        fast: "var(--motion-duration-fast)",
        normal: "var(--motion-duration-normal)",
        slow: "var(--motion-duration-slow)",
      },
    },
  },
  plugins: [],
};
export default config;

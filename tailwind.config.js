/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                background: "#EFEEF3",
                surface: "#EFEEF3",
                primary: "#0f172a",
                secondary: "#475569",
                accent: "#ff5212",
                "accent-muted": "rgba(255, 82, 18, 0.1)",
                "accent-glow": "rgba(255, 82, 18, 0.15)",
                signal: "#0ea5e9",
            },
            fontFamily: {
                sans: ["Inter", "sans-serif"],
            },
            fontSize: {
                'xs': ['0.8125rem', { lineHeight: '1.25rem' }],   // 13px (was 12px)
                'sm': ['0.9375rem', { lineHeight: '1.375rem' }],  // 15px (was 14px)
                'base': ['1.125rem', { lineHeight: '1.75rem' }],   // 18px (was 16px)
                'lg': ['1.25rem', { lineHeight: '1.875rem' }],  // 20px (was 18px)
                'xl': ['1.375rem', { lineHeight: '2rem' }],      // 22px (was 20px)
                '2xl': ['1.625rem', { lineHeight: '2.25rem' }],   // 26px (was 24px)
                '3xl': ['2rem', { lineHeight: '2.5rem' }],    // 32px (was 30px)
                '4xl': ['2.375rem', { lineHeight: '2.75rem' }],   // 38px (was 36px)
                '5xl': ['3.125rem', { lineHeight: '1' }],         // 50px (was 48px)
            },
            boxShadow: {
                // Refined Neumorphic Elevation Scale
                "neumorph-subtle": "4px 4px 8px rgba(163,177,198,0.35), -4px -4px 8px rgba(255,255,255,0.5)",
                neumorph: "6px 6px 12px rgba(163,177,198,0.5), -6px -6px 12px rgba(255,255,255,0.7)",
                "neumorph-sm": "3px 3px 6px rgba(163,177,198,0.4), -3px -3px 6px rgba(255,255,255,0.6)",
                "neumorph-elevated": "10px 10px 20px rgba(163,177,198,0.6), -10px -10px 20px rgba(255,255,255,0.8)",
                "neumorph-pressed": "inset 3px 3px 6px rgba(163,177,198,0.5), inset -3px -3px 6px rgba(255,255,255,0.7)",
                "neumorph-hover": "8px 8px 16px rgba(163,177,198,0.6), -8px -8px 16px rgba(255,255,255,0.8)",
                glow: "0px 10px 20px rgba(0, 0, 0, 0.1)",
            },
            borderRadius: {
                xl: "1rem",
                "2xl": "1.5rem",
                "3xl": "2rem", // For cards (32px)
                full: "9999px", // For pills
            },
        },
    },
    plugins: [],
}

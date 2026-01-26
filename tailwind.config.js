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
                primary: "#1A2B4C", // Deep Navy
                secondary: "#64748B", // Slate 500 equivalent for secondary text
                accent: "#FFB347", // Soft Amber
                "accent-glow": "rgba(255, 179, 71, 0.4)",
            },
            fontFamily: {
                sans: ["Inter", "sans-serif"],
            },
            boxShadow: {
                neumorph: "6px 6px 12px #C5C9D2, -6px -6px 12px #FFFFFF",
                "neumorph-pressed": "inset 4px 4px 8px #C5C9D2, inset -4px -4px 8px #FFFFFF",
                glow: "0px 4px 20px rgba(255, 179, 71, 0.4)",
            },
            borderRadius: {
                xl: "1rem",
                "2xl": "1.5rem",
                "3xl": "2rem", // For cards (32px)
            },
        },
    },
    plugins: [],
}

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                background: "#EFEEF3", // Soft Base Grey
                surface: "#EFEEF3",    // Same as bg, depth comes from shadows
                primary: "#0f172a",    // Deep Navy (Text & Active Elements)
                secondary: "#64748B",  // Slate 500 (Muted Text)
                accent: "#0f172a",     // Using Navy as the primary accent now
                "accent-glow": "rgba(15, 23, 42, 0.15)", // Subtle shadow for accent
                success: "#10b981",    // Emerald
                danger: "#ef4444",     // Red
            },
            fontFamily: {
                sans: ["Inter", "sans-serif"],
            },
            boxShadow: {
                // Soft Light Neumorphism
                neumorph: "9px 9px 16px rgb(163,177,198,0.6), -9px -9px 16px rgba(255,255,255, 0.8)",
                "neumorph-pressed": "inset 6px 6px 10px 0 rgba(163,177,198, 0.7), inset -6px -6px 10px 0 rgba(255,255,255, 0.8)",
                "neumorph-hover": "12px 12px 20px rgb(163,177,198,0.7), -12px -12px 20px rgba(255,255,255, 0.9)",
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

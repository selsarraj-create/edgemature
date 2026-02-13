/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                serif: ['"Playfair Display"', 'serif'],
                sans: ['Inter', 'sans-serif'],
            },
            colors: {
                brand: {
                    black: '#1a1a1a',
                    gold: '#D4AF37', // Optional accent if needed, but keeping it minimal
                    gray: '#f4f4f4',
                }
            },
            animation: {
                'scan': 'scan 3s ease-in-out infinite',
                'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
            },
            keyframes: {
                scan: {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(100%)' },
                }
            }
        },
    },
    plugins: [],
}

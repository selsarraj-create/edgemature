/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                brand: {
                    start: '#3B82F6',
                    end: '#8B5CF6',
                },
                surface: {
                    light: '#F2F4F7',
                    dark: '#000000',
                },
                card: {
                    light: '#FFFFFF',
                    dark: '#121212',
                },
                text: {
                    primary: {
                        light: '#111827',
                        dark: '#FFFFFF',
                    },
                    secondary: {
                        light: '#6B7280',
                        dark: '#9CA3AF',
                    }
                }
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
            },
            borderRadius: {
                '3xl': '1.5rem',
            },
            animation: {
                'scan': 'scan 4s linear infinite',
                'pulse-slow': 'pulse 4s ease-in-out infinite',
            },
            keyframes: {
                scan: {
                    '0%': { top: '0%' },
                    '100%': { top: '100%' },
                }
            }
        },
    },
    plugins: [],
}

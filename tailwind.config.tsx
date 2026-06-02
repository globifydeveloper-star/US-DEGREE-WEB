import type { Config } from 'tailwindcss'

const config: Config = {
    content: ['./src/**/*.{ts,tsx,js,jsx}'],
    theme: {
        extend: {
            fontFamily: {
                lexend: ['var(--font-lexend)', 'sans-serif'],  // ADD THIS
                poppins: ['var(--font-poppins)', 'sans-serif'], // ADD THIS
            },
        },
    },
    plugins: [],
}

export default config
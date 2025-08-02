import type { Config } from "tailwindcss";

const config: Config = {
    darkMode: ["class"],
    content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
  	extend: {
  		colors: {
  			primary: {
  				'50': 'hsl(217, 91%, 95%)',
  				'100': 'hsl(217, 91%, 90%)',
  				'200': 'hsl(217, 91%, 80%)',
  				'300': 'hsl(217, 91%, 70%)',
  				'400': 'hsl(217, 91%, 60%)',
  				'500': 'hsl(217, 91%, 50%)',
  				'600': 'hsl(217, 91%, 40%)',
  				'700': 'hsl(217, 91%, 30%)',
  				'800': 'hsl(217, 91%, 20%)',
  				'900': 'hsl(217, 91%, 10%)',
  				'950': 'hsl(217, 91%, 5%)',
  				DEFAULT: 'hsl(217, 91%, 60%)',
  				foreground: 'hsl(0, 0%, 98%)'
  			},
  			secondary: {
  				'50': 'hsl(210, 44%, 98%)',
  				'100': 'hsl(210, 44%, 95%)',
  				'200': 'hsl(210, 44%, 90%)',
  				'300': 'hsl(210, 44%, 87%)',
  				'400': 'hsl(210, 44%, 80%)',
  				'500': 'hsl(210, 44%, 70%)',
  				'600': 'hsl(210, 44%, 60%)',
  				'700': 'hsl(210, 44%, 50%)',
  				'800': 'hsl(210, 44%, 40%)',
  				'900': 'hsl(210, 44%, 30%)',
  				'950': 'hsl(210, 44%, 20%)',
  				DEFAULT: 'hsl(210, 44%, 87%)',
  				foreground: 'hsl(222.2, 84%, 4.9%)'
  			},
  			success: {
  				DEFAULT: 'hsl(142, 76%, 36%)',
  				foreground: 'hsl(355.7, 100%, 97.3%)'
  			},
  			warning: {
  				DEFAULT: 'hsl(32, 95%, 44%)',
  				foreground: 'hsl(355.7, 100%, 97.3%)'
  			},
  			error: {
  				DEFAULT: 'hsl(0, 84%, 60%)',
  				foreground: 'hsl(0, 0%, 98%)'
  			},
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			sidebar: {
  				DEFAULT: 'hsl(var(--sidebar-background))',
  				foreground: 'hsl(var(--sidebar-foreground))',
  				primary: 'hsl(var(--sidebar-primary))',
  				'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
  				accent: 'hsl(var(--sidebar-accent))',
  				'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
  				border: 'hsl(var(--sidebar-border))',
  				ring: 'hsl(var(--sidebar-ring))'
  			}
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		fontFamily: {
  			sans: [
  				'var(--font-geist-sans)',
  				'system-ui',
  				'sans-serif'
  			],
  			mono: [
  				'var(--font-geist-mono)',
  				'monospace'
  			]
  		},
  		keyframes: {
  			'accordion-down': {
  				from: {
  					height: '0'
  				},
  				to: {
  					height: 'var(--radix-accordion-content-height)'
  				}
  			},
  			'accordion-up': {
  				from: {
  					height: 'var(--radix-accordion-content-height)'
  				},
  				to: {
  					height: '0'
  				}
  			},
  			'fade-in': {
  				from: {
  					opacity: '0'
  				},
  				to: {
  					opacity: '1'
  				}
  			},
  			'slide-in-from-top': {
  				from: {
  					transform: 'translateY(-100%)'
  				},
  				to: {
  					transform: 'translateY(0)'
  				}
  			},
  			'slide-in-from-bottom': {
  				from: {
  					transform: 'translateY(100%)'
  				},
  				to: {
  					transform: 'translateY(0)'
  				}
  			},
  			'accordion-down': {
  				from: {
  					height: '0'
  				},
  				to: {
  					height: 'var(--radix-accordion-content-height)'
  				}
  			},
  			'accordion-up': {
  				from: {
  					height: 'var(--radix-accordion-content-height)'
  				},
  				to: {
  					height: '0'
  				}
  			}
  		},
  		animation: {
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out',
  			'fade-in': 'fade-in 0.2s ease-out',
  			'slide-in-from-top': 'slide-in-from-top 0.3s ease-out',
  			'slide-in-from-bottom': 'slide-in-from-bottom 0.3s ease-out',
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out'
  		},
  		screens: {
  			xs: '475px'
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;

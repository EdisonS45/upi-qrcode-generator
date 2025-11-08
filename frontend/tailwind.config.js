module.exports = {
  // Specify the files Tailwind should scan for class names
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html", 
  ],
  theme: {
    extend: {
      // Custom colors inspired by Wise.com (Defined here for Tailwind classes)
      colors: {
        'brand-blue': '#00b9ff', // Primary action color
        'brand-green': '#9fe870', // Success indicator
        'brand-dark': '#373f51',  // Primary text/headers
        'brand-gray': '#f3f4f6',  // Background color
        'brand-text': '#5a6474',  // Secondary text
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
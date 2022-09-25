/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        backgroundBlack: "#242124",
        lightblue: "#BAE6FD",
        lightgray: "#CBD5E1",
        darkgray: "#111111",

      },
      fontFamily: {
        'system': ['system-ui', 'sans-serif'],
        'poppins': ['Poppins', 'sans-serif'],
      },
    },
    plugins: [],
  }
};
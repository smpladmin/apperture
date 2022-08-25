/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    backgroundColor: (theme) => ({
      ...theme("colors"),
      aptBlack: "#0E0E1A",
      aptGreen: "#57AA64",
    }),

    maxWidth: {
      4: "4rem",
    },

    fontSize: {
      "xs-8": ["0.5rem", "1.5"],
      "xs-10": ["0.625rem", "1.2"],
      "xs-14": ["0.875rem", "1.3"],
    },
  },
  plugins: [],
};

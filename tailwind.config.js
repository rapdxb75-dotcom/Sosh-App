/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all files that contain Nativewind classes.
  content: ["./App.{js,jsx,ts,tsx}", "./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  extend: {
    boxShadow: {
      'center-icon': '0px 8px 14px 0px rgba(0, 0, 0, 0.97)',
    },
    fontFamily: {
      questrial: ["Questrial_400Regular"],
      inter: ["Inter_400Regular", "Inter_600SemiBold"],
    },
  },
  plugins: [],
}

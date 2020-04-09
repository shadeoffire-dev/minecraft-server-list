const purgecss = [
  "@fullhuman/postcss-purgecss",
  {
    // Specify the paths to all of the template files in your project
    content: [
      "./components/*.js",
      "./components/*/*.js",
      "./components/*/*/*.js",
      "./components/*/*/*/*.js",
      "./components/*/*/*/*/*.js",
      "./pages/*.js",
      "./pages/*/*.js"
      // etc.
    ],

    whitelist: [
      "body",
      "img",
      "video",
      "em",
      "figure",
      "wp-block-image",
      "wp-block-code",
      "language-",
      "iframe",
      "aligncenter",
      "notice-box"
    ],
    whitelistPatterns: [/nprogress/, /has-/, /desktop/],
    // Include any special characters you're using in this regular expression
    defaultExtractor: content => content.match(/[\w-/:]+(?<!:)/g) || []
  }
];
const cssnano = [
  "cssnano",
  {
    preset: "default"
  }
];
module.exports = {
  plugins: [
    "postcss-easy-import",
    "tailwindcss",
    "autoprefixer",
    ...(process.env.NODE_ENV === "production" ? [purgecss, cssnano] : [])
  ]
};

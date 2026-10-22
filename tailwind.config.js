// Tailwind scans every page and script that writes class names (the demo and the
// translations build HTML in JS). Run `npm run build:css` after changing classes.
export default {
  content: ["./*.html", "./blog/*.html", "./js/*.js"],
};

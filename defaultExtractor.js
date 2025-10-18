// Default extractor for PurgeCSS/Tailwind classnames
// Some Netlify PurgeCSS plugins allow referencing a custom extractor file.
// This extractor is compatible with Tailwind class naming patterns.

module.exports = function defaultExtractor(content) {
  // Matches strings like: bg-blue-500, md:hover:underline, etc.
  const matches = content.match(/[^<>'"`\s]*[^<>'"`\s:]/g);
  return matches || [];
};


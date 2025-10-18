// No-op cache invalidation configuration
// Some Netlify build/post-processing setups look for this file
// inside the publish directory. Providing an empty config keeps
// the pipeline satisfied without changing global settings.

module.exports = {
  invalidate: [],
  rules: [],
};


/**
 * Netlify Function Handler for Express Backend
 *
 * This file adapts the Express app to work with Netlify Functions
 * using serverless-http to wrap the Express application.
 */

// Netlify Functions run in CommonJS context, but our app uses ES modules
// We need to use dynamic import() to load ES module dependencies

let _app;
let _serverless;

// Lazy load ES modules
async function loadModules() {
  if (!_app) {
    const serverlessModule = await import("serverless-http");
    const appModule = await import("../index.js");
    _serverless = serverlessModule.default;
    _app = appModule.default;
  }
  return { serverless: _serverless, app: _app };
}

// Netlify function handler
module.exports.handler = async (event, context) => {
  const { serverless, app } = await loadModules();
  const handler = serverless(app);
  return handler(event, context);
};

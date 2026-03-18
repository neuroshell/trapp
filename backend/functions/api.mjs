/**
 * Netlify Function Handler for Express Backend
 *
 * This file adapts the Express app to work with Netlify Functions
 * using serverless-http to wrap the Express application.
 */

import serverless from "serverless-http";

import app from "../index.js";

// Export the Express app wrapped with serverless-http
export const handler = serverless(app);

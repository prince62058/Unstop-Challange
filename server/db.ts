// In-memory storage configuration
// Database is disabled - using memory storage for fast development

let pool = null;
let db = null;

console.log("Using in-memory storage for development");

export { pool, db };

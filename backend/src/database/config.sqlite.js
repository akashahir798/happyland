// =====================================================
// DATABASE CONFIGURATION - SQLite Fallback
// This file provides SQLite support for local development
// when Supabase is not accessible
// =====================================================

import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Database file path
const dbPath = path.join(__dirname, '../../data/hotel.db');

// Ensure data directory exists
const dataDir = path.dirname(dbPath);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Create SQLite database connection
const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Helper function to execute queries
/**
 * Execute a database query with parameters
 * @param {string} text - SQL query text
 * @param {Array} params - Query parameters
 * @returns {Promise<Object>} Query result
 */
export const query = (text, params = []) => {
  try {
    const start = Date.now();
    const stmt = db.prepare(text);
    const result = params.length > 0 ? stmt.all(...params) : stmt.all();
    const duration = Date.now() - start;
    
    console.log('Executed query', { text: text.substring(0, 100), duration, rows: result.length });
    
    return { 
      rows: result, 
      rowCount: result.length,
      command: text.split(' ')[0]
    };
  } catch (error) {
    console.error('Database query error:', { text: text.substring(0, 100), error: error.message });
    throw error;
  }
};

/**
 * Execute a query and get a single row
 * @param {string} text - SQL query text
 * @param {Array} params - Query parameters
 * @returns {Object} Single row
 */
export const queryOne = (text, params = []) => {
  try {
    const stmt = db.prepare(text);
    return params.length > 0 ? stmt.get(...params) : stmt.get();
  } catch (error) {
    console.error('Database query error:', { text: text.substring(0, 100), error: error.message });
    throw error;
  }
};

/**
 * Run a query (INSERT, UPDATE, DELETE)
 * @param {string} text - SQL query text
 * @param {Array} params - Query parameters
 * @returns {Object} Result with lastInsertRowid and changes
 */
export const run = (text, params = []) => {
  try {
    const stmt = db.prepare(text);
    const result = params.length > 0 ? stmt.run(...params) : stmt.run();
    return {
      lastInsertRowid: result.lastInsertRowid,
      changes: result.changes,
      rowCount: result.changes
    };
  } catch (error) {
    console.error('Database run error:', { text: text.substring(0, 100), error: error.message });
    throw error;
  }
};

/**
 * Get a client from the pool for transactions (not needed for SQLite)
 * @returns {Object} Database instance
 */
export const getClient = async () => {
  return db;
};

/**
 * Check database connection health
 * @returns {boolean} Connection status
 */
export const checkConnection = () => {
  try {
    db.exec('SELECT 1');
    return true;
  } catch (error) {
    console.error('Database connection failed:', error.message);
    return false;
  }
};

/**
 * Close the database connection
 */
export const closePool = () => {
  db.close();
};

export default {
  query,
  queryOne,
  run,
  getClient,
  checkConnection,
  closePool
};

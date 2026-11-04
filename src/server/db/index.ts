import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import type { ChatSession, ChatMessage, Product } from '../types/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure data folder exists at project root
const dataDir = path.resolve(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'nexus_shopping.sqlite');
const db = new Database(dbPath);

// Enable WAL mode for high performance concurrency
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Initialize database schema
db.exec(`
  CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL,
    country_code TEXT DEFAULT 'IN',
    currency_code TEXT DEFAULT 'INR'
  );

  CREATE TABLE IF NOT EXISTS messages (
    id TEXT PRIMARY KEY,
    session_id TEXT NOT NULL,
    role TEXT NOT NULL,
    content TEXT NOT NULL,
    action TEXT,
    clarification TEXT,
    products TEXT,
    created_at INTEGER NOT NULL,
    FOREIGN KEY (session_id) REFERENCES sessions (id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS saved_products (
    id TEXT PRIMARY KEY,
    product_id TEXT NOT NULL,
    session_id TEXT NOT NULL,
    data TEXT NOT NULL,
    created_at INTEGER NOT NULL,
    FOREIGN KEY (session_id) REFERENCES sessions (id) ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS idx_messages_session_id ON messages (session_id, created_at ASC);
  CREATE INDEX IF NOT EXISTS idx_sessions_updated_at ON sessions (updated_at DESC);
`);

export const dbService = {
  getSessions(): ChatSession[] {
    const stmt = db.prepare(`
      SELECT id, title, created_at as createdAt, updated_at as updatedAt, country_code as countryCode, currency_code as currencyCode 
      FROM sessions 
      ORDER BY updated_at DESC
    `);
    return stmt.all() as ChatSession[];
  },

  getSession(id: string): ChatSession | null {
    const stmt = db.prepare(`
      SELECT id, title, created_at as createdAt, updated_at as updatedAt, country_code as countryCode, currency_code as currencyCode 
      FROM sessions 
      WHERE id = ?
    `);
    const row = stmt.get(id);
    return (row as ChatSession) || null;
  },

  createSession(session: ChatSession): ChatSession {
    const stmt = db.prepare(`
      INSERT INTO sessions (id, title, created_at, updated_at, country_code, currency_code)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    stmt.run(
      session.id,
      session.title,
      session.createdAt,
      session.updatedAt,
      session.countryCode,
      session.currencyCode
    );
    return session;
  },

  updateSessionTitle(id: string, title: string): void {
    const stmt = db.prepare(`
      UPDATE sessions SET title = ?, updated_at = ? WHERE id = ?
    `);
    stmt.run(title, Date.now(), id);
  },

  updateSessionTimestamp(id: string): void {
    const stmt = db.prepare(`
      UPDATE sessions SET updated_at = ? WHERE id = ?
    `);
    stmt.run(Date.now(), id);
  },

  deleteSession(id: string): void {
    const stmt = db.prepare(`DELETE FROM sessions WHERE id = ?`);
    stmt.run(id);
  },

  getMessages(sessionId: string): ChatMessage[] {
    const stmt = db.prepare(`
      SELECT id, session_id as sessionId, role, content, action, clarification, products, created_at as createdAt
      FROM messages
      WHERE session_id = ?
      ORDER BY created_at ASC
    `);
    const rows = stmt.all(sessionId) as any[];
    return rows.map(row => ({
      id: row.id,
      sessionId: row.sessionId,
      role: row.role as 'user' | 'assistant',
      content: row.content,
      action: row.action,
      clarification: row.clarification ? JSON.parse(row.clarification) : undefined,
      products: row.products ? JSON.parse(row.products) : undefined,
      createdAt: row.createdAt,
    }));
  },

  addMessage(msg: ChatMessage): void {
    const stmt = db.prepare(`
      INSERT INTO messages (id, session_id, role, content, action, clarification, products, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(
      msg.id,
      msg.sessionId,
      msg.role,
      msg.content,
      msg.action || null,
      msg.clarification ? JSON.stringify(msg.clarification) : null,
      msg.products ? JSON.stringify(msg.products) : null,
      msg.createdAt
    );

    // Update session timestamp
    this.updateSessionTimestamp(msg.sessionId);
  },

  clearSessionMessages(sessionId: string): void {
    const stmt = db.prepare(`DELETE FROM messages WHERE session_id = ?`);
    stmt.run(sessionId);
  }
};

export default db;

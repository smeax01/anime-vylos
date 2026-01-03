import { createPool } from '@vercel/postgres';

export const db = createPool();

export async function initDb() {
  try {
    await db.sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        avatar TEXT,
        joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        stats_watched_time INT DEFAULT 0,
        stats_episodes_seen INT DEFAULT 0,
        stats_completed INT DEFAULT 0
      );
    `;

    await db.sql`
      CREATE TABLE IF NOT EXISTS favorites (
        id SERIAL PRIMARY KEY,
        user_id INT REFERENCES users(id) ON DELETE CASCADE,
        anime_id VARCHAR(255) NOT NULL,
        title TEXT NOT NULL,
        image TEXT,
        type VARCHAR(50),
        added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, anime_id)
      );
    `;

    await db.sql`
      CREATE TABLE IF NOT EXISTS watch_history (
        id SERIAL PRIMARY KEY,
        user_id INT REFERENCES users(id) ON DELETE CASCADE,
        anime_id VARCHAR(255) NOT NULL,
        last_ep INT DEFAULT 1,
        progress_json TEXT,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, anime_id)
      );
    `;
    console.log('Database initialized successfully');
  } catch (e) {
    console.error('Failed to initialize database:', e);
  }
}

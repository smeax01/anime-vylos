import type { APIRoute } from 'astro';
import { db, initDb } from '../../lib/db';

export const POST: APIRoute = async ({ request }) => {
  // Ensure tables exist (ideal for demo/dev, in production use migrations)
  await initDb();

  const body = await request.json();
  const { action, username, email, password } = body;

  try {
    if (action === 'register') {
      const existing = await db.sql`SELECT id FROM users WHERE email = ${email} OR username = ${username}`;
      if (existing.rowCount && existing.rowCount > 0) {
        return new Response(JSON.stringify({ error: 'Email ou pseudo déjà utilisé' }), { status: 400 });
      }

      const avatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`;
      const result = await db.sql`
        INSERT INTO users (username, email, password, avatar)
        VALUES (${username}, ${email}, ${password}, ${avatar})
        RETURNING id, username, email, avatar, joined_at, stats_episodes_seen
      `;

      return new Response(JSON.stringify({ user: result.rows[0] }), { status: 200 });
    }

    if (action === 'login') {
      const result = await db.sql`
        SELECT id, username, email, avatar, joined_at, stats_episodes_seen
        FROM users 
        WHERE email = ${email} AND password = ${password}
      `;

      if (result.rowCount === 0) {
        return new Response(JSON.stringify({ error: 'Identifiants incorrects' }), { status: 401 });
      }

      return new Response(JSON.stringify({ user: result.rows[0] }), { status: 200 });
    }

    if (action === 'update-stats') {
      const { userId, episodesSeen } = body;
      await db.sql`
        UPDATE users 
        SET stats_episodes_seen = ${episodesSeen}
        WHERE id = ${userId}
      `;
      return new Response(JSON.stringify({ success: true }));
    }

    return new Response(JSON.stringify({ error: 'Action non reconnue' }), { status: 400 });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: 'Erreur serveur' }), { status: 500 });
  }
};

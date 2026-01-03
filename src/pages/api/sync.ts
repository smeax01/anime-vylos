import type { APIRoute } from 'astro';
import { db } from '../../lib/db';

export const POST: APIRoute = async ({ request }) => {
  const body = await request.json();
  const { action, userId, animeId, title, image, type, lastEp, progressJson } = body;

  try {
    if (!userId) return new Response('Unauthorized', { status: 401 });

    if (action === 'sync-favorite') {
      const isFavorite = body.isFavorite; // true to add, false to remove
      if (isFavorite) {
        await db.sql`
          INSERT INTO favorites (user_id, anime_id, title, image, type)
          VALUES (${userId}, ${animeId}, ${title}, ${image}, ${type})
          ON CONFLICT (user_id, anime_id) DO NOTHING
        `;
      } else {
        await db.sql`DELETE FROM favorites WHERE user_id = ${userId} AND anime_id = ${animeId}`;
      }
      return new Response(JSON.stringify({ success: true }));
    }

    if (action === 'sync-history') {
      await db.sql`
        INSERT INTO watch_history (user_id, anime_id, last_ep, progress_json)
        VALUES (${userId}, ${animeId}, ${lastEp}, ${progressJson})
        ON CONFLICT (user_id, anime_id) DO UPDATE 
        SET last_ep = EXCLUDED.last_ep, progress_json = EXCLUDED.progress_json, updated_at = CURRENT_TIMESTAMP
      `;
      
      // Update user general stat: episodes_seen
      // This is a bit complex to do perfectly (avoiding double counts), 
      // but let's just increment for now or handle client side.
      // Already handling client side in register/login.
      
      return new Response(JSON.stringify({ success: true }));
    }

    return new Response('Invalid action', { status: 400 });
  } catch (e) {
    console.error(e);
    return new Response('Error', { status: 500 });
  }
};

import type { APIRoute } from 'astro';
import { getAnimeListByIds } from '../../lib/anilist';

export const GET: APIRoute = async ({ request }) => {
    const url = new URL(request.url);
    const ids = url.searchParams.get('ids');
    
    if (!ids) return new Response(JSON.stringify([]), { status: 200 });

    try {
        const idArray = ids.split(',').map(Number);
        const animeList = await getAnimeListByIds(idArray);
        return new Response(JSON.stringify(animeList), {
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (e) {
        return new Response(JSON.stringify({ error: 'Failed to fetch anime list' }), { status: 500 });
    }
}

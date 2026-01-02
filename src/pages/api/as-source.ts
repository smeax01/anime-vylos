import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ request }) => {
    const url = new URL(request.url);
    const slug = url.searchParams.get('slug');
    const season = url.searchParams.get('season') || 'saison1';
    const lang = url.searchParams.get('lang') || 'vostfr';

    if (!slug) return new Response(JSON.stringify({ error: 'Missing slug' }), { status: 400 });

    try {
        const asUrl = `https://anime-sama.tv/catalogue/${slug}/${season}/${lang}/episodes.js`;
        const res = await fetch(asUrl);
        if (!res.ok) throw new Error('Not found on Anime-Sama');
        
        const text = await res.text();
        
        // Basic regex to find arrays eps1, eps2, etc.
        const sources: any = {};
        const regex = /var\s+(eps\d+)\s*=\s*\[([\s\S]*?)\];/g;
        let match;
        
        while ((match = regex.exec(text)) !== null) {
            const varName = match[1];
            const content = match[2];
            // Clean and split URLs
            const urls = content
                .split(',')
                .map(u => u.trim().replace(/['"\n]/g, ''))
                .filter(u => u.startsWith('http'));
            sources[varName] = urls;
        }

        return new Response(JSON.stringify({ sources }), {
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (e: any) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500 });
    }
}

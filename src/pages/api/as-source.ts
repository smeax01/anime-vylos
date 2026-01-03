import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ request }) => {
    const url = new URL(request.url);
    const slug = url.searchParams.get('slug');
    const season = url.searchParams.get('season') || 'saison1';
    const lang = url.searchParams.get('lang') || 'vostfr'; // vostfr or vf

    if (!slug) return new Response(JSON.stringify({ error: 'Missing slug' }), { status: 400 });

    const slugVariations = [
        slug,
        slug.replace(/-tv$/, ''),
        slug.replace(/-season-\d+/, ''),
        slug.replace(/-s\d+/, '')
    ];

    // Remove duplicates
    const uniqueSlugs = [...new Set(slugVariations)];

    for (const s of uniqueSlugs) {
        try {
            const asUrl = `https://anime-sama.tv/catalogue/${s}/${season}/${lang}/episodes.js`;
            const res = await fetch(asUrl);
            
            if (res.ok) {
                const text = await res.text();
                const sources: any = {};
                const regex = /var\s+(eps\d+)\s*=\s*\[([\s\S]*?)\];/g;
                let match;
                
                while ((match = regex.exec(text)) !== null) {
                    const varName = match[1];
                    const content = match[2];
                    const urls = content
                        .split(',')
                        .map(u => u.trim().replace(/['"\n]/g, ''))
                        .filter(u => u.startsWith('http'));
                    sources[varName] = urls;
                }

                if (Object.keys(sources).length > 0) {
                    return new Response(JSON.stringify({ sources, usedSlug: s }), {
                        headers: { 'Content-Type': 'application/json' }
                    });
                }
            }
        } catch (e) {}
    }

    return new Response(JSON.stringify({ error: 'Not found on any variation' }), { status: 404 });
}

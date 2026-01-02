import type { APIRoute } from 'astro';

const CLIENT_ID = '33981';
const CLIENT_SECRET = 'muQVGDTz3mSoYlnJRIGC8KHpwvhtgnlS4GAARxXl';
const REDIRECT_URI = 'https://vylos-anime.vercel.app/api/auth/callback';

export const GET: APIRoute = async ({ request, cookies, redirect }) => {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');

  if (!code) {
    return new Response('No code provided', { status: 400 });
  }

  try {
    const response = await fetch('https://anilist.co/api/v2/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        grant_type: 'authorization_code',
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        redirect_uri: REDIRECT_URI,
        code,
      }),
    });

    const data = await response.json();

    if (data.access_token) {
      cookies.set('anilist_token', data.access_token, {
        path: '/',
        httpOnly: false, // Accessible JS for client-side calls if needed
        secure: true,
        maxAge: data.expires_in,
      });
      return redirect('/profile');
    } else {
       return new Response(JSON.stringify(data), { status: 400 });
    }

  } catch (error) {
    return new Response('Error during authentication', { status: 500 });
  }
};

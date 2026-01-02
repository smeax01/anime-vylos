import type { APIRoute } from 'astro';

const CLIENT_ID = '33989';
const CLIENT_SECRET = 'A2y4zS8gorAxbZnPqDnvwmlLvmqrRXC6NAGpFUlg';
const REDIRECT_URI = 'https://vylos-anime.vercel.app/api/auth/callback';

export const GET: APIRoute = async ({ request, cookies, redirect }) => {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');

  if (!code) {
    return new Response('No code provided', { status: 400 });
  }

  try {
    const params = new URLSearchParams();
    params.append('grant_type', 'authorization_code');
    params.append('client_id', CLIENT_ID);
    params.append('client_secret', CLIENT_SECRET);
    params.append('redirect_uri', REDIRECT_URI);
    params.append('code', code);

    const response = await fetch('https://anilist.co/api/v2/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
      },
      body: params,
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

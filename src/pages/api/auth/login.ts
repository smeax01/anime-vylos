import type { APIRoute } from 'astro';

const CLIENT_ID = '33989';
const REDIRECT_URI = 'https://vylos-anime.vercel.app/api/auth/callback';

export const GET: APIRoute = ({ redirect }) => {
  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    response_type: 'code',
  });

  return redirect(`https://anilist.co/api/v2/oauth/authorize?${params.toString()}`);
};

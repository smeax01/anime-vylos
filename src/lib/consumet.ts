const CONSUMET_API = 'https://api-consumet.vercel.app/meta/anilist'; // Public instance fallback

export async function getAnimeStreamingInfo(anilistId: string | number) {
  try {
    const response = await fetch(`${CONSUMET_API}/info/${anilistId}?provider=gogoanime`);
    if (!response.ok) return null;
    return await response.json();
  } catch (e) {
    console.error("Consumet Error:", e);
    return null;
  }
}

export async function getEpisodeSources(episodeId: string) {
   try {
    const response = await fetch(`${CONSUMET_API}/watch/${episodeId}`);
    if (!response.ok) return null;
    return await response.json();
  } catch (e) {
    console.error("Consumet Error:", e);
    return null;
  }
}

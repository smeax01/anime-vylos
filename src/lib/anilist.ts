export interface Media {
  id: number;
  title: {
    romaji: string;
    english: string;
    native: string;
  };
  coverImage: {
    extraLarge: string;
    large: string;
    medium: string;
    color: string;
  };
  bannerImage: string;
  description: string;
  episodes: number;
  averageScore: number;
  genres: string[];
  format: string;
  status: string;
  nextAiringEpisode?: {
    episode: number;
    timeUntilAiring: number;
  };
}

const ANILIST_API = 'https://graphql.anilist.co';

async function fetchAniList(query: string, variables: any = {}) {
  const response = await fetch(ANILIST_API, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({
      query,
      variables,
    }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(JSON.stringify(data));
  }
  return data.data;
}

export const getTrendingAnime = async (perPage = 10) => {
  const query = `
    query ($perPage: Int) {
      Page(perPage: $perPage) {
        media(sort: TRENDING_DESC, type: ANIME) {
          id
          title {
            romaji
            english
            native
          }
          coverImage {
            large
            extraLarge
            color
          }
          bannerImage
          description
          averageScore
          genres
          episodes
          nextAiringEpisode {
             episode
             timeUntilAiring
          }
        }
      }
    }
  `;
  const data = await fetchAniList(query, { perPage });
  return data.Page.media as Media[];
};

export const getPopularAnime = async (perPage = 10) => {
  const query = `
    query ($perPage: Int) {
      Page(perPage: $perPage) {
        media(sort: POPULARITY_DESC, type: ANIME) {
          id
          title {
            romaji
            english
          }
          coverImage {
            large
            color
          }
          averageScore
          genres
          format
        }
      }
    }
  `;
  const data = await fetchAniList(query, { perPage });
  return data.Page.media as Media[];
};

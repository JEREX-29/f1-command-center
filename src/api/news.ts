export const newsApi = {
  async getLatestNews() {
    try {
      const res = await fetch('https://api.rss2json.com/v1/api.json?rss_url=https://www.motorsport.com/rss/f1/news/');
      if (!res.ok) throw new Error('Failed to fetch news');
      const data = await res.json();
      return data.items || [];
    } catch (err) {
      console.error(err);
      return [];
    }
  }
};

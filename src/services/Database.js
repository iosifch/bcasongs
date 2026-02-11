export default {
  async fetchVersion() {
    try {
      const baseUrl = import.meta.env.BASE_URL;
      const response = await fetch(`${baseUrl}data/songs.json?t=${Date.now()}`);
      if (!response.ok) throw new Error('Failed to fetch version');
      const data = await response.json();
      return data.version;
    } catch (e) {
      console.error('Database fetchVersion error:', e);
      throw e;
    }
  },

  async fetchData() {
    try {
      const baseUrl = import.meta.env.BASE_URL;
      const response = await fetch(`${baseUrl}data/songs.json?t=${Date.now()}`);
      if (!response.ok) throw new Error('Failed to fetch data');
      return await response.json();
    } catch (e) {
      console.error('Database fetchData error:', e);
      throw e;
    }
  }
};

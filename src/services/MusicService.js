export default {
  // Fetch songs from local JSON
  async getSongs() {
    try {
      const baseUrl = import.meta.env.BASE_URL;
      const response = await fetch(`${baseUrl}data/songs.json`);
      if (!response.ok) throw new Error('Failed to load songs');
      return await response.json();
    } catch (e) {
      console.error(e);
      return [];
    }
  },

  async getSong(id) {
    const songs = await this.getSongs();
    return songs.find(s => s.id === id);
  },

  // Parse ChordPro-like content into structured data
  // Returns: Array of lines objects
  // Line Object: { segments: Array, isChorus: Boolean, isSpacer: Boolean }
  // Segment: { chord: string | null, text: string }
  parse(content) {
    if (!content) return [];

    const lines = content.split('\n');
    let inChorus = false;
    let inBridge = false;
    let inCoda = false;

    return lines.map(line => {
      // Check for chorus tags
      if (line.includes('{start_of_chorus}') || line.includes('{soc}') || line.includes('{c: Chorus}')) {
        inChorus = true;
        line = line.replace('{start_of_chorus}', '').replace('{soc}', '').replace('{c: Chorus}', '');
      }

      // Check for bridge tags
      if (line.includes('{start_of_bridge}') || line.includes('{sob}') || line.includes('{c: Bridge}')) {
        inBridge = true;
        line = line.replace('{start_of_bridge}', '').replace('{sob}', '').replace('{c: Bridge}', '');
      }

      // Check for coda tags
      if (line.includes('{start_of_coda}') || line.includes('{so_coda}') || line.includes('{c: Coda}')) {
        inCoda = true;
        line = line.replace('{start_of_coda}', '').replace('{so_coda}', '').replace('{c: Coda}', '');
      }

      const currentLineIsChorus = inChorus;
      const currentLineIsBridge = inBridge;
      const currentLineIsCoda = inCoda;

      if (line.includes('{end_of_chorus}') || line.includes('{eoc}')) {
        inChorus = false;
        line = line.replace('{end_of_chorus}', '').replace('{eoc}', '');
      }

      if (line.includes('{end_of_bridge}') || line.includes('{eob}')) {
        inBridge = false;
        line = line.replace('{end_of_bridge}', '').replace('{eob}', '');
      }

      if (line.includes('{end_of_coda}') || line.includes('{eo_coda}')) {
        inCoda = false;
        line = line.replace('{end_of_coda}', '').replace('{eo_coda}', '');
      }

      // Check for empty line (spacer)
      if (!line.trim()) {
        return { segments: [], isChorus: false, isBridge: false, isCoda: false, isSpacer: true };
      }

      const segments = [];
      const regex = /\[([^\]]+)\]([^\[]*)/g;

      let lastIndex = 0;
      let match;

      // Check for text at the start before any chord
      const firstBracket = line.indexOf('[');
      if (firstBracket > 0) {
        segments.push({
          chord: null,
          text: line.substring(0, firstBracket)
        });
        lastIndex = firstBracket;
      } else if (firstBracket === -1) {
        // No chords in this line
        return {
          segments: [{ chord: null, text: line }],
          isChorus: currentLineIsChorus,
          isBridge: currentLineIsBridge,
          isCoda: currentLineIsCoda,
          isSpacer: false
        };
      }

      while ((match = regex.exec(line)) !== null) {
        segments.push({
          chord: match[1],
          text: match[2]
        });
        lastIndex = regex.lastIndex;
      }

      return {
        segments,
        isChorus: currentLineIsChorus,
        isBridge: currentLineIsBridge,
        isCoda: currentLineIsCoda,
        isSpacer: false
      };
    });
  }
}

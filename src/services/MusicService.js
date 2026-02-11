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

  // Parse ChordPro-like content into structured data (Paragraphs)
  parseToParagraphs(content) {
    if (!content) return [];
    
    const lines = content.split('\n');
    const paragraphs = [];
    let currentParagraph = null;

    const createParagraph = (type) => {
      return {
        id: Math.random().toString(36).substr(2, 9),
        type: type || 'verse',
        lines: []
      };
    };

    lines.forEach(line => {
      const trimmedLine = line.trim();

      // Check for explicit start tags
      if (trimmedLine.includes('{start_of_chorus}')) {
        if (currentParagraph && currentParagraph.lines.length > 0) paragraphs.push(currentParagraph);
        currentParagraph = createParagraph('chorus');
        return;
      }
      if (trimmedLine.includes('{start_of_coda}')) {
        if (currentParagraph && currentParagraph.lines.length > 0) paragraphs.push(currentParagraph);
        currentParagraph = createParagraph('coda');
        return;
      }

      // Check for explicit end tags
      if (trimmedLine.includes('{end_of_chorus}') || trimmedLine.includes('{end_of_coda}')) {
        if (currentParagraph) {
          if (currentParagraph.lines.length > 0) paragraphs.push(currentParagraph);
          currentParagraph = null;
        }
        return;
      }

      // Empty line handling (spacer)
      if (trimmedLine === '') {
        if (currentParagraph) {
          if (currentParagraph.lines.length > 0) paragraphs.push(currentParagraph);
          currentParagraph = null;
        }
        return;
      }

      // Regular content line
      if (!currentParagraph) {
        currentParagraph = createParagraph('verse');
      }

      const parsedLine = this.parseLine(line);
      currentParagraph.lines.push(parsedLine);
    });

    if (currentParagraph && currentParagraph.lines.length > 0) {
      paragraphs.push(currentParagraph);
    }

    return paragraphs;
  },

  // Helper for parsing a single line
  parseLine(line) {
    // Strip tags just in case they are inline
    let cleanLine = line.replace(/\{start_of_chorus\}|\{end_of_chorus\}|\{start_of_coda\}|\{end_of_coda\}/g, '');
    
    if (!cleanLine.trim() && !cleanLine.includes('[')) {
        return { segments: [], isSpacer: true };
    }

    const segments = [];
    const regex = /\[([^\]]+)\]([^\[]*)/g;

    const firstBracket = cleanLine.indexOf('[');
    if (firstBracket > 0) {
      segments.push({ chord: null, text: cleanLine.substring(0, firstBracket) });
    } else if (firstBracket === -1) {
      return { segments: [{ chord: null, text: cleanLine }], isSpacer: false };
    }

    let match;
    let lastIndex = 0;
    
    // Reset regex index
    regex.lastIndex = 0;
    while ((match = regex.exec(cleanLine)) !== null) {
      segments.push({ chord: match[1], text: match[2] });
      lastIndex = regex.lastIndex;
    }

    return { segments, isSpacer: false };
  },

  serialize(paragraphs) {
    return paragraphs.map(p => {
      let content = "";
      if (p.type === 'chorus') content += "{start_of_chorus}\n";
      if (p.type === 'coda') content += "{start_of_coda}\n";
      
      content += p.lines.map(l => {
        return l.segments.map(s => {
          return (s.chord ? `[${s.chord}]` : "") + s.text;
        }).join("");
      }).join("\n");

      if (p.type === 'chorus') content += "\n{end_of_chorus}";
      if (p.type === 'coda') content += "\n{end_of_coda}";
      
      return content;
    }).join("\n\n");
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

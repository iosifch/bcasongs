export default {
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
  }
};

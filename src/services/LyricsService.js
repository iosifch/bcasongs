export default {
  // Parse content into structured data (Paragraphs)
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
    // Strip tags and chords [C] from lyrics
    let cleanLine = line.replace(/\{start_of_chorus\}|\{end_of_chorus\}|\{start_of_coda\}|\{end_of_coda\}/g, '');
    cleanLine = cleanLine.replace(/\[[^\]]+\]/g, ''); // Remove chords
    
    if (!cleanLine.trim()) {
        return { text: '', isSpacer: true };
    }

    return { text: cleanLine, isSpacer: false };
  },

  serialize(paragraphs) {
    return paragraphs.map(p => {
      let content = "";
      if (p.type === 'chorus') content += "{start_of_chorus}\n";
      if (p.type === 'coda') content += "{start_of_coda}\n";
      
      content += p.lines.map(l => l.text).join("\n");

      if (p.type === 'chorus') content += "\n{end_of_chorus}";
      if (p.type === 'coda') content += "\n{end_of_coda}";
      
      return content;
    }).join("\n\n");
  }
};

export type ParagraphType = 'verse' | 'chorus' | 'coda'

export interface Line {
  text: string
  isSpacer: boolean
}

export interface Paragraph {
  id: string
  type: ParagraphType
  lines: Line[]
  editText?: string
}

export default {
  // Create a new empty paragraph object
  createParagraph(type?: ParagraphType): Paragraph {
    return {
      id: Math.random().toString(36).substr(2, 9),
      type: type || 'verse',
      lines: []
    };
  },

  // Sync a paragraph's lines from a raw text string
  syncParagraphLines(paragraph: Pick<Paragraph, 'lines'>, text: string): void {
    paragraph.lines = text.split('\n').map((lineText): Line => ({
      text: lineText,
      isSpacer: lineText.trim() === ''
    }));
  },

  // Filter out paragraphs that have no content (all lines are empty)
  filterEmptyParagraphs(paragraphs: Paragraph[]): Paragraph[] {
    return paragraphs.filter(p => {
      const text = (p.editText !== undefined) ? p.editText : p.lines.map(l => l.text).join('');
      return text.trim().length > 0;
    });
  },

  // Parse content into structured data (Paragraphs)
  parseToParagraphs(content: string | null | undefined): Paragraph[] {
    if (!content) return [];

    const lines = content.split('\n');
    const paragraphs: Paragraph[] = [];
    let currentParagraph: Paragraph | null = null;

    lines.forEach(line => {
      const trimmedLine = line.trim();

      // Check for explicit start tags
      if (trimmedLine.includes('{start_of_chorus}')) {
        if (currentParagraph && currentParagraph.lines.length > 0) paragraphs.push(currentParagraph);
        currentParagraph = this.createParagraph('chorus');
        return;
      }
      if (trimmedLine.includes('{start_of_coda}')) {
        if (currentParagraph && currentParagraph.lines.length > 0) paragraphs.push(currentParagraph);
        currentParagraph = this.createParagraph('coda');
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
        currentParagraph = this.createParagraph('verse');
      }

      const parsedLine = this.parseLine(line);
      currentParagraph.lines.push(parsedLine);
    });

    if (currentParagraph && (currentParagraph as Paragraph).lines.length > 0) {
      paragraphs.push(currentParagraph);
    }

    return paragraphs;
  },

  // Helper for parsing a single line
  parseLine(line: string): Line {
    // Strip tags and chords [C] from lyrics
    let cleanLine = line.replace(/\{start_of_chorus\}|\{end_of_chorus\}|\{start_of_coda\}|\{end_of_coda\}/g, '');
    cleanLine = cleanLine.replace(/\[[^\]]+\]/g, ''); // Remove chords

    if (!cleanLine.trim()) {
        return { text: '', isSpacer: true };
    }

    return { text: cleanLine, isSpacer: false };
  },

  serialize(paragraphs: Paragraph[]): string {
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

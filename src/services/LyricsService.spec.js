import LyricsService from './LyricsService';

describe('LyricsService', () => {
  describe('parseToParagraphs', () => {
    it('should parse a simple line as a verse paragraph', () => {
      const content = 'Simple lyrics';
      const paragraphs = LyricsService.parseToParagraphs(content);

      expect(paragraphs).toHaveLength(1);
      expect(paragraphs[0].type).toBe('verse');
      expect(paragraphs[0].lines[0].text).toBe('Simple lyrics');
    });

    it('should identify chorus tags correctly', () => {
      const content = '{start_of_chorus}\nChorus line\n{end_of_chorus}';
      const paragraphs = LyricsService.parseToParagraphs(content);

      expect(paragraphs).toHaveLength(1);
      expect(paragraphs[0].type).toBe('chorus');
      expect(paragraphs[0].lines[0].text).toBe('Chorus line');
    });

    it('should split paragraphs by empty lines', () => {
      const content = 'Verse 1\n\nVerse 2';
      const paragraphs = LyricsService.parseToParagraphs(content);

      expect(paragraphs).toHaveLength(2);
      expect(paragraphs[0].type).toBe('verse');
      expect(paragraphs[1].type).toBe('verse');
    });

    it('should strip chords from text', () => {
      const content = '[A]Amazing [D]Grace';
      const paragraphs = LyricsService.parseToParagraphs(content);
      const lineText = paragraphs[0].lines[0].text;

      expect(lineText).toBe('Amazing Grace');
    });

    it('should return an empty array for empty string input', () => {
      expect(LyricsService.parseToParagraphs('')).toEqual([]);
    });

    it('should return an empty array for null input', () => {
      expect(LyricsService.parseToParagraphs(null)).toEqual([]);
    });

    it('should return an empty array for undefined input', () => {
      expect(LyricsService.parseToParagraphs(undefined)).toEqual([]);
    });

    it('should strip complex chords like Cmaj7 and F#m/C#', () => {
      const content = '[Cmaj7]Amazing [F#m/C#]Grace';
      const paragraphs = LyricsService.parseToParagraphs(content);
      expect(paragraphs[0].lines[0].text).toBe('Amazing Grace');
    });

    it('should handle multiple consecutive empty lines as a single paragraph break', () => {
      const content = 'Verse 1\n\n\n\nVerse 2';
      const paragraphs = LyricsService.parseToParagraphs(content);
      expect(paragraphs).toHaveLength(2);
      expect(paragraphs[0].lines[0].text).toBe('Verse 1');
      expect(paragraphs[1].lines[0].text).toBe('Verse 2');
    });
  });

  describe('serialize', () => {
    it('should convert paragraphs back to text with tags', () => {
      const paragraphs = [
        {
          type: 'chorus',
          lines: [
            { text: 'Gloria', isSpacer: false }
          ]
        }
      ];

      const result = LyricsService.serialize(paragraphs);
      expect(result).toContain('{start_of_chorus}');
      expect(result).toContain('Gloria');
      expect(result).toContain('{end_of_chorus}');
    });

    it('should handle verse type without tags', () => {
      const paragraphs = [
        {
          type: 'verse',
          lines: [
            { text: 'Verse line', isSpacer: false }
          ]
        }
      ];

      const result = LyricsService.serialize(paragraphs);
      expect(result).not.toContain('{start_of_chorus}');
      expect(result).not.toContain('{end_of_chorus}');
      expect(result).toBe('Verse line');
    });

    it('should handle multiple paragraphs with mixed types', () => {
      const paragraphs = [
        {
          type: 'verse',
          lines: [{ text: 'Verse 1', isSpacer: false }]
        },
        {
          type: 'chorus',
          lines: [{ text: 'Chorus', isSpacer: false }]
        },
        {
          type: 'coda',
          lines: [{ text: 'Coda', isSpacer: false }]
        }
      ];

      const result = LyricsService.serialize(paragraphs);

      // Check sequence
      const parts = result.split('\n\n');
      expect(parts).toHaveLength(3);

      // Verse (no tags)
      expect(parts[0]).toBe('Verse 1');

      // Chorus (tags)
      expect(parts[1]).toContain('{start_of_chorus}');
      expect(parts[1]).toContain('Chorus');
      expect(parts[1]).toContain('{end_of_chorus}');

      // Coda (tags)
      expect(parts[2]).toContain('{start_of_coda}');
      expect(parts[2]).toContain('Coda');
      expect(parts[2]).toContain('{end_of_coda}');
    });
  });

  describe('syncParagraphLines', () => {
    it('should split text into lines and set isSpacer correctly', () => {
      const p = { lines: [] };
      const text = 'Line 1\n\nLine 2';
      LyricsService.syncParagraphLines(p, text);

      expect(p.lines).toHaveLength(3);
      expect(p.lines[0]).toEqual({ text: 'Line 1', isSpacer: false });
      expect(p.lines[1]).toEqual({ text: '', isSpacer: true });
      expect(p.lines[2]).toEqual({ text: 'Line 2', isSpacer: false });
    });
  });

  describe('filterEmptyParagraphs', () => {
    it('should remove paragraphs that have no content', () => {
      const paragraphs = [
        { editText: 'Content' },
        { editText: '   ' }, // empty after trim
        { editText: '\n\n' }, // only newlines
        { editText: 'Valid' }
      ];

      const filtered = LyricsService.filterEmptyParagraphs(paragraphs);
      expect(filtered).toHaveLength(2);
      expect(filtered[0].editText).toBe('Content');
      expect(filtered[1].editText).toBe('Valid');
    });

    it('should use lines if editText is not present', () => {
      const paragraphs = [
        { lines: [{ text: 'L1', isSpacer: false }] },
        { lines: [{ text: '', isSpacer: true }] }
      ];

      const filtered = LyricsService.filterEmptyParagraphs(paragraphs);
      expect(filtered).toHaveLength(1);
      expect(filtered[0].lines[0].text).toBe('L1');
    });
  });

  describe('roundtrip: parseToParagraphs -> serialize', () => {
    it('should preserve verse structure through parse and serialize', () => {
      const content = 'Verse 1 line 1\nVerse 1 line 2\n\nVerse 2 line 1';
      const paragraphs = LyricsService.parseToParagraphs(content);
      const result = LyricsService.serialize(paragraphs);
      expect(result).toBe(content);
    });

    it('should preserve chorus tags through parse and serialize', () => {
      const content = '{start_of_chorus}\nChorus line\n{end_of_chorus}';
      const paragraphs = LyricsService.parseToParagraphs(content);
      const result = LyricsService.serialize(paragraphs);
      expect(result).toBe(content);
    });
  });
});

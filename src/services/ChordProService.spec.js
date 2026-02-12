import ChordProService from './ChordProService';

describe('ChordProService', () => {
  describe('parseToParagraphs', () => {
    it('should parse a simple line as a verse paragraph', () => {
      const content = 'Simple lyrics';
      const paragraphs = ChordProService.parseToParagraphs(content);

      expect(paragraphs).toHaveLength(1);
      expect(paragraphs[0].type).toBe('verse');
      expect(paragraphs[0].lines[0].segments[0].text).toBe('Simple lyrics');
    });

    it('should identify chorus tags correctly', () => {
      const content = '{start_of_chorus}\nChorus line\n{end_of_chorus}';
      const paragraphs = ChordProService.parseToParagraphs(content);

      expect(paragraphs).toHaveLength(1);
      expect(paragraphs[0].type).toBe('chorus');
      expect(paragraphs[0].lines[0].segments[0].text).toBe('Chorus line');
    });

    it('should split paragraphs by empty lines', () => {
      const content = 'Verse 1\n\nVerse 2';
      const paragraphs = ChordProService.parseToParagraphs(content);

      expect(paragraphs).toHaveLength(2);
      expect(paragraphs[0].type).toBe('verse');
      expect(paragraphs[1].type).toBe('verse');
    });

    it('should parse chords and text segments correctly', () => {
      const content = '[A]Amazing [D]Grace';
      const paragraphs = ChordProService.parseToParagraphs(content);
      const segments = paragraphs[0].lines[0].segments;

      expect(segments).toHaveLength(2);
      expect(segments[0]).toEqual({ chord: 'A', text: 'Amazing ' });
      expect(segments[1]).toEqual({ chord: 'D', text: 'Grace' });
    });
  });

  describe('serialize', () => {
    it('should convert paragraphs back to ChordPro text', () => {
      const paragraphs = [
        {
          type: 'chorus',
          lines: [
            { segments: [{ chord: 'G', text: 'Gloria' }], isSpacer: false }
          ]
        }
      ];

      const result = ChordProService.serialize(paragraphs);
      expect(result).toContain('{start_of_chorus}');
      expect(result).toContain('[G]Gloria');
      expect(result).toContain('{end_of_chorus}');
    });

    it('should handle verse type without tags', () => {
      const paragraphs = [
        {
          type: 'verse',
          lines: [
            { segments: [{ chord: 'D', text: 'Verse line' }], isSpacer: false }
          ]
        }
      ];

      const result = ChordProService.serialize(paragraphs);
      expect(result).not.toContain('{start_of_chorus}');
      expect(result).not.toContain('{end_of_chorus}');
      expect(result).toContain('[D]Verse line');
    });

    it('should handle multiple paragraphs with mixed types', () => {
      const paragraphs = [
        {
          type: 'verse',
          lines: [{ segments: [{ text: 'Verse 1' }], isSpacer: false }]
        },
        {
          type: 'chorus',
          lines: [{ segments: [{ text: 'Chorus' }], isSpacer: false }]
        },
        {
          type: 'coda',
          lines: [{ segments: [{ text: 'Coda' }], isSpacer: false }]
        }
      ];

      const result = ChordProService.serialize(paragraphs);

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
});

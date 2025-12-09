import { jest } from '@jest/globals';
import {
  chooseWeighted,
  detectTopic,
  detectDialogueTree,
} from '../../../utils/chatUtils.js';

describe('Chat Utils', () => {
  describe('chooseWeighted', () => {
    it('returns null for empty or null input', () => {
      expect(chooseWeighted([])).toBeNull();
      expect(chooseWeighted(null)).toBeNull();
    });

    it('returns an item based on probability', () => {
      const items = [{ text: 'A', probability: 1.0 }];
      const result = chooseWeighted(items);
      expect(result).toEqual(items[0]);
    });

    it('handles multiple items', () => {
      // Mock Math.random to control the outcome
      const originalRandom = Math.random;
      Math.random = () => 0.1; // Should pick the first item if it has enough weight

      const items = [
        { text: 'A', probability: 0.5 },
        { text: 'B', probability: 0.5 },
      ];

      const result = chooseWeighted(items);
      expect(result.text).toBe('A');

      Math.random = originalRandom;
    });
  });

  describe('detectTopic', () => {
    const topics = {
      greetings: ['hello', 'hi'],
      farewell: ['bye'],
    };

    it('detects topic from exact match', () => {
      expect(detectTopic('hello', topics)).toBe('greetings');
    });

    it('detects topic from partial match (case insensitive)', () => {
      expect(detectTopic('Oh Hi there', topics)).toBe('greetings');
    });

    it('returns null if no topic matches', () => {
      expect(detectTopic('weather', topics)).toBeNull();
    });
  });

  describe('detectDialogueTree', () => {
    const trees = {
      strategy: { triggers: ['war', 'battle'] },
    };

    it('detects tree from trigger word', () => {
      const result = detectDialogueTree('I want war', trees);
      expect(result).toEqual({ name: 'strategy', step: 'start' });
    });

    it('returns null if no trigger matches', () => {
      expect(detectDialogueTree('peace', trees)).toBeNull();
    });

    it('returns null if trees are undefined', () => {
      expect(detectDialogueTree('war', null)).toBeNull();
    });
  });
});

import { jest } from '@jest/globals';
import { getCurrentTime } from '../../../utils/chatUtils.js';

describe('chatUtils', () => {
  describe('getCurrentTime', () => {
    it('returns time in DD Mon HH:MM format', () => {
      const mockDate = new Date('2023-12-25T14:30:00');
      jest.useFakeTimers().setSystemTime(mockDate);

      const time = getCurrentTime();
      // Check if it contains the day, month, and time components
      expect(time).toContain('25 Dec');
      expect(time).toContain('14:30');

      jest.useRealTimers();
    });
  });
});

import { TSound } from './sound';
import {
  AudioJobLoadSoundFromUrl,
  AudioJobPlaySound,
  AudioJobSetVolume,
} from './jobs';

// Mock the job manager
interface MockJobManager {
  do: jest.Mock;
}

const mockJobManager: MockJobManager = {
  do: jest.fn(),
};

describe('TSound', () => {
  let sound: TSound;
  let mockJobs: typeof mockJobManager;

  beforeEach(() => {
    sound = new TSound();
    mockJobs = { ...mockJobManager };
    jest.clearAllMocks();
  });

  describe('initial state', () => {
    it('should have default volume of 1.0', () => {
      expect(sound.volume).toBe(1.0);
    });

    it('should have default loop of false', () => {
      expect(sound.loop).toBe(false);
    });
  });

  describe('loadWithJob', () => {
    it('should load a sound using the job manager', async () => {
      const url = 'https://example.com/sound.mp3';
      const expectedUuid = 'test-uuid-123';

      mockJobs.do.mockResolvedValue(expectedUuid);

      await sound.loadWithJob(mockJobs as any, url);

      expect(mockJobs.do).toHaveBeenCalledWith(AudioJobLoadSoundFromUrl, url);
      expect(sound.volume).toBe(1.0); // Should remain unchanged
      expect(sound.loop).toBe(false); // Should remain unchanged
    });

    it('should store the returned UUID and job manager', async () => {
      const url = 'https://example.com/sound.mp3';
      const expectedUuid = 'test-uuid-456';

      mockJobs.do.mockResolvedValue(expectedUuid);

      await sound.loadWithJob(mockJobs as any, url);

      // We can't directly access private properties, but we can test behavior
      // that depends on them being set correctly
      sound.play();
      expect(mockJobs.do).toHaveBeenCalledWith(AudioJobPlaySound, {
        uuid: expectedUuid,
        volume: 1.0,
        loop: false,
      });
    });

    it('should handle job manager errors', async () => {
      const url = 'https://example.com/sound.mp3';
      const error = new Error('Failed to load sound');

      mockJobs.do.mockRejectedValue(error);

      await expect(sound.loadWithJob(mockJobs as any, url)).rejects.toThrow(
        'Failed to load sound',
      );
    });
  });

  describe('play', () => {
    beforeEach(async () => {
      mockJobs.do.mockResolvedValue('test-uuid-123');
      await sound.loadWithJob(mockJobs as any, 'test-url');
      jest.clearAllMocks();
    });

    it('should play the sound with current volume and loop settings', () => {
      sound.volume = 0.7;
      sound.loop = true;

      sound.play();

      expect(mockJobs.do).toHaveBeenCalledWith(AudioJobPlaySound, {
        uuid: 'test-uuid-123',
        volume: 0.7,
        loop: true,
      });
    });

    it('should use default volume and loop settings', () => {
      sound.play();

      expect(mockJobs.do).toHaveBeenCalledWith(AudioJobPlaySound, {
        uuid: 'test-uuid-123',
        volume: 1.0,
        loop: false,
      });
    });

    it('should not play if not loaded (no UUID)', () => {
      const unloadedSound = new TSound();

      unloadedSound.play();

      expect(mockJobs.do).not.toHaveBeenCalled();
    });

    it('should not play if no job manager', () => {
      const unloadedSound = new TSound();
      // Simulate having a UUID but no job manager by manually setting the uuid
      // but leaving jobs undefined
      (unloadedSound as any).uuid = 'test-uuid';

      unloadedSound.play();

      expect(mockJobs.do).not.toHaveBeenCalled();
    });
  });

  describe('setVolume', () => {
    beforeEach(async () => {
      mockJobs.do.mockResolvedValue('test-uuid-123');
      await sound.loadWithJob(mockJobs as any, 'test-url');
      jest.clearAllMocks();
    });

    it('should set volume and call job manager', () => {
      const newVolume = 0.5;

      sound.setVolume(newVolume);

      expect(sound.volume).toBe(newVolume);
      expect(mockJobs.do).toHaveBeenCalledWith(AudioJobSetVolume, {
        uuid: 'test-uuid-123',
        volume: newVolume,
      });
    });

    it('should handle edge case volume values', () => {
      // Test minimum volume
      sound.setVolume(0);
      expect(sound.volume).toBe(0);
      expect(mockJobs.do).toHaveBeenCalledWith(AudioJobSetVolume, {
        uuid: 'test-uuid-123',
        volume: 0,
      });

      // Test maximum volume
      sound.setVolume(1);
      expect(sound.volume).toBe(1);
      expect(mockJobs.do).toHaveBeenCalledWith(AudioJobSetVolume, {
        uuid: 'test-uuid-123',
        volume: 1,
      });

      // Test fractional volume
      sound.setVolume(0.33);
      expect(sound.volume).toBe(0.33);
      expect(mockJobs.do).toHaveBeenCalledWith(AudioJobSetVolume, {
        uuid: 'test-uuid-123',
        volume: 0.33,
      });
    });

    it('should not set volume if not loaded (no UUID)', () => {
      const unloadedSound = new TSound();
      const originalVolume = unloadedSound.volume;

      unloadedSound.setVolume(0.5);

      expect(unloadedSound.volume).toBe(originalVolume);
      expect(mockJobs.do).not.toHaveBeenCalled();
    });

    it('should not set volume if no job manager', () => {
      const unloadedSound = new TSound();
      // Simulate having a UUID but no job manager by manually setting the uuid
      // but leaving jobs undefined
      (unloadedSound as any).uuid = 'test-uuid';
      const originalVolume = unloadedSound.volume;

      unloadedSound.setVolume(0.5);

      expect(unloadedSound.volume).toBe(originalVolume);
      expect(mockJobs.do).not.toHaveBeenCalled();
    });
  });

  describe('property updates', () => {
    it('should allow volume to be set directly', () => {
      sound.volume = 0.8;
      expect(sound.volume).toBe(0.8);
    });

    it('should allow loop to be set directly', () => {
      sound.loop = true;
      expect(sound.loop).toBe(true);
    });

    it('should maintain property values after operations', async () => {
      sound.volume = 0.6;
      sound.loop = true;

      mockJobs.do.mockResolvedValue('test-uuid-123');
      await sound.loadWithJob(mockJobs as any, 'test-url');

      expect(sound.volume).toBe(0.6);
      expect(sound.loop).toBe(true);
    });
  });

  describe('integration tests', () => {
    it('should handle complete sound lifecycle', async () => {
      const url = 'https://example.com/sound.mp3';
      const uuid = 'test-uuid-789';

      // Load sound
      mockJobs.do.mockResolvedValue(uuid);
      await sound.loadWithJob(mockJobs as any, url);

      expect(mockJobs.do).toHaveBeenCalledWith(AudioJobLoadSoundFromUrl, url);

      // Set custom properties
      sound.volume = 0.4;
      sound.loop = true;

      // Play sound
      sound.play();
      expect(mockJobs.do).toHaveBeenCalledWith(AudioJobPlaySound, {
        uuid,
        volume: 0.4,
        loop: true,
      });

      // Change volume
      sound.setVolume(0.8);
      expect(mockJobs.do).toHaveBeenCalledWith(AudioJobSetVolume, {
        uuid,
        volume: 0.8,
      });

      // Play again with new volume
      sound.play();
      expect(mockJobs.do).toHaveBeenCalledWith(AudioJobPlaySound, {
        uuid,
        volume: 0.8,
        loop: true,
      });
    });

    it('should handle multiple sound instances independently', async () => {
      const sound1 = new TSound();
      const sound2 = new TSound();

      mockJobs.do
        .mockResolvedValueOnce('uuid-1')
        .mockResolvedValueOnce('uuid-2');

      // Load both sounds
      await sound1.loadWithJob(mockJobs as any, 'url1');
      await sound2.loadWithJob(mockJobs as any, 'url2');

      // Set different properties
      sound1.volume = 0.3;
      sound1.loop = false;
      sound2.volume = 0.7;
      sound2.loop = true;

      // Play both sounds
      sound1.play();
      sound2.play();

      expect(mockJobs.do).toHaveBeenCalledWith(AudioJobPlaySound, {
        uuid: 'uuid-1',
        volume: 0.3,
        loop: false,
      });

      expect(mockJobs.do).toHaveBeenCalledWith(AudioJobPlaySound, {
        uuid: 'uuid-2',
        volume: 0.7,
        loop: true,
      });
    });
  });
});

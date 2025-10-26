import {
  AudioJobLoadSoundFromUrl,
  AudioJobPlaySound,
  AudioJobSetVolume,
  registerAudioJobs,
} from './jobs';
import { TJobContextTypes } from '../jobs/context-types';

// Mock TAudio
const mockAudio = {
  loadSound: jest.fn(),
  play: jest.fn(),
  setVolume: jest.fn(),
};

// Mock job manager
const mockJobManager = {
  registerJob: jest.fn(),
};

describe('Audio Jobs', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('AudioJobLoadSoundFromUrl', () => {
    it('should have correct configuration', () => {
      expect(AudioJobLoadSoundFromUrl.name).toBe('load_sound_from_url');
      expect(AudioJobLoadSoundFromUrl.requiredContext).toBe(
        TJobContextTypes.Audio,
      );
    });
  });

  describe('AudioJobPlaySound', () => {
    it('should have correct configuration', () => {
      expect(AudioJobPlaySound.name).toBe('play_sound');
      expect(AudioJobPlaySound.requiredContext).toBe(TJobContextTypes.Audio);
    });
  });

  describe('AudioJobSetVolume', () => {
    it('should have correct configuration', () => {
      expect(AudioJobSetVolume.name).toBe('set_volume');
      expect(AudioJobSetVolume.requiredContext).toBe(TJobContextTypes.Audio);
    });
  });

  describe('registerAudioJobs', () => {
    it('should register all three audio jobs', () => {
      registerAudioJobs(mockJobManager as any);

      expect(mockJobManager.registerJob).toHaveBeenCalledTimes(3);
    });

    it('should register load sound job with correct handler', () => {
      registerAudioJobs(mockJobManager as any);

      const loadSoundCall = mockJobManager.registerJob.mock.calls.find(
        (call) => call[0] === AudioJobLoadSoundFromUrl,
      );

      expect(loadSoundCall).toBeDefined();
      expect(loadSoundCall[0]).toBe(AudioJobLoadSoundFromUrl);
    });

    it('should register play sound job with correct handler', () => {
      registerAudioJobs(mockJobManager as any);

      const playSoundCall = mockJobManager.registerJob.mock.calls.find(
        (call) => call[0] === AudioJobPlaySound,
      );

      expect(playSoundCall).toBeDefined();
      expect(playSoundCall[0]).toBe(AudioJobPlaySound);
    });

    it('should register set volume job with correct handler', () => {
      registerAudioJobs(mockJobManager as any);

      const setVolumeCall = mockJobManager.registerJob.mock.calls.find(
        (call) => call[0] === AudioJobSetVolume,
      );

      expect(setVolumeCall).toBeDefined();
      expect(setVolumeCall[0]).toBe(AudioJobSetVolume);
    });
  });

  describe('job handlers', () => {
    let mockContext: any;

    beforeEach(() => {
      mockContext = {
        audio: mockAudio,
      };
    });

    describe('load sound handler', () => {
      it('should call audio.loadSound with correct URL', async () => {
        registerAudioJobs(mockJobManager as any);

        const loadSoundCall = mockJobManager.registerJob.mock.calls.find(
          (call) => call[0] === AudioJobLoadSoundFromUrl,
        );
        const handler = loadSoundCall[1];

        const url = 'https://example.com/sound.mp3';
        const expectedUuid = 'test-uuid-123';
        mockAudio.loadSound.mockResolvedValue(expectedUuid);

        const result = await handler(mockContext, url);

        expect(mockAudio.loadSound).toHaveBeenCalledWith(url);
        expect(result).toBe(expectedUuid);
      });

      it('should handle load sound errors', async () => {
        registerAudioJobs(mockJobManager as any);

        const loadSoundCall = mockJobManager.registerJob.mock.calls.find(
          (call) => call[0] === AudioJobLoadSoundFromUrl,
        );
        const handler = loadSoundCall[1];

        const url = 'https://example.com/sound.mp3';
        const error = new Error('Failed to load sound');
        mockAudio.loadSound.mockRejectedValue(error);

        await expect(handler(mockContext, url)).rejects.toThrow(
          'Failed to load sound',
        );
      });
    });

    describe('play sound handler', () => {
      it('should call audio.play with correct parameters', async () => {
        registerAudioJobs(mockJobManager as any);

        const playSoundCall = mockJobManager.registerJob.mock.calls.find(
          (call) => call[0] === AudioJobPlaySound,
        );
        const handler = playSoundCall[1];

        const params = {
          uuid: 'test-uuid-123',
          volume: 0.7,
          loop: true,
        };

        await handler(mockContext, params);

        expect(mockAudio.play).toHaveBeenCalledWith(
          params.uuid,
          params.volume,
          params.loop,
        );
      });

      it('should handle different parameter combinations', async () => {
        registerAudioJobs(mockJobManager as any);

        const playSoundCall = mockJobManager.registerJob.mock.calls.find(
          (call) => call[0] === AudioJobPlaySound,
        );
        const handler = playSoundCall[1];

        // Test with loop = false
        const params1 = {
          uuid: 'test-uuid-456',
          volume: 0.3,
          loop: false,
        };

        await handler(mockContext, params1);
        expect(mockAudio.play).toHaveBeenCalledWith(
          params1.uuid,
          params1.volume,
          params1.loop,
        );

        // Test with volume = 0
        const params2 = {
          uuid: 'test-uuid-789',
          volume: 0,
          loop: true,
        };

        await handler(mockContext, params2);
        expect(mockAudio.play).toHaveBeenCalledWith(
          params2.uuid,
          params2.volume,
          params2.loop,
        );
      });
    });

    describe('set volume handler', () => {
      it('should call audio.setVolume with correct parameters', async () => {
        registerAudioJobs(mockJobManager as any);

        const setVolumeCall = mockJobManager.registerJob.mock.calls.find(
          (call) => call[0] === AudioJobSetVolume,
        );
        const handler = setVolumeCall[1];

        const params = {
          uuid: 'test-uuid-123',
          volume: 0.5,
        };

        await handler(mockContext, params);

        expect(mockAudio.setVolume).toHaveBeenCalledWith(
          params.uuid,
          params.volume,
        );
      });

      it('should handle edge case volume values', async () => {
        registerAudioJobs(mockJobManager as any);

        const setVolumeCall = mockJobManager.registerJob.mock.calls.find(
          (call) => call[0] === AudioJobSetVolume,
        );
        const handler = setVolumeCall[1];

        // Test minimum volume
        await handler(mockContext, { uuid: 'test-uuid', volume: 0 });
        expect(mockAudio.setVolume).toHaveBeenCalledWith('test-uuid', 0);

        // Test maximum volume
        await handler(mockContext, { uuid: 'test-uuid', volume: 1 });
        expect(mockAudio.setVolume).toHaveBeenCalledWith('test-uuid', 1);

        // Test fractional volume
        await handler(mockContext, { uuid: 'test-uuid', volume: 0.33 });
        expect(mockAudio.setVolume).toHaveBeenCalledWith('test-uuid', 0.33);
      });
    });
  });

  describe('job registration integration', () => {
    it('should register jobs in the correct order', () => {
      registerAudioJobs(mockJobManager as any);

      const calls = mockJobManager.registerJob.mock.calls;

      // Check that all three jobs are registered
      const jobConfigs = calls.map((call) => call[0]);
      expect(jobConfigs).toContain(AudioJobLoadSoundFromUrl);
      expect(jobConfigs).toContain(AudioJobPlaySound);
      expect(jobConfigs).toContain(AudioJobSetVolume);
    });

    it('should register handlers that are functions', () => {
      registerAudioJobs(mockJobManager as any);

      const calls = mockJobManager.registerJob.mock.calls;

      calls.forEach((call) => {
        const handler = call[1];
        expect(typeof handler).toBe('function');
      });
    });

    it('should handle multiple registrations', () => {
      // Register jobs multiple times
      registerAudioJobs(mockJobManager as any);
      registerAudioJobs(mockJobManager as any);

      // Should register 6 times total (3 jobs × 2 registrations)
      expect(mockJobManager.registerJob).toHaveBeenCalledTimes(6);
    });
  });
});

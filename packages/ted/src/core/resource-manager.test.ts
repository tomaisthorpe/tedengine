import type { IAsset } from './resource-manager';
import { TResourceManager } from './resource-manager';
import { TJobManager } from '../jobs/job-manager';

describe('TResourceManager', () => {
  let resourceManager: TResourceManager;
  let jobs: TJobManager;

  beforeEach(() => {
    jobs = new TJobManager([]);
    resourceManager = new TResourceManager(jobs);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('isResourceLoaded should return true if resource is loaded', () => {
    const key = 'testKey';
    const asset: IAsset = {
      load: jest.fn(),
    };

    resourceManager['resources'].set(key, asset);

    const result = resourceManager.isResourcedLoaded(key);

    expect(result).toBe(true);
  });

  test('isResourceLoaded should return false if resource is not loaded', () => {
    const key = 'testKey';

    const result = resourceManager.isResourcedLoaded(key);

    expect(result).toBe(false);
  });

  test('get should return the loaded resource if it exists', () => {
    const key = 'testKey';
    const asset: IAsset = {
      load: jest.fn(),
    };

    resourceManager['resources'].set(key, asset);

    const result = resourceManager.get<IAsset>(key);

    expect(result).toBe(asset);
  });

  test('get should return undefined if the loaded resource does not exist', () => {
    const key = 'testKey';

    const result = resourceManager.get<IAsset>(key);

    expect(result).toBeUndefined();
  });
});

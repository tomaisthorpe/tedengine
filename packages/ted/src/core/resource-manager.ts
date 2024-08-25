import type TJobManager from '../jobs/job-manager';

export interface IAsset {
  load(response: Response): Promise<void>;
}

export interface IJobAsset {
  loadWithJob(jobs: TJobManager, url: string, config?: unknown): Promise<void>;
}

export default class TResourceManager {
  private resources = new Map<string, IAsset | IJobAsset>();

  constructor(private jobs: TJobManager) {}

  /**
   * Checks if a resource is already loaded into the cache
   *
   * @param key resource key
   */
  public isResourcedLoaded(key: string): boolean {
    return this.resources.has(key);
  }

  /**
   * Returns an already loaded resource.
   *
   * Must be loaded, otherwise undefined will be returned.
   */
  public get<T extends IAsset | IJobAsset>(key: string): T | undefined {
    return this.resources.get(key) as T;
  }

  /**
   * Loads a resource of type T with the specified key.
   * If the resource is already loaded, it returns the cached resource.
   * Otherwise, it fetches the resource, caches the loaded resource, and returns it.
   *
   * @param type The constructor function of the resource type T.
   * @param key The key or URL of the resource to load.
   * @returns A promise that resolves to the loaded resource of type T.
   */
  public async load<T extends IAsset | IJobAsset>(
    type: { new (): T },
    key: string,
    config?: unknown,
  ): Promise<T> {
    // If already loaded, then just resolve
    if (this.isResourcedLoaded(key)) {
      return this.resources.get(key) as T;
    }

    const resource = new type();

    if (isJobAsset(resource)) {
      await resource.loadWithJob(this.jobs, key, config);
    } else {
      const response = await fetch(key);
      await resource.load(response);
    }

    this.resources.set(key, resource);
    return resource;
  }
}

function isJobAsset(object: object): object is IJobAsset {
  return 'loadWithJob' in object;
}

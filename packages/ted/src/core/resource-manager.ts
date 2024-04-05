import type TJobManager from '../jobs/job-manager';

export interface IAsset {
  load(response: Response): Promise<void>;
}

export interface IJobAsset {
  loadWithJob(jobs: TJobManager, url: string): Promise<void>;
}

export default class TResourceManager {
  private resources: { [key: string]: any } = {};

  constructor(private jobs: TJobManager) { }

  /**
   * Checks if a resource is already loaded into the cache
   *
   * @param key resource key
   */
  public isResourcedLoaded(key: string): boolean {
    return this.resources[key] !== undefined;
  }

  /**
   * Returns an already loaded resource.
   *
   * Must be loaded, otherwise undefined will be returned.
   */
  public get<T extends IAsset | IJobAsset>(key: string): T {
    return this.resources[key] as T;
  }

  public async load<T extends IAsset | IJobAsset>(
    type: { new(): T },
    key: string,
  ): Promise<T> {
    // If already loaded, then just resolve
    if (this.isResourcedLoaded(key)) {
      return this.resources[key];
    }

    const response = await fetch(key);
    const resource = new type();

    if (isJobAsset(resource)) {
      await resource.loadWithJob(this.jobs, key);
    } else {
      await resource.load(response);
    }

    this.resources[key] = resource;
    return resource;
  }
}

function isJobAsset(object: object): object is IJobAsset {
  return 'loadWithJob' in object;
}

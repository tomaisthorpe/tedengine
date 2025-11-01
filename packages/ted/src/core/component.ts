/**
 * A component is a data structure that describes a property of an entity.
 */
export abstract class TComponent {
  /**
   * The components that are required by this component.
   * If the entity doesn't have any of the components, they will be created with default values.
   */
  public static readonly requiredComponents?: TComponentConstructor[];
}

/**
 * Type for component class constructors
 * Uses any[] for constructor parameters because each component type has its own unique
 * constructor signature. Type safety is maintained at usage sites when instantiating
 * specific component types. This is similar to type erasure for heterogeneous collections.
 */
export type TComponentConstructor<T extends TComponent = TComponent> = new (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ...args: any[]
) => T;

export class TComponentContainer {
  private components: Map<TComponentConstructor, TComponent> = new Map();

  constructor(components?: TComponent[]) {
    if (components) {
      for (const component of components) {
        this.add(component);
      }
    }
  }

  public add(component: TComponent): void {
    // Check if this component has required components
    // If components are added out of order with provided values,
    // they will be overridden later.
    const requiredComponents = (component.constructor as typeof TComponent)
      .requiredComponents;
    if (requiredComponents) {
      for (const requiredComponent of requiredComponents) {
        if (!this.has(requiredComponent)) {
          this.add(new requiredComponent());
        }
      }
    }

    this.components.set(
      component.constructor as TComponentConstructor,
      component,
    );
  }

  public get<T extends TComponent>(
    componentClass: TComponentConstructor<T>,
  ): T | undefined {
    return this.components.get(componentClass) as T | undefined;
  }

  public has(componentClass: TComponentConstructor): boolean {
    return this.components.has(componentClass);
  }

  public hasAll(componentClasses: Iterable<TComponentConstructor>): boolean {
    return Array.from(componentClasses).every((componentClass) =>
      this.has(componentClass),
    );
  }

  public hasAny(componentClasses: Iterable<TComponentConstructor>): boolean {
    return Array.from(componentClasses).some((componentClass) =>
      this.has(componentClass),
    );
  }

  public remove(componentClass: TComponentConstructor): void {
    this.components.delete(componentClass);
  }

  public getAll(): TComponent[] {
    return Array.from(this.components.values());
  }
}

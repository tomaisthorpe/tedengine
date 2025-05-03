import type { TComponentConstructor } from './component';
import type { TComponent } from './component';
import type TWorld from './world';

/**
 * Represents a predefined set of components that can be used to create entities
 */
export class TBundle {
  constructor(
    private readonly componentTypes: TComponentConstructor[],
    private readonly defaultValues: Map<
      TComponentConstructor,
      () => TComponent
    > = new Map(),
  ) {}

  /**
   * Creates a new entity with this bundle's components
   */
  public createEntity(world: TWorld, overrides?: TComponent[]): number {
    const components: TComponent[] = [];

    for (const componentType of this.componentTypes) {
      const createComponent = this.defaultValues.get(componentType);
      if (createComponent) {
        components.push(createComponent());
      } else {
        components.push(new componentType());
      }
    }

    return world.createEntity([...components, ...(overrides ?? [])]);
  }

  /**
   * Adds a component type to this bundle with an optional default value factory
   */
  public withComponent<T extends TComponent>(
    componentType: TComponentConstructor<T>,
    createDefault?: () => T,
  ): TBundle {
    const newComponentTypes = [...this.componentTypes, componentType];
    const newDefaultValues = new Map(this.defaultValues);

    if (createDefault) {
      newDefaultValues.set(componentType, createDefault);
    }

    return new TBundle(newComponentTypes, newDefaultValues);
  }

  /**
   * Merges this bundle with another bundle and returns a new bundle
   * Components from the other bundle will override components of the same type
   */
  public merge(other: TBundle): TBundle {
    // Combine component types, removing duplicates
    const mergedComponentTypes = [...this.componentTypes];
    for (const componentType of other.componentTypes) {
      if (!mergedComponentTypes.includes(componentType)) {
        mergedComponentTypes.push(componentType);
      }
    }

    // Combine default values, with other bundle's values taking precedence
    const mergedDefaultValues = new Map(this.defaultValues);
    for (const [componentType, createDefault] of other.defaultValues) {
      mergedDefaultValues.set(componentType, createDefault);
    }

    return new TBundle(mergedComponentTypes, mergedDefaultValues);
  }

  /**
   * Creates a new bundle from a set of component types
   */
  public static fromComponents(
    componentTypes: TComponentConstructor[],
  ): TBundle {
    return new TBundle(componentTypes);
  }
}

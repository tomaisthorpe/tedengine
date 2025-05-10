import type { TComponentConstructor } from './component';
import type { TComponent } from './component';

/**
 * Represents a predefined set of components that can be used to create entities
 */
export class TBundle {
  constructor(
    public readonly componentTypes: TComponentConstructor[],
    private readonly defaultValues: Map<
      TComponentConstructor,
      () => TComponent
    > = new Map(),
  ) {}

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
   * Creates a new bundle with the specified component overrides
   * @param overrides Component instances to override default values in the bundle
   */
  public with(...overrides: TComponent[]): TBundle {
    const newDefaultValues = new Map(this.defaultValues);

    for (const component of overrides) {
      // Get the constructor of the component
      const constructor = Object.getPrototypeOf(component).constructor;
      // Check if this component type is in the bundle
      if (this.componentTypes.includes(constructor)) {
        newDefaultValues.set(constructor, () => component);
      }
    }

    return new TBundle(this.componentTypes, newDefaultValues);
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

  /**
   * Creates the components defined in this bundle without creating an entity
   */
  public createComponents(): TComponent[] {
    const components: TComponent[] = [];

    for (const componentType of this.componentTypes) {
      const createComponent = this.defaultValues.get(componentType);
      if (createComponent) {
        components.push(createComponent());
      } else {
        components.push(new componentType());
      }
    }

    console.log(components);

    return components;
  }
}

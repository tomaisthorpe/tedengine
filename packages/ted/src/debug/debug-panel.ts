import type { TEventQueue } from '../core/event-queue';
import type { TEngine } from '../engine/engine';
import type { TKeyUpEvent } from '../input/events';
import { TEventTypesInput } from '../input/events';
import type { TDebugPanelSectionSerializedData } from './debug-panel-section';
import { TDebugPanelSection } from './debug-panel-section';
import type { TDebugUpdateEvent } from './events';
import { TEventTypesDebug } from './events';

export interface TDebugPanelData {
  isOpen: boolean;
  sections: TDebugPanelSection[];
}

export interface TDebugPanelSerializedData {
  isOpen: boolean;
  sections: TDebugPanelSectionSerializedData[];
}

/**
 * The debug panel holds a number of stats to display on the UI.
 * The panel also acts as the default section.
 */
export class TDebugPanel extends TDebugPanelSection {
  private sections: TDebugPanelSection[] = [];

  constructor(
    events: TEventQueue,
    private isOpen = false,
    engine: TEngine,
  ) {
    super(events, 'Debug', true);

    this.createDefaultRows(engine);

    events.addListener<TKeyUpEvent>(TEventTypesInput.KeyUp, '`', (e) =>
      this.toggle(),
    );
  }

  /**
   * Runs every update to keep rows up to date
   *
   * @param engine
   * @param delta
   */
  public update(engine: TEngine, delta: number) {
    // If panel isn't open, no reason to update
    if (!this.isOpen) return;

    super.update(engine, delta);

    // Remove any deleted sections
    this.sections = this.sections.filter((s) => !s.dead);

    for (const section of this.sections) {
      section.update(engine, delta);
    }

    this.publishUpdateEvent();
  }

  /**
   * Add new section to the debug panel
   * @param name Name of section
   */
  public addSection(name: string, startOpen = false): TDebugPanelSection {
    const section = new TDebugPanelSection(this.events, name, startOpen);
    this.sections.push(section);

    return section;
  }

  private createDefaultRows(engine: TEngine) {
    this.addValue('Engine (ms)', (engine: TEngine) => {
      return engine.stats.engineTime.toFixed(1);
    });

    this.addFredValue('Render (ms)', 'renderTime');

    this.addButtons('Debug Physics', {
      label: 'Toggle',
      onClick: () => {
        const world = engine.gameState.current()?.world;
        if (world) {
          world.physicsDebug = !world.physicsDebug;
        }
      },
    });
  }

  /**
   * Toggle visibily of the debug panel
   */
  public toggle() {
    this.isOpen = !this.isOpen;

    this.publishUpdateEvent();
  }

  private publishUpdateEvent() {
    const event: TDebugUpdateEvent = {
      type: TEventTypesDebug.Update,
      data: {
        isOpen: this.isOpen,
        sections: [
          this.getData(),
          ...this.sections.map((section) => section.getData()),
        ],
      },
    };
    this.events.broadcast(event);
  }
}

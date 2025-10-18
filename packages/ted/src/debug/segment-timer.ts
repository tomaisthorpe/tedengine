import type { TDebugPanel } from './debug-panel';
import type { TDebugPanelSection } from './debug-panel-section';
import { TDebugPanelValue } from './debug-panel-value';

interface TSegment {
  name: string;
  path: string; // Full hierarchical path (e.g., "Update/Physics/Collision")

  // Timing stats
  inclusiveAverage: number; // Average time including children
  exclusiveAverage: number; // Average time excluding children
  inclusiveSamples: number[];
  exclusiveSamples: number[];
  sampleCount: number;

  // For tracking current execution
  lastStartTime: number;
  lastEndTime: number | null;
  lastChildrenTime: number;

  // UI
  debugRow?: TDebugPanelValue;
}

/**
 * Context object for timing a segment. Allows creating child segments
 * and properly tracking hierarchical timing even with concurrent operations.
 */
export class TSegmentTimingContext {
  private startTime: number;
  private childrenTime = 0;
  private ended = false;

  constructor(
    private timer: TSegmentTimer,
    private segment: TSegment,
    private parentContext: TSegmentTimingContext | null,
  ) {
    this.startTime = performance.now();
    this.segment.lastStartTime = this.startTime;
    this.segment.lastEndTime = null;
    this.segment.lastChildrenTime = 0;
  }

  /**
   * Start timing a child segment within this segment's context.
   *
   * @param name - Name of the child segment
   * @returns A new timing context for the child segment
   *
   * @example
   * const updateSegment = segmentTimer.startSegment("Update");
   * const physicsSegment = updateSegment.startSegment("Physics");
   * // ... physics work ...
   * physicsSegment.end();
   * updateSegment.end();
   */
  startSegment(name: string): TSegmentTimingContext {
    if (this.ended) {
      console.warn(
        `Attempted to start child segment "${name}" on already-ended segment "${this.segment.name}"`,
      );
    }
    return this.timer.startChildSegment(name, this);
  }

  /**
   * End timing for this segment and record the results.
   * Can be called multiple times safely (subsequent calls are no-ops).
   */
  end(): void {
    if (this.ended) {
      return;
    }
    this.ended = true;

    const endTime = performance.now();
    const inclusiveDuration = endTime - this.startTime;
    const exclusiveDuration = inclusiveDuration - this.childrenTime;

    this.segment.lastEndTime = endTime;
    this.segment.lastChildrenTime = this.childrenTime;

    // Update inclusive average
    if (this.segment.inclusiveAverage === 0) {
      this.segment.inclusiveAverage = inclusiveDuration;
    } else {
      this.segment.inclusiveAverage =
        this.timer.getAlpha() * inclusiveDuration +
        (1 - this.timer.getAlpha()) * this.segment.inclusiveAverage;
    }

    // Update exclusive average
    if (this.segment.exclusiveAverage === 0) {
      this.segment.exclusiveAverage = exclusiveDuration;
    } else {
      this.segment.exclusiveAverage =
        this.timer.getAlpha() * exclusiveDuration +
        (1 - this.timer.getAlpha()) * this.segment.exclusiveAverage;
    }

    // Update samples for p99 calculation
    const maxSamples = this.timer.getMaxSamples();
    if (this.segment.inclusiveSamples.length >= maxSamples) {
      this.segment.inclusiveSamples.shift();
      this.segment.exclusiveSamples.shift();
    }
    this.segment.inclusiveSamples.push(inclusiveDuration);
    this.segment.exclusiveSamples.push(exclusiveDuration);
    this.segment.sampleCount++;

    // Add this segment's time to parent's children time
    if (this.parentContext) {
      this.parentContext.addChildTime(inclusiveDuration);
    }
  }

  /**
   * Internal method to track time spent in child segments
   */
  addChildTime(duration: number): void {
    this.childrenTime += duration;
  }

  /**
   * Get the segment being timed by this context
   */
  getSegment(): Readonly<TSegment> {
    return this.segment;
  }
}

export class TSegmentTimer {
  private segments: Map<string, TSegment> = new Map();
  private debugSection: TDebugPanelSection;

  // Alpha value for exponential moving average (0 < alpha <= 1)
  private alpha = 0.1;
  // Maximum number of samples to keep for p99 calculation
  private maxSamples = 100;

  constructor(
    private debugPanel: TDebugPanel,
    label: string,
  ) {
    this.debugSection = debugPanel.addSection(label, false);
  }

  /**
   * Start timing a root-level segment. Returns a context object that can
   * be used to create child segments or end the timing.
   *
   * @param name - Name of this segment (e.g., "Update")
   * @returns Timing context with methods to create children or end timing
   *
   * @example
   * const updateSegment = segmentTimer.startSegment("Update");
   * // ... do work ...
   * const physicsSegment = updateSegment.startSegment("Physics");
   * // ... physics work ...
   * physicsSegment.end();
   * updateSegment.end();
   */
  startSegment(name: string): TSegmentTimingContext {
    return this.createSegmentContext(name, null);
  }

  /**
   * Internal method to start a child segment
   */
  startChildSegment(
    name: string,
    parent: TSegmentTimingContext,
  ): TSegmentTimingContext {
    return this.createSegmentContext(name, parent);
  }

  private createSegmentContext(
    name: string,
    parentContext: TSegmentTimingContext | null,
  ): TSegmentTimingContext {
    const parentSegment = parentContext?.getSegment();
    const path = parentSegment ? `${parentSegment.path}/${name}` : name;

    let segment = this.segments.get(path);

    if (!segment) {
      segment = {
        name,
        path,
        inclusiveAverage: 0,
        exclusiveAverage: 0,
        inclusiveSamples: [],
        exclusiveSamples: [],
        sampleCount: 0,
        lastStartTime: 0,
        lastEndTime: null,
        lastChildrenTime: 0,
      };
      this.segments.set(path, segment);

      // Create the debug row
      const updateFn = () => {
        const seg = this.segments.get(path);
        if (!seg || seg.lastEndTime === null) {
          return 'Running...';
        }

        const inclusiveP99 = this.calculateP99(seg.inclusiveSamples);

        // Show both inclusive and exclusive times
        return (
          `${seg.inclusiveAverage.toFixed(2)}ms (P99: ${Math.round(inclusiveP99)}ms) | ` +
          `Exc: ${seg.exclusiveAverage.toFixed(2)}ms`
        );
      };

      // If this has a parent, create the row directly and add as child
      // Otherwise, use addValue which adds to the section's root rows
      if (parentSegment && parentSegment.debugRow) {
        const debugRow = new TDebugPanelValue(name, updateFn);
        segment.debugRow = debugRow;
        parentSegment.debugRow.addChild(debugRow);
      } else {
        segment.debugRow = this.debugSection.addValue(name, updateFn);
      }
    }

    return new TSegmentTimingContext(this, segment, parentContext);
  }

  private calculateP99(samples: number[]): number {
    if (samples.length === 0) return 0;
    const sortedSamples = [...samples].sort((a, b) => a - b);
    const index = Math.min(
      Math.ceil(samples.length * 0.99) - 1,
      samples.length - 1,
    );
    return sortedSamples[Math.max(0, index)];
  }

  /**
   * Get all segments sorted by their hierarchical path for external use
   */
  getSegments(): ReadonlyMap<string, Readonly<TSegment>> {
    return this.segments;
  }

  /**
   * Reset all timing data (useful for profiling specific scenarios)
   */
  reset() {
    for (const segment of this.segments.values()) {
      segment.inclusiveAverage = 0;
      segment.exclusiveAverage = 0;
      segment.inclusiveSamples = [];
      segment.exclusiveSamples = [];
      segment.sampleCount = 0;
    }
  }

  /**
   * Get the alpha value for exponential moving average
   */
  getAlpha(): number {
    return this.alpha;
  }

  /**
   * Get the maximum number of samples to keep
   */
  getMaxSamples(): number {
    return this.maxSamples;
  }
}

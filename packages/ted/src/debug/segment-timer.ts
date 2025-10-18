import type { TDebugPanel } from './debug-panel';
import type { TDebugPanelSection } from './debug-panel-section';

interface TSegment {
  name: string;
  startTime: number;
  endTime: number | null;
  average: number;
  samples: number[];
  sampleCount: number;
}

export class TSegmentTimer {
  private segments: Map<string, TSegment> = new Map();
  private activeSegments: TSegment[] = [];
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

  startSegment(name: string): () => void {
    let segment = this.segments.get(name);
    if (!segment) {
      segment = {
        name,
        startTime: 0,
        endTime: null,
        average: 0,
        samples: [],
        sampleCount: 0,
      };
      this.segments.set(name, segment);
      this.addSegmentToDebugPanel(segment);
    }

    segment.startTime = performance.now();
    segment.endTime = null;
    this.activeSegments.push(segment);

    return () => this.endSegment(segment);
  }

  private endSegment(segment: TSegment) {
    const index = this.activeSegments.indexOf(segment);
    if (index !== -1) {
      this.activeSegments.splice(index, 1);
      segment.endTime = performance.now();
      const duration = segment.endTime - segment.startTime;

      // Update the moving average
      if (segment.average === 0) {
        segment.average = duration;
      } else {
        segment.average =
          this.alpha * duration + (1 - this.alpha) * segment.average;
      }

      // Update samples for p99 calculation
      if (segment.samples.length >= this.maxSamples) {
        segment.samples.shift();
      }
      segment.samples.push(duration);
      segment.sampleCount++;
    } else {
      console.warn(
        `Attempted to end segment "${segment.name}" that was not active.`,
      );
    }
  }

  private addSegmentToDebugPanel(segment: TSegment) {
    this.debugSection.addValue(segment.name, () => {
      if (segment.endTime === null) {
        return 'Running...';
      }
      const p99 = this.calculateP99(segment.samples);
      return `Avg: ${segment.average.toFixed(2)} ms | P99: ${p99.toFixed(2)} ms`;
    });
  }

  private calculateP99(samples: number[]): number {
    if (samples.length === 0) return 0;
    const sortedSamples = [...samples].sort((a, b) => a - b);
    const index = Math.floor(samples.length * 0.99);
    return sortedSamples[index];
  }
}

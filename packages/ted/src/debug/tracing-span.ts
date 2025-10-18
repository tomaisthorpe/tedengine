import type { TDebugPanel } from './debug-panel';
import type { TDebugPanelSection } from './debug-panel-section';

interface TSpan {
  name: string;
  startTime: number;
  endTime: number | null;
  average: number;
  samples: number[];
  sampleCount: number;
}

export class TTracingSpan {
  private spans: Map<string, TSpan> = new Map();
  private activeSpans: TSpan[] = [];
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

  startSpan(name: string): () => void {
    let span = this.spans.get(name);
    if (!span) {
      span = {
        name,
        startTime: 0,
        endTime: null,
        average: 0,
        samples: [],
        sampleCount: 0,
      };
      this.spans.set(name, span);
      this.addSpanToDebugPanel(span);
    }

    span.startTime = performance.now();
    span.endTime = null;
    this.activeSpans.push(span);

    return () => this.endSpan(span);
  }

  private endSpan(span: TSpan) {
    const index = this.activeSpans.indexOf(span);
    if (index !== -1) {
      this.activeSpans.splice(index, 1);
      span.endTime = performance.now();
      const duration = span.endTime - span.startTime;

      // Update the moving average
      if (span.average === 0) {
        span.average = duration;
      } else {
        span.average = this.alpha * duration + (1 - this.alpha) * span.average;
      }

      // Update samples for p99 calculation
      if (span.samples.length >= this.maxSamples) {
        span.samples.shift();
      }
      span.samples.push(duration);
      span.sampleCount++;
    } else {
      console.warn(`Attempted to end span "${span.name}" that was not active.`);
    }
  }

  private addSpanToDebugPanel(span: TSpan) {
    this.debugSection.addValue(span.name, () => {
      if (span.endTime === null) {
        return 'Running...';
      }
      const p99 = this.calculateP99(span.samples);
      return `Avg: ${span.average.toFixed(2)} ms | P99: ${p99.toFixed(2)} ms`;
    });
  }

  private calculateP99(samples: number[]): number {
    if (samples.length === 0) return 0;
    const sortedSamples = [...samples].sort((a, b) => a - b);
    const index = Math.floor(samples.length * 0.99);
    return sortedSamples[index];
  }
}

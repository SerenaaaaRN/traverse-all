import type { CPPResult } from "@algorithms/types";
import { solveCPP } from "@algorithms/cpp";
import { findRouteThroughStops, type RouteResult } from "@algorithms/route";
import { graphState } from "./graphState.svelte";

class ViewState {
  startNode = $state("P74");
  startNodeValid = $derived(graphState.nodes.some((n) => n.id === this.startNode));
  startNodeDraft = $state("P74");

  commitStartNode(): void {
    const value = this.startNodeDraft.trim();
    if (value !== this.startNode) this.startNode = value;
  }

  resetStartNode(): void {
    this.startNodeDraft = "P74";
    this.startNode = "P74";
  }

  cpp = $derived.by<CPPResult | null>(() => {
    try {
      return solveCPP(
        graphState.graph(),
        this.startNodeValid ? this.startNode : undefined,
      );
    } catch {
      return null;
    }
  });

  tourStep = $state<number | null>(null);
  tourPlaying = $state(false);
  speedMs = $state(220);
  selectedNode = $state<string | null>(null);

  viewMode = $state<"peta" | "graf">("peta");

  stops = $state<string[]>([]);

  route = $derived.by<RouteResult | null>(() => {
    const valid = this.stops.filter((id) => id !== "");
    if (valid.length < 2) return null;
    return findRouteThroughStops(graphState.graph(), valid);
  });

  showWeights = $state(false);
  showOdd = $state(true);
  showTour = $state(true);
  showRoute = $state(true);

  get totalSteps(): number {
    return this.cpp?.eulerCircuit?.length ?? 0;
  }

  play(): void {
    if (this.totalSteps < 2) return;
    if (this.tourStep === null || this.tourStep >= this.totalSteps - 1) {
      this.tourStep = 0;
    }
    this.tourPlaying = true;
  }

  pause(): void {
    this.tourPlaying = false;
  }

  stepForward(): void {
    if (this.tourStep === null) this.tourStep = 0;
    else this.tourStep = Math.min(this.tourStep + 1, this.totalSteps - 1);
  }

  resetTour(): void {
    this.tourPlaying = false;
    this.tourStep = null;
  }

  onNodeClick(id: string): void {
    this.selectedNode = id;
    this.addStop(id);
  }

  addStop(id: string): void {
    if (this.stops.length < 2) this.stops.push(id);
    else this.stops.splice(this.stops.length - 1, 0, id);
  }

  setStop(index: number, id: string): void {
    this.stops[index] = id;
  }

  removeStop(index: number): void {
    this.stops.splice(index, 1);
  }

  addWaypoint(): void {
    this.stops.splice(Math.max(this.stops.length - 1, 0), 0, "");
  }

  resetStops(): void {
    this.stops = [];
  }
}

export const viewState = new ViewState();

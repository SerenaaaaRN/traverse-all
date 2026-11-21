/** Simpul jaringan jalan internal kilang dengan koordinat tracking asli. */
export interface PatrolNode {
  id: string;
  label: string;
  lat: number;
  lng: number;
}

/** Ruas jalan undirected dengan bobot jarak dalam kilometer. */
export interface PatrolEdge {
  source: string;
  target: string;
  weightKm: number;
}

/** Graf patroli yang terdiri dari simpul dan ruas jalan. */
export interface PatrolGraph {
  nodes: PatrolNode[];
  edges: PatrolEdge[];
}

/** Derajat sebuah simpul beserta status ganjilnya. */
export interface DegreeInfo {
  nodeId: string;
  degree: number;
  isOdd: boolean;
}

/** Hasil satu strategi perfect matching pada simpul ganjil. */
export interface MatchingStrategyResult {
  strategy: "greedy";
  pairs: Array<{ u: string; v: string; costKm: number }>;
  totalCostKm: number;
  executed: boolean;
  paths: Map<string, string[]>;
}

/** Ruas yang disalin (diulang) saat augmentasi CPP. */
export interface AugmentedEdge {
  source: string;
  target: string;
  weightKm: number;
  augmented: boolean;
}

/** Keluaran lengkap pipeline CPP untuk sebuah graf. */
export interface CPPResult {
  hasEulerCircuit: boolean;
  hasEulerPath: boolean;
  oddNodes: string[];
  augmentedEdges: AugmentedEdge[];
  eulerCircuit: string[] | null;
  totalInspectionDistanceKm: number;
  baseDistanceKm: number;
  augmentationCostKm: number;
  strategies: MatchingStrategyResult[];
}

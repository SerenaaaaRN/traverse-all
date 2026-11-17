export type TransportMode = "lrt" | "brt" | "feeder" | "kereta";

export interface RouteLine {
	id: string;
	name: string;
	mode: TransportMode;
	color: string;
}

export interface TransitNode {
	id: string;
	label: string;
	x: number;
	y: number;
	type: "station" | "stop" | "terminal" | "transfer";
	routeIds: string[];
}

export interface TransitEdge {
	source: string;
	target: string;
	weightKm: number;
	isOneWay: boolean;
	routeId: string;
}

export interface TransitGraph {
	nodes: TransitNode[];
	edges: TransitEdge[];
}

export interface DegreeInfo {
	nodeId: string;
	degree: number;
	isOdd: boolean;
}

export interface MatchingStrategyResult {
	strategy: "brute-force" | "greedy";
	pairs: Array<{ u: string; v: string; costKm: number }>;
	totalCostKm: number;
	executed: boolean;
	paths: Map<string, string[]>;
}

export interface AugmentedEdge {
	source: string;
	target: string;
	weightKm: number;
	augmented: boolean;
	routeId: string;
}

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

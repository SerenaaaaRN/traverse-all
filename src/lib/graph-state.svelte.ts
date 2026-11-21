import type { PatrolGraph, PatrolNode } from "@algorithms/types";
import { patrolNodes } from "@data/nodes";
import { patrolEdges } from "@data/edges";

class GraphState {
  nodes = $state<PatrolNode[]>(patrolNodes);
  edges = $state(patrolEdges);

  graph(): PatrolGraph {
    return { nodes: this.nodes, edges: this.edges };
  }

  nodeById(id: string): PatrolNode | undefined {
    return this.nodes.find((n) => n.id === id);
  }
}

export const graphState = new GraphState();

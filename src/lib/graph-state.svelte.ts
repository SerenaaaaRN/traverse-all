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

  /** Menyusun graf dari simpul yang dipilih beserta ruas di antaranya. */
  subgraph(nodeIds: string[]): PatrolGraph {
    const selected = new Set(nodeIds);
    return {
      nodes: this.nodes.filter((node) => selected.has(node.id)),
      edges: this.edges.filter(
        (edge) => selected.has(edge.source) && selected.has(edge.target),
      ),
    };
  }
}

export const graphState = new GraphState();

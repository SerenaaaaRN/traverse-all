/**
 * State global aplikasi (module rune). Sumber data tunggal adalah
 * src/data/nodes.json — tidak ada filter koridor, seluruh jaringan ditampilkan.
 */
import type { PatrolGraph, PatrolNode, PatrolMetadata } from "@algorithms/types";
import { patrolNetwork } from "@data";

class GraphState {
  nodes = $state<PatrolNode[]>(patrolNetwork.nodes);
  edges = $state(patrolNetwork.edges);
  metadata: PatrolMetadata = patrolNetwork.metadata!;

  graph(): PatrolGraph {
    return { nodes: this.nodes, edges: this.edges, metadata: this.metadata };
  }

  nodeById(id: string): PatrolNode | undefined {
    return this.nodes.find((n) => n.id === id);
  }
}

export const graphState = new GraphState();

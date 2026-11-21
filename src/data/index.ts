/**
 * Loader + runtime guard untuk src/data/nodes.json (jaringan jalan internal
 * Kilang Pertamina Plaju). Dataset ini merupakan satu-satunya sumber kebenaran.
 *
 * Konversi schema:
 *   name            -> id
 *   from / to       -> source / target
 *   distance_m /1000-> weightKm
 *   lat / lng       -> dipertahankan apa adanya (dipakai peta Leaflet/OSM)
 */
import rawDataset from "./nodes.json";
import type {
  PatrolGraph,
  PatrolNode,
  PatrolEdge,
  PatrolMetadata,
} from "@algorithms/types";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readMetadata(raw: unknown): PatrolMetadata {
  if (!isRecord(raw)) {
    throw new Error("Dataset tidak memiliki metadata yang valid.");
  }
  const { name, source, weight_unit, coordinate_note, graph_note } = raw;
  if (
    typeof name !== "string" ||
    typeof source !== "string" ||
    typeof weight_unit !== "string" ||
    typeof coordinate_note !== "string" ||
    typeof graph_note !== "string"
  ) {
    throw new Error("Field metadata dataset tidak lengkap.");
  }
  return {
    name,
    source,
    weightUnit: weight_unit,
    coordinateNote: coordinate_note,
    graphNote: graph_note,
  };
}

function readNodes(raw: unknown): PatrolNode[] {
  if (!Array.isArray(raw)) {
    throw new Error("Dataset harus memiliki array 'nodes'.");
  }
  const seen = new Set<string>();
  return raw.map((item, index) => {
    if (!isRecord(item)) {
      throw new Error(`Node index ${index} bukan object yang valid.`);
    }
    const { name, lat, lng, label } = item;
    if (typeof name !== "string" || name.length === 0) {
      throw new Error(`Node index ${index} memiliki 'name' tidak valid.`);
    }
    if (seen.has(name)) {
      throw new Error(`Node id duplikat: ${name}`);
    }
    seen.add(name);
    if (typeof lat !== "number" || !Number.isFinite(lat)) {
      throw new Error(`Node ${name} memiliki latitude tidak valid.`);
    }
    if (typeof lng !== "number" || !Number.isFinite(lng)) {
      throw new Error(`Node ${name} memiliki longitude tidak valid.`);
    }
    if (typeof label !== "string") {
      throw new Error(`Node ${name} memiliki label tidak valid.`);
    }
    return { id: name, label, lat, lng };
  });
}

function readEdges(raw: unknown, nodeIds: Set<string>): PatrolEdge[] {
  if (!Array.isArray(raw)) {
    throw new Error("Dataset harus memiliki array 'edges'.");
  }
  const seen = new Set<string>();
  return raw.map((item, index) => {
    if (!isRecord(item)) {
      throw new Error(`Edge index ${index} bukan object yang valid.`);
    }
    const { from, to, distance_m } = item;
    if (typeof from !== "string" || typeof to !== "string") {
      throw new Error(`Edge index ${index} memiliki endpoint tidak valid.`);
    }
    if (!nodeIds.has(from) || !nodeIds.has(to)) {
      throw new Error(
        `Edge ${from}–${to} menghubungkan simpul yang tidak ada.`,
      );
    }
    if (from === to) {
      throw new Error(`Edge ${from}–${to} adalah self-loop.`);
    }
    const key = from < to ? `${from}|${to}` : `${to}|${from}`;
    if (seen.has(key)) {
      throw new Error(`Edge duplikat: ${from}–${to}`);
    }
    seen.add(key);
    if (
      typeof distance_m !== "number" ||
      !Number.isFinite(distance_m) ||
      distance_m <= 0
    ) {
      throw new Error(`Edge ${from}–${to} memiliki jarak tidak valid.`);
    }
    return {
      source: from,
      target: to,
      weightKm: distance_m / 1000,
    };
  });
}

export function validateDataset(parsed: unknown): PatrolGraph {
  if (!isRecord(parsed)) {
    throw new Error("Dataset harus berupa object JSON.");
  }
  const metadata = readMetadata(parsed.metadata);
  const nodes = readNodes(parsed.nodes);
  const edges = readEdges(parsed.edges, new Set(nodes.map((n) => n.id)));
  return { nodes, edges, metadata };
}

export function validateGraph(parsed: unknown): PatrolGraph {
  return validateDataset(parsed);
}

export const patrolNetwork: PatrolGraph = validateGraph(rawDataset);

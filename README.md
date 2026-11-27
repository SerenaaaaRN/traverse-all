# Eulerian Analysis & Chinese Postman Problem — Study Case

A client-side web application for analysing a weighted undirected graph and
computing a minimum closed route with the **Chinese Postman Problem (CPP)**.
All computation runs in the browser from static TypeScript data

## Dataset summary

| Metric | Value |
|---|---|
| Vertices / edges | 74 / 115 |
| Odd-degree vertices | 40 |
| Greedy pairs | 20 pairs · 4.829 km |
| Total inspection distance | 24.168 km |
| Tour steps | 153 (starting at `P74`) |

Every number shown in the UI is derived from `solveCPP()` and
`calculateDegrees()` rather than hard-coded.

## Getting started

```bash
bun install
bun run dev
bun run check
bun run build
```

Run `bun run gen-routes` only after adding a new route file.

## View modes

The **Peta | Graf** switch sits at the top centre of the workspace.

- **Peta** — Leaflet with OpenStreetMap tiles; vertex positions follow the
  stored `lat/lng` coordinates.
- **Graf** — automatic Fruchterman–Reingold layout computed only from vertices
  and edges; geographic coordinates are ignored. The graph can be panned and
  zoomed, and **Reset layout** restores the computed positions.

Both modes consume the same `PatrolGraph` and the same `solveCPP()` result.
The control panel sets the start vertex, edge weights, odd vertices, CPP route,
and Dijkstra route. The right-hand panel can be collapsed to give the map or
graph the full width.

## Pages

| Route | Content |
|---|---|
| `/` | Network overview and vertex selection |
| `/nodes` | Subgraph picker with randomized Euler examples; map focuses the selection |
| `/analysis` | CPP metrics, duplicated edges, and animated tour |
| `/route` | Shortest path through waypoints |

## Structure

```
src/
├── algorithms/     pure functions: degrees, connectivity, dijkstra, matching,
│                   euler, route, cpp, types
├── data/           nodes.ts and edges.ts (single data source)
├── lib/            state runes, graph layout, colours, helpers
├── components/     flat Svelte components (kebab-case)
└── routes/         file-based pages (sv-router)
docs/Laporan.md     academic report
```

## Conventions

- One file, one responsibility; the graph contract lives only in
  `algorithms/types.ts`.
- Algorithms are pure: no DOM, no state, no I/O.
- JSDoc is **required only in `src/algorithms/`**; no comments elsewhere.
- `weightKm` is geometric distance in metres divided by 1000.
- Matching uses the greedy nearest-neighbour strategy, not brute force or
  blossom.

The full report is in [`docs/Laporan.md`](docs/Laporan.md).

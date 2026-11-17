import type { RouteLine } from "@algorithms/types";

export const routeLines: RouteLine[] = [
	{
		id: "LRT-1",
		name: "LRT Sumatera Selatan — Bandara SMB II – DJKO",
		mode: "lrt",
		color: "#3b2d8f",
	},
	{
		id: "TM-1",
		name: "Terminal Alang-Alang Lebar – Ampera",
		mode: "brt",
		color: "#e52521",
	},
	{
		id: "TM-2",
		name: "Terminal Sako – Palembang Icon",
		mode: "brt",
		color: "#00a651",
	},
	{
		id: "TM-3",
		name: "Terminal Plaju – Palembang Icon",
		mode: "brt",
		color: "#0072bc",
	},
	{
		id: "TM-4",
		name: "Terminal Alang-Alang Lebar – Talang Jambe",
		mode: "brt",
		color: "#8a4fbe",
	},
	{
		id: "ME-1",
		name: "Punti Kayu – Talang Kelapa",
		mode: "feeder",
		color: "#f7a800",
	},
	{
		id: "ME-2",
		name: "Stasiun LRT Asrama Haji – Sematang Borang",
		mode: "feeder",
		color: "#f7941d",
	},
	{
		id: "ME-3",
		name: "Stasiun LRT Asrama Haji – Talang Betutu",
		mode: "feeder",
		color: "#f26522",
	},
	{
		id: "ME-4",
		name: "Stasiun LRT Polresta – Perumahan OPI",
		mode: "feeder",
		color: "#ffb400",
	},
	{
		id: "ME-5",
		name: "Stasiun LRT DJKA – Terminal Plaju",
		mode: "feeder",
		color: "#f68b1f",
	},
	{
		id: "ME-6",
		name: "Stasiun LRT RSUD – Sukawinatan",
		mode: "feeder",
		color: "#fcaf17",
	},
	{
		id: "ME-7",
		name: "Bukit Siguntang – Stasiun Kamboja",
		mode: "feeder",
		color: "#fbb040",
	},
	{
		id: "KR-1",
		name: "LRT Sumatera Selatan Lin 1 — Kertoapati",
		mode: "kereta",
		color: "#f5d000",
	},
	{
		id: "KR-2",
		name: "LRT Sumatera Selatan Lin 2 — Bandara SMB II – DJKO (Unit Dijkstra)",
		mode: "kereta",
		color: "#e0c000",
	},
];

export const routeById = new Map<string, RouteLine>(
	routeLines.map((r) => [r.id, r]),
);

<script lang="ts">
	import type { Snippet } from "svelte";
	import { p } from "sv-router/generated";

	let { children }: { children: Snippet } = $props();

	const navItems = [
		{ href: p("/"), label: "Peta Graf" },
		{ href: p("/analysis"), label: "Analisis" },
		{ href: p("/comparison"), label: "Perbandingan" },
		{ href: p("/theory"), label: "Teori" },
	];
</script>

<div class="flex h-[100dvh] flex-col">
	<nav class="flex h-12 shrink-0 items-center gap-1 border-b bg-white px-4">
		<span class="mr-4 text-sm font-bold text-neutral-900">Transmusi Euler & CPP</span>
		{#each navItems as item (item.href)}
			<a
				href={item.href}
				class="rounded px-3 py-1.5 text-sm text-neutral-600 transition hover:bg-neutral-100 hover:text-neutral-900 active:scale-[0.98]"
			>
				{item.label}
			</a>
		{/each}
	</nav>
	<div class="min-h-0 flex-1">
		{@render children()}
	</div>
</div>

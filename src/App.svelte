<!-- <script lang="ts">
    let count = $state(0);
</script>

<div>
    <h1>Count: {count}</h1>
    <div>
        <button onclick={() => count++}>Tambah</button>
        <button onclick={() => count--}>Kurang</button>
    </div>
</div> -->

<script lang="ts">
    import { Router } from "sv-router";
    import "sv-router/generated";
</script>

<a href="/">Home</a>
<a href="/about">About</a>

<Router />

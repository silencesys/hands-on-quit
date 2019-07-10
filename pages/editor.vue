<template>
    <div class="container">
        <guide-bubble />
        <div></div>
        <konva-canvas />
    </div>
</template>

<script>
import KonvaCanvas from '~/components/Canvas.vue'
import GuideBubble from '~/components/Bubble.vue'

export default {
    components: {
        KonvaCanvas,
        GuideBubble
    }
}
</script>

<style>
.container {
    margin: 0 auto;
    display: block;
    width: 100%;
    height: 100%;
}
</style>

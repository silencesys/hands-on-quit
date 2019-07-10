<template>
    <div class="guide-wrapper">
        <div class="guide-comment">
            <img src="https://img.silencesys.dev/150-150" alt="guide_avatar" />
            <div class="comment">
                <slot></slot>
            </div>
        </div>
    </div>
</template>

<script>
export default {}
</script>

<style>
.guide-wrapper {
    display: block;
    width: 100%;
    margin-bottom: 2em;
}
.guide-comment {
    display: grid;
    grid-template-columns: 150px auto;
    grid-column-gap: 20px;
    grid-template-rows: 1fr;
    grid-template-areas: '. .';
    position: relative;
    width: 100%;
}
img {
    border: 5px solid black;
    box-sizing: border-box;
}
.comment {
    border: 5px solid black;
    box-sizing: border-box;
}
</style>

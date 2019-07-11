<template>
    <div class="guide-wrapper">
        <div class="guide-comment">
            <img src="/imgs/avatar.png" alt="guide_avatar" />
            <div class="comment">
                <slot />
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
    position: absolute;
    z-index: 9999;
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
    border: 3px solid black;
    box-sizing: border-box;
}
.comment {
    border: 3px solid black;
    border-radius: 5px;
    padding: 2em;
    box-sizing: border-box;
    background: #d6c49f;
}
</style>

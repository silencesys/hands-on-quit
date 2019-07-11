<template>
    <div class="content-container">
        <header>
            <h1>{{ $t('site_title') }}</h1>
        </header>

        <p>{{ $t('site_description') }}</p>
        <nuxt-link :to="{ name: 'editor' }" class="button">
            {{ $t('site_start_button') }}
        </nuxt-link>
    </div>
</template>

<script>
export default {
    components: {}
}
</script>

<style>
.content-container {
    background: #d6c49f;
    padding: 3em;
    box-sizing: border-box;
    border-radius: 4px;
}
</style>

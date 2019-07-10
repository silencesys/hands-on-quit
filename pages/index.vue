<template>
    <div class="container">
        <header>
            <h1>{{ $t('site_title') }}</h1>
            <nuxt-link :to="{ name: 'editor' }">Continue</nuxt-link>
        </header>
    </div>
</template>

<script>
export default {
    components: {}
}
</script>

<style></style>

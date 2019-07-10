<template>
    <div class="container">
        <header>
            <h1>{{ $t('site_title') }}</h1>
            <p>{{ $t('site_description') }}</p>
            <nuxt-link :to="{ name: 'editor' }">
                {{ $t('site_start_button') }}
            </nuxt-link>
        </header>
    </div>
</template>

<script>
export default {
    components: {}
}
</script>

<style></style>

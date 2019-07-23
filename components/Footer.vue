<template>
    <footer id="sc-footer">
        <p>
            {{ $t('copyright', { year: currentYear }) }}
            <a href="https://github.com/silencesys/hands-on-quit">
                {{ $t('fork_on_github') }}
                <font-awesome-icon :icon="['fab', 'github']" />
            </a>
        </p>
    </footer>
</template>

<script>
export default {
    name: 'SiteFooter',
    data() {
        return {}
    },
    computed: {
        currentYear() {
            return new Date().getFullYear()
        }
    }
}
</script>

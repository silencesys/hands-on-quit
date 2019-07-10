<template>
    <div>
        <guide-bubble>
            <p
                v-html="
                    $t('guide_messages.stage_' + guide.stage + '_' + guide.step)
                "
            />
            <nuxt-link :to="{ name: 'editor' }">
                {{ $t('site_start_button') }}
            </nuxt-link>
        </guide-bubble>
    </div>
</template>

<script>
import GuideBubble from '~/components/Bubble.vue'

export default {
    data() {
        return {
            guide: {
                stage: 1,
                step: 8,
                enable_continue: false,
                timeout: null,
                timeoutTime: 10000
            }
        }
    },
    components: {
        GuideBubble
    }
}
</script>

<template>
    <div class="content-container">
        <header>
            <h1>{{ $t('site_title') }}</h1>
        </header>

        <p>{{ $t('site_description') }}</p>

        <div class="guides">
            <h2>{{ $t('site_pick_guide') }}</h2>
            <figure>
                <img
                    src="/imgs/avatar_mouse.png"
                    @click="setGuide('/imgs/avatar_mouse.png')"
                    :class="{
                        selected: guideAvatar === '/imgs/avatar_mouse.png'
                    }"
                />
                <figcaption>
                    {{ $t('guide.mouse') }}
                </figcaption>
            </figure>
            <figure>
                <img
                    src="/imgs/avatar_bunny.png"
                    @click="setGuide('/imgs/avatar_bunny.png')"
                    :class="{
                        selected: guideAvatar === '/imgs/avatar_bunny.png'
                    }"
                />
                <figcaption>
                    {{ $t('guide.rabbit') }}
                </figcaption>
            </figure>
            <figure>
                <img
                    src="/imgs/avatar_dragon.png"
                    @click="setGuide('/imgs/avatar_dragon.png')"
                    :class="{
                        selected: guideAvatar === '/imgs/avatar_dragon.png'
                    }"
                />
                <figcaption>
                    {{ $t('guide.dragon') }}
                </figcaption>
            </figure>
        </div>

        <nuxt-link :to="{ name: 'editor' }" class="button">
            {{ $t('site_start_button') }}
        </nuxt-link>
    </div>
</template>

<script>
import { mapMutations } from 'vuex'

export default {
    components: {},
    computed: {
        guideAvatar() {
            return this.$store.state.guide.avatarUrl
        }
    },
    methods: {
        ...mapMutations({
            setGuide: 'guide/setGuide'
        })
    }
}
</script>

<style>
.content-container {
    background: #d6c49f;
    padding: 3em;
    box-sizing: border-box;
    border-radius: 4px;
}
figure {
    width: 150px;
    display: inline-block;
    vertical-align: top;
    margin-right: 15px;
}
header h1 {
    font-size: 50px;
}
.guides {
    margin-top: 3em;
    margin-bottom: 3em;
}
.guides h2 {
    margin-bottom: 1em;
}
.selected {
    border-color: #b04130;
}
p {
    font-size: 22px;
}
a {
    text-decoration: none;
    font-size: 20px;
}
</style>

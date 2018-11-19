<template>
    <v-app dark>
        <v-navigation-drawer width="250" stateless value="true" fixed :mini-variant="miniVariant" :clipped="clipped" v-model="drawer" app dark>
            <feed-list></feed-list>
        </v-navigation-drawer>
        <v-toolbar fixed app :clipped-left="clipped" dark>
            <v-toolbar-side-icon @click.stop="drawer = !drawer"></v-toolbar-side-icon>
            <v-btn icon @click.stop="miniVariant = !miniVariant">
                <v-icon v-html="miniVariant ? 'chevron_right' : 'chevron_left'"></v-icon>
            </v-btn>
            <v-btn icon @click.stop="clipped = !clipped">
                <v-icon>web</v-icon>
            </v-btn>
            <v-btn icon @click.stop="fixed = !fixed">
                <v-icon>remove</v-icon>
            </v-btn>
            <v-toolbar-title v-text="title"></v-toolbar-title>
            <v-spacer></v-spacer>
        </v-toolbar>
        <v-content>
            <v-container fluid>
                <v-slide-y-transition mode="out-in">
                    <v-layout column align-center>
                        <img src="/public/v.png" alt="Vuetify.js" class="mb-5" />
                        <blockquote>
                            &#8220;First, solve the problem. Then, write the code.&#8221;
                            <footer>
                                <small>
                                    <em>&mdash;John Johnson</em>
                                </small>
                            </footer>
                        </blockquote>
                    </v-layout>
                </v-slide-y-transition>
            </v-container>
        </v-content>
    </v-app>
</template>

<script>
import FeedList from './views/FeedList/FeedList.vue';

export default {
    data: () => ({
        clipped: false,
        drawer: true,
        fixed: false,
        miniVariant: false,
        title: 'Vuetify.js'
    }),
    methods: {
    },
    components: {
        FeedList
    }
};
</script>

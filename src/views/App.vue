<template>
    <v-app dark>
        <v-navigation-drawer width="250" stateless value="true" fixed :mini-variant="miniVariant" v-model="drawer" app>
            <v-toolbar flat class="transparent">
                <v-toolbar-items>
                    <v-icon x-large class="blue--text">wifi_tethering</v-icon>
                </v-toolbar-items>
                <v-toolbar-title>Feed Maker</v-toolbar-title>
            </v-toolbar>
            <v-list>
                <v-list-tile>
                    <v-text-field label="搜索" append-icon="search" clearable></v-text-field>
                </v-list-tile>
            </v-list>
            <feed-list></feed-list>
        </v-navigation-drawer>
        <v-toolbar fixed app>
            <v-toolbar-side-icon @click.stop="drawer = !drawer"></v-toolbar-side-icon>
            <v-btn icon @click.stop="miniVariant = !miniVariant">
                <v-icon v-html="miniVariant ? 'chevron_right' : 'chevron_left'"></v-icon>
            </v-btn>
            <v-btn icon @click.stop="">
                <v-icon>add</v-icon>
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
import FeedList from './FeedList/FeedList.vue';

export default {
    data: () => ({
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

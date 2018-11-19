<template>
    <v-app dark>
        <v-navigation-drawer width="250" stateless value="true" fixed :mini-variant="miniVariant" v-model="drawer" app>
            <v-list two-line>
                <v-list-tile>
                    <v-list-tile-avatar>
                        <v-icon class="blue darken-3">wifi_tethering</v-icon>
                    </v-list-tile-avatar>

                    <v-list-tile-content>
                        <v-list-tile-title class="headline">Feed Maker</v-list-tile-title>
                    </v-list-tile-content>
                </v-list-tile>
                <v-list-tile>
                    <v-text-field label="搜索" append-icon="search" clearable></v-text-field>
                </v-list-tile>
            </v-list>
            <v-divider></v-divider>
            <feed-list></feed-list>
        </v-navigation-drawer>
        <v-toolbar fixed app :clipped-left="clipped">
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
import FeedList from './views/FeedList/FeedList.vue';

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

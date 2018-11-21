<template>
    <v-app dark>
        <v-navigation-drawer width="250" stateless value="true" fixed v-model="drawer" app>
            <v-layout column justify-space-between fill-height>
                <v-toolbar flat class="transparent">
                    <v-toolbar-items>
                        <v-icon x-large class="blue--text">wifi_tethering</v-icon>
                    </v-toolbar-items>
                    <v-toolbar-title>Feed Maker</v-toolbar-title>
                </v-toolbar>
                <v-flex class="feed-list">
                    <feed-list></feed-list>
                </v-flex>
                <v-toolbar flat dense class="transparent">
                    <v-btn color="blue" flat round>
                        <v-icon>add</v-icon>添加
                    </v-btn>
                    <v-btn color="blue" flat round>
                        <v-icon>list</v-icon>整理
                    </v-btn>
                </v-toolbar>
            </v-layout>
        </v-navigation-drawer>
        <v-toolbar fixed app>
            <v-toolbar-side-icon @click="drawer = !drawer"></v-toolbar-side-icon>
            <v-toolbar-title v-text="title"></v-toolbar-title>
            <v-toolbar-title>
                <v-text-field class="pt-0" v-model="searchString" prepend-inner-icon="search" solo hide-details single-line clearable @click:prepend-inner.stop="search"></v-text-field>
            </v-toolbar-title>
            <v-spacer></v-spacer>
            <v-btn icon @click="setting = !setting">
                <v-icon>settings</v-icon>
            </v-btn>
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
        <v-navigation-drawer v-model="setting" right temporary fixed>
            <v-list>
                <v-list-tile ripple @click="setting = !setting">
                    <v-list-tile-action>
                        <v-icon>compare_arrows</v-icon>
                    </v-list-tile-action>
                    <v-list-tile-title>Switch drawer (click me)</v-list-tile-title>
                </v-list-tile>
            </v-list>
        </v-navigation-drawer>
        <v-dialog v-model="dialog" fullscreen hide-overlay>
            <v-card>

                <v-card-text>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
                </v-card-text>

                <v-divider></v-divider>

                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="primary" flat @click="dialog = false">
                        I accept
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </v-app>
</template>

<script>
import FeedList from './FeedList/FeedList.vue';

export default {
    data: () => ({
        drawer: true,
        setting: false,
        dialog: false,
        title: 'Vuetify.js',
        searchString: ''
    }),
    methods: {
        search() {
            console.log(this.searchString);
        }
    },
    components: {
        FeedList
    }
};
</script>

<style lang="scss" scoped>
$scrollbar: -17px;
.feed-list {
    overflow-y: scroll;
    margin-right: $scrollbar;
    max-width: calc(100% - #{$scrollbar}) !important;
}
</style>

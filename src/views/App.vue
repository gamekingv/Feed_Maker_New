<template>
    <v-app dark>
        <v-fade-transition>
            <v-container v-if="!loading" fluid>
                <v-navigation-drawer width="250" stateless value="true" fixed v-model="drawer" app>
                    <v-layout column fill-height>
                        <v-toolbar flat class="transparent">
                            <v-toolbar-items>
                                <v-icon x-large class="blue--text">wifi_tethering</v-icon>
                            </v-toolbar-items>
                            <v-toolbar-title>Feed Maker</v-toolbar-title>
                        </v-toolbar>
                        <v-flex class="group-list">
                            <group-list/>
                        </v-flex>
                    </v-layout>
                </v-navigation-drawer>
                <v-toolbar fixed app>
                    <v-toolbar-side-icon @click="drawer = !drawer"/>
                    <v-toolbar-title v-text="$store.getters.activeTitle"/>
                    <v-spacer/>
                    <v-btn-toggle class="filter-group" v-model="view" mandatory>
                        <v-btn value="unread" flat>
                            <v-icon>bookmark_border</v-icon>
                        </v-btn>
                        <v-btn value="read" flat>
                            <v-icon>bookmark</v-icon>
                        </v-btn>
                        <v-btn value="all" flat>
                            <v-icon>bookmarks</v-icon>
                        </v-btn>
                    </v-btn-toggle>
                    <v-btn icon @click.stop="refresh">
                        <v-icon>refresh</v-icon>
                    </v-btn>
                    <v-btn icon @click="setting = !setting">
                        <v-icon>settings</v-icon>
                    </v-btn>
                </v-toolbar>
                <v-content class="fill-height">
                    <v-fade-transition mode="out-in" duration="80">
                        <router-view ref="content"/>
                    </v-fade-transition>
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
            </v-container>
        </v-fade-transition>
        <v-dialog v-model="loading" persistent width="300">
            <v-card color="primary">
                <v-card-text>正在加载数据
                    <v-progress-linear indeterminate color="white" class="mb-0"></v-progress-linear>
                </v-card-text>
            </v-card>
        </v-dialog>
    </v-app>
</template>

<script>
import GroupList from 'views/Components/GroupList';
import message from '~/utils/extension/message';

export default {
    data: () => ({
        loading: true,
        drawer: true,
        setting: false,
        searchString: ''
    }),
    computed: {
        view: {
            get() {
                return this.$store.state.settings.view;
            },
            async set(value) {
                this.$refs.content.loading++;
                await this.$store.dispatch('setView', value);
                await this.refreshList(true);
            }
        }
    },
    async mounted() {
        await this.$store.dispatch('initStore');
        this.loading = false;
    },
    methods: {
        search() {
            console.log(this.searchString);
        },
        async refreshList(isLoading = false) {
            return await this.$refs.content.refreshList({ isLoading });
        },
        async refresh() {
            let { subType: type, id } = this.$store.state.active;
            let { result, data } = await message.sendUpdateFeed(id);
            if (result === 'ok') {
                await this.refreshList();
            }
            else if (result === 'fail') {
                throw data;
            }
        }
    },
    components: {
        GroupList
    }
};
</script>

<style lang="scss" scoped>
.group-list {
    scrollbar-width: none;
    overflow-y: scroll;
}
.filter-group {
    margin: {
        left: 20px;
        right: 20px;
    }
}
</style>

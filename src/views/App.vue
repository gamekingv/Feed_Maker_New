<template>
    <v-app dark>
        <v-fade-transition>
            <v-container v-if="!loading">
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
                    <v-toolbar-title>
                        <v-text-field
                            class="pt-0"
                            v-model="searchString"
                            prepend-inner-icon="search"
                            solo
                            hide-details
                            single-line
                            clearable
                            @click:prepend-inner.stop="search"
                        />
                    </v-toolbar-title>
                    <v-btn icon @click.stop="test">
                        <v-icon>add</v-icon>
                    </v-btn>
                    <v-btn icon @click="setting = !setting">
                        <v-icon>settings</v-icon>
                    </v-btn>
                </v-toolbar>
                <v-content>
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

export default {
    data: () => ({
        loading: true,
        drawer: true,
        setting: false,
        searchString: ''
    }),
    async mounted() {
        await this.$store.dispatch('getGroups');
        this.loading = false;
    },
    methods: {
        search() {
            console.log(this.searchString);
        },
        test() {
            this.$store.dispatch('updateGroups', [
                {
                    name: 'group1', id: '2', isActive: false, feeds: [
                        { name: 'Management', icon: 'people_outline', id: '6', groupId: '2' },
                        { name: 'Settings', icon: 'settings', id: '7', groupId: '2' },
                        { name: 'test', icon: 'settings', id: '8', groupId: '2' }
                    ]
                },
                {
                    name: 'group2', id: '3', isActive: false, feeds: [
                        { name: 'Management', icon: 'people_outline', id: '9', groupId: '3' },
                        { name: 'Settings', icon: 'settings', id: '10', groupId: '3' },
                    ]
                },
                {
                    name: 'group3', id: '4', isActive: false, feeds: [
                        { name: 'Management', icon: 'people_outline', id: '11', groupId: '4' },
                    ]
                },
                {
                    name: 'group4', id: '5', isActive: false, feeds: [
                        { name: 'Management', icon: 'people_outline', id: '12', groupId: '5' },
                        { name: 'Settings', icon: 'settings', id: '13', groupId: '5' },
                        { name: 'test', icon: 'settings', id: '14', groupId: '5' },
                    ]
                }
            ]);
        }
    },
    components: {
        GroupList
    }
};
</script>

<style lang="scss" scoped>
$scrollbar: -17px;
.group-list {
    overflow-y: scroll;
    margin-right: $scrollbar;
    max-width: calc(100% - #{$scrollbar}) !important;
}
</style>

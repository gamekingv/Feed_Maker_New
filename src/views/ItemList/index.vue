<template>
    <div>
        <v-fade-transition>
            <v-list dense class="transparent" v-if="!loading">
                <template v-for="(item, i) in list">
                    <v-list-tile :key="item.id" @click.stop>
                        <v-list-tile-avatar>
                            <v-avatar size="22px" v-if="isUrl(icons[i])">
                                <img :src="icons[i]">
                            </v-avatar>
                            <v-icon v-text="icons[i] ? icons[i] : 'insert_drive_file'" v-else></v-icon>
                        </v-list-tile-avatar>
                        <v-list-tile-content>
                            <v-list-tile-title v-text="item.title"></v-list-tile-title>
                        </v-list-tile-content>
                    </v-list-tile>
                    <v-divider v-if="i < list.length - 1" :key="item.id"></v-divider>
                </template>
            </v-list>
        </v-fade-transition>
        <v-dialog v-model="loading" hide-overlay persistent width="300">
            <v-card color="primary">
                <v-card-text>正在加载数据
                    <v-progress-linear indeterminate color="white" class="mb-0"></v-progress-linear>
                </v-card-text>
            </v-card>
        </v-dialog>
    </div>
</template>
<script>
export default {
    data: () => ({
        loading: true
    }),
    computed: {
        list() {
            return this.$store.state.list;
        },
        icons() {
            return this.list.map(item => this.$store.getters.getFeed(item.feedId).icon);
        }
    },
    methods: {
        icon(feedId) {
            return this.$store.getters.getFeed(feedId).icon;
        },
        isUrl(icon) {
            return /http(s)?:\/\/([\w-]+\.)+[\w-]+(\/[\w- ./?%&=]*)?/.test(icon);
        },
        refreshList(path) {
            let [, type, id] = path.substr(1).split('/');
            this.loading = true;
            this.$store.dispatch('refreshList', { type, id }).then(() => this.loading = false);
        }
    },
    beforeRouteEnter(to, from, next) {
        next(vm => vm.refreshList(to.path));
    },
    beforeRouteUpdate(to, from, next) {
        this.refreshList(to.path);
        next();
    }
};
</script>

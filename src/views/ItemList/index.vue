<template>
    <v-container class="pl-5 pr-5" fill-height fluid>
        <v-fade-transition mode="out-in" :duration="40">
            <v-flex fill-height v-if="!loading" key="items">
                <v-list class="transparent" dense>
                    <template v-for="(item, i) in items">
                        <v-list-tile :key="item.id" @click.stop>
                            <v-list-tile-action style="min-width: unset;">
                                <v-checkbox
                                    v-model="selectedItems"
                                    :value="item.id"
                                    :ripple="false"
                                    hide-details
                                ></v-checkbox>
                            </v-list-tile-action>
                            <v-chip
                                color="grey darken-2"
                                text-color="white"
                                small
                                disabled
                                v-if="item.author"
                            >
                                <v-avatar class="small" color="blue">
                                    <img :src="icons[i]" v-if="isUrl(icons[i])">
                                    <v-icon
                                        size="20px"
                                        v-text="icons[i] ? icons[i] : 'insert_drive_file'"
                                        v-else
                                    ></v-icon>
                                </v-avatar>
                                {{item.author}}
                            </v-chip>
                            <v-list-tile-avatar v-else>
                                <v-avatar class="small" v-if="isUrl(icons[i])">
                                    <img :src="icons[i]">
                                </v-avatar>
                                <v-icon v-text="icons[i] ? icons[i] : 'insert_drive_file'" v-else></v-icon>
                            </v-list-tile-avatar>
                            <v-list-tile-content>
                                <v-list-tile-title
                                    :class="item.state === 'unread' ? 'font-weight-bold' : ''"
                                    v-text="item.title"
                                ></v-list-tile-title>
                            </v-list-tile-content>
                            <v-chip
                                color="grey darken-3"
                                text-color="white"
                                small
                                disabled
                                outline
                            >{{timeFormatter(item.pubDate)}}</v-chip>
                        </v-list-tile>
                        <v-divider v-if="i < items.length - 1" :key="item.id * -1"></v-divider>
                    </template>
                </v-list>
                <v-speed-dial
                    direction="bottom"
                    open-on-hover
                    right
                    top
                    fixed
                    style="top: 88px;"
                    v-if="items.length !== 0"
                >
                    <v-btn slot="activator" color="blue darken-2" fab>
                        <v-icon>done_all</v-icon>
                    </v-btn>
                    <v-btn fab small color="pink" @click.stop="selectAll">
                        <v-icon>select_all</v-icon>
                    </v-btn>
                    <v-btn fab small color="indigo" @click="markAsRead">
                        <v-icon>done</v-icon>
                    </v-btn>
                    <v-btn fab small color="green" @click="clearSelects">
                        <v-icon>crop_free</v-icon>
                    </v-btn>
                    <v-btn fab small color="red">
                        <v-icon>star</v-icon>
                    </v-btn>
                </v-speed-dial>
            </v-flex>
            <v-layout fill-height justify-center align-center v-else key="loading">
                <v-card color="primary" width="300">
                    <v-card-text>正在加载数据
                        <v-progress-linear indeterminate color="white" class="mb-0"></v-progress-linear>
                    </v-card-text>
                </v-card>
            </v-layout>
        </v-fade-transition>
    </v-container>
</template>
<script>
export default {
    data() {
        return {
            loading: 1,
            selectedItems: []
        };
    },
    computed: {
        items() {
            return this.$store.state.items;
        },
        icons() {
            return this.items.map(item => this.$store.getters.getFeed(item.feedId).icon);
        }
    },
    methods: {
        icon(feedId) {
            return this.$store.getters.getFeed(feedId).icon;
        },
        isUrl(icon) {
            return /http(s)?:\/\/([\w-]+\.)+[\w-]+(\/[\w- ./?%&=]*)?/.test(icon);
        },
        timeFormatter(timeString) {
            let time = new Date(timeString);
            if (time.toDateString() === new Date().toDateString())
                return `${('0' + time.getHours()).slice(-2)}:${('0' + time.getMinutes()).slice(-2)}`;
            else
                return `${time.getFullYear()}/${time.getMonth() + 1}/${time.getDate()}`;
        },
        refreshList(path) {
            let [, type, id] = path.substr(1).split('/');
            this.$store.dispatch('refreshList', { type, id }).then(() => this.loading--);
        },
        selectAll() {
            this.selectedItems = this.items.map(item => item.id);
        },
        clearSelects() {
            this.selectedItems = [];
        },
        markAsRead() {
            console.log(this.selectedItems);
        }
    },
    beforeRouteEnter(to, from, next) {
        next(vm => vm.refreshList(to.path));
    },
    beforeRouteUpdate(to, from, next) {
        this.loading++;
        this.refreshList(to.path);
        next();
    }
};
</script>
<style lang="scss" scoped>
.small {
    width: 24px !important;
    height: 24px !important;
}
</style>

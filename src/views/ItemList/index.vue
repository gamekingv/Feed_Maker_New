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
                                    :class="item.state === 'unread' ? 'font-weight-bold' : 'grey--text text--lighten-1'"
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
                <v-layout justify-center align-center>
                    <v-pagination
                        v-model="currentPage"
                        :length="totalPage"
                        circle
                        v-if="totalPage > 1"
                        @input="changePage"
                    ></v-pagination>
                </v-layout>
                <v-speed-dial
                    direction="bottom"
                    open-on-hover
                    right
                    top
                    fixed
                    style="top: 88px;"
                    v-if="items.length !== 0"
                >
                    <v-btn slot="activator" color="blue darken-2" fab @click="markAllAsRead">
                        <v-icon>done_all</v-icon>
                    </v-btn>
                    <v-btn fab small color="pink" @click.stop="selectAll">
                        <v-icon>select_all</v-icon>
                    </v-btn>
                    <v-btn fab small color="green" @click="clearSelects">
                        <v-icon>crop_free</v-icon>
                    </v-btn>
                    <v-btn fab small color="indigo" @click="markAsRead">
                        <v-icon>bookmark</v-icon>
                    </v-btn>
                    <v-btn fab small color="indigo" @click="markAsUnread">
                        <v-icon>bookmark_border</v-icon>
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
import message from '~/utils/extension/message';

export default {
    data() {
        return {
            loading: true,
            items: [],
            selectedItems: [],
            currentPage: 1,
            totalItems: 0
        };
    },
    computed: {
        icons() {
            return this.items.map(item => this.$store.getters.getFeed(item.feedId).icon);
        },
        totalPage() {
            return Math.ceil(this.totalItems / this.$store.state.settings.itemsPerPage);
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
        async refreshList(type = this.$store.state.active.subType, id = this.$store.state.active.id) {
            this.loading = true;
            if (type === 'changePage') {
                type = this.$store.state.active.subType;
            }
            else {
                this.currentPage = 1;
                this.totalItems = await message.sendGetCount(type, id, this.$store.state.settings.view);
            }
            this.items = await message.sendGet(type, id, this.currentPage);
            this.clearSelects();
            this.loading = false;
        },
        selectAll() {
            this.selectedItems = this.items.map(item => item.id);
        },
        clearSelects() {
            this.selectedItems = [];
        },
        markAsRead() {
            this.loading = true;
            message.sendMarkItemsAsRead(this.selectedItems)
                .then(({ result, data }) => {
                    if (result === 'ok') {
                        return this.refreshList();
                    }
                    else if (result === 'fail') {
                        return Promise.reject(data);
                    }
                }).catch(e => { throw e; });
        },
        async markAllAsRead() {
            this.loading = true;
            let { subType: type, id } = this.$store.state.active;
            let items = await message.sendGet(type, id, null, 'unread');
            message.sendMarkItemsAsRead(items.map(item => item.id))
                .then(({ result, data }) => {
                    if (result === 'ok') {
                        return this.refreshList();
                    }
                    else if (result === 'fail') {
                        return Promise.reject(data);
                    }
                }).catch(e => { throw e; });
        },
        markAsUnread() {
            this.loading = true;
            message.sendMarkItemsAsUnread(this.selectedItems)
                .then(({ result, data }) => {
                    if (result === 'ok') {
                        return this.refreshList();
                    }
                    else if (result === 'fail') {
                        return Promise.reject(data);
                    }
                }).catch(e => { throw e; });
        },
        changePage() {
            this.refreshList('changePage');
        }
    },
    beforeRouteEnter(to, from, next) {
        next(async vm => {
            let [, type, id] = to.path.substr(1).split('/');
            vm.refreshList(type, id);
        });
    },
    async beforeRouteUpdate(to, from, next) {
        let [, type, id] = to.path.substr(1).split('/');
        this.refreshList(type, id);
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

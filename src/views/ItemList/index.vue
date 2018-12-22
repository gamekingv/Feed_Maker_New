<template>
    <v-container class="pl-5 pr-5" fill-height fluid>
        <v-fade-transition mode="out-in" :duration="40">
            <v-flex fill-height v-if="loading === 0" key="items">
                <v-list class="transparent" dense>
                    <template v-for="(item, i) in items">
                        <v-list-tile
                            :key="item.id"
                            @click="showDetails(item.title, item.author, item.content)"
                        >
                            <v-list-tile-action style="min-width: unset;">
                                <v-checkbox
                                    v-model="selectedItems"
                                    :value="{id: item.id, feedId: item.feedId}"
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
                                    <img
                                        :class="`custom-feed-icon-${item.feedId}`"
                                        v-if="isUrl(icons[i])"
                                    >
                                    <v-icon
                                        :size="20"
                                        v-text="icons[i] ? icons[i] : 'insert_drive_file'"
                                        v-else
                                    ></v-icon>
                                </v-avatar>
                                {{item.author}}
                            </v-chip>
                            <v-list-tile-avatar v-else>
                                <v-avatar class="small" v-if="isUrl(icons[i])">
                                    <img :class="`custom-feed-icon-${item.feedId}`">
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
                        :total-visible="9"
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
                    style="top: 88px; z-index:0;"
                    v-if="items.length !== 0"
                >
                    <v-btn slot="activator" color="blue darken-2" fab @click="markItems('all')">
                        <v-icon>done_all</v-icon>
                    </v-btn>
                    <v-btn fab small color="pink" @click.stop="selectAll">
                        <v-icon>select_all</v-icon>
                    </v-btn>
                    <v-btn fab small color="green" @click="clearSelects">
                        <v-icon>crop_free</v-icon>
                    </v-btn>
                    <v-btn fab small color="indigo" @click="markItems('read')">
                        <v-icon>bookmark</v-icon>
                    </v-btn>
                    <v-btn fab small color="indigo" @click="markItems('unread')">
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
import { mapState, mapGetters } from 'vuex';

export default {
    data() {
        return {
            loading: 1,
            items: [],
            selectedItems: [],
            currentPage: 1,
            totalItems: 0
        };
    },
    computed: {
        icons() {
            return this.items.map(item => this.getFeed(item.feedId).icon);
        },
        totalPage() {
            return Math.ceil(this.totalItems / this.settings.itemsPerPage);
        },
        ...mapState([
            'settings',
            'active',
            'groups',
            'feedState'
        ]),
        ...mapGetters([
            'getFeed',
            'getGroup',
        ])
    },
    methods: {
        icon(feedId) {
            return this.getFeed(feedId).icon;
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
        async refreshList({ type, id, isLoading = false, isChangePage = false, isUpdateComplete = false }) {
            if (isUpdateComplete && !this.isShowing(type, id)) {
                isLoading && this.loading--;
                return;
            }
            if (!isLoading) this.loading++;
            if (!isChangePage) {
                this.totalItems = await message.sendGetCount(this.active.subType, this.active.id, this.settings.view);
                if (this.currentPage > this.totalPage) {
                    if (this.totalPage === 0) {
                        this.currentPage = 1;
                    }
                    else {
                        this.currentPage = this.totalPage;
                    }
                }
            }
            this.items = await message.sendGet(this.active.subType, this.active.id, this.currentPage);
            this.clearSelects();
            this.loading--;
        },
        isShowing(type, id) {
            let { subType: activeType, id: activeId } = this.active;
            if (activeType === 'group') {
                if (activeId === 'all') {
                    return true;
                }
                else if (type === 'feed') {
                    return this.groups.find(group => group.id === activeId).feeds.some(feed => feed.id === id);
                }
            }
            else if (activeType === 'feed') {
                return id === activeId;
            }
        },
        selectAll() {
            this.selectedItems = this.items.map(({ id, feedId }) => ({ id, feedId }));
        },
        clearSelects() {
            this.selectedItems = [];
        },
        modifyUnreadCount() {
            this.selectedItems.map(item => item.feedId).forEach(async id => {
                let count = await message.sendGetCount('feed', id, 'unread');
                await this.$store.dispatch('updateFeedState', { id, unread: count });
            });
        },
        async markItems(type) {
            this.loading++;
            let request;
            switch (type) {
                case 'read': {
                    request = await message.sendMarkItemsAsRead(this.selectedItems.map(item => item.id));
                    this.modifyUnreadCount();
                    break;
                }
                case 'unread': {
                    request = await message.sendMarkItemsAsUnread(this.selectedItems.map(item => item.id));
                    this.modifyUnreadCount();
                    break;
                }
                case 'all': {
                    let { subType: type, id } = this.active;
                    request = await message.sendMarkAllItemsAsRead(type, id);
                    if (type === 'group') {
                        if (id === 'all') {
                            Object.keys(this.feedState).forEach(id => this.$store.dispatch('updateFeedState', { id, unread: 0 }));
                        }
                        else {
                            this.getGroup(id).feeds.forEach(({ id }) => this.$store.dispatch('updateFeedState', { id, unread: 0 }));
                        }
                    }
                    else {
                        this.$store.dispatch('updateFeedState', { id, unread: 0 });
                    }
                }
            }
            let { result, data } = request;
            if (result === 'ok') {
                await this.refreshList({ isLoading: true });
            }
            else if (result === 'fail') {
                throw data;
            }
        },
        changePage() {
            this.refreshList({ isChangePage: true });
        },
        showDetails(title, author, content) {
            this.$emit('showDetails', { title, author, content });
        }
    },
    beforeRouteEnter(to, from, next) {
        next(async vm => {
            let [, subType, id] = to.path.substr(1).split('/');
            vm.refreshList({ subType, id, isLoading: true });
        });
    },
    async beforeRouteUpdate(to, from, next) {
        let [, subType, id] = to.path.substr(1).split('/');
        this.refreshList({ subType, id });
        next();
    }
};
</script>
<style lang="scss" scoped>
.small {
    width: 24px !important;
    height: 24px !important;
}
.small > [class^="custom-feed-icon"] {
    background-size: 24px;
}
</style>

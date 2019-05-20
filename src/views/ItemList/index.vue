<template>
    <v-container class="px-5" fill-height fluid>
        <v-layout column fill-height>
            <v-fade-transition :duration="40" mode="out-in">
                <v-flex fill-height key="items" v-if="loading === 0">
                    <v-alert class="py-1" dismissible type="warning" v-if="isAlertShown" v-model="isAlertShown">
                        <div v-html="`上一次更新失败，错误信息为：<br>${getFeedError(active.id)}`"></div>
                    </v-alert>
                    <v-list class="transparent" dense v-if="items.length !== 0">
                        <template v-for="(item, i) in items">
                            <v-hover :key="item.id">
                                <v-list-tile @click="showDetails(item.title, item.content, item.author)" slot-scope="{ hover: isHover }">
                                    <v-list-tile-action style="min-width: unset;">
                                        <v-checkbox :ripple="false" :value="item.id" @click.stop color="blue" hide-details v-model="selectedItems"></v-checkbox>
                                    </v-list-tile-action>
                                    <v-chip
                                        @click.stop
                                        color="grey darken-2"
                                        disabled
                                        small
                                        style="margin-left: 8px;"
                                        text-color="white"
                                        v-if="item.author"
                                    >
                                        <v-avatar class="small">
                                            <div :class="`custom-feed-icon-${item.feedId}`" v-if="isUrl(icons[i])"></div>
                                            <v-icon :size="20" v-else v-text="icons[i] ? icons[i] : 'insert_drive_file'"></v-icon>
                                        </v-avatar>
                                        {{item.author}}
                                    </v-chip>
                                    <v-list-tile-avatar v-else>
                                        <v-avatar class="small">
                                            <div :class="`custom-feed-icon-${item.feedId}`" v-if="isUrl(icons[i])"></div>
                                            <v-icon :size="20" v-else v-text="icons[i] ? icons[i] : 'insert_drive_file'"></v-icon>
                                        </v-avatar>
                                    </v-list-tile-avatar>
                                    <v-list-tile-content>
                                        <v-list-tile-title
                                            :class="item.state === 'unread' ? 'font-weight-bold' : 'grey--text text--lighten-1'"
                                            v-html="item.title"
                                        ></v-list-tile-title>
                                    </v-list-tile-content>
                                    <v-tooltip :open-delay="1000" lazy top v-if="isHover">
                                        <v-btn @click.stop="openInNewTab(item.url)" icon slot="activator" small>
                                            <v-icon small>arrow_forward</v-icon>
                                        </v-btn>
                                        <span>在新标签页打开</span>
                                    </v-tooltip>
                                    <v-tooltip
                                        :key="button.id"
                                        :open-delay="1000"
                                        lazy
                                        top
                                        v-for="button in buttons"
                                        v-if="button.active && button.feedIds.indexOf(item.feedId) > -1"
                                    >
                                        <v-btn @click.stop="customAction(button.script, item)" icon slot="activator" small>
                                            <v-icon small v-text="button.icon"></v-icon>
                                        </v-btn>
                                        <span v-text="button.name"></span>
                                    </v-tooltip>
                                    <v-chip
                                        @click.stop
                                        color="grey darken-3"
                                        disabled
                                        outline
                                        small
                                        text-color="white"
                                    >{{timeFormatter(item.pubDate)}}</v-chip>
                                    <v-tooltip :open-delay="1000" lazy top v-if="active.id !== 'collections'">
                                        <v-btn
                                            :color="item.collectionId && 'yellow--text'"
                                            @click.stop="collectStateChange([item])"
                                            icon
                                            slot="activator"
                                            small
                                        >
                                            <v-icon small v-text="item.collectionId ? 'star' :'star_border'"></v-icon>
                                        </v-btn>
                                        <span v-text="item.collectionId ? '取消收藏' : '收藏'"></span>
                                    </v-tooltip>
                                </v-list-tile>
                            </v-hover>
                            <v-divider :key="item.id * -1" v-if="i < items.length - 1 || items.length === 1"></v-divider>
                        </template>
                    </v-list>
                    <v-layout align-center fill-height justify-center v-else>
                        <v-card class="title pl-3 pr-5 py-3" flat>
                            <v-icon left>error_outline</v-icon>
                            {{`暂无${emptyText}消息`}}
                        </v-card>
                    </v-layout>
                    <v-layout align-center justify-center>
                        <v-pagination :length="totalPage" :total-visible="9" @input="changePage" circle v-if="totalPage > 1" v-model="currentPage"></v-pagination>
                    </v-layout>
                    <v-speed-dial
                        direction="bottom"
                        fixed
                        open-on-hover
                        right
                        style="top: 88px; z-index:0;"
                        top
                        v-if="items.length !== 0"
                        v-model="floatingButton"
                    >
                        <v-btn
                            @click="active.id !== 'collections' && markItems('all')"
                            color="blue darken-2"
                            fab
                            slot="activator"
                            v-model="floatingButton"
                        >
                            <v-icon v-text="active.id === 'collections' ? 'menu' : 'done_all'"></v-icon>
                            <v-icon v-if="active.id === 'collections'">close</v-icon>
                        </v-btn>
                        <v-btn @click.stop="selectAll" color="pink" fab small>
                            <v-icon>select_all</v-icon>
                        </v-btn>
                        <v-btn @click="clearSelects" color="green" fab small>
                            <v-icon>crop_free</v-icon>
                        </v-btn>
                        <v-btn @click="markItems('read')" color="indigo" fab small v-if="active.id !== 'collections'">
                            <v-icon>bookmark</v-icon>
                        </v-btn>
                        <v-btn @click="markItems('unread')" color="indigo" fab small v-if="active.id !== 'collections'">
                            <v-icon>bookmark_border</v-icon>
                        </v-btn>
                        <v-btn @click="removeCollections(selectedItems)" color="red" fab small v-if="active.id === 'collections'">
                            <v-icon>star_border</v-icon>
                        </v-btn>
                    </v-speed-dial>
                </v-flex>
                <v-layout align-center fill-height justify-center key="loading" v-else>
                    <v-card color="primary" width="300">
                        <v-card-text>
                            正在加载数据
                            <v-progress-linear class="mb-0" color="white" indeterminate></v-progress-linear>
                        </v-card-text>
                    </v-card>
                </v-layout>
            </v-fade-transition>
            <v-navigation-drawer
                :class="['d-flex',{resizing: isResizing}]"
                :stateless="showingDetailsImage"
                :width="detailsWidth"
                @input="e => e || (detailsContent = detailsTitle = detailsAuthor = '')"
                fixed
                right
                temporary
                v-model="showingDetails"
            >
                <div @mousedown="onResizing" style="height: 100%; cursor: e-resize; max-width: 5px; min-width: 5px;"></div>
                <v-card :class="{'details-image-showing': showingDetailsImage}" flat id="scroll-target" v-scroll:#scroll-target="onDetailsScroll">
                    <v-card-title class="headline font-weight-bold pb-1" id="scroll-top" v-html="detailsTitle"></v-card-title>
                    <v-card-title class="py-1">
                        <v-chip class="ml-0" color="primary" selected small text-color="white" v-if="detailsAuthor">
                            <v-avatar class="small">
                                <v-icon>account_circle</v-icon>
                            </v-avatar>
                            {{detailsAuthor}}
                        </v-chip>
                    </v-card-title>
                    <v-card-text class="details-content" ref="detailsContent" v-html="parsedDetailsContent"></v-card-text>
                </v-card>
                <v-fab-transition>
                    <v-btn
                        @click="$scrollTo('#scroll-top', 300, { container: '#scroll-target'})"
                        bottom
                        color="green"
                        fab
                        fixed
                        right
                        small
                        v-if="detailsOffsetTop > 100"
                    >
                        <v-icon small>keyboard_arrow_up</v-icon>
                    </v-btn>
                </v-fab-transition>
            </v-navigation-drawer>
            <v-dialog fullscreen v-model="showingDetailsImage">
                <v-layout column fill-height style="overflow: hidden; background-color: rgba(33, 33, 33, 0.8)">
                    <v-layout fill-height style="position: relative;">
                        <v-btn
                            @click="showingDetailsImage = false"
                            class="overflow-button"
                            color="rgba(33, 33, 33, 0.46)"
                            icon
                            large
                            style="right: 10px; top: 10px;"
                        >
                            <v-icon>close</v-icon>
                        </v-btn>
                        <v-btn
                            @click="detailsImageIndex = `tab-${parseInt(detailsImageIndex.replace('tab-', '')) + 1}`"
                            class="overflow-button"
                            color="rgba(33, 33, 33, 0.46)"
                            icon
                            large
                            style="right: 10px; top: 0; bottom: 0;"
                            v-if="parseInt(detailsImageIndex.replace('tab-', '')) < detailsImages.length - 1"
                        >
                            <v-icon>arrow_forward</v-icon>
                        </v-btn>
                        <v-btn
                            @click="detailsImageIndex = `tab-${parseInt(detailsImageIndex.replace('tab-', '')) - 1}`"
                            class="overflow-button"
                            color="rgba(33, 33, 33, 0.46)"
                            icon
                            large
                            style="left: 10px; top: 0; bottom: 0; "
                            v-if="parseInt(detailsImageIndex.replace('tab-', '')) > 0"
                        >
                            <v-icon>arrow_back</v-icon>
                        </v-btn>
                        <v-tabs-items v-if="detailsImages.length > 0" v-model="detailsImageIndex">
                            <v-tab-item :key="i" :value="`tab-${i}`" v-for="(detailsImage, i) in detailsImages">
                                <v-layout class="details-image-container">
                                    <img
                                        :class="['details-image', {'zoomed-image': detailsImage.zoomed}]"
                                        :src="detailsImage.src"
                                        @click="detailsImage.zoomed = !detailsImage.zoomed"
                                    >
                                </v-layout>
                            </v-tab-item>
                        </v-tabs-items>
                    </v-layout>
                    <v-divider class="mb-1"></v-divider>
                    <v-tabs
                        :height="100"
                        centered
                        color="transparent"
                        fixed-tabs
                        show-arrows
                        v-if="detailsImages.length > 0"
                        v-model="detailsImageIndex"
                    >
                        <v-tabs-slider color="blue"></v-tabs-slider>
                        <v-tab :href="`#tab-${i}`" :key="i" class="mb-1" v-for="(detailsImage, i) in detailsImages">
                            <v-img :max-height="96" :src="detailsImage">
                                <v-layout align-center fill-height justify-center ma-0 slot="placeholder">
                                    <v-progress-circular color="grey lighten-5" indeterminate></v-progress-circular>
                                </v-layout>
                            </v-img>
                        </v-tab>
                    </v-tabs>
                </v-layout>
            </v-dialog>
        </v-layout>
    </v-container>
</template>
<script>
import message from '~/utils/extension/message';
import { mapState, mapGetters } from 'vuex';

export default {
    data: () => ({
        showingDetails: false,
        showingDetailsImage: false,
        loading: 1,
        items: [],
        selectedItems: [],
        currentPage: 1,
        totalItems: 0,
        floatingButton: false,
        refreshing: false,
        refreshQueue: [],
        refreshMaxInterval: 500,
        detailsTitle: '',
        detailsAuthor: '',
        detailsContent: '',
        detailsImages: [],
        detailsImageIndex: 'tab-0',
        detailsOffsetTop: 0,
        detailsWidth: 900,
        isResizing: false,
    }),
    computed: {
        icons() {
            return this.items.map(item => this.getFeed(item.feedId).icon);
        },
        totalPage() {
            return Math.ceil(this.totalItems / this.settings.itemsPerPage);
        },
        parsedDetailsContent() {
            return this.detailsContent.replace(/<(a[^>]*)>/g, '<$1 target="_blank">')
                .replace(/<img[^>]*src=["']([^"']*)["'][^>]*?>/g, '<span><img class="image-box" src="$1"/></span>');
        },
        emptyText() {
            if (this.active.id === 'collections') return '收藏的';
            else if (this.settings.view === 'unread') return '未读的';
            else if (this.settings.view === 'read') return '已读的';
            else if (this.settings.view === 'all') return '任何';
        },
        ...mapState([
            'settings',
            'active',
            'groups',
            'buttons',
            'collections',
            'feedState'
        ]),
        ...mapGetters([
            'getFeed',
            'getGroup',
            'getFeedError',
            'getCollections'
        ]),
        isAlertShown: {
            get() {
                if (this.active.subType === 'feed') return this.getFeedError(this.active.id);
                else return false;
            },
            set(value) {
                if (!value) this.$store.dispatch('updateFeedState', { id: this.active.id, errorMessage: '' });
            }
        }
    },
    watch: {
        showingDetailsImage(val) {
            val || setTimeout(() => {
                this.detailsImages = [];
                this.detailsImageIndex = 'tab-0';
            }, 300);
        }
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
                return `${('0' + time.getHours()).substr(-2)}:${('0' + time.getMinutes()).substr(-2)}`;
            else
                return `${time.getFullYear()}/${time.getMonth() + 1}/${time.getDate()}`;
        },
        async refreshList(config = {}) {
            let { type, id, isLoading = false, isChangePage = false, isUpdateComplete = false, isRouteChange = false } = config;
            if (isUpdateComplete && !this.isShowing(type, id)) {
                isLoading && this.loading--;
                return;
            }
            if (!isLoading) this.loading++;
            if (!isChangePage) {
                if (this.active.id === 'collections') this.totalItems = this.collections.length;
                else this.totalItems = await message.sendGetCount(this.active.subType, this.active.id, this.settings.view);
                if (isRouteChange) this.currentPage = 1;
                if (this.currentPage > this.totalPage) {
                    if (this.totalPage === 0) {
                        this.currentPage = 1;
                    }
                    else {
                        this.currentPage = this.totalPage;
                    }
                }
            }
            if (this.active.id === 'collections') this.items = JSON.parse(JSON.stringify(this.getCollections(this.currentPage)));
            else this.items = await message.sendGet(this.active.subType, this.active.id, this.currentPage);
            this.clearSelects();
            this.floatingButton = false;
            this.loading--;
        },
        isShowing(type, id) {
            let { subType: activeType, id: activeId } = this.active;
            if (activeType === 'group') {
                if (activeId === 'all') {
                    return true;
                }
                else if (activeId === 'collections') {
                    return false;
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
            this.selectedItems = this.items.map(({ id }) => id);
        },
        clearSelects() {
            this.selectedItems = [];
        },
        async modifyUnreadCount() {
            let feedIds = new Set(this.selectedItems.map(id => this.items.find(item => item.id === id).feedId));
            for (let feedId of feedIds) {
                let count = await message.sendGetCount('feed', feedId, 'unread');
                await this.$store.dispatch('updateFeedState', { id: feedId, unread: count });
            }
        },
        async markItems(type) {
            this.loading++;
            switch (type) {
                case 'read': {
                    await message.sendMarkItemsAsRead(this.selectedItems);
                    await this.modifyUnreadCount();
                    break;
                }
                case 'unread': {
                    await message.sendMarkItemsAsUnread(this.selectedItems);
                    await this.modifyUnreadCount();
                    break;
                }
                case 'all': {
                    let { subType: type, id } = this.active;
                    await message.sendMarkAllItemsAsRead(type, id);
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
            await this.addToRefreshQueue({ isLoading: true });
        },
        openInNewTab(url) {
            browser.tabs.create({ url, active: false });
        },
        changePage() {
            this.addToRefreshQueue({ isChangePage: true });
        },
        customAction(script, { url, title }) {
            try {
                let context = {
                    url,
                    title,
                    fetchSource: message.sendFetchSource.bind(message),
                    showInfo: this.$addInfo,
                    tabs: browser.tabs,
                    downloads: browser.downloads
                };
                (function () {
                    let window, chrome, browser = undefined;
                    eval(script);
                    return [window, chrome, browser, context];
                })();
            }
            catch (e) { this.$throw(e); }
        },
        async collectStateChange(items) {
            for (let item of items) {
                if (item.collectionId) {
                    await this.$store.dispatch('deleteCollection', item.collectionId);
                    item.collectionId = '';
                }
                else {
                    item.collectionId = Date.now().toString();
                    let newItem = JSON.parse(JSON.stringify(item));
                    newItem.state = 'unread';
                    newItem.id = newItem.collectionId;
                    delete newItem.collectionId;
                    await this.$store.dispatch('addCollection', newItem);
                }
                await message.sendChangeItemCollectionId(item.id, item.collectionId);
            }
        },
        async removeCollections(ids) {
            this.loading++;
            let items = await message.sendGetItemsByCollectionId(ids);
            if (items.length > 0) await this.collectStateChange(items);
            else await Promise.all(ids.map(id => this.$store.dispatch('deleteCollection', id)));
            this.addToRefreshQueue({ isLoading: true });
        },
        async addToRefreshQueue(info) {
            if (!this.refreshing) {
                this.refreshing = true;
                await this.refreshList(info);
                setTimeout(() => this.leaveRefreshQueue(), this.refreshMaxInterval);
            }
            else this.refreshQueue.push(info);
        },
        async leaveRefreshQueue() {
            if (this.refreshQueue.length > 0) {
                await this.refreshList(this.refreshQueue.pop());
                this.refreshQueue = [];
                setTimeout(() => this.leaveRefreshQueue(), this.refreshMaxInterval);
            }
            else if (this.refreshing) this.refreshing = false;
        },
        showDetails(title, content, author) {
            this.showingDetails = true;
            this.detailsTitle = title;
            this.detailsAuthor = author;
            this.detailsContent = content ? content : '';
            this.$nextTick(() => {
                let images = this.$refs.detailsContent.querySelectorAll('.image-box');
                images.forEach((image, i) => image.addEventListener('click', () => {
                    this.detailsImages = images ? [...images].map(image => ({ zoomed: true, src: image.src })) : [];
                    this.detailsImageIndex = `tab-${i}`;
                    this.showingDetailsImage = true;
                }));
            });
        },
        onDetailsScroll(e) {
            this.detailsOffsetTop = e.target.scrollTop;
        },
        onResizing(e) {
            this.isResizing = true;
            let offset = e.clientX,
                originWidth = Math.min(this.detailsWidth, document.body.offsetWidth),
                newWidth = originWidth;
            document.onmousemove = (e) => {
                newWidth = offset - e.clientX + originWidth;
                if (newWidth < 300) {
                    newWidth = 300;
                }
                this.detailsWidth = newWidth;
            };
            document.onmouseup = () => {
                this.$store.dispatch('updateSetting', { detailsWidth: newWidth });
                this.isResizing = false;
                document.onmousemove = undefined;
                document.onmouseup = undefined;
            };
        },
    },
    beforeRouteEnter(to, from, next) {
        next(async vm => {
            let [, subType, id] = to.path.substr(1).split('/');
            vm.addToRefreshQueue({ subType, id, isLoading: true, isRouteChange: true });
        });
    },
    async beforeRouteUpdate(to, from, next) {
        let [, subType, id] = to.path.substr(1).split('/');
        this.addToRefreshQueue({ subType, id, isRouteChange: true });
        next();
    }
};
</script>
<style lang="scss" scoped>
.small {
    width: 24px !important;
    height: 24px !important;
    overflow: hidden;
}
.small > [class^="custom-feed-icon"] {
    background-size: 24px;
}
.resizing {
    transition: none !important;
    -moz-user-select: none !important;
}
.details-image-showing {
    overflow: hidden;
}
.details-content /deep/ .image-box {
    max-width: calc(100% - 16px);
    max-height: 500px;
    cursor: pointer;
}
.details-image-container {
    overflow: scroll;
    height: calc(100vh - 108px);
    width: 100vw;

    .details-image {
        margin: auto;
        flex-shrink: 0;
        cursor: pointer;
        &.zoomed-image {
            max-height: 100%;
            flex-shrink: 1;
        }
    }
}
.overflow-button {
    position: absolute;
    margin: auto;
    z-index: 999;
}
#scroll-target {
    -moz-user-select: text;
    overflow-y: auto;
}
</style>

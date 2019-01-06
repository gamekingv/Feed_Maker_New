<template>
    <v-app dark>
        <v-fade-transition>
            <v-container fluid v-if="!loading">
                <v-navigation-drawer app fixed stateless v-model="drawer" value="true" width="250">
                    <v-layout column fill-height>
                        <v-toolbar class="transparent" flat>
                            <v-toolbar-items>
                                <v-icon class="blue--text" x-large>wifi_tethering</v-icon>
                            </v-toolbar-items>
                            <v-toolbar-title>Feed Maker</v-toolbar-title>
                        </v-toolbar>
                        <v-flex style="scrollbar-width: none; overflow-y: scroll;">
                            <group-list/>
                        </v-flex>
                    </v-layout>
                </v-navigation-drawer>
                <v-toolbar app fixed>
                    <v-tooltip :open-delay="1000" bottom lazy>
                        <v-toolbar-side-icon @click="drawer = !drawer" slot="activator"/>
                        <span>收起/显示侧边栏</span>
                    </v-tooltip>
                    <v-tooltip
                        :disabled="active.type !== 'list' || active.subType !== 'feed' || $store.getters.getFeed(active.id).home === ''"
                        :open-delay="1000"
                        bottom
                        lazy
                    >
                        <v-btn
                            :disabled="active.type !== 'list' || active.subType !== 'feed' || $store.getters.getFeed(active.id).home === ''"
                            @click="openHomePage"
                            icon
                            slot="activator"
                        >
                            <v-icon v-text="'home'"/>
                        </v-btn>
                        <span>打开主页</span>
                    </v-tooltip>
                    <v-fade-transition :duration="40" mode="out-in">
                        <v-toolbar-title :key="$store.getters.activeTitle" v-text="$store.getters.activeTitle"/>
                    </v-fade-transition>
                    <v-spacer/>
                    <v-btn-toggle class="mx-3" mandatory v-model="view">
                        <v-tooltip :disabled="active.type !== 'list'" :open-delay="1000" bottom lazy>
                            <v-btn :disabled="active.type !== 'list'" flat slot="activator" value="unread">
                                <v-icon>bookmark_border</v-icon>
                            </v-btn>
                            <span>只显示未读</span>
                        </v-tooltip>
                        <v-tooltip :disabled="active.type !== 'list'" :open-delay="1000" bottom lazy>
                            <v-btn :disabled="active.type !== 'list'" flat slot="activator" value="read">
                                <v-icon>bookmark</v-icon>
                            </v-btn>
                            <span>只显示已读</span>
                        </v-tooltip>
                        <v-tooltip :disabled="active.type !== 'list'" :open-delay="1000" bottom lazy>
                            <v-btn :disabled="active.type !== 'list'" flat slot="activator" value="all">
                                <v-icon>bookmarks</v-icon>
                            </v-btn>
                            <span>显示全部</span>
                        </v-tooltip>
                    </v-btn-toggle>
                    <v-tooltip :disabled="active.type !== 'list'" :open-delay="1000" bottom lazy>
                        <v-btn :disabled="active.type !== 'list'" @click.stop="refresh" icon slot="activator">
                            <v-icon>refresh</v-icon>
                        </v-btn>
                        <span>刷新</span>
                    </v-tooltip>
                    <v-tooltip :open-delay="1000" bottom lazy>
                        <v-btn @click="setting = !setting" icon slot="activator">
                            <v-icon>settings</v-icon>
                        </v-btn>
                        <span>打开设置</span>
                    </v-tooltip>
                </v-toolbar>
                <v-content class="fill-height">
                    <v-fade-transition duration="80" mode="out-in">
                        <router-view @showDetails="showDetails" ref="content"/>
                    </v-fade-transition>
                </v-content>
                <v-navigation-drawer :width="500" class="scrollbar-thin" fixed right temporary v-model="setting">
                    <v-layout column fill-height>
                        <v-layout column>
                            <v-subheader>自定义按钮</v-subheader>
                            <v-list class="pt-0">
                                <v-list-tile>
                                    <v-list-tile-action>启用</v-list-tile-action>
                                    <v-list-tile-content>
                                        <v-switch class="mt-0 pt-0 ml-4" color="blue" hide-details style="flex: unset;"></v-switch>
                                    </v-list-tile-content>
                                    <v-list-tile-content class="align-end">
                                        <v-btn @click="setting = false" class="mr-0" color="blue" to="/button/list">管理自定义按钮</v-btn>
                                    </v-list-tile-content>
                                </v-list-tile>
                            </v-list>
                        </v-layout>
                        <v-spacer></v-spacer>
                        <v-layout align-end class="mb-3">
                            <v-btn @click.native="$refs.selectFile.click()" color="blue">导入配置</v-btn>
                            <input @change="importConfig" ref="selectFile" type="file" v-show="false">
                            <v-btn @click="exportConfig">导出配置</v-btn>
                            <v-spacer></v-spacer>
                            <v-btn color="error">恢复默认配置</v-btn>
                        </v-layout>
                    </v-layout>
                </v-navigation-drawer>
                <v-navigation-drawer
                    :class="['d-flex',{resizing: isResizing}]"
                    :temporary="!showDetailsImage"
                    :width="detailsWidth"
                    @input="e => e || (detailsContent = detailsTitle = detailsAuthor = '')"
                    fixed
                    right
                    v-model="details"
                >
                    <div @mousedown="onResizing" style="height: 100%; cursor: e-resize; max-width: 5px; min-width: 5px;"></div>
                    <v-card class="scrollbar-thin" flat id="scroll-target" v-scroll:#scroll-target="onDetailsScroll">
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
                            v-if="detailsOffsetTop > 0"
                        >
                            <v-icon>keyboard_arrow_up</v-icon>
                        </v-btn>
                    </v-fab-transition>
                </v-navigation-drawer>
            </v-container>
        </v-fade-transition>
        <v-dialog persistent v-model="loading" width="300">
            <v-card color="primary">
                <v-card-text>正在加载数据
                    <v-progress-linear class="mb-0" color="white" indeterminate></v-progress-linear>
                </v-card-text>
            </v-card>
        </v-dialog>
        <v-dialog @input="e => e || (detailsImage = '')" scrollable v-model="showDetailsImage" width="unset">
            <v-card class="grey darken-4">
                <v-card-title class="font-weight-bold py-0 pr-0">查看图片
                    <v-spacer></v-spacer>
                    <v-btn @click="showDetailsImage = false" icon>
                        <v-icon>close</v-icon>
                    </v-btn>
                </v-card-title>
                <v-divider></v-divider>
                <v-card-text class="text-md-center scrollbar-thin">
                    <img :src="detailsImage">
                </v-card-text>
            </v-card>
        </v-dialog>
        <custom-icon-style/>
    </v-app>
</template>

<script>
import GroupList from './GroupList';
import CustomIconStyle from './CustomIconStyle';
import message from '~/utils/extension/message';

export default {
    data: () => ({
        loading: true,
        drawer: true,
        setting: false,
        details: false,
        showDetailsImage: false,
        detailsTitle: '',
        detailsAuthor: '',
        detailsContent: '',
        detailsImage: '',
        detailsOffsetTop: 0,
        detailsWidth: 1300,
        isResizing: false,
    }),
    computed: {
        view: {
            get() {
                return this.$store.state.settings.view;
            },
            async set(value) {
                this.$refs.content.loading++;
                await this.$store.dispatch('setView', value);
                await this.refreshList({ isLoading: true });
            }
        },
        parsedDetailsContent() {
            return this.detailsContent.replace(/<(a[^>]*)>/g, '<$1 target="_blank">')
                .replace(/<img[^>]*src=["']([^"']*)["'][^>]*?>/g, '<span><img class="image-box" src="$1"/></span>');
        },
        active() {
            return this.$store.state.active;
        }
    },
    async mounted() {
        await this.$store.dispatch('initStore');
        message.init(this);
        this.loading = false;
    },
    methods: {
        async refreshList(config) {
            return await this.$refs.content.refreshList(config);
        },
        async refresh() {
            let { subType: type, id } = this.active;
            switch (type) {
                case 'group': {
                    if (id === 'all') {
                        Object.keys(this.$store.state.feedState).forEach(id => this.$store.dispatch('updateFeedState', { id, isLoading: true }));
                    }
                    else {
                        this.$store.getters.getGroup(id).feeds.forEach(({ id }) => this.$store.dispatch('updateFeedState', { id, isLoading: true }));
                    }
                    break;
                }
                case 'feed': {
                    await this.$store.dispatch('updateFeedState', { id, isLoading: true });
                    break;
                }
            }
            await message.sendUpdate(type, id);
        },
        showDetails({ title, content, author }) {
            this.details = true;
            this.detailsTitle = title;
            this.detailsAuthor = author;
            this.detailsContent = content;
            this.$nextTick(() => {
                let images = this.$refs.detailsContent.querySelectorAll('.image-box');
                images.forEach(image => image.addEventListener('click', () => {
                    this.showDetailsImage = true;
                    this.detailsImage = image.src;
                }));
            });
        },
        openHomePage() {
            browser.tabs.create({ url: this.$store.getters.getFeed(this.active.id).home });
        },
        async exportConfig() {
            let { groups, parsers } = await browser.storage.local.get();
            let file = new Blob([JSON.stringify({ type: 'all', groups, parsers })], { type: 'application/json' });
            browser.downloads.download({
                url: URL.createObjectURL(file),
                filename: 'all configs.json',
                saveAs: true
            });
        },
        importConfig(e) {
            this.loading = true;
            let reader = new FileReader();
            reader.addEventListener('loadend', async event => {
                try {
                    let { type, groups, parsers } = JSON.parse(event.target.result);
                    if (type === 'all') {
                        await this.$store.dispatch('updateGroups', groups);
                        await this.$store.dispatch('updateParsers', parsers);
                        location.reload();
                    }
                }
                catch (e) { throw (e); }
            });
            reader.readAsText(e.target.files[0]);
        },
        onDetailsScroll(e) {
            this.detailsOffsetTop = e.target.scrollTop;
        },
        onResizing(e) {
            this.isResizing = true;
            let offset = e.clientX;
            let originWidth = this.detailsWidth;
            document.onmousemove = (e) => {
                let newWidth = offset - e.clientX + originWidth;
                if (newWidth < 300) {
                    newWidth = 300;
                }
                this.detailsWidth = newWidth;
            };
            document.onmouseup = () => {
                this.isResizing = false;
                document.onmousemove = undefined;
                document.onmouseup = undefined;
            };
        }
    },
    components: {
        GroupList,
        CustomIconStyle
    }
};
</script>

<style lang="scss" scoped>
.small {
    width: 24px !important;
    height: 24px !important;
}
.resizing {
    transition: none !important;
    -moz-user-select: none;
}
.details-content /deep/ .image-box {
    max-width: calc(100% - 16px);
    max-height: 500px;
    cursor: pointer;
}
</style>
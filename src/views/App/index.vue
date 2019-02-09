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
                        :disabled="active.type !== 'list' || active.subType !== 'feed' || getFeed(active.id).home === ''"
                        :open-delay="1000"
                        bottom
                        lazy
                    >
                        <v-btn
                            :disabled="active.type !== 'list' || active.subType !== 'feed' || getFeed(active.id).home === ''"
                            @click="openHomePage"
                            icon
                            slot="activator"
                        >
                            <v-icon v-text="'home'"/>
                        </v-btn>
                        <span>打开主页</span>
                    </v-tooltip>
                    <v-fade-transition :duration="40" mode="out-in">
                        <v-toolbar-title :key="activeTitle.action + activeTitle.name">
                            {{activeTitle.action}}
                            <span
                                :class="{'blue--text': !!activeTitle.action}"
                                v-if="!!activeTitle.name"
                                v-text="activeTitle.name"
                            ></span>
                        </v-toolbar-title>
                    </v-fade-transition>
                    <v-spacer/>
                    <v-btn-toggle class="mx-3" mandatory v-model="view">
                        <v-tooltip :disabled="active.type !== 'list' || active.id === 'collections'" :open-delay="1000" bottom lazy>
                            <v-btn :disabled="active.type !== 'list' || active.id === 'collections'" flat slot="activator" value="unread">
                                <v-icon>bookmark_border</v-icon>
                            </v-btn>
                            <span>只显示未读</span>
                        </v-tooltip>
                        <v-tooltip :disabled="active.type !== 'list' || active.id === 'collections'" :open-delay="1000" bottom lazy>
                            <v-btn :disabled="active.type !== 'list' || active.id === 'collections'" flat slot="activator" value="read">
                                <v-icon>bookmark</v-icon>
                            </v-btn>
                            <span>只显示已读</span>
                        </v-tooltip>
                        <v-tooltip :disabled="active.type !== 'list' || active.id === 'collections'" :open-delay="1000" bottom lazy>
                            <v-btn :disabled="active.type !== 'list' || active.id === 'collections'" flat slot="activator" value="all">
                                <v-icon>bookmarks</v-icon>
                            </v-btn>
                            <span>显示全部</span>
                        </v-tooltip>
                    </v-btn-toggle>
                    <v-tooltip :disabled="active.type !== 'list' || active.id === 'collections'" :open-delay="1000" bottom lazy>
                        <v-btn :disabled="active.type !== 'list' || active.id === 'collections'" @click.stop="refresh" icon slot="activator">
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
                <v-navigation-drawer :temporary="!importAlert" :width="500" @input="settingClose" fixed right v-model="setting">
                    <v-layout column fill-height>
                        <v-subheader>自定义按钮</v-subheader>
                        <v-list class="pt-0">
                            <v-list-tile>
                                <v-list-tile-content>
                                    <v-btn @click="setting = false" class="mr-0" color="blue" to="/button/list">管理自定义按钮</v-btn>
                                </v-list-tile-content>
                            </v-list-tile>
                        </v-list>
                        <v-subheader>常规</v-subheader>
                        <v-list class="pt-0">
                            <v-list-tile>
                                <v-flex lg6>自动更新</v-flex>
                                <v-flex lg6>
                                    <v-switch @change="updateSetting('autoUpdate')" class="mt-0 pt-0" color="blue" hide-details v-model="autoUpdate"></v-switch>
                                </v-flex>
                            </v-list-tile>
                            <v-list-tile class="mt-3">
                                <v-flex lg6>自动更新频率（分钟）</v-flex>
                                <v-flex lg6>
                                    <v-slider
                                        :thumb-size="24"
                                        @end="updateSetting('autoUpdateFrequency')"
                                        always-dirty
                                        hide-details
                                        max="60"
                                        min="1"
                                        thumb-label="always"
                                        v-model="autoUpdateFrequency"
                                    ></v-slider>
                                </v-flex>
                            </v-list-tile>
                            <v-list-tile class="mt-3">
                                <v-flex lg6>每页显示消息数量</v-flex>
                                <v-flex lg6>
                                    <v-slider
                                        :thumb-size="24"
                                        @end="itemsPerPageChanged = true"
                                        always-dirty
                                        hide-details
                                        max="100"
                                        min="1"
                                        thumb-label="always"
                                        v-model="itemsPerPage"
                                    ></v-slider>
                                </v-flex>
                            </v-list-tile>
                            <v-list-tile class="mt-3">
                                <v-flex lg6>最大并发处理数</v-flex>
                                <v-flex lg6>
                                    <v-slider
                                        :thumb-size="24"
                                        @end="updateSetting('maxThread')"
                                        always-dirty
                                        hide-details
                                        max="20"
                                        min="1"
                                        thumb-label="always"
                                        v-model="maxThread"
                                    ></v-slider>
                                </v-flex>
                            </v-list-tile>
                        </v-list>
                        <v-spacer></v-spacer>
                        <v-list>
                            <v-layout align-end>
                                <v-btn @click.native="$refs.selectFile.click()" color="blue">导入配置</v-btn>
                                <input @change="importConfig" accept="application/json" ref="selectFile" type="file" v-show="false">
                                <v-btn @click="exportConfig">导出配置</v-btn>
                                <v-spacer></v-spacer>
                                <v-btn @click="importAlert = true" color="error">恢复默认配置</v-btn>
                            </v-layout>
                        </v-list>
                    </v-layout>
                </v-navigation-drawer>
                <v-navigation-drawer
                    :class="['d-flex',{resizing: isResizing}]"
                    :stateless="showDetailsImage"
                    :width="detailsWidth"
                    @input="e => e || (detailsContent = detailsTitle = detailsAuthor = '')"
                    fixed
                    right
                    temporary
                    v-model="details"
                >
                    <div @mousedown="onResizing" style="height: 100%; cursor: e-resize; max-width: 5px; min-width: 5px;"></div>
                    <v-card :class="{'details-image-showing': showDetailsImage}" flat id="scroll-target" v-scroll:#scroll-target="onDetailsScroll">
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
            </v-container>
        </v-fade-transition>
        <v-dialog persistent v-model="loading" width="300">
            <v-card color="primary">
                <v-card-text>正在加载数据
                    <v-progress-linear class="mb-0" color="white" indeterminate></v-progress-linear>
                </v-card-text>
            </v-card>
        </v-dialog>
        <v-dialog @input="e => e || (detailsImages = [])" fullscreen v-model="showDetailsImage">
            <v-layout column fill-height style="overflow: hidden; background-color: rgba(33, 33, 33, 0.8)">
                <v-layout fill-height style="position: relative;">
                    <v-btn
                        @click="showDetailsImage = false"
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
                    <v-tabs-items v-model="detailsImageIndex">
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
                <v-tabs :height="100" centered color="transparent" fixed-tabs show-arrows v-model="detailsImageIndex">
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
        <v-dialog :width="300" content-class="grey darken-4" v-model="importAlert">
            <v-card class="grey darken-4">
                <v-card-text class="mt-3" v-if="importType === 'feed'">
                    <v-form lazy-validation ref="form" v-model="importFeedInfo">
                        <v-layout justify-center>
                            <v-flex lg10>
                                <v-select
                                    :items="groups.map(group => ({text: group.name, value: group.id}))"
                                    placeholder="添加到分组"
                                    solo
                                    v-model="importToGroup"
                                ></v-select>
                            </v-flex>
                        </v-layout>
                    </v-form>
                </v-card-text>
                <v-card-text class="my-4" v-else>{{`${importType === 'all' ? '导入此配置' : '即'}将清除所有现有配置及数据，是否继续？`}}</v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn :disabled="!importFeedInfo" @click="apply" color="blue">确定</v-btn>
                    <v-btn @click="close" color="secondary">取消</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
        <v-snackbar
            :color="info.color"
            :key="info.id"
            :value="true"
            @input="v => !!v || deleteInfo(info.id)"
            auto-height
            top
            v-for="info in infoText"
        >
            {{ info.text }}
            <v-btn :color="info.color ? undefined : 'pink--text'" @click="deleteInfo(info.id)" icon small>
                <v-icon small>close</v-icon>
            </v-btn>
        </v-snackbar>
        <custom-icon-style/>
    </v-app>
</template>

<script>
import GroupList from './GroupList';
import CustomIconStyle from './CustomIconStyle';
import message from '~/utils/extension/message';
import { mapState, mapGetters } from 'vuex';

export default {
    data: () => ({
        loading: true,
        drawer: true,
        setting: false,
        details: false,
        confirm: false,
        showDetailsImage: false,
        detailsTitle: '',
        detailsAuthor: '',
        detailsContent: '',
        detailsImages: [],
        detailsImageIndex: 'tab-0',
        detailsOffsetTop: 0,
        detailsWidth: 900,
        isResizing: false,
        itemsPerPage: 0,
        itemsPerPageChanged: false,
        autoUpdate: true,
        autoUpdateFrequency: 0,
        maxThread: 5,
        config: '',
        importType: '',
        importToGroup: '',
        importFeedInfo: true,
        importAlert: false,
        infoText: []
    }),
    computed: {
        view: {
            get() {
                return this.settings ? this.settings.view : 'all';
            },
            async set(value) {
                this.$refs.content.loading++;
                await this.$store.dispatch('updateSetting', { view: value });
                await this.saveSettings();
                await this.refreshList({ isLoading: true });
            }
        },
        parsedDetailsContent() {
            return this.detailsContent.replace(/<(a[^>]*)>/g, '<$1 target="_blank">')
                .replace(/<img[^>]*src=["']([^"']*)["'][^>]*?>/g, '<span><img class="image-box" src="$1"/></span>');
        },
        ...mapState([
            'active',
            'settings',
            'groups',
            'feedState'
        ]),
        ...mapGetters([
            'getGroup',
            'getFeed',
            'activeTitle'
        ])
    },
    async mounted() {
        let state = await message.init(this);
        if (!state) return this.addInfo('请等待初始化完成', 'warning');
        await this.$store.dispatch('initStore');
        this.itemsPerPage = this.settings.itemsPerPage;
        this.autoUpdate = this.settings.autoUpdate;
        this.autoUpdateFrequency = this.settings.autoUpdateFrequency;
        this.maxThread = this.settings.maxThread;
        this.detailsWidth = this.settings.detailsWidth;
        this.loading = false;
    },
    methods: {
        refreshList(config) {
            return this.$refs.content.addToRefreshQueue(config);
        },
        async refresh() {
            let { subType: type, id } = this.active;
            switch (type) {
                case 'group': {
                    if (id === 'all') {
                        this.groups.reduce((total, group) => group.active ? total.concat(group.feeds) : total, []).forEach(feed => feed.active && this.$store.dispatch('updateFeedState', { id: feed.id, isLoading: true }));
                    }
                    else {
                        this.getGroup(id).feeds.forEach(feed => feed.active && this.$store.dispatch('updateFeedState', { id: feed.id, isLoading: true }));
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
            this.detailsContent = content ? content : '';
            this.$nextTick(() => {
                let images = this.$refs.detailsContent.querySelectorAll('.image-box');
                images.forEach((image, i) => image.addEventListener('click', () => {
                    this.detailsImages = images ? [...images].map(image => ({ zoomed: true, src: image.src })) : [];
                    this.detailsImageIndex = `tab-${i}`;
                    this.showDetailsImage = true;
                }));
            });
        },
        openHomePage() {
            browser.tabs.create({ url: this.getFeed(this.active.id).home });
        },
        async exportConfig() {
            let { groups, parsers, buttons, settings, collections } = await browser.storage.local.get();
            let file = new Blob([JSON.stringify({ type: 'all', groups, parsers, buttons, settings, collections })], { type: 'application/json' });
            browser.downloads.download({
                url: URL.createObjectURL(file),
                filename: 'all configs.json',
                saveAs: true
            });
        },
        importConfig(e) {
            let reader = new FileReader();
            reader.addEventListener('loadend', async event => {
                try {
                    let config = JSON.parse(event.target.result);
                    if (!config.type) return this.$throw('导入文件解析错误');
                    this.importType = config.type;
                    this.config = config;
                    this.importAlert = true;
                }
                catch (e) { this.$throw(e); }
            });
            reader.readAsText(e.target.files[0]);
        },
        async resetAllConfig() {
            await browser.storage.local.clear();
            await message.sendClearDataBase();
        },
        async apply() {
            this.importAlert = false;
            if (this.importType === 'all') {
                let { groups, parsers, buttons, settings, collections } = this.config;
                await this.resetAllConfig();
                groups && await browser.storage.local.set({ groups });
                parsers && await browser.storage.local.set({ parsers });
                buttons && await browser.storage.local.set({ buttons });
                settings && await browser.storage.local.set({ settings });
                collections && await browser.storage.local.set({ collections });
                await message.changeAutoUpdateFrequency();
                this.$router.push('/list/group/all');
                location.reload();
            }
            else if (this.importType === 'feed') {
                let { feed, parser } = this.config;
                feed.id = Date.now().toString();
                feed.groupId = this.importToGroup;
                feed && await this.$store.dispatch('addFeed', feed);
                feed.custom && parser && await this.$store.dispatch('addParser', { id: feed.id, parser });
                this.setting = false;
            }
            else if (this.importType === '') {
                await this.resetAllConfig();
                await message.changeAutoUpdateFrequency();
                this.$router.push('/list/group/all');
                location.reload();
            }
            this.close();
        },
        close() {
            this.config = '';
            this.importType = '';
            this.importToGroup = '';
            this.importFeedInfo = true;
            this.importAlert = false;
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
        async updateSetting(key) {
            await this.$store.dispatch('updateSetting', { [key]: this[key] });
            if (key === 'autoUpdate') await message.changeAutoUpdate(this[key]);
            if (key === 'autoUpdateFrequency') await message.changeAutoUpdateFrequency();
            if (key === 'maxThread') await message.changeMaxThread();
        },
        saveSettings() {
            return this.$store.dispatch('saveSettings');
        },
        settingClose(e) {
            if (!e && this.itemsPerPageChanged) {
                this.itemsPerPageChanged = false;
                this.updateSetting('itemsPerPage');
                this.refreshList();
            }
        },
        addInfo(text, color) {
            let id = Date.now().toString();
            if (typeof text === 'string' && (!color || typeof color === 'string')) {
                this.infoText.push({ id, text, color });
            }
            else {
                this.infoText.push({ id, text: '参数非法！', color: 'error' });
            }
        },
        deleteInfo(id) {
            this.infoText.splice(this.infoText.findIndex(info => id === info.id), 1);
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
}
</style>
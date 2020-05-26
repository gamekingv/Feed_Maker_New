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
                        <v-flex class="no-scrollbar" style="scrollbar-width: none; overflow-y: scroll;">
                            <group-list />
                        </v-flex>
                    </v-layout>
                </v-navigation-drawer>
                <v-toolbar app fixed>
                    <v-tooltip :open-delay="1000" bottom lazy>
                        <v-toolbar-side-icon @click="drawer = !drawer" slot="activator" />
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
                            <v-icon v-text="'home'" />
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
                    <v-spacer />
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
                        <v-btn @click="$refs.setting.showing = true" icon slot="activator">
                            <v-icon>settings</v-icon>
                        </v-btn>
                        <span>打开设置</span>
                    </v-tooltip>
                </v-toolbar>
                <v-content class="fill-height">
                    <v-fade-transition duration="80" mode="out-in">
                        <router-view
                            :last="last"
                            :synchronizing="synchronizing"
                            @autoSync="autoSync"
                            @stopSync="stopSync"
                            @synchronize="synchronize"
                            ref="content"
                        />
                    </v-fade-transition>
                </v-content>
                <setting @refreshList="refreshList" ref="setting" />
            </v-container>
        </v-fade-transition>
        <v-dialog persistent v-model="loading" width="300">
            <v-card color="primary">
                <v-card-text>
                    正在加载数据
                    <v-progress-linear class="mb-0" color="white" indeterminate></v-progress-linear>
                </v-card-text>
            </v-card>
        </v-dialog>
        <v-dialog :width="500" content-class="grey darken-4" v-model="newConfigAlert">
            <v-card class="grey darken-4">
                <v-card-text class="my-4">{{'检测到github有更新的配置，是否替换本地配置？（选择“否”将强制同步配置到github，如果不想这样做请选择“取消”）'}}</v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn @click="replaceLocalConfig" color="blue">是</v-btn>
                    <v-btn @click="forceSynchronizing" color="secondary">否</v-btn>
                    <v-btn @click="cancelSynchronizing" color="blue" outline>取消</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
        <v-snackbar
            :color="info.color"
            :key="info.id"
            @input="v => !!v || deleteInfo(info.id)"
            auto-height
            top
            v-for="info in infoText"
            v-model="info.show"
        >
            {{ info.text }}
            <v-btn :color="info.color ? undefined : 'pink--text'" @click="deleteInfo(info.id)" icon small>
                <v-icon small>close</v-icon>
            </v-btn>
        </v-snackbar>
        <custom-icon-style />
    </v-app>
</template>

<script>
import GroupList from './GroupList';
import CustomIconStyle from './CustomIconStyle';
import Setting from './setting';
import message from '~/utils/extension/message';
import { mapState, mapGetters } from 'vuex';
import sync from '~/utils/extension/sync';

export default {
    data: () => ({
        loading: true,
        drawer: true,
        confirm: false,
        infoText: [],
        config: {},
        last: {
            time: -1,
            successTime: -1,
            success: false,
            message: ''
        },
        synchronizing: false,
        newConfigAlert: false
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
        await this.updateLast();
        sync.init(this);
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
        openHomePage() {
            browser.tabs.create({ url: this.getFeed(this.active.id).home });
        },
        saveSettings() {
            return this.$store.dispatch('saveSettings');
        },
        addInfo(text, color) {
            let id = Date.now().toString();
            if (typeof text === 'string' && (!color || typeof color === 'string')) {
                this.infoText.push({ show: false, id, text, color });
            }
            else {
                this.infoText.push({ show: false, id, text: '参数非法！', color: 'error' });
            }
            this.$nextTick(() => this.infoText[this.infoText.findIndex(info => id === info.id)].show = true);
        },
        deleteInfo(id) {
            this.infoText.splice(this.infoText.findIndex(info => id === info.id), 1);
        },
        async synchronize(isForced = false) {
            this.synchronizing = true;
            await sync.synchronize(isForced);
            await this.updateLast();
            this.synchronizing = false;
        },
        async updateLast() {
            let { last } = await browser.storage.local.get('last');
            if (last) this.last = last;
        },
        async autoSync() {
            await sync.autoSync();
        },
        stopSync() {
            sync.stopSync();
        },
        newConfigDetected(config) {
            this.newConfigAlert = true;
            this.config = config;
        },
        async replaceLocalConfig() {
            this.newConfigAlert = false;
            if (this.config.last) {
                [this.config.last.time, this.config.last.successTime] = Array(2).fill(Date.now());
            }
            for (let key in this.config) {
                await browser.storage.local.set({ [key]: JSON.parse(JSON.stringify(this.config[key])) });
            }
            window.location.reload();
        },
        async forceSynchronizing() {
            this.newConfigAlert = false;
            this.config = {};
            await this.synchronize(true);
            await this.updateLast();
        },
        cancelSynchronizing() {
            this.newConfigAlert = false;
            this.config = {};
        }
    },
    components: {
        GroupList,
        CustomIconStyle,
        Setting
    }
};
</script>

<style scoped>
.small {
    width: 24px !important;
    height: 24px !important;
}
</style>
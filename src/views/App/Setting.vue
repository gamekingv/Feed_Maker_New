<template>
    <v-navigation-drawer :width="500" @input="settingClose" fixed right temporary v-model="showing">
        <v-layout column fill-height>
            <v-subheader>自定义按钮</v-subheader>
            <v-list class="pt-0">
                <v-list-tile>
                    <v-list-tile-content>
                        <v-btn @click="$emit('closeSetting')" class="mr-0" color="blue" to="/button/list">管理自定义按钮</v-btn>
                    </v-list-tile-content>
                </v-list-tile>
            </v-list>
            <v-subheader>自动同步配置</v-subheader>
            <v-list class="pt-0">
                <v-list-tile>
                    <v-list-tile-content>
                        <v-btn @click="$emit('closeSetting')" class="mr-0" color="blue" to="/sync">管理自动同步配置</v-btn>
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
        </v-layout>
    </v-navigation-drawer>
</template>

<script>
import message from '~/utils/extension/message';

export default {
    data: () => ({
        showing: false,
        itemsPerPage: 0,
        itemsPerPageChanged: false,
        autoUpdate: true,
        autoUpdateFrequency: 0,
        maxThread: 5,
        config: {},
        importType: '',
        importToGroup: '',
        importFeedInfo: true,
        importAlert: false,
    }),
    computed: {
        settings() {
            return this.$store.state.settings;
        },
        groups() {
            return this.$store.state.groups;
        }
    },
    mounted() {
        this.itemsPerPage = this.settings.itemsPerPage;
        this.autoUpdate = this.settings.autoUpdate;
        this.autoUpdateFrequency = this.settings.autoUpdateFrequency;
        this.maxThread = this.settings.maxThread;
    },
    methods: {
        async updateSetting(key) {
            await this.$store.dispatch('updateSetting', { [key]: this[key] });
            if (key === 'autoUpdate') await message.changeAutoUpdate(this[key]);
            if (key === 'autoUpdateFrequency') await message.changeAutoUpdateFrequency();
            if (key === 'maxThread') await message.changeMaxThread();
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
                let { groups, parsers, buttons, settings, collections, synchronization, last } = JSON.parse(JSON.stringify(this.config));
                await this.resetAllConfig();
                groups && await browser.storage.local.set({ groups });
                parsers && await browser.storage.local.set({ parsers });
                buttons && await browser.storage.local.set({ buttons });
                settings && await browser.storage.local.set({ settings });
                collections && await browser.storage.local.set({ collections });
                synchronization && await browser.storage.local.set({ synchronization });
                last && await browser.storage.local.set({ last });
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
                this.showing = false;
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
            this.config = {};
            this.importType = '';
            this.importToGroup = '';
            this.importFeedInfo = true;
            this.importAlert = false;
        },
        settingClose(e) {
            if (!e && this.itemsPerPageChanged) {
                this.updateSetting('itemsPerPage');
                this.$emit('refreshList');
            }
        },
    }
};
</script>

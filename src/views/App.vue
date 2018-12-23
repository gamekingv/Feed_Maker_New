<template>
    <v-app dark>
        <v-fade-transition>
            <v-container v-if="!loading" fluid>
                <v-navigation-drawer width="250" stateless value="true" fixed v-model="drawer" app>
                    <v-layout column fill-height>
                        <v-toolbar flat class="transparent">
                            <v-toolbar-items>
                                <v-icon x-large class="blue--text">wifi_tethering</v-icon>
                            </v-toolbar-items>
                            <v-toolbar-title>Feed Maker</v-toolbar-title>
                        </v-toolbar>
                        <v-flex style="scrollbar-width: none; overflow-y: scroll;">
                            <group-list/>
                        </v-flex>
                    </v-layout>
                </v-navigation-drawer>
                <v-toolbar fixed app>
                    <v-toolbar-side-icon @click="drawer = !drawer"/>
                    <v-btn
                        icon
                        :disabled="active.type !== 'list' || active.subType !== 'feed' || $store.getters.getFeed(active.id).home === ''"
                        @click="openHomePage"
                    >
                        <v-icon v-text="'home'"/>
                    </v-btn>
                    <v-fade-transition mode="out-in" :duration="40">
                        <v-toolbar-title
                            :key="$store.getters.activeTitle"
                            v-text="$store.getters.activeTitle"
                        />
                    </v-fade-transition>
                    <v-spacer/>
                    <v-btn-toggle class="ml-3 mr-3" v-model="view" mandatory>
                        <v-btn value="unread" flat>
                            <v-icon>bookmark_border</v-icon>
                        </v-btn>
                        <v-btn value="read" flat>
                            <v-icon>bookmark</v-icon>
                        </v-btn>
                        <v-btn value="all" flat>
                            <v-icon>bookmarks</v-icon>
                        </v-btn>
                    </v-btn-toggle>
                    <v-btn icon @click.stop="refresh">
                        <v-icon>refresh</v-icon>
                    </v-btn>
                    <v-btn icon @click="setting = !setting">
                        <v-icon>settings</v-icon>
                    </v-btn>
                </v-toolbar>
                <v-content class="fill-height">
                    <v-fade-transition mode="out-in" duration="80">
                        <router-view ref="content" @showDetails="showDetails"/>
                    </v-fade-transition>
                </v-content>
                <v-navigation-drawer v-model="setting" :width="500" right temporary fixed>
                    <v-layout fill-height column>
                        <v-list>
                            <v-list-tile ripple @click="setting = !setting">
                                <v-list-tile-action>
                                    <v-icon>compare_arrows</v-icon>
                                </v-list-tile-action>
                                <v-list-tile-title>Switch drawer (click me)</v-list-tile-title>
                            </v-list-tile>
                        </v-list>
                        <v-spacer></v-spacer>
                        <v-layout class="mb-3" align-end justify-end>
                            <v-btn color="blue" @click.native="$refs.selectFile.click()">导入配置</v-btn>
                            <input
                                type="file"
                                ref="selectFile"
                                v-show="false"
                                @change="importConfig"
                            >
                            <v-btn @click="exportConfig">导出配置</v-btn>
                            <v-btn color="error">恢复默认配置</v-btn>
                        </v-layout>
                    </v-layout>
                </v-navigation-drawer>
                <v-navigation-drawer
                    v-model="details"
                    style="scrollbar-width: none;"
                    :width="1300"
                    right
                    :temporary="!showDetailsImage"
                    fixed
                    @input="e => e || (detailsContent = detailsTitle = detailsAuthor = '')"
                >
                    <v-card flat>
                        <v-card-title class="headline font-weight-bold pb-1" v-html="detailsTitle"></v-card-title>
                        <v-card-title class="pt-1 pb-1">
                            <v-chip
                                class="ml-0"
                                color="primary"
                                text-color="white"
                                small
                                selected
                                v-if="detailsAuthor"
                            >
                                <v-avatar class="small">
                                    <v-icon>account_circle</v-icon>
                                </v-avatar>
                                {{detailsAuthor}}
                            </v-chip>
                        </v-card-title>
                        <v-card-text ref="detailsContent" v-html="parsedDetailsContent"></v-card-text>
                    </v-card>
                </v-navigation-drawer>
            </v-container>
        </v-fade-transition>
        <v-dialog v-model="loading" persistent width="300">
            <v-card color="primary">
                <v-card-text>正在加载数据
                    <v-progress-linear class="mb-0" color="white" indeterminate></v-progress-linear>
                </v-card-text>
            </v-card>
        </v-dialog>
        <v-dialog
            width="unset"
            v-model="showDetailsImage"
            scrollable
            @input="e => e || (detailsImage = '')"
        >
            <v-card>
                <v-card-title class="font-weight-bold">查看图片</v-card-title>
                <v-divider></v-divider>
                <v-card-text class="text-md-center" style="scrollbar-width: none;">
                    <img :src="detailsImage">
                </v-card-text>
            </v-card>
        </v-dialog>
        <custom-icon-style/>
    </v-app>
</template>

<script>
import GroupList from 'views/Components/GroupList';
import message from '~/utils/extension/message';
import CustomIconStyle from 'views/Components/CustomIconStyle';

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
        searchString: ''
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
        search() {
            console.log(this.searchString);
        },
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
            let { groups } = await browser.storage.local.get();
            let file = new Blob([JSON.stringify({ type: 'all', groups })], { type: 'application/json' });
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
                    let { type, groups } = JSON.parse(event.target.result);
                    if (type === 'all') {
                        await this.$store.dispatch('updateGroups', groups);
                        location.reload();
                    }
                }
                catch (e) { throw (e); }
            });
            reader.readAsText(e.target.files[0]);
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
</style>

<style lang="scss">
.image-box {
    max-width: calc(100% - 16px);
    cursor: pointer;
}
</style>
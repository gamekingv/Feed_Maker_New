<template>
    <v-flex fill-height>
        <v-fade-transition mode="out-in" :duration="80">
            <v-list class="transparent" dense v-if="!loading">
                <template v-for="(item, i) in list">
                    <v-list-tile :key="item.id" @click.stop>
                        <v-list-tile-action>
                            <v-checkbox :ripple="false" hide-details></v-checkbox>
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
                            <v-list-tile-title v-text="item.title"></v-list-tile-title>
                        </v-list-tile-content>
                        <v-chip
                            color="grey darken-3"
                            text-color="white"
                            small
                            disabled
                            outline
                        >{{timeFormatter(item.pubDate)}}</v-chip>
                    </v-list-tile>
                    <v-divider v-if="i < list.length - 1" :key="item.id"></v-divider>
                </template>
            </v-list>
        </v-fade-transition>

        <v-fade-transition mode="out-in" :duration="80">
            <v-dialog v-model="loading" persistent width="300">
                <v-card color="primary">
                    <v-card-text>正在加载数据
                        <v-progress-linear indeterminate color="white" class="mb-0"></v-progress-linear>
                    </v-card-text>
                </v-card>
            </v-dialog>
        </v-fade-transition>

        <v-fade-transition mode="out-in" :duration="80">
            <v-speed-dial
                direction="bottom"
                open-on-hover
                right
                top
                fixed
                v-if="!loading"
                style="top: 88px;"
            >
                <v-btn slot="activator" color="blue darken-2" fab>
                    <v-icon>done_all</v-icon>
                </v-btn>
                <v-btn fab small color="pink">
                    <v-icon>select_all</v-icon>
                </v-btn>
                <v-btn fab small color="indigo">
                    <v-icon>done</v-icon>
                </v-btn>
                <v-btn fab small color="green">
                    <v-icon>crop_free</v-icon>
                </v-btn>
                <v-btn fab small color="red">
                    <v-icon>star</v-icon>
                </v-btn>
            </v-speed-dial>
        </v-fade-transition>
    </v-flex>
</template>
<script>
export default {
    data: () => ({
        loading: 0,
        selectedItems: []
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
        timeFormatter(timeString) {
            let time = new Date(timeString);
            if (time.toDateString() === new Date().toDateString())
                return `${('0' + time.getHours()).slice(-2)}:${('0' + time.getMinutes()).slice(-2)}`;
            else
                return `${time.getFullYear()}/${time.getMonth() + 1}/${time.getDate()}`;
        },
        refreshList(path) {
            let [, type, id] = path.substr(1).split('/');
            console.log(this.loading);
            this.loading++;
            this.$store.dispatch('refreshList', { type, id }).then(() => this.loading--);
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
<style lang="scss" scoped>
.small {
    width: 24px !important;
    height: 24px !important;
}
</style>

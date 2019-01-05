<template>
    <draggable :options="{ animation: 100 }" v-model="feeds">
        <template v-for="feed in group.feeds">
            <v-hover :key="feed.id">
                <v-list-tile
                    :inactive="!feed.active || !group.active"
                    :to="`/list/feed/${feed.id}`"
                    active-class="blue--text"
                    ripple
                    slot-scope="{ hover: isHover }"
                >
                    <v-list-tile-action>
                        <v-fade-transition :duration="20" mode="out-in">
                            <v-tooltip :open-delay="600" key="edit" lazy top v-if="isHover">
                                <v-btn :to="`/edit/feed/${feed.id}`" @click.stop.prevent flat icon slot="activator">
                                    <v-icon>edit</v-icon>
                                </v-btn>
                                <span>编辑</span>
                            </v-tooltip>
                            <v-badge :value="getFeedUnread(feed) > 0" class="small-badge" key="icon" overlap transition="fade-transition" v-else>
                                <span slot="badge" v-text="unreadFormatter(getFeedUnread(feed))"></span>
                                <v-badge
                                    :value="getFeedError(feed.id)"
                                    class="small-badge"
                                    color="transparent"
                                    key="icon"
                                    left
                                    overlap
                                    transition="fade-transition"
                                >
                                    <v-icon class="warning--text" slot="badge">report_problem</v-icon>
                                    <v-progress-circular
                                        :size="22"
                                        :width="2"
                                        color="blue"
                                        indeterminate
                                        v-if="$store.state.feedState[feed.id].isLoading === true"
                                    ></v-progress-circular>
                                    <v-avatar :size="22" v-else-if="/http(s)?:\/\/([\w-]+\.)+[\w-]+(\/[\w- ./?%&=]*)?/.test(feed.icon)">
                                        <img :class="`custom-feed-icon-${feed.id}`">
                                    </v-avatar>
                                    <v-avatar :size="22" tile v-else>
                                        <v-icon v-text="feed.icon ? feed.icon : 'insert_drive_file'"/>
                                    </v-avatar>
                                </v-badge>
                            </v-badge>
                        </v-fade-transition>
                    </v-list-tile-action>
                    <v-list-tile-content>
                        <v-list-tile-title :class="{'grey--text': !feed.active || !group.active}" v-text="feed.name"/>
                    </v-list-tile-content>
                </v-list-tile>
            </v-hover>
        </template>
    </draggable>
</template>

<script>
import Draggable from 'vuedraggable';

export default {
    props: ['group'],
    computed: {
        feeds: {
            get() {
                return this.group.feeds;
            },
            set(feeds) {
                this.$store.dispatch('updateFeeds', { groupId: this.group.id, feeds });
            }
        },
        feedsLength() {
            return this.feeds.length;
        },
        feedState() {
            return this.$store.state.feedState;
        },
        getFeedError() {
            return this.$store.getters.getFeedError;
        },
        getFeedUnread() {
            return this.$store.getters.getFeedUnread;
        }
    },
    watch: {
        feedsLength(newValue) {
            if (newValue === 0) this.$emit('groupEmpty', this.group.id);
        }
    },
    methods: {
        unreadFormatter(count) {
            return count > 99 ? '99+' : count;
        }
    },
    components: {
        Draggable
    }
};
</script>

<style lang="scss" scoped>
.small-badge /deep/ .v-badge__badge {
    height: 18px;
    width: 18px;
    font-size: 10px;
    top: -6px;
}
.small-badge /deep/ .v-badge__badge .v-icon {
    font-size: 18px;
}
</style>

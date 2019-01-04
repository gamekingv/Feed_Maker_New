<template>
    <draggable :options="{ animation: 100 }" v-model="feeds">
        <v-list-tile
            :inactive="!feed.active || !group.active"
            :key="feed.id"
            :to="`/list/feed/${feed.id}`"
            @mouseenter.native="hoverId = feed.id"
            @mouseleave.native="hoverId = ''"
            active-class="blue--text"
            ripple
            v-for="feed in group.feeds"
        >
            <v-list-tile-action>
                <v-fade-transition :duration="20" mode="out-in">
                    <v-tooltip :open-delay="600" key="edit" lazy top v-if="hoverId === feed.id">
                        <v-btn :to="`/edit/feed/${feed.id}`" @click.stop.prevent flat icon slot="activator">
                            <v-icon>edit</v-icon>
                        </v-btn>
                        <span>编辑</span>
                    </v-tooltip>
                    <v-badge :value="getFeedUnread(feed) > 0" class="small-badge" key="icon" overlap transition="fade-transition" v-else>
                        <span slot="badge" v-text="unreadFormatter(getFeedUnread(feed))"></span>
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
                </v-fade-transition>
            </v-list-tile-action>
            <v-list-tile-content>
                <v-list-tile-title :class="{'grey--text': !feed.active || !group.active}" v-text="feed.name"/>
            </v-list-tile-content>
        </v-list-tile>
    </draggable>
</template>

<script>
import Draggable from 'vuedraggable';

export default {
    props: ['group'],
    data: () => ({
        hoverId: ''
    }),
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
        },
        getFeedUnread(feed) {
            return this.$store.getters.getFeedUnread(feed);
        }
    },
    components: {
        Draggable
    }
};
</script>

<template>
    <draggable v-model="feeds" :options="options">
        <v-list-tile
            active-class="blue--text"
            v-for="feed in group.feeds"
            :key="feed.id"
            :to="`/list/feed/${feed.id}`"
            @mouseenter="hoverId = feed.id"
            @mouseleave="hoverId = ''"
        >
            <v-list-tile-action>
                <v-btn
                    flat
                    icon
                    @click.stop.prevent
                    :to="`/edit/feed/${feed.id}`"
                    v-if="hoverId === feed.id"
                >
                    <v-icon>edit</v-icon>
                </v-btn>
                <v-badge color="red" overlap v-else>
                    <span slot="badge" v-text="$store.state.feedState[feed.id].unread"></span>
                    <v-progress-circular
                        indeterminate
                        :size="22"
                        :width="2"
                        color="blue"
                        v-if="$store.state.feedState[feed.id].isLoading === true"
                    ></v-progress-circular>
                    <v-avatar
                        size="22"
                        v-else-if="/http(s)?:\/\/([\w-]+\.)+[\w-]+(\/[\w- ./?%&=]*)?/.test(feed.icon)"
                    >
                        <img :src="feed.icon">
                    </v-avatar>
                    <v-icon size="22" v-text="feed.icon ? feed.icon : 'insert_drive_file'" v-else/>
                </v-badge>
            </v-list-tile-action>
            <v-list-tile-content>
                <v-list-tile-title v-text="feed.name"/>
            </v-list-tile-content>
        </v-list-tile>
    </draggable>
</template>

<script>
import Draggable from 'vuedraggable';

export default {
    props: ['group'],
    data: () => ({
        options: {
            animation: 100
        },
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
        }
    },
    methods: {
    },
    components: {
        Draggable
    }
};
</script>

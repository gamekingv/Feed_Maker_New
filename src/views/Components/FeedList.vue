<template>
    <draggable v-model="feeds" :options="options">
        <v-list-tile
            v-for="feed in group.feeds"
            :key="feed.id"
            ripple
            :to="`/list/feed/${feed.id}`"
            @mouseenter="hoverId = feed.id"
            @mouseleave="hoverId = ''"
        >
            <v-list-tile-action v-if="hoverId !== feed.id">
                <v-avatar
                    size="22px"
                    v-if="/http(s)?:\/\/([\w-]+\.)+[\w-]+(\/[\w- ./?%&=]*)?/.test(feed.icon)"
                >
                    <img :src="feed.icon">
                </v-avatar>
                <v-icon v-text="feed.icon ? feed.icon : 'insert_drive_file'" v-else/>
            </v-list-tile-action>
            <v-list-tile-action v-if="hoverId === feed.id">
                <v-btn flat icon @click.stop.prevent :to="`/edit/feed/${feed.id}`">
                    <v-icon>edit</v-icon>
                </v-btn>
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
            animation: 100,
            group: 'feeds'
        },
        hoverId: ''
    }),
    computed: {
        feeds: {
            get() {
                return this.group.feeds;
            },
            set(feeds) {
                this.$store.dispatch('updateFeeds', { id: this.group.id, feeds });
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

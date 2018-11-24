<template>
    <draggable v-model="feeds" :options="options">
        <v-list-tile v-for="feed in group.feeds" :key="feed.id" ripple :to="`/list/feed/${feed.id}`" @mouseenter="hoverId = feed.id" @mouseleave="hoverId = ''">
            <v-list-tile-action v-if="hoverId !== feed.id">
                <v-icon v-text="feed.icon" />
            </v-list-tile-action>
            <v-list-tile-action v-if="hoverId === feed.id">
                <v-btn flat icon @click.stop.prevent="" :to="`/edit/feed/${feed.id}`">
                    <v-icon>edit</v-icon>
                </v-btn>
            </v-list-tile-action>
            <v-list-tile-content>
                <v-list-tile-title v-text="feed.name" />
            </v-list-tile-content>
        </v-list-tile>
    </draggable>
</template>

<script>
import { mapMutations } from 'vuex';
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
                this.$store.commit('updateFeeds', { id: this.group.id, feeds });
            }
        }
    },
    methods: {
        ...mapMutations(['setActive']),
        select(id) {
            this.setActive({ type: 'feed', id });

        }
    },
    components: {
        Draggable
    }
};
</script>

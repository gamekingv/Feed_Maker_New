<template>
    <v-list dense expand>
        <v-list-tile ripple to="/list/group/collection">
            <v-list-tile-action>
                <v-icon>star</v-icon>
            </v-list-tile-action>
            <v-list-tile-content>
                <v-list-tile-title>收藏</v-list-tile-title>
            </v-list-tile-content>
        </v-list-tile>
        <v-list-tile ripple to="/list/group/all">
            <v-list-tile-action>
                <v-icon>dashboard</v-icon>
            </v-list-tile-action>
            <v-list-tile-content>
                <v-list-tile-title>全部</v-list-tile-title>
            </v-list-tile-content>
            <v-list-tile-action>
                <v-btn flat icon @click.stop.prevent to="/add">
                    <v-icon>add</v-icon>
                </v-btn>
            </v-list-tile-action>
        </v-list-tile>
        <draggable v-model="groups" :options="options">
            <v-list-group
                v-for="group in groups"
                :key="group.id"
                :append-icon="group.feeds.length > 0 ? $vuetify.icons.expand : false"
            >
                <v-list-tile
                    slot="activator"
                    @click.stop
                    :to="`/list/group/${group.id}`"
                    @mouseenter="hoverId = group.id"
                    @mouseleave="hoverId = ''"
                >
                    <v-list-tile-action v-if="hoverId !== group.id">
                        <v-icon v-text="group.isActive ? 'folder_open': 'folder'"/>
                    </v-list-tile-action>
                    <v-list-tile-action v-if="hoverId === group.id">
                        <v-btn flat icon @click.stop.prevent :to="`/edit/group/${group.id}`">
                            <v-icon>edit</v-icon>
                        </v-btn>
                    </v-list-tile-action>
                    <v-list-tile-content>
                        <v-list-tile-title v-text="group.name"/>
                    </v-list-tile-content>
                </v-list-tile>
                <feed-list :group="group"/>
            </v-list-group>
        </draggable>
    </v-list>
</template>

<script>
import FeedList from './FeedList';
import Draggable from 'vuedraggable';

export default {
    data: () => ({
        options: {
            animation: 100
        },
        hoverId: ''
    }),
    computed: {
        groups: {
            get() {
                return this.$store.state.groups;
            },
            set(groups) {
                this.$store.dispatch('updateGroups', groups);
            }
        }
    },
    methods: {
    },
    components: {
        Draggable,
        FeedList
    }
};
</script>

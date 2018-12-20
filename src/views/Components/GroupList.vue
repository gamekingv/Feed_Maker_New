<template>
    <v-list dense expand>
        <v-list-tile active-class="blue--text" to="/list/group/collection">
            <v-list-tile-action>
                <v-icon>star</v-icon>
            </v-list-tile-action>
            <v-list-tile-content>
                <v-list-tile-title>收藏</v-list-tile-title>
            </v-list-tile-content>
        </v-list-tile>
        <v-list-tile active-class="blue--text" to="/list/group/all">
            <v-list-tile-action>
                <v-badge
                    :value="$store.getters.getAllUnread > 0"
                    class="small-badge"
                    overlap
                    transition="fade-transition"
                >
                    <span slot="badge" v-text="unreadFormatter($store.getters.getAllUnread)"></span>
                    <v-icon>dashboard</v-icon>
                </v-badge>
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
                :append-icon="group.feeds.length > 0 ? $vuetify.icons.expand : ''"
            >
                <v-list-tile
                    active-class="blue--text"
                    slot="activator"
                    @click.stop
                    :to="`/list/group/${group.id}`"
                    @mouseenter="hoverId = group.id"
                    @mouseleave="hoverId = ''"
                >
                    <v-list-tile-action>
                        <v-btn
                            flat
                            icon
                            @click.stop.prevent
                            :to="`/edit/group/${group.id}`"
                            v-if="hoverId === group.id"
                        >
                            <v-icon>edit</v-icon>
                        </v-btn>
                        <v-badge
                            :value="$store.getters.getGroupUnread(group.id) > 0"
                            class="small-badge"
                            overlap
                            transition="fade-transition"
                            v-else
                        >
                            <span
                                slot="badge"
                                v-text="unreadFormatter($store.getters.getGroupUnread(group.id))"
                            ></span>
                            <v-progress-circular
                                indeterminate
                                :size="22"
                                :width="2"
                                color="blue"
                                v-if="false"
                            ></v-progress-circular>
                            <v-icon v-text="'folder'" v-else/>
                        </v-badge>
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
        unreadFormatter(count) {
            return count > 99 ? '99+' : count;
        }
    },
    components: {
        Draggable,
        FeedList
    }
};
</script>

<style lang="scss">
.small-badge > .v-badge__badge {
    height: 18px;
    width: 18px;
    font-size: 10px;
    top: -6px;
}
</style>
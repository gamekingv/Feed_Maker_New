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
        <v-list-tile active-class="blue--text" ripple to="/list/group/all">
            <v-list-tile-action>
                <v-badge :value="getAllUnread > 0" class="small-badge" overlap transition="fade-transition">
                    <span slot="badge" v-text="unreadFormatter(getAllUnread)"></span>
                    <v-icon>dashboard</v-icon>
                </v-badge>
            </v-list-tile-action>
            <v-list-tile-content>
                <v-list-tile-title>全部</v-list-tile-title>
            </v-list-tile-content>
            <v-list-tile-action>
                <v-tooltip :open-delay="600" lazy top>
                    <v-btn @click.stop.prevent flat icon slot="activator" to="/add">
                        <v-icon>add</v-icon>
                    </v-btn>
                    <span>添加一个分组、订阅源或自定义源</span>
                </v-tooltip>
            </v-list-tile-action>
        </v-list-tile>
        <draggable :options="{ animation: 100 }" v-model="groups">
            <v-list-group :append-icon="group.feeds.length > 0 ? $vuetify.icons.expand : ''" :key="group.id" :ref="group.id" v-for="group in groups">
                <div slot="activator">
                    <v-hover>
                        <v-list-tile
                            :inactive="!group.active"
                            :to="`/list/group/${group.id}`"
                            @click="e => group.active && e.stopPropagation()"
                            active-class="blue--text"
                            ripple
                            slot-scope="{ hover: isHover }"
                        >
                            <v-list-tile-action>
                                <v-fade-transition :duration="20" mode="out-in">
                                    <v-tooltip :open-delay="600" key="edit" lazy top v-if="isHover">
                                        <v-btn :to="`/edit/group/${group.id}`" @click.stop.prevent flat icon slot="activator">
                                            <v-icon>edit</v-icon>
                                        </v-btn>
                                        <span>编辑</span>
                                    </v-tooltip>
                                    <v-badge
                                        :value="getGroupUnread(group.id) > 0"
                                        class="small-badge"
                                        key="icon"
                                        overlap
                                        transition="fade-transition"
                                        v-else
                                    >
                                        <span slot="badge" v-text="unreadFormatter(getGroupUnread(group.id))"></span>
                                        <v-progress-circular
                                            :size="22"
                                            :width="2"
                                            color="blue"
                                            indeterminate
                                            v-if="$store.getters.getGroupLoading(group.id)"
                                        ></v-progress-circular>
                                        <v-avatar :size="22" tile v-else>
                                            <v-icon v-text="'folder'"/>
                                        </v-avatar>
                                    </v-badge>
                                </v-fade-transition>
                            </v-list-tile-action>
                            <v-list-tile-content>
                                <v-list-tile-title :class="{'grey--text': !group.active}" v-text="group.name"/>
                            </v-list-tile-content>
                        </v-list-tile>
                    </v-hover>
                </div>
                <feed-list :group="group" @groupEmpty="collapseGroup"/>
            </v-list-group>
        </draggable>
    </v-list>
</template>

<script>
import FeedList from './FeedList';
import Draggable from 'vuedraggable';

export default {
    computed: {
        groups: {
            get() {
                return this.$store.state.groups;
            },
            set(groups) {
                this.$store.dispatch('updateGroups', groups);
            }
        },
        getAllUnread() {
            return this.$store.getters.getAllUnread;
        }
    },
    methods: {
        unreadFormatter(count) {
            return count > 99 ? '99+' : count;
        },
        getGroupUnread(id) {
            return this.$store.getters.getGroupUnread(id);
        },
        collapseGroup(id) {
            this.$refs[id][0]._data.isActive = false;
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
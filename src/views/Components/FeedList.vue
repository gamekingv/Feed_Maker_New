<template>
    <v-list dense expand>
        <v-list-tile ripple to="/feed/collection" @click="select('collection')">
            <v-list-tile-action>
                <v-icon>star</v-icon>
            </v-list-tile-action>
            <v-list-tile-title>收藏</v-list-tile-title>
        </v-list-tile>
        <v-list-tile ripple to="/feed/all" @click="select('all')">
            <v-list-tile-action>
                <v-icon>dashboard</v-icon>
            </v-list-tile-action>
            <v-list-tile-title>全部</v-list-tile-title>
        </v-list-tile>
        <v-list-group v-for="(group, i) in groups" :key="i" active-class>
            <v-list-tile slot="activator" ripple @click.stop="select('group', group.id)" :to="`/feed/group${group.id}`">
                <v-list-tile-action>
                    <v-icon v-text="group.isActive ? 'folder_open': 'folder'" />
                </v-list-tile-action>
                <v-list-tile-title v-text="group.name" />
            </v-list-tile>

            <v-list-tile v-for="(feed, i) in group.feeds" :key="i" ripple @click="select('feed', feed.id)" :to="`/feed/feed${feed.id}`">
                <v-list-tile-action>
                    <v-icon v-text="feed.icon" />
                </v-list-tile-action>
                <v-list-tile-title v-text="feed.name" />
            </v-list-tile>
        </v-list-group>
    </v-list>
</template>

<script>
import { mapMutations } from 'vuex';

export default {
    data: () => ({
        options: {
            animation: 100
        }
    }),
    computed: {
        groups() {
            return this.$store.state.groups;
        }
    },
    methods: {
        ...mapMutations(['setActive']),
        select(name, id) {
            switch (name) {
                case 'collection':
                    this.setActive({ type: 'other', id: 'collection' });
                    break;
                case 'all':
                    this.setActive({ type: 'other', id: 'all' });
                    break;
                case 'group':
                    this.setActive({ type: 'group', id });
                    break;
                case 'feed':
                    this.setActive({ type: 'feed', id });
                    break;
            }
        }
    },
    props: {
        changeHandler: {
            type: Function
        }
    },
    beforeRouteUpdate(to, from, next) {
        next();
    }
};
</script>
<style scope>
.list-button-mask {
    position: absolute;
    z-index: 1;
    height: 40px;
}
</style>

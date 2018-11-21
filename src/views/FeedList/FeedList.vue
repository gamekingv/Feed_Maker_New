<template>
    <v-list dense expand>
        <v-list-tile ripple @click="test">
            <v-list-tile-action>
                <v-icon>star</v-icon>
            </v-list-tile-action>
            <v-list-tile-title>收藏</v-list-tile-title>
        </v-list-tile>
        <v-list-tile ripple @click="test">
            <v-list-tile-action>
                <v-icon>dashboard</v-icon>
            </v-list-tile-action>
            <v-list-tile-title>全部</v-list-tile-title>
        </v-list-tile>
        <v-list-group v-for="(group, i) in groups" :key="i" active-class v-model="group.isActive">
            <v-list-tile slot="activator" ripple @click.stop="">
                <v-list-tile-action>
                    <v-icon v-text="group.isActive ? 'folder_open': 'folder'"></v-icon>
                </v-list-tile-action>
                <v-list-tile-title v-text="group.name"></v-list-tile-title>
            </v-list-tile>

            <v-list-tile v-for="(feed, i) in group.feeds" :key="i" ripple @click="test">
                <v-list-tile-action>
                    <v-icon v-text="feed[1]"></v-icon>
                </v-list-tile-action>
                <v-list-tile-title v-text="feed[0]"></v-list-tile-title>
            </v-list-tile>
        </v-list-group>
    </v-list>
</template>

<script>
export default {
    data: () => ({
        isActive: true,
        options: {
            animation: 100
        },
        groups: [{
            name: 'group1', id: 1, isActive: false, feeds: [
                ['Management', 'people_outline'],
                ['Settings', 'settings'],
                ['test', 'settings']
            ]
        }, {
            name: 'group2', id: 2, isActive: false, feeds: [
                ['Management', 'people_outline'],
                ['Settings', 'settings']
            ]
        }, {
            name: 'group3', id: 3, isActive: false, feeds: [
                ['Management', 'people_outline']
            ]
        }, {
            name: 'group4', id: 4, isActive: false, feeds: [
                ['Management', 'people_outline'],
                ['Settings', 'settings'],
                ['test', 'settings']
            ]
        }],
        groupsTemp: []
    }),
    methods: {
        test() {
            console.log(this.groups[0].name);
        },
        test2() {
            this.groupsTemp = Array.from(this.groups);
            console.log(this.groupsTemp);
        },
        feedSelect() {
            console.log(123);
        }
    },
    props: {
        changeHandler: {
            type: Function
        }
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

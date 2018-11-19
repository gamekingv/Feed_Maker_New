<template>
    <v-list class="pt-0" dense expand>
        <v-list-tile ripple @click.stop="">
            <v-list-tile-action>
                <v-icon>folder_special</v-icon>
            </v-list-tile-action>
            <v-list-tile-title>全部</v-list-tile-title>
        </v-list-tile>

        <v-list-group active-class v-model="isActive">
            <v-list-tile slot="activator" ripple @click.stop="">
                <v-list-tile-action>
                    <v-icon v-text="isActive ? 'folder_open': 'folder'"></v-icon>
                </v-list-tile-action>
                <v-list-tile-title>User11111111111111111111111</v-list-tile-title>
            </v-list-tile>

            <v-list-tile v-for="(admin, i) in admins" :key="i" ripple @click.stop="">
                <v-list-tile-action>
                    <v-icon v-text="admin[1]"></v-icon>
                </v-list-tile-action>
                <v-list-tile-title v-text="admin[0]"></v-list-tile-title>
            </v-list-tile>
        </v-list-group>
    </v-list>
</template>

<script>
export default {
    data: () => ({
        admins: [
            ['Management', 'people_outline'],
            ['Settings', 'settings']
        ],
        cruds: [
            ['Create', 'add'],
            ['Read', 'insert_drive_file'],
            ['Update', 'update'],
            ['Delete', 'delete']
        ],
        isActive: true
    }),
    methods: {
        test(e) {
            console.log(this.isActive);
            this.isActive = !this.isActive;
            console.log(this);
            console.log(e);
        },
        feedSelect() {
            console.log(123);
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

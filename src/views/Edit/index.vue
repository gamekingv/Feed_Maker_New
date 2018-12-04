<template>
    <v-container>
        <v-list>
            <v-list-tile v-for="item in list" :key="item.id" avatar dense>
                <v-list-tile-avatar>
                    <v-icon
                        v-text="icon(item.feedId)"
                        v-if="/http(s)?:\/\/([\w-]+\.)+[\w-]+(\/[\w- ./?%&=]*)?/.test(icon(item.feedId))"
                    ></v-icon>
                    <img :src="icon(item.feedId)">
                </v-list-tile-avatar>

                <v-list-tile-content>
                    <v-list-tile-title v-text="item.title"></v-list-tile-title>
                </v-list-tile-content>

                <v-list-tile-avatar>
                    <img :src="icon(feedId)">
                </v-list-tile-avatar>
            </v-list-tile>
        </v-list>
    </v-container>
</template>
<script>
export default {
    data: () => ({
    }),
    computed: {
        list() {
            return this.$store.state.list;
        },
        icon(feedId) {
            let icon = this.$store.getter.getFeed(feedId).icon;
            return /http(s)?:\/\/([\w-]+\.)+[\w-]+(\/[\w- ./?%&=]*)?/.test(icon) ? { type: 'img', icon } : { type: 'icon', icon };
        }
    },
    watch: {
    },
    methods: {
    }
};
</script>

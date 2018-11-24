<template>
    <v-container fluid grid-list-md>
        <v-layout row wrap>
            <draggable class="draggable-item" :list="groups" :options="options">
                <v-flex v-for="card in cards" lg3 :key="card.title">
                    <v-card>
                        <v-img :src="card.src" height="200px">
                            <v-container fill-height fluid pa-2>
                                <v-layout fill-height>
                                    <v-flex lg12 align-end>
                                        <span class="headline white--text" v-text="card.title"></span>
                                    </v-flex>
                                </v-layout>
                            </v-container>
                        </v-img>

                        <v-card-actions>
                            <v-spacer></v-spacer>
                            <v-btn icon>
                                <v-icon>favorite</v-icon>
                            </v-btn>
                            <v-btn icon>
                                <v-icon>bookmark</v-icon>
                            </v-btn>
                            <v-btn icon>
                                <v-icon>share</v-icon>
                            </v-btn>
                        </v-card-actions>
                    </v-card>
                </v-flex>
            </draggable>
        </v-layout>
    </v-container>
</template>
<script>
import Draggable from 'vuedraggable';

export default {
    data: () => ({
        cards: [
            { title: 'Pre-fab homes', src: 'https://cdn.vuetifyjs.com/images/cards/house.jpg', flex: 3 },
            { title: 'Favorite road trips', src: 'https://cdn.vuetifyjs.com/images/cards/road.jpg', flex: 3 },
            { title: 'Best airlines', src: 'https://cdn.vuetifyjs.com/images/cards/plane.jpg', flex: 3 }
        ],
        options: {
            animation: 100
        },
        windowWidth: 0,
    }),
    methods: {
    },
    computed: {
        groups() {
            return this.$store.state.groups;
        }
    },
    components: {
        Draggable
    }
};
</script>
<style lang="scss" scoped>
.draggable-item {
    display: flex;
    flex: 1 1 auto;
    flex-wrap: wrap;
}
</style>

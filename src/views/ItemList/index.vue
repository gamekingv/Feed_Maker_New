<template>
    <v-container fluid>
        <v-slide-y-transition mode="out-in">
            <v-layout column align-center>
                <img src="/public/v.png" alt="Vuetify.js" class="mb-5" />
                <blockquote>
                    &#8220;First, solve the problem. Then, write the code.&#8221;
                    <footer>
                        <small>
                            <em>&mdash;John Johnson {{id}}</em>
                        </small>
                    </footer>
                </blockquote>
            </v-layout>
        </v-slide-y-transition>
    </v-container>
</template>
<script>
export default {
    props: ['id'],
    data: () => ({

    }),
    methods: {
        test() {
            console.log(this);
        }
    }
};
</script>

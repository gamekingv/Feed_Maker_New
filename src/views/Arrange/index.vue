<template>
    <v-card tile>
        <v-card-text>
            <v-btn color="primary" dark @click="dialog2 = !dialog2">Open Dialog 2</v-btn>
            <v-tooltip right>
                <v-btn slot="activator">Tool Tip Activator</v-btn>
                Tool Tip
            </v-tooltip>
            <v-list three-line subheader>
                <v-subheader>User Controls</v-subheader>
                <v-list-tile avatar>
                    <v-list-tile-content>
                        <v-list-tile-title>Content filtering</v-list-tile-title>
                        <v-list-tile-sub-title>Set the content filtering level to restrict apps that can be downloaded</v-list-tile-sub-title>
                    </v-list-tile-content>
                </v-list-tile>
                <v-list-tile avatar>
                    <v-list-tile-content>
                        <v-list-tile-title>Password</v-list-tile-title>
                        <v-list-tile-sub-title>Require password for purchase or use password to restrict purchase</v-list-tile-sub-title>
                    </v-list-tile-content>
                </v-list-tile>
            </v-list>
            <v-divider></v-divider>
            <v-list three-line subheader>
                <v-subheader>General</v-subheader>
                <v-list-tile avatar>
                    <v-list-tile-action>
                        <v-checkbox v-model="notifications"></v-checkbox>
                    </v-list-tile-action>
                    <v-list-tile-content>
                        <v-list-tile-title>Notifications</v-list-tile-title>
                        <v-list-tile-sub-title>Notify me about updates to apps or games that I downloaded</v-list-tile-sub-title>
                    </v-list-tile-content>
                </v-list-tile>
                <v-list-tile avatar>
                    <v-list-tile-action>
                        <v-checkbox v-model="sound"></v-checkbox>
                    </v-list-tile-action>
                    <v-list-tile-content>
                        <v-list-tile-title>Sound</v-list-tile-title>
                        <v-list-tile-sub-title>Auto-update apps at any time. Data charges may apply</v-list-tile-sub-title>
                    </v-list-tile-content>
                </v-list-tile>
                <v-list-tile avatar>
                    <v-list-tile-action>
                        <v-checkbox v-model="widgets"></v-checkbox>
                    </v-list-tile-action>
                    <v-list-tile-content>
                        <v-list-tile-title>Auto-add widgets</v-list-tile-title>
                        <v-list-tile-sub-title>Automatically add home screen widgets</v-list-tile-sub-title>
                    </v-list-tile-content>
                </v-list-tile>
            </v-list>
        </v-card-text>
    </v-card>
</template>
<script>
export default {
    data: () => ({

    })
};
</script>

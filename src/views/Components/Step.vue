<template>
    <v-toolbar dense>
        <v-overflow-btn
            class="pa-0"
            :items="['匹配', '替换', 'JSON', '选择器']"
            placeholder="Select font"
            hide-details
            style="max-width: 140px;"
        ></v-overflow-btn>
        <v-divider vertical></v-divider>
        <v-overflow-btn
            class="pa-0"
            placeholder="Select size"
            hide-details
            append-icon
            attach
            editable
        ></v-overflow-btn>
        <v-overflow-btn
            class="pa-0 ml-2"
            placeholder="Select size"
            hide-details
            append-icon
            prepend-icon="arrow_forward"
            attach
            editable
        ></v-overflow-btn>
        <v-divider class="mr-2" vertical></v-divider>
        <v-btn-toggle class="transparent" multiple>
            <v-btn :value="1" flat>
                <v-icon>format_line_spacing</v-icon>
            </v-btn>
            <v-btn :value="2" flat>
                <v-icon>font_download</v-icon>
            </v-btn>
        </v-btn-toggle>
    </v-toolbar>
</template>
<script>
export default {
    props: ['step'],
};
</script>

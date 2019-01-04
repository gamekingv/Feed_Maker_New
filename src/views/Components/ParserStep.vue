<template>
    <draggable :options="{ animation: 100, handle: '.drag-handler' }" v-model="parserSteps">
        <v-toolbar :key="parserStep.id" class="mb-2" dense v-for="(parserStep, i) in parserSteps">
            <v-toolbar-items>
                <v-subheader class="pl-0" v-text="i + 1"></v-subheader>
            </v-toolbar-items>
            <v-select
                :items="[{text: '匹配', value: 'match'}, {text: '替换', value: 'replace'}, {text: 'JSON', value: 'json'}, {text: '选择器', value: 'selector'}]"
                background-color="transparent"
                flat
                hide-details
                solo
                style="max-width: 110px;"
                v-model="parserStep.method"
            ></v-select>
            <v-divider vertical></v-divider>
            <v-text-field background-color="transparent" flat hide-details placeholder="请输入表达式" solo v-model="parserStep.regexp" validate-on-blur></v-text-field>
            <v-text-field
                background-color="transparent"
                flat
                hide-details
                placeholder="请输入替换表达式"
                prepend-icon="arrow_forward"
                solo
                v-if="parserStep.method === 'replace'"
                v-model="parserStep.replaceExp"
                validate-on-blur
            ></v-text-field>
            <v-divider vertical></v-divider>
            <v-text-field
                background-color="transparent"
                class="input-align-center"
                flat
                hide-details
                mask="##"
                prefix="["
                solo
                style="max-width: 60px;"
                suffix="]"
                v-model="parserStep.subPattern"
            ></v-text-field>
            <v-divider class="mr-2" vertical></v-divider>
            <v-btn-toggle class="transparent" multiple v-model="parserStep.flags">
                <v-tooltip :disabled="parserStep.method !== 'match' && parserStep.method !== 'replace'" :open-delay="1000" lazy top>
                    <v-btn :disabled="parserStep.method === 'json'" flat slot="activator" value="g">
                        <v-icon>format_line_spacing</v-icon>
                    </v-btn>
                    <span>全局匹配</span>
                </v-tooltip>
                <v-tooltip :disabled="parserStep.method !== 'match' && parserStep.method !== 'replace'" :open-delay="1000" lazy top>
                    <v-btn :disabled="parserStep.method !== 'match' && parserStep.method !== 'replace'" flat slot="activator" value="i">
                        <v-icon>font_download</v-icon>
                    </v-btn>
                    <span>区分大小写</span>
                </v-tooltip>
            </v-btn-toggle>
            <v-divider class="ml-2 mr-2" vertical></v-divider>
            <v-tooltip :open-delay="1000" lazy top>
                <v-btn @click="$emit('test', parserSteps.slice(0, i + 1))" icon slot="activator">
                    <v-icon>play_arrow</v-icon>
                </v-btn>
                <span>测试</span>
            </v-tooltip>
            <v-tooltip :open-delay="1000" lazy top>
                <v-btn @click="parserSteps.splice(i, 1)" icon slot="activator">
                    <v-icon>close</v-icon>
                </v-btn>
                <span>删除此步骤</span>
            </v-tooltip>
            <v-divider class="ml-2 mr-2" vertical></v-divider>
            <div class="ml-3 drag-handler">
                <v-icon>swap_vert</v-icon>
            </div>
        </v-toolbar>
    </draggable>
</template>

<script>
import Draggable from 'vuedraggable';
export default {
    props: ['steps'],
    computed: {
        parserSteps: {
            get() {
                return this.steps;
            },
            set(value) {
                this.$emit('modify', value);
            }
        }
    },
    components: {
        Draggable
    }
};
</script>

<style lang="scss" scoped>
.drag-handler {
    cursor: pointer;
}
.input-align-center /deep/ input {
    text-align: center;
}
</style>

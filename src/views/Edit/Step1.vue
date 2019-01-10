<template>
    <v-form lazy-validation ref="form1" v-model="validate">
        <v-layout justify-center>
            <v-flex lg1>
                <v-subheader>类型*</v-subheader>
            </v-flex>
            <v-flex lg4>
                <v-select
                    :disabled="action === 'update'"
                    :items="[{ text: '分组', value: 'group' }, { text: '订阅源', value: 'feed' }, { text: '自定义源', value: 'custom' }]"
                    :rules="[requireRule]"
                    placeholder="请选择类型"
                    required
                    solo
                    v-model="step.type"
                ></v-select>
            </v-flex>
        </v-layout>
        <v-layout class="mb-4" justify-center v-if="action === 'update'">
            <v-flex align-self-center lg1>
                <v-subheader>启用</v-subheader>
            </v-flex>
            <v-flex align-self-center lg4>
                <v-switch class="mt-0 pt-0" color="blue" hide-details v-model="step.active"></v-switch>
            </v-flex>
        </v-layout>
    </v-form>
</template>

<script>
export default {
    props: ['step1', 'validation', 'requireRule', 'action'],
    computed: {
        step: {
            get() {
                return this.step1;
            },
            set(value) {
                this.$emit('modifyStep', value);
            }
        },
        validate: {
            get() {
                return this.validation;
            },
            set(value) {
                this.$emit('modifyValidation', value);
            }
        }
    },
};
</script>
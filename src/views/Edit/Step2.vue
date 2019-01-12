<template>
    <v-form lazy-validation ref="form" v-model="formValidation">
        <v-layout justify-center v-if="type === 'feed' || type === 'custom'">
            <v-flex lg1>
                <v-subheader>分组*</v-subheader>
            </v-flex>
            <v-flex lg4>
                <v-select :items="groups" :rules="[requireRule]" no-data-text="无任何分组" placeholder="请选择所属分组" required solo v-model="step.group"></v-select>
            </v-flex>
        </v-layout>
        <v-layout justify-center>
            <v-flex lg1>
                <v-subheader>名称*</v-subheader>
            </v-flex>
            <v-flex lg4>
                <v-text-field :rules="[requireRule]" clearable placeholder="请输入名称" required solo v-model="step.name"></v-text-field>
            </v-flex>
        </v-layout>
        <v-layout justify-center v-if="type === 'feed' || type === 'custom'">
            <v-flex lg1>
                <v-subheader>主页</v-subheader>
            </v-flex>
            <v-flex lg4>
                <v-text-field clearable placeholder="请输入主页链接" solo v-model="step.home"></v-text-field>
            </v-flex>
        </v-layout>
        <v-layout justify-center v-if="type === 'feed' || type === 'custom'">
            <v-flex lg1>
                <v-subheader>图标</v-subheader>
            </v-flex>
            <v-flex lg4>
                <v-text-field clearable placeholder="可输入图片链接或Material Icons的名称" solo v-model="step.icon"></v-text-field>
            </v-flex>
        </v-layout>
    </v-form>
</template>

<script>
export default {
    props: ['type', 'step', 'validation', 'groups', 'requireRule'],
    computed: {
        formValidation: {
            get() {
                return this.validation;
            },
            set(value) {
                this.$emit('modifyValidation', value);
            }
        }
    },
    methods: {
        validate() {
            return this.$refs.form.validate();
        },
        reset() {
            this.step.name = '';
            this.step.group = '';
            this.step.icon = '';
            this.step.home = '';
            this.$nextTick(() => {
                this.$refs.form.resetValidation();
            });
        }
    }
};
</script>

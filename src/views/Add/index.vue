<template>
    <v-stepper v-model="step" vertical non-linear>
        <v-stepper-step editable step="1" :rules="[() => validates.form1]">选择要添加的类型</v-stepper-step>
        <v-stepper-content step="1">
            <v-form ref="form1" v-model="validates.form1" lazy-validation>
                <v-select v-model="type" :items="types" :rules="[requireRules]" label="类型" required></v-select>
                <v-layout>
                    <v-spacer></v-spacer>
                    <v-btn
                        color="primary"
                        :disabled="!validates.form1"
                        @click="validate('form1', 2)"
                    >下一步</v-btn>
                    <v-btn @click="clear('form1')">重置</v-btn>
                </v-layout>
            </v-form>
        </v-stepper-content>
        <v-stepper-step editable step="2" :rules="[() => validates.form2]">填写基本信息</v-stepper-step>
        <v-stepper-content step="2">
            <v-form ref="form2" v-model="validates.form2" lazy-validation>
                <v-text-field v-model="name" :rules="[requireRules]" label="名称" required></v-text-field>
                <v-layout>
                    <v-btn color="secondary" @click="step = 1">上一步</v-btn>
                    <v-spacer></v-spacer>
                    <v-btn color="primary" :disabled="!complete" @click="submit">完成</v-btn>
                    <v-btn @click="clear('form2')">重置</v-btn>
                </v-layout>
            </v-form>
        </v-stepper-content>
    </v-stepper>
</template>

<script>
export default {
    data: () => ({
        step: 0,
        types: [
            '分组',
            '订阅源',
            '自定义源',
            '自定义按钮'
        ],
        validates: {
            form1: true,
            form2: true
        },
        type: null,
        name: '',
        requireRules: v => !!v || '必填',
    }),
    methods: {
        validate(name, next) {
            if (this.$refs[name].validate())
                this.step = next;
        },
        submit() {
            Object.values(this.$refs).forEach(form => form.validate());
            this.$nextTick(() => {
                if (this.complete) {
                    console.log(1);
                }
            });
        },
        clear(name) {
            this.$refs[name].reset();
        }
    },
    computed: {
        complete() {
            return !Object.values(this.validates).some(validate => validate === false);
        }
    }
};
</script>

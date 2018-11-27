<template>
    <v-stepper v-model="step">
        <v-stepper-header>
            <v-stepper-step :complete="step > 1" step="1">选择要添加的类型</v-stepper-step>
            <v-divider></v-divider>
            <v-stepper-step :complete="step > 2" step="2">Name of step 2</v-stepper-step>
            <v-divider></v-divider>
            <v-stepper-step step="3">Name of step 3</v-stepper-step>
        </v-stepper-header>
        <v-stepper-items>
            <v-stepper-content step="1">
                <v-form ref="form1" v-model="form1">
                    <v-select v-model="select" :items="types" :rules="[requireRules]" label="类型" required></v-select>
                    <v-layout>
                        <v-spacer></v-spacer>
                        <v-btn color="primary" :disabled="!form1" @click="step = 2">下一步</v-btn>
                        <v-btn @click="clear('form1')">重置</v-btn>
                    </v-layout>
                </v-form>
            </v-stepper-content>

            <v-stepper-content step="2">
                <v-form ref="form2" v-model="form2">
                    <v-text-field v-model="name" :rules="[requireRules, characterRules]" :counter="10" label="Name" required></v-text-field>
                    <v-text-field v-model="email" :rules="[emailRules, emailRules]" label="E-mail" required></v-text-field>
                    <!-- <v-select v-model="select" :items="items" :rules="[v => !!v || 'Item is required']" label="Item" required></v-select> -->
                    <v-checkbox v-model="checkbox" :rules="[v => !!v || 'You must agree to continue!']" label="Do you agree?" required></v-checkbox>
                    <v-layout>
                        <v-btn color="secondary" @click="step = 1">上一步</v-btn>
                        <v-spacer></v-spacer>
                        <v-btn color="primary" :disabled="!form2" @click="step = 3">下一步</v-btn>
                        <v-btn @click="clear('form2')">重置</v-btn>
                    </v-layout>
                </v-form>
            </v-stepper-content>

            <v-stepper-content step="3">
                <v-card class="mb-5" color="grey lighten-1" height="200px"></v-card>
                <v-layout>
                    <v-btn color="secondary" @click="step = 2">上一步</v-btn>
                    <v-spacer></v-spacer>
                    <v-btn color="primary" :disabled="!form2" @click="submit">完成</v-btn>
                    <v-btn @click="clear('form2')">重置</v-btn>
                </v-layout>
            </v-stepper-content>
        </v-stepper-items>
    </v-stepper>
</template>

<script>
export default {
    data: () => ({

        step: 0,
        form1: true,
        form2: true,
        requireRules: v => !!v || '必填',
        name: '',
        characterRules: v => (v && v.length <= 10) || 'Name must be less than 10 characters',
        email: '',
        emailRules: v => /.+@.+/.test(v) || 'E-mail must be valid',
        select: null,
        types: [
            '分组',
            '订阅源',
            '自定义源',
            '自定义按钮'
        ],
        checkbox: false
    }),

    methods: {
        submit() {
            if (this.$refs.form.validate()) {
                // Native form submission is not yet supported
                //   axios.post('/api/submit', {
                //     name: this.name,
                //     email: this.email,
                //     select: this.select,
                //     checkbox: this.checkbox
                //   })
            }
        },
        clear(name) {
            this.$refs[name].reset();
        }
    }
};
</script>

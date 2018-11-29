<template>
    <v-stepper v-model="step" vertical non-linear>
        <v-stepper-step editable step="1" :rules="[() => validates.form1]">选择类型</v-stepper-step>
        <v-stepper-content step="1">
            <v-form ref="form1" v-model="validates.form1" lazy-validation>
                <v-layout justify-center>
                    <v-flex lg1>
                        <v-subheader>类型</v-subheader>
                    </v-flex>
                    <v-flex lg4>
                        <v-select
                            v-model="type"
                            :items="types"
                            :rules="[requireRules]"
                            placeholder="请选择类型"
                            solo
                            required
                        ></v-select>
                    </v-flex>
                </v-layout>
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
        <v-stepper-step editable step="2" :rules="[() => validates.form2]">基本信息</v-stepper-step>
        <v-stepper-content step="2">
            <v-form ref="form2" v-model="validates.form2" lazy-validation>
                <v-layout justify-center v-if="type === 'feed' || type === 'custom'">
                    <v-flex lg1>
                        <v-subheader>分组</v-subheader>
                    </v-flex>
                    <v-flex lg4>
                        <v-select
                            v-model="group"
                            :items="groups"
                            :rules="[requireRules]"
                            placeholder="请选择所属分组"
                            solo
                            required
                        ></v-select>
                    </v-flex>
                </v-layout>
                <v-layout justify-center>
                    <v-flex lg1>
                        <v-subheader>名称</v-subheader>
                    </v-flex>
                    <v-flex lg4>
                        <v-text-field
                            v-model="name"
                            :rules="[requireRules]"
                            placeholder="请输入名称"
                            solo
                            required
                        ></v-text-field>
                    </v-flex>
                </v-layout>
                <v-layout justify-center v-if="type === 'feed' || type === 'custom'">
                    <v-flex lg1>
                        <v-subheader>主页</v-subheader>
                    </v-flex>
                    <v-flex lg4>
                        <v-text-field v-model="home" placeholder="请输入主页链接" solo></v-text-field>
                    </v-flex>
                </v-layout>
                <v-layout>
                    <v-btn color="secondary" @click="step = 1">上一步</v-btn>
                    <v-spacer></v-spacer>
                    <v-btn color="primary" :disabled="!complete" @click="submit">完成</v-btn>
                    <v-btn @click="clear('form2')">重置</v-btn>
                </v-layout>
            </v-form>
        </v-stepper-content>
        <v-stepper-step
            editable
            step="3"
            :rules="[() => validates.form2]"
            v-if="type === 'feed' || type === 'custom'"
        >源信息</v-stepper-step>
        <v-stepper-content step="3" v-if="type === 'feed' || type === 'custom'">
            <v-form ref="form3" v-model="validates.form2" lazy-validation>
                <v-layout justify-center>
                    <v-flex lg1>
                        <v-subheader>链接</v-subheader>
                    </v-flex>
                    <v-flex lg11>
                        <v-text-field
                            v-model="link"
                            :rules="[requireRules]"
                            placeholder="请输入链接"
                            solo
                            required
                        ></v-text-field>
                    </v-flex>
                </v-layout>
                <v-layout>
                    <v-flex lg1>
                        <v-subheader>方法</v-subheader>
                    </v-flex>
                    <v-flex lg4>
                        <v-select
                            v-model="fetchType"
                            class="pa-0"
                            label="方法"
                            :items="['GET', 'POST']"
                            :rules="[requireRules]"
                            solo
                            required
                        ></v-select>
                    </v-flex>
                    <v-spacer></v-spacer>
                    <v-btn @click>测试</v-btn>
                </v-layout>

                <v-layout class="mb-4">
                    <v-flex lg1>
                        <v-subheader>消息头</v-subheader>
                    </v-flex>
                    <v-flex align-self-center>
                        <v-chip
                            color="primary"
                            text-color="white"
                            v-model="headers"
                            v-for="header in headers"
                            :key="header.key"
                            small
                            selected
                            close
                        >{{`${header.key}: ${header.value}`}}</v-chip>
                        <v-btn icon @click>
                            <v-icon>add</v-icon>
                        </v-btn>
                    </v-flex>
                </v-layout>
                <v-layout>
                    <v-flex lg1>
                        <v-subheader>测试结果</v-subheader>
                    </v-flex>
                    <v-flex lg11>
                        <v-textarea
                            solo
                            value="The Woodman set to work at once, and so sharp was his axe that the tree was soon chopped nearly through."
                            readonly
                            hide-details
                            loading
                        ></v-textarea>
                    </v-flex>
                </v-layout>
                <v-layout>
                    <v-btn color="secondary" @click="step = 2">上一步</v-btn>
                    <v-spacer></v-spacer>
                    <v-btn color="primary" :disabled="!complete" @click="submit">完成</v-btn>
                    <v-btn @click="clear('form3')">重置</v-btn>
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
            { text: '分组', value: 'group' },
            { text: '订阅源', value: 'feed' },
            { text: '自定义源', value: 'custom' },
            { text: '自定义按钮', value: 'button' }
        ],
        validates: {
            form1: true,
            form2: true
        },
        type: '',
        name: '',
        group: '',
        icon: '',
        home: '',
        fetchType: 'GET',
        link: '',
        headers: [{ key: 'Referer', value: 'http' }],
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
                    let id = Date.now().toString();
                    this.$store.dispatch('addGroup', {
                        name: this.name,
                        id: id
                    }).then(() => this.$router.push({ path: `/list/group/${id}` }));
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
        },
        groups() {
            return this.$store.state.groups.map(({ id, name }) => ({ text: name, value: id }));
        }
    }
};
</script>

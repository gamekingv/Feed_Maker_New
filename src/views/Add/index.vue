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
                            clearable
                            required
                        ></v-text-field>
                    </v-flex>
                </v-layout>
                <v-layout justify-center v-if="type === 'feed' || type === 'custom'">
                    <v-flex lg1>
                        <v-subheader>主页</v-subheader>
                    </v-flex>
                    <v-flex lg4>
                        <v-text-field v-model="home" placeholder="请输入主页链接" solo clearable></v-text-field>
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
            <v-form ref="form3" v-model="validates.form3" lazy-validation>
                <v-layout justify-center>
                    <v-flex lg1>
                        <v-subheader>链接</v-subheader>
                    </v-flex>
                    <v-flex lg11>
                        <v-text-field
                            v-model="url"
                            :rules="[requireRules, urlRules]"
                            placeholder="请输入链接"
                            clearable
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
                            v-model="method"
                            class="pa-0"
                            label="方法"
                            :items="['GET', 'POST']"
                            :rules="[requireRules]"
                            solo
                            required
                        ></v-select>
                    </v-flex>
                    <v-spacer></v-spacer>
                    <v-btn @click="test">测试</v-btn>
                </v-layout>

                <v-layout class="mb-4">
                    <v-flex lg1>
                        <v-subheader>消息头</v-subheader>
                    </v-flex>
                    <v-flex lg11 align-self-center>
                        <v-chip
                            color="primary"
                            text-color="white"
                            v-for="(value, key) in headers"
                            :key="key"
                            small
                            selected
                            close
                            @input="Vue.delete(headers, key)"
                        >{{`${key}: ${value}`}}</v-chip>
                        <v-dialog v-model="addHeaderDialog" width="500">
                            <v-btn icon slot="activator">
                                <v-icon>add</v-icon>
                            </v-btn>
                            <v-card class="grey darken-4">
                                <v-card-title class="headline">添加一个消息头</v-card-title>
                                <v-card-text class="pb-0">
                                    <v-form ref="header" lazy-validation>
                                        <v-layout class="ma-3">
                                            <v-text-field
                                                v-model="headerKey"
                                                placeholder="键"
                                                solo
                                                :rules="[requireRules, v => !headers.hasOwnProperty(v) || '已添加该属性']"
                                                clearable
                                            ></v-text-field>
                                            <v-subheader>:</v-subheader>
                                            <v-text-field
                                                v-model="headerValue"
                                                placeholder="值"
                                                solo
                                                :rules="[requireRules]"
                                                clearable
                                            ></v-text-field>
                                        </v-layout>
                                    </v-form>
                                </v-card-text>
                                <v-card-actions>
                                    <v-spacer></v-spacer>
                                    <v-btn color="primary" @click="addHeader">确定</v-btn>
                                    <v-btn color="secondary" @click="close">取消</v-btn>
                                </v-card-actions>
                            </v-card>
                        </v-dialog>
                    </v-flex>
                </v-layout>
                <v-slide-y-transition>
                    <v-layout class="mb-3" v-if="method === 'POST'">
                        <v-flex lg1>
                            <v-subheader>主体</v-subheader>
                        </v-flex>
                        <v-flex lg11>
                            <v-textarea v-model="body" solo hide-details></v-textarea>
                        </v-flex>
                    </v-layout>
                </v-slide-y-transition>
                <v-layout class="mb-3">
                    <v-flex lg1>
                        <v-subheader>测试结果</v-subheader>
                    </v-flex>
                    <v-flex lg11>
                        <v-textarea
                            solo
                            v-model="result"
                            rows="10"
                            readonly
                            hide-details
                            :loading="fetching"
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
import axios from 'axios';

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
            form2: true,
            form3: true
        },
        type: '',
        name: '',
        group: '',
        icon: '',
        home: '',
        method: 'GET',
        url: '',
        addHeaderDialog: false,
        headerKey: '',
        headerValue: '',
        headers: {},
        body: '',
        fetching: false,
        result: '',
        requireRules: v => !!v || '必填',
        urlRules: v => /http(s)?:\/\/([\w-]+\.)+[\w-]+(\/[\w- ./?%&=]*)?/.test(v) || '请输入合法的链接'
    }),
    methods: {
        repeatRules(v) { return !this.headers.hasOwnProperty(v) || '已添加该属性'; },
        addHeader() {
            if (this.$refs.header.validate()) {
                this.$set(this.headers, this.headerKey, this.headerValue);
                this.close();
            }
        },
        close() {
            this.addHeaderDialog = false;
            this.$refs.header.reset();
        },
        validate(name, next) {
            if (this.$refs[name].validate())
                this.step = next;
        },
        async test() {
            browser.webRequest.onBeforeSendHeaders.addListener(this.modifyHeader, { urls: [this.url] }, ['blocking', 'requestHeaders']);
            if (this.method === 'GET') {
                let response = await axios.get(this.url);
                this.result = response.data;
            }
        },
        modifyHeader(details) {
            browser.webRequest.onBeforeSendHeaders.removeListener(this.modifyHeader);
            for (let name in this.headers) {
                let gotName = false;
                for (let requestHeader of details.requestHeaders) {
                    gotName = requestHeader.name.toLowerCase() === name;
                    if (gotName) {
                        requestHeader.value = this.headers[name];
                    }
                }
                if (!gotName) {
                    details.requestHeaders.push({ name: name, value: this.headers[name] });
                }
            }
            return { requestHeaders: details.requestHeaders };
        },
        submit() {
            Object.keys(this.validates).forEach(name => this.$refs[name].validate());
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

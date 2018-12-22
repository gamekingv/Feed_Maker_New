<template>
    <v-container class="pl-5 pr-5" fill-height fluid>
        <v-fade-transition mode="out-in" :duration="40">
            <v-flex fill-height v-if="loading === 0" key="steps">
                <v-stepper v-model="step" vertical non-linear>
                    <v-stepper-step editable step="1" :rules="[() => validates.form1]">类型</v-stepper-step>
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
                                        :disabled="action === 'update'"
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
                                        no-data-text="无任何分组"
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
                                    <v-text-field
                                        v-model="home"
                                        placeholder="请输入主页链接"
                                        solo
                                        clearable
                                    ></v-text-field>
                                </v-flex>
                            </v-layout>
                            <v-layout justify-center v-if="type === 'feed' || type === 'custom'">
                                <v-flex lg1>
                                    <v-subheader>图标</v-subheader>
                                </v-flex>
                                <v-flex lg4>
                                    <v-text-field
                                        v-model="icon"
                                        placeholder="可输入图片链接或Material Icons的名称"
                                        solo
                                        clearable
                                    ></v-text-field>
                                </v-flex>
                            </v-layout>
                            <v-layout>
                                <v-btn color="secondary" @click="step = 1">上一步</v-btn>
                                <v-spacer></v-spacer>
                                <v-btn
                                    color="primary"
                                    :disabled="!complete"
                                    @click="type === 'group' ? submit() : validate('form2', 3)"
                                >{{type === 'group' ? '完成' : '下一步'}}</v-btn>
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
                                <v-flex lg3>
                                    <v-select
                                        v-model="method"
                                        class="pa-0"
                                        label="方法"
                                        :items="[{text: 'GET', value: 'get'}, {text: 'POST', value: 'post'}]"
                                        :rules="[requireRules]"
                                        solo
                                        required
                                    ></v-select>
                                </v-flex>
                                <v-spacer></v-spacer>
                                <v-flex lg1>
                                    <v-subheader>超时（秒）</v-subheader>
                                </v-flex>
                                <v-flex lg2>
                                    <v-slider
                                        v-model="timeout"
                                        thumb-label="always"
                                        min="1"
                                        max="60"
                                        always-dirty
                                    ></v-slider>
                                </v-flex>
                                <v-spacer></v-spacer>
                                <v-btn @click="test" :disabled="fetching">测试</v-btn>
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
                                        @input="$delete(headers, key)"
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
                            <transition-group name="forms">
                                <v-layout class="mb-3" v-show="method === 'post'" key="body">
                                    <v-flex lg1>
                                        <v-subheader>主体</v-subheader>
                                    </v-flex>
                                    <v-flex lg11>
                                        <v-textarea v-model="body" solo hide-details></v-textarea>
                                    </v-flex>
                                </v-layout>
                                <v-layout class="mb-3" key="result">
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
                                <v-layout key="action">
                                    <v-btn color="secondary" @click="step = 2">上一步</v-btn>
                                    <v-spacer></v-spacer>
                                    <v-btn color="primary" :disabled="!complete" @click="submit">完成</v-btn>
                                    <v-btn @click="clear('form3')">重置</v-btn>
                                </v-layout>
                            </transition-group>
                        </v-form>
                    </v-stepper-content>
                </v-stepper>
            </v-flex>
            <v-layout fill-height justify-center align-center v-else key="loading">
                <v-card color="primary" width="300">
                    <v-card-text>正在加载数据
                        <v-progress-linear indeterminate color="white" class="mb-0"></v-progress-linear>
                    </v-card-text>
                </v-card>
            </v-layout>
        </v-fade-transition>
    </v-container>
</template>

<script>
import axios from 'axios';

export default {
    props: ['editType', 'editId'],
    data: () => ({
        loading: 1,
        step: 1,
        types: [
            { text: '分组', value: 'group' },
            { text: '订阅源', value: 'feed' },
            { text: '自定义源', value: 'custom' }
        ],
        validates: {
            form1: true,
            form2: true,
            form3: true
        },
        id: '',
        type: 'group',
        name: '',
        group: '',
        icon: '',
        home: '',
        url: '',
        method: 'get',
        timeout: 30,
        headers: {},
        body: '',
        addHeaderDialog: false,
        headerKey: '',
        headerValue: '',
        fetching: false,
        result: '',
        requireRules: v => !!v || '必填',
        urlRules: v => /http(s)?:\/\/([\w-]+\.)+[\w-]+(\/[\w- ./?%&=]*)?/.test(v) || '请输入合法的链接'
    }),
    methods: {
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
            this.fetching = true;

            function modifyHeader(details) {
                browser.webRequest.onBeforeSendHeaders.removeListener(modifyHeader);
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
            }
            browser.webRequest.onBeforeSendHeaders.addListener(modifyHeader.bind(this), { urls: [this.url] }, ['blocking', 'requestHeaders']);

            let config = {
                method: this.method,
                url: this.url,
                timeout: this.timeout * 1000
            };
            if (this.method === 'post' && this.body) {
                config.data = this.body;
            }
            try {
                let response = await axios(config);
                this.result = response.data;
            }
            catch (e) {
                this.result = e;
            }
            this.fetching = false;
        },
        submit() {
            Object.keys(this.validates).forEach(name => this.$refs[name] && this.$refs[name].validate());
            this.$nextTick(() => {
                if (this.complete) {
                    if (this.action === 'add') this.id = Date.now().toString();
                    switch (this.type) {
                        case 'group': {
                            this.$store.dispatch(`${this.action}Group`, {
                                id: this.id,
                                name: this.name
                            }).then(() => this.$router.push({ path: `/list/group/${this.id}` }));
                            break;
                        }
                        case 'feed': {
                            this.$store.dispatch(`${this.action}Feed`, {
                                id: this.id,
                                custom: false,
                                name: this.name,
                                groupId: this.group,
                                home: this.home,
                                icon: this.icon,
                                url: this.url,
                                method: this.method,
                                timeout: this.timeout,
                                headers: this.headers,
                                body: this.body
                            }).then(() => this.$router.push({ path: `/list/feed/${this.id}` }));
                            break;
                        }
                        case 'custom':
                            break;
                    }
                }
            });
        },
        clear(name) {
            this.$refs[name].reset();
            this.$nextTick(() => {
                if (name === 'form1') {
                    this.type = 'group';
                }
                if (name === 'form3') {
                    this.method = 'GET';
                    this.timeout = 30;
                }
            });
        },
        clearAll() {
            this.type = 'group';
            this.id = '';
            this.name = '';
            this.group = '';
            this.icon = '';
            this.home = '';
            this.url = '';
            this.method = 'get';
            this.timeout = 30;
            this.headers = {};
            this.body = '';
        },
        initialize() {
            if (this.action === 'update') {
                this.type = this.editType;
                if (this.editType === 'group') {
                    ({ id: this.id, name: this.name } = this.$store.getters.getGroup(this.editId));
                }
                else if (this.editType === 'feed') {
                    ({
                        id: this.id,
                        name: this.name,
                        groupId: this.group,
                        home: this.home,
                        icon: this.icon,
                        url: this.url,
                        method: this.method,
                        timeout: this.timeout,
                        headers: this.headers,
                        body: this.body
                    } = this.$store.getters.getFeed(this.editId));
                }
            }
            else {
                this.clearAll();
            }
        }
    },
    computed: {
        complete() {
            return !Object.values(this.validates).some(validate => validate === false);
        },
        groups() {
            return this.$store.state.groups.map(({ id, name }) => ({ text: name, value: id }));
        },
        action() {
            return this.$store.state.active.type.replace('edit', 'update');
        }
    },
    mounted() {
        this.initialize();
        this.loading--;
    },
    watch: {
        '$route'() {
            this.loading++;
            this.step = 1;
            this.$nextTick(() => {
                this.initialize();
                this.loading--;
            });
        }
    }
};
</script>
<style lang="scss" scoped>
.forms {
    &-move {
        transition: all 0.2s;
    }
    &-enter {
        opacity: 0;
        transform: translateX(-100px) !important;
    }
    &-leave-to {
        opacity: 0;
        transform: translateX(100px) !important;
    }
    &-leave-active {
        position: absolute;
        transition: all 0.2s;
        width: calc(100% - 83px);
    }
}
</style>

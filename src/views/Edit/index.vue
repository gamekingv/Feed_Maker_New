<template>
    <v-container class="pl-5 pr-5" fill-height fluid>
        <v-fade-transition :duration="40" mode="out-in">
            <v-flex fill-height key="steps" v-if="loading === 0">
                <v-stepper non-linear v-model="step" vertical>
                    <v-stepper-step :rules="[() => validates.form1]" editable step="1">基本信息</v-stepper-step>
                    <v-stepper-content step="1">
                        <v-form lazy-validation ref="form1" v-model="validates.form1">
                            <v-layout justify-center>
                                <v-flex lg1>
                                    <v-subheader>类型</v-subheader>
                                </v-flex>
                                <v-flex lg4>
                                    <v-select
                                        :disabled="action === 'update'"
                                        :items="[{ text: '分组', value: 'group' }, { text: '订阅源', value: 'feed' }, { text: '自定义源', value: 'custom' }]"
                                        :rules="[requireRules]"
                                        placeholder="请选择类型"
                                        required
                                        solo
                                        v-model="type"
                                    ></v-select>
                                </v-flex>
                            </v-layout>
                            <v-layout class="mb-4" justify-center v-if="action === 'update'">
                                <v-flex align-self-center lg1>
                                    <v-subheader>启用</v-subheader>
                                </v-flex>
                                <v-flex align-self-center lg4>
                                    <v-switch class="mt-0 pt-0" color="blue" hide-details v-model="active"></v-switch>
                                </v-flex>
                            </v-layout>
                            <v-layout>
                                <v-btn color="secondary" v-if="action === 'update' && type !== 'group'">导出</v-btn>
                                <v-btn color="error" v-if="action === 'update'">删除</v-btn>
                                <v-spacer></v-spacer>
                                <v-btn :disabled="!validates.form1" @click="validate('form1', 2)" color="primary">下一步</v-btn>
                                <v-btn :disabled="!complete" @click="submit" color="primary">完成</v-btn>
                                <v-btn @click="clear('form1')">重置</v-btn>
                            </v-layout>
                        </v-form>
                    </v-stepper-content>
                    <v-stepper-step :rules="[() => validates.form2]" editable step="2">详细信息</v-stepper-step>
                    <v-stepper-content step="2">
                        <v-form lazy-validation ref="form2" v-model="validates.form2">
                            <v-layout justify-center v-if="type === 'feed' || type === 'custom'">
                                <v-flex lg1>
                                    <v-subheader>分组</v-subheader>
                                </v-flex>
                                <v-flex lg4>
                                    <v-select
                                        :items="groups"
                                        :rules="[requireRules]"
                                        no-data-text="无任何分组"
                                        placeholder="请选择所属分组"
                                        required
                                        solo
                                        v-model="group"
                                    ></v-select>
                                </v-flex>
                            </v-layout>
                            <v-layout justify-center>
                                <v-flex lg1>
                                    <v-subheader>名称</v-subheader>
                                </v-flex>
                                <v-flex lg4>
                                    <v-text-field :rules="[requireRules]" clearable placeholder="请输入名称" required solo v-model="name"></v-text-field>
                                </v-flex>
                            </v-layout>
                            <v-layout justify-center v-if="type === 'feed' || type === 'custom'">
                                <v-flex lg1>
                                    <v-subheader>主页</v-subheader>
                                </v-flex>
                                <v-flex lg4>
                                    <v-text-field clearable placeholder="请输入主页链接" solo v-model="home"></v-text-field>
                                </v-flex>
                            </v-layout>
                            <v-layout justify-center v-if="type === 'feed' || type === 'custom'">
                                <v-flex lg1>
                                    <v-subheader>图标</v-subheader>
                                </v-flex>
                                <v-flex lg4>
                                    <v-text-field clearable placeholder="可输入图片链接或Material Icons的名称" solo v-model="icon"></v-text-field>
                                </v-flex>
                            </v-layout>
                            <v-layout>
                                <v-btn @click="step--" color="secondary">上一步</v-btn>
                                <v-spacer></v-spacer>
                                <v-btn
                                    :disabled="!validates.form2"
                                    @click="validate('form2', 3)"
                                    color="primary"
                                    v-if="type === 'feed' || type === 'custom'"
                                >下一步</v-btn>
                                <v-btn :disabled="!complete" @click="submit" color="primary">完成</v-btn>
                                <v-btn @click="clear('form2')">重置</v-btn>
                            </v-layout>
                        </v-form>
                    </v-stepper-content>
                    <v-stepper-step :rules="[() => validates.form3]" editable step="3" v-if="type === 'feed' || type === 'custom'">源信息</v-stepper-step>
                    <v-stepper-content step="3" v-if="type === 'feed' || type === 'custom'">
                        <v-form lazy-validation ref="form3" v-model="validates.form3">
                            <v-layout justify-center>
                                <v-flex lg1>
                                    <v-subheader>链接</v-subheader>
                                </v-flex>
                                <v-flex lg11>
                                    <v-text-field :rules="[requireRules, urlRules]" clearable placeholder="请输入链接" required solo v-model="url"></v-text-field>
                                </v-flex>
                            </v-layout>
                            <v-layout>
                                <v-flex lg1>
                                    <v-subheader>方法</v-subheader>
                                </v-flex>
                                <v-flex lg3>
                                    <v-select
                                        :items="[{text: 'GET', value: 'get'}, {text: 'POST', value: 'post'}]"
                                        :rules="[requireRules]"
                                        class="pa-0"
                                        label="方法"
                                        required
                                        solo
                                        v-model="method"
                                    ></v-select>
                                </v-flex>
                                <v-spacer></v-spacer>
                                <v-flex lg1>
                                    <v-subheader>超时（秒）</v-subheader>
                                </v-flex>
                                <v-flex lg2>
                                    <v-slider always-dirty max="60" min="1" thumb-label="always" v-model="timeout"></v-slider>
                                </v-flex>
                                <v-spacer></v-spacer>
                                <v-btn :disabled="fetching" @click="test">测试</v-btn>
                            </v-layout>
                            <v-layout class="mb-4">
                                <v-flex lg1>
                                    <v-subheader>消息头</v-subheader>
                                </v-flex>
                                <v-flex align-self-center lg11>
                                    <v-chip
                                        :key="key"
                                        @input="$delete(headers, key)"
                                        close
                                        color="primary"
                                        selected
                                        small
                                        text-color="white"
                                        v-for="(value, key) in headers"
                                    >{{`${key}: ${value}`}}</v-chip>
                                    <v-dialog v-model="addHeaderDialog" width="500">
                                        <v-btn icon slot="activator">
                                            <v-icon>add</v-icon>
                                        </v-btn>
                                        <v-card class="grey darken-4">
                                            <v-card-title class="headline">添加一个消息头</v-card-title>
                                            <v-card-text class="pb-0">
                                                <v-form lazy-validation ref="header">
                                                    <v-layout class="ma-3">
                                                        <v-text-field
                                                            :rules="[requireRules, v => !headers.hasOwnProperty(v) || '已添加该属性']"
                                                            clearable
                                                            placeholder="键"
                                                            solo
                                                            v-model="headerKey"
                                                        ></v-text-field>
                                                        <v-subheader>:</v-subheader>
                                                        <v-text-field :rules="[requireRules]" clearable placeholder="值" solo v-model="headerValue"></v-text-field>
                                                    </v-layout>
                                                </v-form>
                                            </v-card-text>
                                            <v-card-actions>
                                                <v-spacer></v-spacer>
                                                <v-btn @click="addHeader" color="primary">确定</v-btn>
                                                <v-btn @click="close" color="secondary">取消</v-btn>
                                            </v-card-actions>
                                        </v-card>
                                    </v-dialog>
                                </v-flex>
                            </v-layout>
                            <transition-group name="forms">
                                <v-layout class="mb-3" key="body" v-show="method === 'post'">
                                    <v-flex lg1>
                                        <v-subheader>主体</v-subheader>
                                    </v-flex>
                                    <v-flex lg11>
                                        <v-textarea hide-details solo v-model="body"></v-textarea>
                                    </v-flex>
                                </v-layout>
                                <v-layout class="mb-3" key="result">
                                    <v-flex lg1>
                                        <v-subheader>测试结果</v-subheader>
                                    </v-flex>
                                    <v-flex lg11>
                                        <v-textarea :loading="fetching" hide-details readonly rows="10" solo v-model="result"></v-textarea>
                                    </v-flex>
                                </v-layout>
                            </transition-group>
                            <v-layout>
                                <v-btn @click="step--" color="secondary">上一步</v-btn>
                                <v-spacer></v-spacer>
                                <v-btn :disabled="!validates.form3" @click="validate('form3', 4)" color="primary" v-if="type === 'custom'">下一步</v-btn>
                                <v-btn :disabled="!complete" @click="submit" color="primary">完成</v-btn>
                                <v-btn @click="clear('form3')">重置</v-btn>
                            </v-layout>
                        </v-form>
                    </v-stepper-content>
                    <template v-for="(resultGroup, index) in resultGroups">
                        <v-stepper-step
                            :key="`step${index + 4}`"
                            :rules="[() => validates.form3]"
                            :step="index + 4"
                            editable
                            v-if="type === 'custom'"
                        >{{`结果组 [${index + 1}]`}}</v-stepper-step>
                        <v-stepper-content :key="`content${index + 4}`" :step="index + 4" v-if="type === 'custom'">
                            <v-layout class="mb-4 mt-4" column>
                                <v-flex :key="type" v-for="(parsers, type, count) in resultGroup">
                                    <v-card :key="i" color="#303030" disabled flat hide-actions v-for="(parser, i) in parsers">
                                        <v-card-title class="pb-0">
                                            <v-layout>
                                                <v-flex lg1>
                                                    <v-subheader v-text="`${resultGroupName[type]} (${i + 1})`"></v-subheader>
                                                </v-flex>
                                                <v-flex lg3>
                                                    <v-select
                                                        :items="parseSource[index].filter(({value}) => value.indexOf(`${type + (i + 1)}Step`) === -1)"
                                                        clearable
                                                        label="来源"
                                                        solo
                                                        v-model="parser.source"
                                                    ></v-select>
                                                </v-flex>
                                                <v-spacer></v-spacer>
                                                <v-btn
                                                    @click="parser.parserSteps.push({id: Date.now().toString(), method: 'match', regexp: '', flags: [], replaceExp: '', subPattern: ''})"
                                                    icon
                                                >
                                                    <v-icon>add</v-icon>
                                                </v-btn>
                                                <v-btn @click="parsers.push({ source: '', parserSteps: [] })" icon>
                                                    <v-icon>playlist_add</v-icon>
                                                </v-btn>
                                                <v-btn @click="parsers.splice(i, 1)" icon v-if="parsers.length > 1">
                                                    <v-icon>close</v-icon>
                                                </v-btn>
                                            </v-layout>
                                        </v-card-title>
                                        <v-card-text class="pt-0">
                                            <draggable :options="{ animation: 100, handle: '.drag-handler' }" v-model="parser.parserSteps">
                                                <v-toolbar :key="parserStep.id" class="mb-2" dense v-for="(parserStep, i) in parser.parserSteps">
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
                                                    <v-text-field background-color="transparent" flat hide-details placeholder="请输入表达式" solo></v-text-field>
                                                    <v-text-field
                                                        background-color="transparent"
                                                        flat
                                                        hide-details
                                                        placeholder="请输入替换表达式"
                                                        prepend-icon="arrow_forward"
                                                        solo
                                                        v-if="parserStep.method === 'replace'"
                                                        v-model="parserStep.replaceExp"
                                                    ></v-text-field>
                                                    <v-divider class="mr-2" vertical></v-divider>
                                                    <v-btn-toggle class="transparent" multiple v-model="parserStep.flags">
                                                        <v-btn flat value="global">
                                                            <v-icon>format_line_spacing</v-icon>
                                                        </v-btn>
                                                        <v-btn flat value="case">
                                                            <v-icon>font_download</v-icon>
                                                        </v-btn>
                                                    </v-btn-toggle>
                                                    <v-divider class="ml-2 mr-2" vertical></v-divider>
                                                    <v-btn icon>
                                                        <v-icon>play_arrow</v-icon>
                                                    </v-btn>
                                                    <v-btn @click="parser.parserSteps.splice(i, 1)" icon>
                                                        <v-icon>close</v-icon>
                                                    </v-btn>
                                                    <v-divider class="ml-2 mr-2" vertical></v-divider>
                                                    <div class="ml-3 drag-handler">
                                                        <v-icon>swap_vert</v-icon>
                                                    </div>
                                                </v-toolbar>
                                            </draggable>
                                        </v-card-text>
                                    </v-card>
                                    <v-divider class="mt-3" v-if="count < 5"></v-divider>
                                </v-flex>
                            </v-layout>
                            <v-layout>
                                <v-btn @click="step--" color="secondary">上一步</v-btn>
                                <v-spacer></v-spacer>
                                <v-btn
                                    :disabled="!validates.form3"
                                    @click="validate('form3', 4)"
                                    color="primary"
                                    v-if="index < resultGroups.length"
                                >下一步</v-btn>
                                <v-btn :disabled="!complete" @click="submit" color="primary">完成</v-btn>
                                <v-btn @click="clear('form3')">重置</v-btn>
                            </v-layout>
                        </v-stepper-content>
                    </template>
                </v-stepper>
            </v-flex>
            <v-layout align-center fill-height justify-center key="loading" v-else>
                <v-card color="primary" width="300">
                    <v-card-text>正在加载数据
                        <v-progress-linear class="mb-0" color="white" indeterminate></v-progress-linear>
                    </v-card-text>
                </v-card>
            </v-layout>
        </v-fade-transition>
    </v-container>
</template>

<script>
import axios from 'axios';
import Draggable from 'vuedraggable';

export default {
    props: ['editType', 'editId'],
    data: () => ({
        loading: 1,
        step: 1,
        validates: {
            form1: true,
            form2: true,
            form3: true
        },
        active: true,
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
        resultGroups: [{
            common: [{ source: '', parserSteps: [] }],
            title: [{ source: '', parserSteps: [] }],
            url: [{ source: '', parserSteps: [] }],
            author: [{ source: '', parserSteps: [] }],
            pubDate: [{ source: '', parserSteps: [] }],
            content: [{ source: '', parserSteps: [] }]
        }],
        resultGroupName: {
            common: '通用',
            title: '标题',
            url: '链接',
            author: '作者',
            pubDate: '时间',
            content: '内容',
        },
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
                                active: this.active,
                                id: this.id,
                                name: this.name
                            }).then(() => this.$router.push({ path: this.active ? `/list/group/${this.id}` : '/list/group/all' }));
                            break;
                        }
                        case 'feed': {
                            this.$store.dispatch(`${this.action}Feed`, {
                                active: this.active,
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
                            }).then(() => this.$router.push({ path: this.active ? `/list/feed/${this.id}` : '/list/group/all' }));
                            break;
                        }
                        case 'custom':
                            break;
                    }
                }
            });
        },
        clear(name) {
            this.$refs[name] && this.$refs[name].reset();
            switch (name) {
                case 'form1': {
                    this.type = 'group';
                    break;
                }
                case 'form2': {
                    this.name = '';
                    this.group = '';
                    this.icon = '';
                    this.home = '';
                    break;
                }
                case 'form3': {
                    this.url = '';
                    this.method = 'get';
                    this.timeout = 30;
                    this.headers = {};
                    this.body = '';
                    break;
                }
            }
        },
        clearAll() {
            this.id = '';
            this.active = true;
            Object.keys(this.validates).forEach(name => this.clear(name));
        },
        initialize() {
            if (this.action === 'update') {
                this.type = this.editType;
                if (this.editType === 'group') {
                    ({ id: this.id, name: this.name, active: this.active } = this.$store.getters.getGroup(this.editId));
                }
                else if (this.editType === 'feed') {
                    ({
                        id: this.id,
                        name: this.name,
                        active: this.active,
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
        },
        parseSource() {
            return this.resultGroups.map(resultGroup => Object.entries(resultGroup).reduce((total, [type, parsers]) => {
                parsers.map((parser, index) => parser.parserSteps.forEach((step, i) => total.push({
                    text: `${this.resultGroupName[type]} (${(index + 1)}) 步骤 ${(i + 1)}`,
                    value: type + (index + 1) + 'Step' + (i + 1)
                })));
                return total;
            }, [{ text: '源', value: 'origin' }]));
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
    },
    components: {
        Draggable
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
.drag-handler {
    cursor: pointer;
}
</style>

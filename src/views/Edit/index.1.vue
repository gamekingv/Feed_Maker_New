<template>
    <v-container class="px-5" fill-height fluid>
        <v-fade-transition :duration="40" mode="out-in">
            <v-flex fill-height key="steps" v-if="loading === 0">
                <v-stepper non-linear v-model="step" vertical>
                    <v-stepper-step :rules="[() => validates.form1]" editable step="1">基本信息</v-stepper-step>
                    <v-stepper-content step="1">
                        <v-form lazy-validation ref="form1" v-model="validates.form1">
                            <v-layout justify-center>
                                <v-flex lg1>
                                    <v-subheader>类型*</v-subheader>
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
                                <v-btn
                                    :disabled="exporting"
                                    :loading="exporting"
                                    @click="exportFeed"
                                    color="secondary"
                                    v-if="action === 'update' && type !== 'group'"
                                >导出</v-btn>
                                <v-btn @click="deleteItem(type.replace('custom', 'feed'), id)" color="error" v-if="action === 'update'">删除</v-btn>
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
                                    <v-subheader>分组*</v-subheader>
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
                                    <v-subheader>名称*</v-subheader>
                                </v-flex>
                                <v-flex lg4>
                                    <v-text-field :rules="[requireRules]" clearable placeholder="请输入名称" required solo v-model.lazy="name"></v-text-field>
                                </v-flex>
                            </v-layout>
                            <v-layout justify-center v-if="type === 'feed' || type === 'custom'">
                                <v-flex lg1>
                                    <v-subheader>主页</v-subheader>
                                </v-flex>
                                <v-flex lg4>
                                    <v-text-field clearable placeholder="请输入主页链接" solo v-model.lazy="home"></v-text-field>
                                </v-flex>
                            </v-layout>
                            <v-layout justify-center v-if="type === 'feed' || type === 'custom'">
                                <v-flex lg1>
                                    <v-subheader>图标</v-subheader>
                                </v-flex>
                                <v-flex lg4>
                                    <v-text-field clearable placeholder="可输入图片链接或Material Icons的名称" solo v-model.lazy="icon"></v-text-field>
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
                                    <v-subheader>链接*</v-subheader>
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
                                <v-btn :disabled="fetching !== ''" @click="fetchSource(true)">抓取</v-btn>
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
                            <transition-group name="source-forms">
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
                                        <v-textarea :loading="fetching !== ''" hide-details readonly rows="10" solo v-model="result"></v-textarea>
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
                    <template v-for="(parserGroup, index) in parserGroups">
                        <v-stepper-step
                            :key="`step${index + 4}`"
                            :rules="[() => resultGroupValidates[index]]"
                            :step="index + 4"
                            editable
                            v-if="type === 'custom'"
                        >{{`结果组 [${index + 1}]`}}</v-stepper-step>
                        <v-stepper-content :key="`content${index + 4}`" :step="index + 4" v-if="type === 'custom'">
                            <v-form lazy-validation ref="resultForm" v-model="resultGroupValidates[index]">
                                <v-layout class="my-4" column>
                                    <v-flex :key="parserType" v-for="(parsers, parserType, count) in parserGroup">
                                        <lazy-render :time="500 * (count + 1)">
                                            <v-layout align-center justify-center slot="tip">
                                                <v-progress-circular :size="50" color="blue" indeterminate></v-progress-circular>
                                            </v-layout>
                                            <v-card :key="i" color="#303030" disabled flat hide-actions v-for="(parser, i) in parsers">
                                                <v-card-title class="pb-0">
                                                    <v-container fluid>
                                                        <v-layout>
                                                            <v-flex lg1 style="min-width: 100px;">
                                                                <v-subheader
                                                                    v-text="parserType !== 'base' ? `${parserName[parserType]}${parserType === 'title' || parserType === 'url' || parserType === 'pubDate' ? '*': ''} (${i + 1})` : `${parserName[parserType]}*`"
                                                                ></v-subheader>
                                                            </v-flex>
                                                            <v-flex lg3 v-if="parserType !== 'base'">
                                                                <v-select
                                                                    :items="parseSource[index].filter(({value}) => parseSourceFilter(parserType, value, i))"
                                                                    :required="parserType === 'title' || parserType === 'url' || parserType === 'pubDate'"
                                                                    :rules="[parserType === 'title' || parserType === 'url' || parserType === 'pubDate' ? requireRules : true]"
                                                                    clearable
                                                                    label="输入源"
                                                                    no-data-text="无可用输入源"
                                                                    solo
                                                                    v-model="parser.source"
                                                                ></v-select>
                                                            </v-flex>
                                                            <v-spacer></v-spacer>
                                                            <v-tooltip :disabled="fetching !== ''" :open-delay="1000" lazy top>
                                                                <v-btn
                                                                    :disabled="fetching !== ''"
                                                                    @click="fetchSource"
                                                                    icon
                                                                    slot="activator"
                                                                    v-if="parserType === 'base'"
                                                                >
                                                                    <v-icon>refresh</v-icon>
                                                                </v-btn>
                                                                <span>重新抓取</span>
                                                            </v-tooltip>
                                                            <v-tooltip :open-delay="1000" lazy top>
                                                                <v-btn
                                                                    @click="parser.parserSteps.push({id: Date.now().toString(), method: 'match', regexp: '', flags: [], replaceExp: '', subPattern: ''})"
                                                                    icon
                                                                    slot="activator"
                                                                >
                                                                    <v-icon>add</v-icon>
                                                                </v-btn>
                                                                <span>添加一个步骤</span>
                                                            </v-tooltip>
                                                            <v-tooltip :open-delay="1000" lazy top>
                                                                <v-btn
                                                                    @click="parsers.splice(i + 1, 0, { source: '', parserSteps: [] })"
                                                                    icon
                                                                    slot="activator"
                                                                    v-if="parserType !== 'base'"
                                                                >
                                                                    <v-icon>playlist_add</v-icon>
                                                                </v-btn>
                                                                <span>{{`添加一个${parserName[parserType]}组`}}</span>
                                                            </v-tooltip>
                                                            <v-tooltip :open-delay="1000" lazy top>
                                                                <v-btn
                                                                    @click="parsers.splice(i, 1)"
                                                                    icon
                                                                    slot="activator"
                                                                    v-if="parsers.length > 1 && parserType !== 'base'"
                                                                >
                                                                    <v-icon>close</v-icon>
                                                                </v-btn>
                                                                <span>{{`删除此${parserName[parserType]}组`}}</span>
                                                            </v-tooltip>
                                                        </v-layout>
                                                    </v-container>
                                                </v-card-title>
                                                <v-card-text class="pt-0">
                                                    <parser-step
                                                        :steps="parser.parserSteps"
                                                        @modify="parserSteps => parser.parserSteps = parserSteps"
                                                        @test="parserSteps => testSteps(index, parser.source, parserType, parserSteps)"
                                                    ></parser-step>
                                                </v-card-text>
                                            </v-card>
                                        </lazy-render>
                                        <v-divider class="mt-3" v-if="count < Object.keys(parserGroup).length - 1"></v-divider>
                                    </v-flex>
                                </v-layout>
                                <v-layout>
                                    <v-btn @click="step--" color="secondary">上一步</v-btn>
                                    <v-btn @click="deleteParserGroup(index)" color="error" v-if="parserGroups.length > 1">删除此结果组</v-btn>
                                    <v-spacer></v-spacer>
                                    <v-btn
                                        :disabled="!resultGroupValidates[index]"
                                        @click="validate('resultForm', index + 5, index)"
                                        color="primary"
                                        v-if="index < parserGroups.length - 1"
                                    >下一步</v-btn>
                                    <v-btn @click="addParserGroup" color="primary" v-else>新增结果组</v-btn>
                                    <v-btn :disabled="!complete" @click="submit" color="primary">完成</v-btn>
                                    <v-btn @click="clear('resultForm', index)">重置</v-btn>
                                </v-layout>
                            </v-form>
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
        <v-dialog @input="e => e || (result = '')" class="d-flex" scrollable v-model="stepResult">
            <v-card class="grey darken-4">
                <v-card-title class="font-weight-bold py-0 pr-0">测试结果
                    <v-spacer></v-spacer>
                    <v-btn @click="stepResult = false" icon>
                        <v-icon>close</v-icon>
                    </v-btn>
                </v-card-title>
                <v-divider></v-divider>
                <template v-if="parsing === ''">
                    <v-card-text class="scrollbar-thin" style="overflow-x: hidden; min-height: 300px;" v-if="Array.isArray(result)">
                        <template v-for="(item, i) in result">
                            <v-chip :key="i" color="primary" selected small text-color="white">{{`第 ${i} 项`}}</v-chip>
                            <p :key="'i' + i">{{typeof item === 'object' ? JSON.stringify(item) : item}}</p>
                        </template>
                    </v-card-text>
                    <v-card-text
                        class="scrollbar-thin"
                        style="overflow-x: hidden; min-height: 300px;"
                        v-else
                    >{{typeof result === 'object' ? JSON.stringify(result) : result}}</v-card-text>
                </template>
                <v-layout align-center fill-height justify-center key="parsing" style="min-height: 300px;" v-else>
                    <v-card color="primary" width="300">
                        <v-card-text>正在运行步骤
                            <v-progress-linear class="mb-0" color="white" indeterminate></v-progress-linear>
                        </v-card-text>
                    </v-card>
                </v-layout>
            </v-card>
        </v-dialog>
    </v-container>
</template>

<script>
import message from '~/utils/extension/message';
import ParserStep from './ParserStep';

export default {
    props: ['editType', 'editId'],
    data: () => ({
        loading: 1,
        step: 1,
        stepResult: false,
        exporting: false,
        parsing: '',
        validates: {
            form1: true,
            form2: true,
            form3: true
        },
        resultGroupValidates: [true],
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
        fetching: '',
        fetchResult: '',
        result: '',
        parserGroups: [{
            base: [{ source: 'origin', parserSteps: [] }],
            common: [{ source: '', parserSteps: [] }],
            title: [{ source: '', parserSteps: [] }],
            url: [{ source: '', parserSteps: [] }],
            pubDate: [{ source: '', parserSteps: [] }],
            author: [{ source: '', parserSteps: [] }],
            content: [{ source: '', parserSteps: [] }]
        }],
        parserName: {
            base: '基础数组',
            common: '通用',
            title: '标题',
            url: '链接',
            pubDate: '时间',
            author: '作者',
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
        validate(name, next, index) {
            let validate = isNaN(index) ? this.$refs[name].validate() : this.$refs['resultForm'][index].validate();
            if (validate)
                this.step = next;
        },
        async fetchSource(isShow) {
            let timestamp = Date.now().toString();
            this.fetching = timestamp;
            if (isShow) this.result = '';

            let { data } = await message.sendFetchSource({
                url: this.url,
                method: this.method,
                timeout: this.timeout,
                headers: this.headers,
                body: this.body
            });
            if (this.fetching !== timestamp) return;
            this.fetchResult = data;
            if (isShow) this.result = data;
            this.fetching = '';
        },
        async testSteps(parserGroupIndex, parserSource, parserType, parserSteps) {
            this.stepResult = true;
            let timestamp = Date.now().toString();
            this.parsing = timestamp;
            if (this.fetchResult === '') await this.fetchSource();
            let result = await this.runSteps(parserGroupIndex, parserSource, parserType, parserSteps);
            if (this.parsing !== timestamp) return;
            this.result = result;
            this.parsing = '';
        },
        async runSteps(parserGroupIndex, parserSource, parserType, parserSteps) {
            let source, [type, steps] = [parserType, parserSteps];
            if (parserSource === 'origin') {
                source = this.fetchResult;
            }
            else if (parserSource === 'base') {
                let sourceInfo = this.parserGroups[parserGroupIndex].base[0];
                source = await this.runSteps(parserGroupIndex, sourceInfo.source, parserSource, sourceInfo.parserSteps);
            }
            else {
                let [, sourceType, sourceIndex, sourceStep] = parserSource.match(/(.+?)(\d+)Step(\d+)/);
                let sourceInfo = this.parserGroups[parserGroupIndex][sourceType][sourceIndex - 1];
                source = await this.runSteps(parserGroupIndex, sourceInfo.source, sourceType, sourceInfo.parserSteps.slice(0, sourceStep));
            }
            let { data } = await message.sendParseSource(source, type, steps);
            return data;
        },
        submit() {
            Object.keys(this.validates).forEach(name => this.$refs[name] && this.$refs[name].validate());
            this.resultGroupValidates.forEach((validate, index) => this.$refs['resultForm'] && this.$refs['resultForm'][index].validate());
            this.$nextTick(async () => {
                if (this.complete) {
                    this.loading++;
                    if (this.action === 'add') this.id = Date.now().toString();
                    switch (this.type) {
                        case 'group': {
                            await this.$store.dispatch(`${this.action}Group`, {
                                active: this.active,
                                id: this.id,
                                name: this.name
                            });
                            this.$router.push({ path: this.active ? `/list/group/${this.id}` : '/list/group/all' });
                            break;
                        }
                        case 'feed':
                        case 'custom': {
                            await this.$store.dispatch(`${this.action}Feed`, {
                                active: this.active,
                                id: this.id,
                                custom: this.type === 'custom',
                                name: this.name,
                                groupId: this.group,
                                home: this.home,
                                icon: this.icon,
                                url: this.url,
                                method: this.method,
                                timeout: this.timeout,
                                headers: this.headers,
                                body: this.body
                            });
                            if (this.type === 'custom') await this.$store.dispatch(`${this.action}Parser`, { id: this.id, parser: this.parserGroups });
                            this.$router.push({ path: this.active ? `/list/feed/${this.id}` : '/list/group/all' });
                            break;
                        }
                    }
                }
            });
        },
        clear(name, index) {
            if (isNaN(index)) this.$refs[name] && this.$refs[name].reset();
            else this.$refs[name][index].reset();
            this.$nextTick(() => {
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
                    default: {
                        this.parserGroups.splice(index, 1, {
                            base: [{ source: 'origin', parserSteps: [] }],
                            common: [{ source: '', parserSteps: [] }],
                            title: [{ source: '', parserSteps: [] }],
                            url: [{ source: '', parserSteps: [] }],
                            pubDate: [{ source: '', parserSteps: [] }],
                            author: [{ source: '', parserSteps: [] }],
                            content: [{ source: '', parserSteps: [] }]
                        });
                        break;
                    }
                }
            });
        },
        clearAll() {
            this.id = '';
            this.active = true;
            Object.keys(this.validates).forEach(name => this.clear(name));
            this.parserGroups = [{
                base: [{ source: 'origin', parserSteps: [] }],
                common: [{ source: '', parserSteps: [] }],
                title: [{ source: '', parserSteps: [] }],
                url: [{ source: '', parserSteps: [] }],
                pubDate: [{ source: '', parserSteps: [] }],
                author: [{ source: '', parserSteps: [] }],
                content: [{ source: '', parserSteps: [] }]
            }];
            this.resultGroupValidates = [true];
        },
        initialize() {
            if (this.action === 'update') {
                this.type = this.editType;
                if (this.editType === 'group') {
                    ({ id: this.id, name: this.name, active: this.active } = this.$store.getters.getGroup(this.editId));
                }
                else if (this.editType === 'feed') {
                    let feed = this.$store.getters.getFeed(this.editId);
                    if (feed.custom) {
                        this.type = 'custom';
                        this.parserGroups = JSON.parse(JSON.stringify(this.$store.state.parsers[this.editId]));
                    }
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
                    } = feed);
                }
            }
            else {
                this.clearAll();
            }
        },
        parseSourceFilter(type, value, i) {
            if (type !== 'common' || value.indexOf('base') > -1) return true;
            else return parseInt(value.match(/common(\d+)Step/)[1]) <= i;
        },
        async deleteItem(type, id) {
            this.loading++;
            let Type = type.charAt(0).toUpperCase() + type.slice(1),
                item = this.$store.getters[`get${Type}`](id);
            let { result, data } = await message[`sendDelete${Type}`](id);
            if (result === 'fail') throw data;
            this.$router.push({ path: '/list/group/all' }, () => this.$store.dispatch(`delete${Type}`, item));
        },
        addParserGroup() {
            this.parserGroups.push({ base: [{ parserSteps: [] }], common: [{ source: '', parserSteps: [] }], title: [{ source: '', parserSteps: [] }], url: [{ source: '', parserSteps: [] }], author: [{ source: '', parserSteps: [] }], pubDate: [{ source: '', parserSteps: [] }], content: [{ source: '', parserSteps: [] }] });
            this.resultGroupValidates.push(true);
        },
        deleteParserGroup(index) {
            this.parserGroups.splice(index, 1);
            this.resultGroupValidates.splice(index, 1);
            if ((index + 1) > this.parserGroups.length) this.step--;
        },
        exportFeed() {
            this.exporting = true;
            let feed = Object.assign({}, this.$store.getters.getFeed(this.editId)), parser;
            if (feed.custom) parser = this.$store.state.parsers[this.editId];
            delete feed.id;
            delete feed.groupId;
            let config = { type: 'feed', feed };
            if (parser) config.parser = parser;
            let file = new Blob([JSON.stringify(config)], { type: 'application/json' });
            browser.downloads.download({
                url: URL.createObjectURL(file),
                filename: `${feed.name}.json`,
                saveAs: true
            });
            this.exporting = false;
        }
    },
    computed: {
        complete() {
            return Object.values(this.validates).every(validate => validate === true) && this.resultGroupValidates.every(validate => validate === true);
        },
        groups() {
            return this.$store.state.groups.map(({ id, name }) => ({ text: name, value: id }));
        },
        action() {
            return this.$store.state.active.type.replace('edit', 'update');
        },
        parseSource() {
            return this.parserGroups.map(parserGroup => Object.entries(parserGroup).reduce((total, [type, parsers]) => {
                if (type === 'base' && parsers[0].parserSteps.length > 0) total.push({ text: '基础数组', value: 'base' });
                if (type !== 'common') return total;
                parsers.map((parser, index) => parser.parserSteps.forEach((step, i) => total.push({
                    text: `${this.parserName[type]} (${(index + 1)}) 步骤 ${(i + 1)}`,
                    value: type + (index + 1) + 'Step' + (i + 1)
                })));
                return total;
            }, []));
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
        ParserStep
    }
};
</script>
<style lang="scss" scoped>
.source-forms {
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

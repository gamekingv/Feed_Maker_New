<template>
    <v-container class="px-5" fill-height fluid>
        <v-fade-transition :duration="40" mode="out-in">
            <v-flex fill-height key="steps" v-if="loading === 0">
                <v-stepper style="box-shadow: unset;" non-linear v-model="step" vertical>
                    <v-stepper-step :rules="[() => validates.form1]" editable step="1">基本信息</v-stepper-step>
                    <v-stepper-content step="1">
                        <step-1
                            :action="action"
                            :requireRule="requireRule"
                            :step="step1"
                            :validation="validates.form1"
                            @modifyValidation="v => validates.form1 = v"
                            ref="form1"
                        ></step-1>
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
                            <v-btn :disabled="!validates.form1" @click="nextStep('form1', 2)" color="primary">下一步</v-btn>
                            <v-btn :disabled="!complete" @click="submit" color="primary">完成</v-btn>
                            <v-btn @click="clear('form1')">重置</v-btn>
                        </v-layout>
                    </v-stepper-content>
                    <v-stepper-step :rules="[() => validates.form2]" editable step="2">详细信息</v-stepper-step>
                    <v-stepper-content step="2">
                        <step-2
                            :groups="groups"
                            :requireRule="requireRule"
                            :step="step2"
                            :type="type"
                            :validation="validates.form2"
                            @modifyValidation="v => validates.form2 = v"
                            ref="form2"
                        ></step-2>
                        <v-layout>
                            <v-btn @click="step--" color="secondary">上一步</v-btn>
                            <v-spacer></v-spacer>
                            <v-btn
                                :disabled="!validates.form2"
                                @click="nextStep('form2', 3)"
                                color="primary"
                                v-if="type === 'feed' || type === 'custom'"
                            >下一步</v-btn>
                            <v-btn :disabled="!complete" @click="submit" color="primary">完成</v-btn>
                            <v-btn @click="clear('form2')">重置</v-btn>
                        </v-layout>
                    </v-stepper-content>
                    <v-stepper-step :rules="[() => validates.form3]" editable step="3" v-if="type === 'feed' || type === 'custom'">源信息</v-stepper-step>
                    <v-stepper-content step="3" v-if="type === 'feed' || type === 'custom'">
                        <step-3
                            :fetching="fetching"
                            :fetchResult="fetchResult"
                            :fetchSource="fetchSource"
                            :requireRule="requireRule"
                            :step="step3"
                            :validation="validates.form3"
                            @modifyFetching="v => fetching = v"
                            @modifyFetchResult="v => fetchResult = v"
                            @modifyValidation="v => validates.form3 = v"
                            ref="form3"
                        ></step-3>
                        <v-layout>
                            <v-btn @click="step--" color="secondary">上一步</v-btn>
                            <v-spacer></v-spacer>
                            <v-btn :disabled="!validates.form3" @click="nextStep('form3', 4)" color="primary" v-if="type === 'custom'">下一步</v-btn>
                            <v-btn :disabled="!complete" @click="submit" color="primary">完成</v-btn>
                            <v-btn @click="clear('form3')">重置</v-btn>
                        </v-layout>
                    </v-stepper-content>
                    <template v-for="(parserGroup, index) in parserGroups">
                        <v-stepper-step
                            :key="`step${parserGroup.id}`"
                            :rules="[() => resultGroupValidates[index]]"
                            :step="index + 4"
                            editable
                            v-if="type === 'custom'"
                        >{{`结果组 [${index + 1}]`}}</v-stepper-step>
                        <v-stepper-content :key="`content${parserGroup.id}`" :step="index + 4" v-if="type === 'custom'">
                            <step-4
                                :fetching="fetching"
                                :fetchResult="fetchResult"
                                :fetchSource="fetchSource"
                                :index="index"
                                :parserGroup="parserGroup"
                                :parserGroups="parserGroups"
                                :requireRule="requireRule"
                                @modifyFetching="v => fetching = v"
                                @modifyFetchResult="v => fetchResult = v"
                                @modifyValidation="v => $set(resultGroupValidates, index, v)"
                                ref="resultForm"
                            ></step-4>
                            <v-layout>
                                <v-btn @click="step--" color="secondary">上一步</v-btn>
                                <v-btn @click="deleteParserGroup(index)" color="error" v-if="parserGroups.length > 1">删除此结果组</v-btn>
                                <v-spacer></v-spacer>
                                <v-btn
                                    :disabled="!resultGroupValidates[index]"
                                    @click="nextStep('resultForm', index + 5, index)"
                                    color="primary"
                                    v-if="index < parserGroups.length - 1"
                                >下一步</v-btn>
                                <v-btn @click="addParserGroup" color="primary" v-else>新增结果组</v-btn>
                                <v-btn :disabled="!complete" @click="submit" color="primary">完成</v-btn>
                                <v-btn @click="clear('resultForm', index)">重置</v-btn>
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
import message from '~/utils/extension/message';
import Step1 from './Step1';
import Step2 from './Step2';
import Step3 from './Step3';
import Step4 from './Step4';

export default {
    props: ['editType', 'editId'],
    data: () => ({
        loading: 1,
        step: 1,
        exporting: false,
        validates: {
            form1: true,
            form2: true,
            form3: true
        },
        resultGroupValidates: [true],
        id: '',
        step1: {
            active: true,
            type: 'group'
        },
        step2: {
            name: '',
            group: '',
            icon: '',
            home: '',
        },
        step3: {
            url: '',
            method: 'get',
            timeout: 30,
            headers: {},
            body: ''
        },
        fetching: '',
        fetchResult: '',
        parserGroups: []
    }),
    mounted() {
        this.initialize();
        this.loading--;
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
        type() {
            return this.step1.type;
        }
    },
    methods: {
        requireRule: v => !!v || '必填',
        nextStep(name, next, index) {
            let validate = isNaN(index) ? this.$refs[name].validate() : this.$refs.resultForm[index].validate();
            if (validate)
                this.step = next;
        },
        async fetchSource() {
            let timestamp = Date.now().toString();
            this.fetching = timestamp;

            let data = await message.sendFetchSource({
                url: this.step3.url,
                method: this.step3.method,
                timeout: this.step3.timeout,
                headers: this.step3.headers,
                body: this.step3.body
            });
            if (this.fetching !== timestamp) return;
            this.fetchResult = data;
            this.fetching = '';
        },
        submit() {
            Object.keys(this.validates).forEach(name => this.$refs[name] && this.$refs[name].validate());
            this.$refs.resultForm && this.$refs.resultForm.forEach(resultForm => resultForm.validate());
            this.$nextTick(async () => {
                if (this.complete) {
                    this.loading++;
                    if (this.action === 'add') this.id = Date.now().toString();
                    switch (this.type) {
                        case 'group': {
                            let old = this.$store.getters.getGroup(this.editId);
                            if (this.action === 'update' && old.active !== this.step1.active) {
                                await message.sendChangeItemsActive(this.editType, this.editId, this.step1.active.toString());
                                old.feeds.forEach(async ({ id }) => await this.$store.dispatch('updateFeedState', {
                                    id,
                                    unread: this.step1.active ? await message.sendGetCount('feed', id, 'unread') : 0
                                }));
                            }
                            await this.$store.dispatch(`${this.action}Group`, {
                                id: this.id,
                                active: this.step1.active,
                                name: this.step2.name
                            });
                            this.$router.push({ path: this.step1.active ? `/list/group/${this.id}` : '/list/group/all' });
                            break;
                        }
                        case 'feed':
                        case 'custom': {
                            if (this.action === 'update' && this.$store.getters.getFeed(this.editId).active !== this.step1.active) {
                                await message.sendChangeItemsActive(this.editType, this.editId, this.step1.active.toString());
                                await this.$store.dispatch('updateFeedState', {
                                    id: this.editId,
                                    unread: this.step1.active ? await message.sendGetCount('feed', this.editId, 'unread') : 0
                                });
                            }
                            await this.$store.dispatch(`${this.action}Feed`, {
                                id: this.id,
                                active: this.step1.active,
                                custom: this.step1.type === 'custom',
                                name: this.step2.name,
                                groupId: this.step2.group,
                                home: this.step2.home,
                                icon: this.step2.icon,
                                url: this.step3.url,
                                method: this.step3.method,
                                timeout: this.step3.timeout,
                                headers: this.step3.headers,
                                body: this.step3.body
                            });
                            if (this.step1.type === 'custom') await this.$store.dispatch(`${this.action}Parser`, { id: this.id, parser: this.parserGroups });
                            this.$router.push({ path: this.step1.active ? `/list/feed/${this.id}` : '/list/group/all' });
                            break;
                        }
                    }
                }
            });
        },
        clear(name, index) {
            if (isNaN(index)) this.$refs[name] && this.$refs[name].reset();
            else this.$refs[name] && this.$refs[name][index] && this.$refs[name][index].reset();
        },
        initialize() {
            let timestamp = Date.now().toString();
            this.id = '';
            this.step1 = {
                type: 'group',
                active: true
            };
            this.step2 = {
                name: '',
                group: '',
                icon: '',
                home: ''
            };
            this.step3 = {
                url: '',
                method: 'get',
                timeout: 30,
                headers: {},
                body: ''
            };
            this.parserGroups = [{
                id: timestamp,
                base: [{ id: timestamp, source: 'origin', parserSteps: [] }],
                common: [{ id: timestamp, source: '', parserSteps: [] }],
                title: [{ id: timestamp, source: '', parserSteps: [] }],
                url: [{ id: timestamp, source: '', parserSteps: [] }],
                pubDate: [{ id: timestamp, source: '', parserSteps: [] }],
                author: [{ id: timestamp, source: '', parserSteps: [] }],
                content: [{ id: timestamp, source: '', parserSteps: [] }]
            }];
            this.resultGroupValidates = [true];
            if (this.action === 'update') {
                this.step1.type = this.editType;
                if (this.editType === 'group') {
                    ({ id: this.id, name: this.step2.name, active: this.step1.active } = this.$store.getters.getGroup(this.editId));
                }
                else if (this.editType === 'feed') {
                    let feed = this.$store.getters.getFeed(this.editId);
                    if (feed.custom) {
                        this.step1.type = 'custom';
                        this.parserGroups = JSON.parse(JSON.stringify(this.$store.state.parsers[this.editId]));
                    }
                    ({
                        id: this.id,
                        active: this.step1.active,
                        name: this.step2.name,
                        groupId: this.step2.group,
                        home: this.step2.home,
                        icon: this.step2.icon,
                        url: this.step3.url,
                        method: this.step3.method,
                        timeout: this.step3.timeout,
                        body: this.step3.body
                    } = feed);
                    this.step3.headers = JSON.parse(JSON.stringify(feed.headers));
                }
            }
        },
        async deleteItem(type, id) {
            this.loading++;
            let Type = type.charAt(0).toUpperCase() + type.slice(1),
                item = this.$store.getters[`get${Type}`](id);
            await message[`sendDelete${Type}`](id);
            this.$router.push({ path: '/list/group/all' }, () => this.$store.dispatch(`delete${Type}`, item));
        },
        addParserGroup() {
            let timestamp = Date.now().toString();
            this.parserGroups.push({
                id: timestamp,
                base: [{ id: timestamp, source: 'origin', parserSteps: [] }],
                common: [{ id: timestamp, source: '', parserSteps: [] }],
                title: [{ id: timestamp, source: '', parserSteps: [] }],
                url: [{ id: timestamp, source: '', parserSteps: [] }],
                pubDate: [{ id: timestamp, source: '', parserSteps: [] }],
                author: [{ id: timestamp, source: '', parserSteps: [] }],
                content: [{ id: timestamp, source: '', parserSteps: [] }]
            });
            this.resultGroupValidates.push(true);
        },
        deleteParserGroup(index) {
            this.parserGroups.splice(index, 1);
            this.resultGroupValidates.splice(index, 1);
            this.step--;
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
        Step1,
        Step2,
        Step3,
        Step4
    }
};
</script>

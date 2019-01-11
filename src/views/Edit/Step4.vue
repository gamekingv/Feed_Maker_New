<template>
    <v-layout class="my-4" column>
        <v-flex :key="parserType" v-for="(parsers, parserType, count) in parserGroup" v-if="parserType !== 'id'">
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
                                        :rules="[parserType === 'title' || parserType === 'url' || parserType === 'pubDate' ? requireRule : true]"
                                        @blur="onBlur($event, parserType, i, parser.source)"
                                        @change="onChange($event, parserType, i)"
                                        clearable
                                        label="输入源"
                                        no-data-text="无可用输入源"
                                        solo
                                        v-model="parser.source"
                                    ></v-select>
                                </v-flex>
                                <v-spacer></v-spacer>
                                <v-tooltip :disabled="fetching !== ''" :open-delay="1000" lazy top>
                                    <v-btn :disabled="fetching !== ''" @click="fetchSource" icon slot="activator" v-if="parserType === 'base'">
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
                                    <v-btn @click="parsers.splice(i, 1)" icon slot="activator" v-if="parsers.length > 1 && parserType !== 'base'">
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
    </v-layout>
</template>

<script>
import message from '~/utils/extension/message';
import ParserStep from './ParserStep';

export default {
    props: ['index', 'parserGroup', 'parserGroups', 'requireRule', 'fetchSource', 'fetching', 'fetchResult'],
    data: () => ({
        parserName: {
            base: '基础数组',
            common: '通用',
            title: '标题',
            url: '链接',
            pubDate: '时间',
            author: '作者',
            content: '内容',
        },
        stepResult: false,
        parsing: '',
        result: '',
        validations: {}
    }),
    computed: {
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
        },
        validation() {
            return Object.values(this.validations).reduce((result, validation) => result && validation, true);
        }
    },
    watch: {
        validation(val) {
            this.$emit('modifyValidation', val);
        }
    },
    methods: {
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
        parseSourceFilter(type, value, i) {
            if (type !== 'common' || value.indexOf('base') > -1) return true;
            else return parseInt(value.match(/common(\d+)Step/)[1]) <= i;
        },
        validate() {
            let validate = this.$refs.sourcesRequired.map(source => source.validate(true)).reduce((validates, validate) => validates && validate, true);
            this.$emit('modifyValidation', validate);
            return validate;
        },
        onBlur(e, type, i, val) {
            if (e.type === 'click' && (type === 'title' || type === 'url' || type === 'pubDate')) {
                this.$set(this.validations, `${type}${i}`, !!val);
            }
        },
        onChange(val, type, i) {
            if (type === 'title' || type === 'url' || type === 'pubDate') {
                this.$set(this.validations, `${type}${i}`, !!val);
            }
        }
    },
    components: {
        ParserStep
    }
};
</script>
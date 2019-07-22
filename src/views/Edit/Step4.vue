<template>
    <v-layout class="my-4" column>
        <v-flex :key="parserType" v-for="(parsers, parserType, count) in parserGroup" v-if="parserType !== 'id'">
            <lazy-render :time="500 * (count + 1)">
                <v-layout align-center justify-center slot="tip">
                    <v-progress-circular :size="50" class="my-5" color="blue" indeterminate></v-progress-circular>
                </v-layout>
                <v-card :key="parser.id" color="#303030" disabled flat hide-actions v-for="(parser, i) in parsers">
                    <v-card-title class="pb-0">
                        <v-container fluid>
                            <v-layout>
                                <v-flex lg1 style="min-width: 100px;">
                                    <v-subheader>
                                        {{parserName[parserType]}}
                                        <span
                                            class="error--text"
                                            v-if="parserType !== 'common' && parserType !== 'author' && parserType !== 'content'"
                                        >*</span>
                                        {{parserType === 'base' ? '' :` (${i + 1})`}}
                                    </v-subheader>
                                </v-flex>
                                <v-flex lg3 v-if="parserType !== 'base'">
                                    <v-select
                                        :items="parseSource[index].filter(({value}) => parseSourceFilter(parserType, value, i))"
                                        :ref="parserType === 'title' || parserType === 'url' || parserType === 'pubDate' ? 'sourcesRequired' : 'sources'"
                                        :required="parserType === 'title' || parserType === 'url' || parserType === 'pubDate'"
                                        :rules="[parserType === 'title' || parserType === 'url' || parserType === 'pubDate' ? requireRule : true]"
                                        @blur="onBlur($event, parserType, parser.id, parser.source)"
                                        @change="onChange($event, parserType, parser.id)"
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
                                    <span>重新抓取自定义源</span>
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
                                        @click="parsers.splice(i + 1, 0, {id: Date.now().toString(), source: '', parserSteps: [] })"
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
                                        @click="parsers.splice(i, 1); $delete(validations, `${parserType}${parser.id}`)"
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
                            @test="parserSteps => testSteps(index, parser.source, parserSteps)"
                        ></parser-step>
                    </v-card-text>
                </v-card>
            </lazy-render>
            <v-divider class="mt-3" v-if="count < Object.keys(parserGroup).length - 1"></v-divider>
        </v-flex>
        <v-dialog @input="e => e || (result = '')" class="d-flex" scrollable v-model="stepResult">
            <v-card class="grey darken-4" style="overflow-x: hidden;">
                <v-card-title class="font-weight-bold py-0 pr-0">
                    测试结果
                    <v-spacer></v-spacer>
                    <v-btn @click="stepResult = false" icon>
                        <v-icon>close</v-icon>
                    </v-btn>
                </v-card-title>
                <v-divider></v-divider>
                <template v-if="parsing === ''">
                    <v-card-text class="parsed-result" v-if="Array.isArray(result)">
                        <template v-for="(item, i) in result">
                            <v-chip :key="i" color="primary" selected small text-color="white">{{`第 ${i} 项`}}</v-chip>
                            <p :key="'i' + i" style="-moz-user-select: text;">{{typeof item === 'object' ? JSON.stringify(item) : item}}</p>
                        </template>
                    </v-card-text>
                    <v-card-text
                        class="parsed-result"
                        style="-moz-user-select: text;"
                        v-else
                    >{{typeof result === 'object' ? JSON.stringify(result) : result}}</v-card-text>
                </template>
                <v-layout align-center fill-height justify-center key="parsing" style="min-height: 300px;" v-else>
                    <v-card color="primary" width="300">
                        <v-card-text>
                            正在运行步骤
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
    mounted() {
        this.$emit('modifyValidation', true);
    },
    watch: {
        validation(val) {
            this.$emit('modifyValidation', val);
        },
        stepResult(val) {
            val || setTimeout(() => this.result = '', 300);
        }
    },
    methods: {
        async testSteps(parserGroupIndex, parserSource, parserSteps) {
            this.stepResult = true;
            let timestamp = Date.now().toString(), baseSteps, steps = parserSteps;
            this.parsing = timestamp;
            if (this.fetchResult === '') await this.fetchSource();
            if (parserSource !== 'origin') {
                baseSteps = this.parserGroups[parserGroupIndex].base[0].parserSteps;
                steps = this.combineSteps(parserGroupIndex, parserSource, parserSteps);
            }
            let result = await message.sendParseSource(this.fetchResult, steps, baseSteps);
            if (this.parsing !== timestamp) return;
            this.result = result;
            this.parsing = '';
        },
        combineSteps(parserGroupIndex, parserSource, parserSteps) {
            if (parserSource === 'base') {
                return parserSteps;
            }
            else if (parserSource) {
                let [, sourceType, sourceIndex, sourceStep] = parserSource.match(/(.+?)(\d+)Step(\d+)/);
                let sourceInfo = this.parserGroups[parserGroupIndex][sourceType][sourceIndex - 1];
                return this.combineSteps(parserGroupIndex, sourceInfo.source, sourceInfo.parserSteps.slice(0, sourceStep)).concat(parserSteps);
            }
            else {
                this.result = '无效输入源';
                this.parsing = '';
                throw '';
            }
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
            else if (parserSource) {
                let [, sourceType, sourceIndex, sourceStep] = parserSource.match(/(.+?)(\d+)Step(\d+)/);
                let sourceInfo = this.parserGroups[parserGroupIndex][sourceType][sourceIndex - 1];
                source = await this.runSteps(parserGroupIndex, sourceInfo.source, sourceType, sourceInfo.parserSteps.slice(0, sourceStep));
            }
            else return '输入源为空';
            let data = await message.sendParseSource(source, type, steps);
            return data;
        },
        parseSourceFilter(type, value, i) {
            if (type !== 'common' || value.indexOf('base') > -1) return true;
            else return parseInt(value.match(/common(\d+)Step/)[1]) <= i;
        },
        validate() {
            let validate;
            if (this.$refs.sourcesRequired) {
                validate = this.$refs.sourcesRequired.map(source => source.validate(true)).reduce((validates, validate) => validates && validate, true);
            }
            else validate = true;
            this.$emit('modifyValidation', validate);
            return validate;
        },
        reset() {
            let timestamp = this.parserGroup.id;
            this.$set(this.parserGroups, this.index, {
                id: timestamp,
                base: [{ id: timestamp, source: 'origin', parserSteps: [] }],
                common: [{ id: timestamp, source: '', parserSteps: [] }],
                title: [{ id: timestamp, source: '', parserSteps: [] }],
                url: [{ id: timestamp, source: '', parserSteps: [] }],
                pubDate: [{ id: timestamp, source: '', parserSteps: [] }],
                author: [{ id: timestamp, source: '', parserSteps: [] }],
                content: [{ id: timestamp, source: '', parserSteps: [] }]
            });
            this.validations = {};
            this.$nextTick(() => {
                this.$refs.sourcesRequired && this.$refs.sourcesRequired.forEach(source => source.resetValidation());
            });
        },
        onBlur(e, type, id, val) {
            if (e.type === 'click' && (type === 'title' || type === 'url' || type === 'pubDate')) {
                this.$set(this.validations, `${type}${id}`, !!val);
            }
        },
        onChange(val, type, id) {
            if (type === 'title' || type === 'url' || type === 'pubDate') {
                this.$set(this.validations, `${type}${id}`, !!val);
            }
        }
    },
    components: {
        ParserStep
    }
};
</script>

<style scoped>
.parsed-result {
    overflow-y: scroll;
    overflow-x: hidden;
    min-height: 300px;
}
</style>

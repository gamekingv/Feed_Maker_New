<template>
    <v-form lazy-validation ref="form" v-model="formValidation">
        <v-layout justify-center>
            <v-flex lg1>
                <v-subheader>链接*</v-subheader>
            </v-flex>
            <v-flex lg11>
                <v-text-field :rules="[requireRule, urlRule]" clearable placeholder="请输入链接" required solo v-model="step.url"></v-text-field>
            </v-flex>
        </v-layout>
        <v-layout>
            <v-flex lg1>
                <v-subheader>方法</v-subheader>
            </v-flex>
            <v-flex lg3>
                <v-select
                    :items="[{text: 'GET', value: 'get'}, {text: 'POST', value: 'post'}]"
                    :rules="[requireRule]"
                    class="pa-0"
                    label="方法"
                    required
                    solo
                    v-model="step.method"
                ></v-select>
            </v-flex>
            <v-spacer></v-spacer>
            <v-flex lg1>
                <v-subheader>超时（秒）</v-subheader>
            </v-flex>
            <v-flex lg2>
                <v-slider always-dirty max="60" min="1" thumb-label="always" v-model="step.timeout"></v-slider>
            </v-flex>
            <v-spacer></v-spacer>
            <v-btn :disabled="fetching !== ''" :loading="fetching !== ''" @click="fetchSource">抓取</v-btn>
        </v-layout>
        <v-layout class="mb-4">
            <v-flex lg1>
                <v-subheader>消息头</v-subheader>
            </v-flex>
            <v-flex align-self-center lg11>
                <v-chip
                    :key="key"
                    @input="$delete(step.headers, key)"
                    close
                    color="primary"
                    selected
                    small
                    text-color="white"
                    v-for="(value, key) in step.headers"
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
                                    <v-text-field :rules="[requireRule, headerRule]" clearable placeholder="键" solo v-model="headerKey"></v-text-field>
                                    <v-subheader>:</v-subheader>
                                    <v-text-field :rules="[requireRule]" clearable placeholder="值" solo v-model="headerValue"></v-text-field>
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
            <v-layout class="mb-3" key="body" v-show="step.method === 'post'">
                <v-flex lg1>
                    <v-subheader>主体</v-subheader>
                </v-flex>
                <v-flex lg11>
                    <v-textarea hide-details solo v-model="step.body"></v-textarea>
                </v-flex>
            </v-layout>
            <v-layout class="mb-3" key="result">
                <v-flex lg1>
                    <v-subheader>测试结果</v-subheader>
                </v-flex>
                <v-flex lg11>
                    <v-textarea
                        :loading="fetching !== ''"
                        :value="typeof fetchResult === 'object' ? JSON.stringify(fetchResult) : fetchResult"
                        class="scrollbar-thin"
                        hide-details
                        readonly
                        rows="10"
                        solo
                    ></v-textarea>
                </v-flex>
            </v-layout>
        </transition-group>
    </v-form>
</template>

<script>
export default {
    props: ['step', 'validation', 'requireRule', 'fetchSource', 'fetching', 'fetchResult'],
    data: () => ({
        addHeaderDialog: false,
        headerKey: '',
        headerValue: ''
    }),
    computed: {
        formValidation: {
            get() {
                return this.validation;
            },
            set(value) {
                this.$emit('modifyValidation', value);
            }
        }
    },
    methods: {
        urlRule: v => /http(s)?:\/\/([\w-]+\.)+[\w-]+(\/[\w- ./?%&=]*)?/.test(v) || '请输入合法的链接',
        headerRule(v) {
            return !this.step.headers.hasOwnProperty(v) || '已添加该属性';
        },
        addHeader() {
            if (this.$refs.header.validate()) {
                this.$set(this.step.headers, this.headerKey, this.headerValue);
                this.close();
            }
        },
        close() {
            this.addHeaderDialog = false;
            this.$refs.header.reset();
        },
        validate() {
            return this.$refs.form.validate();
        },
        reset() {
            this.step.url = '';
            this.step.method = 'get';
            this.step.timeout = 30;
            this.step.headers = {};
            this.step.body = '';
            this.$nextTick(() => {
                this.$refs.form.resetValidation();
            });
        }
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
.scrollbar-thin /deep/ textarea {
    scrollbar-width: thin;
    scrollbar-color: rgb(94, 94, 94) transparent;
}
</style>

<template>
    <v-layout class="px-5" column>
        <v-toolbar flat>
            <v-toolbar-title>自定义按钮</v-toolbar-title>
            <v-spacer></v-spacer>
            <v-dialog :width="isDeleted ? 300 : 'auto'" content-class="grey darken-4 scrollbar-thin" v-model="dialog">
                <v-btn class="mb-2" color="primary" dark slot="activator">
                    <v-icon left>add</v-icon>添加
                </v-btn>
                <v-card class="grey darken-4">
                    <v-card-title v-if="!isDeleted">
                        <span class="headline">{{ formTitle }}</span>
                    </v-card-title>
                    <v-card-text v-if="!isDeleted">
                        <v-form lazy-validation ref="form" v-model="isCompleted">
                            <v-layout class="mb-4">
                                <v-flex align-self-center lg2>
                                    <v-subheader>启用</v-subheader>
                                </v-flex>
                                <v-flex align-self-center lg10>
                                    <v-switch class="mt-0 pt-0" color="blue" hide-details v-model="editedItem.active"></v-switch>
                                </v-flex>
                            </v-layout>
                            <v-layout>
                                <v-flex lg2>
                                    <v-subheader>名称</v-subheader>
                                </v-flex>
                                <v-flex lg10>
                                    <v-text-field :rules="[requireRules]" placeholder="请输入名称" solo v-model="editedItem.name"></v-text-field>
                                </v-flex>
                            </v-layout>
                            <v-layout>
                                <v-flex lg2>
                                    <v-subheader>图标</v-subheader>
                                </v-flex>
                                <v-flex lg10>
                                    <v-text-field
                                        :rules="[requireRules, isMDIcon]"
                                        placeholder="请输入图标"
                                        solo
                                        v-model="editedItem.icon"
                                        validate-on-blur
                                    ></v-text-field>
                                </v-flex>
                            </v-layout>
                            <v-layout>
                                <v-flex lg2>
                                    <v-subheader>应用范围</v-subheader>
                                </v-flex>
                                <v-flex lg10>
                                    <v-select :items="feeds" multiple placeholder="请选择应用范围" solo v-model="editedItem.feedIds"></v-select>
                                </v-flex>
                            </v-layout>
                            <v-layout>
                                <v-flex lg2>
                                    <v-subheader>脚本</v-subheader>
                                </v-flex>
                                <v-flex lg10>
                                    <v-fade-transition :duration="200" mode="out-in">
                                        <codemirror :options="options" v-if="showScriptEditor" v-model="editedItem.script"></codemirror>
                                        <v-layout align-center justify-center style="height: 300px;" v-else>
                                            <v-progress-circular :size="50" color="blue" indeterminate></v-progress-circular>
                                        </v-layout>
                                    </v-fade-transition>
                                </v-flex>
                            </v-layout>
                        </v-form>
                    </v-card-text>
                    <v-card-text class="my-4" v-else>{{`是否删除自定义按钮${editedItem.name}？`}}</v-card-text>
                    <v-card-actions>
                        <v-spacer></v-spacer>
                        <v-btn :disabled="!isCompleted" @click="save" color="blue">保存</v-btn>
                        <v-btn @click="close" color="secondary">取消</v-btn>
                    </v-card-actions>
                </v-card>
            </v-dialog>
        </v-toolbar>
        <v-data-table :headers="headers" :items="buttons" :rows-per-page-items="[10]" class="layout-fixed" no-data-text="无任何按钮">
            <template slot="items" slot-scope="props">
                <td class="text-lg-center d-flex justify-center">
                    <v-switch
                        :input-value="props.item.active"
                        @change="activeChanged($event, props.item)"
                        class="mt-0 pt-0 align-self-center"
                        color="blue"
                        hide-details
                        style="flex: unset !important;"
                    ></v-switch>
                </td>
                <td class="text-lg-center">
                    <v-icon v-text="props.item.icon"></v-icon>
                </td>
                <td class="text-lg-center">{{ props.item.name }}</td>
                <td
                    class="text-lg-center"
                    style="white-space: nowrap; word-break: break-all; text-overflow: ellipsis; overflow: hidden;"
                >{{ props.item.feedIds.length > 0 ? props.item.feedIds.map(id => $store.getters.getFeed(id).name).toString().replace(/(\[|\])/, '') : '无' }}</td>
                <td class="text-lg-center">
                    <v-btn @click="editItem(props.item)" icon small>
                        <v-icon small>edit</v-icon>
                    </v-btn>
                    <v-btn @click="deleteItem(props.item)" icon small>
                        <v-icon small>delete</v-icon>
                    </v-btn>
                </td>
            </template>
        </v-data-table>
    </v-layout>
</template>

<script>
import { codemirror } from 'vue-codemirror';
import 'codemirror/mode/javascript/javascript';
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/darcula.css';
import 'codemirror/addon/selection/active-line';
import 'codemirror/addon/scroll/simplescrollbars';
import 'codemirror/addon/scroll/simplescrollbars.css';
import iconList from '~/utils/extension/icon-list';

export default {
    data: () => ({
        dialog: false,
        headers: [
            { text: '启用', value: 'active', sortable: false, align: 'center' },
            { text: '图标', value: 'icon', sortable: false, align: 'center' },
            { text: '名称', value: 'name', sortable: false, align: 'center' },
            { text: '应用范围', value: 'feedIds', sortable: false, align: 'center' },
            { text: '操作', sortable: false, align: 'center' }
        ],
        buttons: [],
        isDeleted: false,
        isCompleted: true,
        editedId: '',
        showScriptEditor: false,
        editedItem: {
            active: true,
            name: '',
            icon: '',
            feedIds: [],
            script: '',
        },
        options: {
            mode: 'javascript',
            lineNumbers: true,
            theme: 'darcula',
            indentUnit: 4,
            lineWrapping: true,
            styleActiveLine: true,
            scrollbarStyle: 'overlay'
        },
        requireRules: v => !!v || '必填',
        isMDIcon: v => iconList.indexOf(v) > -1 || '非正确的 Material Icons 字符串'
    }),
    computed: {
        formTitle() {
            return this.editedId === '' ? '添加' : `${this.isDeleted ? '删除' : '编辑'}按钮${this.editedItem.name}`;
        },
        feeds() {
            return this.$store.state.groups.reduce((feeds, group) => feeds.concat(group.feeds), []).map(feed => ({ text: feed.name, value: feed.id }));
        }
    },
    watch: {
        dialog(val) {
            val || this.close();
            setTimeout(() => this.showScriptEditor = val, 200);
        }
    },
    created() {
        this.buttons = this.$store.state.buttons;
    },
    methods: {
        editItem(item) {
            this.editedId = item.id;
            this.editedItem = JSON.parse(JSON.stringify(item));
            this.dialog = true;
        },
        deleteItem(item) {
            this.isDeleted = true;
            this.editedId = item.id;
            this.editedItem = JSON.parse(JSON.stringify(item));
            this.dialog = true;
        },
        close() {
            this.dialog = false;
            this.$refs.form && this.$refs.form.reset();
            this.$nextTick(() => {
                this.editedItem = {
                    active: true,
                    name: '',
                    icon: '',
                    feedIds: [],
                    script: '',
                };
                setTimeout(() => this.isDeleted = false, 200);
                this.editedId = '';
            });
        },
        async save() {
            if (this.isDeleted) {
                await this.$store.dispatch('deleteButton', Object.assign({ id: this.editedId }, this.editedItem));
                this.close();
            } else {
                this.$refs.form && this.$refs.form.validate();
                this.$nextTick(async () => {
                    if (this.isCompleted) {
                        if (this.editedId !== '') {
                            await this.$store.dispatch('updateButton', Object.assign({ id: this.editedId }, this.editedItem));
                        } else {
                            await this.$store.dispatch('addButton', Object.assign({ id: Date.now().toString() }, this.editedItem));
                        }
                        this.close();
                    }
                });
            }
        },
        async activeChanged(e, item) {
            console.log(e, item.active);
            // await this.$store.dispatch('updateButton', Object.assign({ active: this.editedId }, item));
        }
    },
    components: {
        codemirror
    }
};
</script>

<style lang="scss" scoped>
.layout-fixed /deep/ table {
    table-layout: fixed;
}
</style>

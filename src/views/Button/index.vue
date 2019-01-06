<template>
    <v-layout class="px-5" column>
        <v-toolbar flat>
            <v-toolbar-title>自定义按钮</v-toolbar-title>
            <v-spacer></v-spacer>
            <v-dialog content-class="grey darken-4 scrollbar-thin" v-model="dialog">
                <v-btn class="mb-2" color="primary" dark slot="activator">
                    <v-icon left>add</v-icon>添加
                </v-btn>
                <v-card class="grey darken-4">
                    <v-card-title>
                        <span class="headline">{{ formTitle }}</span>
                    </v-card-title>

                    <v-card-text>
                        <v-layout>
                            <v-flex lg2>
                                <v-subheader>名称</v-subheader>
                            </v-flex>
                            <v-flex lg10>
                                <v-text-field placeholder="请输入名称" solo v-model="editedItem.name"></v-text-field>
                            </v-flex>
                        </v-layout>
                        <v-layout>
                            <v-flex lg2>
                                <v-subheader>图标</v-subheader>
                            </v-flex>
                            <v-flex lg10>
                                <v-text-field placeholder="请输入图标" solo v-model="editedItem.icon"></v-text-field>
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
                                <codemirror :options="options" v-model="editedItem.script"></codemirror>
                            </v-flex>
                        </v-layout>
                    </v-card-text>

                    <v-card-actions>
                        <v-spacer></v-spacer>
                        <v-btn @click="save" color="blue">保存</v-btn>
                        <v-btn @click="close" color="secondary">取消</v-btn>
                    </v-card-actions>
                </v-card>
            </v-dialog>
        </v-toolbar>
        <v-data-table :headers="headers" :items="buttons" :rows-per-page-items="[10]" class="layout-fixed">
            <template slot="items" slot-scope="props">
                <td>{{ props.item.icon }}</td>
                <td>{{ props.item.name }}</td>
                <td style="white-space: nowrap; word-break: break-all; text-overflow: ellipsis;">{{ props.item.feedIds }}</td>
                <td class="text-lg-center">
                    <v-btn @click="editItem(props.item)" icon small>
                        <v-icon small>edit</v-icon>
                    </v-btn>
                    <v-btn @click="deleteItem(props.item)" icon small>
                        <v-icon small>delete</v-icon>
                    </v-btn>
                </td>
            </template>
            <template slot="no-data">
                <v-btn @click="initialize" color="primary">Reset</v-btn>
            </template>
        </v-data-table>
    </v-layout>
</template>

<script>
import { codemirror } from 'vue-codemirror';
import 'codemirror/mode/javascript/javascript.js';
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/darcula.css';
import 'codemirror/addon/selection/active-line';

export default {
    data: () => ({
        dialog: false,
        headers: [
            { text: '图标', value: 'icon', sortable: false, },
            { text: '名称', value: 'name', sortable: false },
            { text: '应用范围', value: 'feedIds', sortable: false },
            { text: '操作', sortable: false, align: 'center' }
        ],
        buttons: [],
        editedIndex: -1,
        editedItem: {
            name: '',
            icon: '',
            feedIds: [],
            script: '',
        },
        defaultItem: {
            name: '',
            calories: 0,
            fat: 0,
            carbs: 0,
            protein: 0
        },
        options: {
            mode: 'javascript',
            lineNumbers: true,
            theme: 'darcula',
            indentUnit: 4,
            lineWrapping: true,
            styleActiveLine: true,
        }
    }),

    computed: {
        formTitle() {
            return this.editedIndex === -1 ? 'New Item' : 'Edit Item';
        },
        feeds() {
            return this.$store.state.groups.reduce((feeds, group) => feeds.concat(group.feeds), []).map(feed => ({ text: feed.name, value: feed.id }));
        }
    },

    watch: {
        dialog(val) {
            val || this.close();
        }
    },

    created() {
        this.initialize();
    },

    methods: {
        initialize() {
            this.buttons = [
                {
                    icon: 'asd',
                    name: 'test',
                    feedIds: [],
                    script: ''
                }
            ];
        },

        editItem(item) {
            this.editedIndex = this.desserts.indexOf(item)
            this.editedItem = Object.assign({}, item)
            this.dialog = true
        },

        deleteItem(item) {
            const index = this.desserts.indexOf(item)
            confirm('Are you sure you want to delete this item?') && this.desserts.splice(index, 1)
        },

        close() {
            this.dialog = false
            setTimeout(() => {
                this.editedItem = Object.assign({}, this.defaultItem)
                this.editedIndex = -1
            }, 300)
        },

        save() {
            if (this.editedIndex > -1) {
                Object.assign(this.desserts[this.editedIndex], this.editedItem)
            } else {
                this.desserts.push(this.editedItem)
            }
            this.close()
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

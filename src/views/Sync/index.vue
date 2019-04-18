<template>
    <v-layout class="px-5" column>
        <v-layout class="mb-4">
            <v-flex align-self-center lg2>
                <v-subheader>自动同步</v-subheader>
            </v-flex>
            <v-flex align-self-center lg10>
                <v-switch @change="toggleAutoSync" class="mt-0 pt-0" color="blue" hide-details v-model="isAutoSync"></v-switch>
            </v-flex>
        </v-layout>
        <v-layout>
            <v-flex lg2>
                <v-subheader>同步频率</v-subheader>
            </v-flex>
            <v-flex lg4>
                <v-select
                    :items="[{ text: '每小时', value: 'hourly' }, { text: '每天', value: 'daily' }, { text: '每周', value: 'weekly' }]"
                    @input="changeAutoSyncFrequency"
                    required
                    solo
                    v-model="frequency"
                ></v-select>
            </v-flex>
            <v-spacer></v-spacer>
            <v-flex lg5>
                <v-btn :disabled="synchronizing" :loading="synchronizing" @click="synchronize" color="blue">立即同步</v-btn>
            </v-flex>
        </v-layout>
        <v-layout>
            <v-flex lg2>
                <v-subheader>仓库链接</v-subheader>
            </v-flex>
            <v-flex lg10>
                <v-text-field @change="updateSetting" prefix="https://github.com/" solo v-model="link"></v-text-field>
            </v-flex>
        </v-layout>
        <v-layout>
            <v-flex lg2>
                <v-subheader>token</v-subheader>
            </v-flex>
            <v-flex lg10>
                <v-text-field @change="updateSetting" solo v-model="token"></v-text-field>
            </v-flex>
        </v-layout>
        <v-layout>
            <v-flex lg2>
                <v-subheader>上次同步记录</v-subheader>
            </v-flex>
            <v-flex align-self-center lg10 v-if="last.time > -1">
                <v-icon :color="last.success ? 'success' : 'error'" class="mr-1" style="vertical-align: middle;">{{last.success ? 'done' : 'clear'}}</v-icon>
                {{`于${timeFormatter(last.time)}同步${last.success ? '成功' : `失败${last.successTime > -1 ? `（最近一次于${timeFormatter(last.successTime)}同步成功）` : ''}：`}${last.success ? '' : last.message}`}}
            </v-flex>
            <v-flex align-self-center lg10 v-else>暂无同步记录</v-flex>
        </v-layout>
    </v-layout>
</template>

<script>
import message from '~/utils/extension/message';

export default {
    data: () => ({
        link: '',
        token: '',
        isAutoSync: false,
        frequency: 'daily',
        synchronizing: false
    }),
    async created() {
        let { synchronization } = await browser.storage.local.get('synchronization');
        if (synchronization) {
            this.link = synchronization.link;
            this.token = synchronization.token;
            this.isAutoSync = synchronization.isAutoSync;
            this.frequency = synchronization.frequency;
        }
    },
    computed: {
        last() {
            return this.$store.state.last;
        }
    },
    methods: {
        timeFormatter(timeString) {
            let time = new Date(timeString);
            return `${time.getFullYear()}/${time.getMonth() + 1}/${time.getDate()} ${('0' + time.getHours()).substr(-2)}:${('0' + time.getMinutes()).substr(-2)}`;
        },
        async synchronize() {
            this.synchronizing = true;
            await this.updateSetting();
            await message.synchronize();
            await this.$store.dispatch('updateLast');
            this.synchronizing = false;
        },
        async toggleAutoSync() {
            await this.updateSetting();
            message.changeAutoSync(this.isAutoSync);
        },
        async changeAutoSyncFrequency() {
            await this.updateSetting();
            message.changeAutoSyncFrequency();
        },
        async updateSetting() {
            let synchronization = {
                isAutoSync: this.isAutoSync,
                frequency: this.frequency,
                link: this.link,
                token: this.token,
            };
            await browser.storage.local.set({ synchronization });
        }
    }
};
</script>

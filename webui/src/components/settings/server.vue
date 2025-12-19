<script setup>
import { onMounted, reactive } from 'vue';
import { useSettingsStore } from '@/stores/settings';

const settingsStore = useSettingsStore();

// 表单数据
const formData = reactive({
    port: 5173,
    authToken: '',
    keepaliveMode: 'comment',
    queueBuffer: 2,
    imageLimit: 5
});

onMounted(async () => {
    await settingsStore.fetchServerConfig();
    Object.assign(formData, settingsStore.serverConfig);
});

// 保存设置
const handleSave = async () => {
    await settingsStore.saveServerConfig(formData);
};
</script>

<template>
    <a-layout style="background: transparent;">
        <a-card title="服务器设置" :bordered="false" style="width: 100%;">
            <!-- 4宫格表单布局 -->
            <a-row :gutter="[16, 16]">
                <!-- 监听端口 -->
                <a-col :xs="24" :md="12">
                    <div style="margin-bottom: 8px;">
                        <div style="font-weight: 600; margin-bottom: 4px;">监听端口</div>
                        <div style="font-size: 12px; color: #8c8c8c; margin-bottom: 8px;">
                            设置服务器监听的端口号，默认为 5173
                        </div>
                        <a-input-number v-model:value="formData.port" :min="1" :max="65535" placeholder="请输入端口号"
                            style="width: 100%" />
                    </div>
                </a-col>

                <!-- 鉴权 Token -->
                <a-col :xs="24" :md="12">
                    <div style="margin-bottom: 8px;">
                        <div style="font-weight: 600; margin-bottom: 4px;">鉴权 Token</div>
                        <div style="font-size: 12px; color: #8c8c8c; margin-bottom: 8px;">
                            用于 API 请求鉴权的密钥，留空则不启用鉴权
                        </div>
                        <a-input-password v-model:value="formData.authToken" placeholder="请输入 Token" type="password" />
                    </div>
                </a-col>

                <!-- 心跳包类型 (Keepalive Mode) -->
                <a-col :xs="24" :md="12">
                    <div style="margin-bottom: 8px;">
                        <div style="font-weight: 600; margin-bottom: 4px;">心跳包类型</div>
                        <div style="font-size: 12px; color: #8c8c8c; margin-bottom: 8px;">
                            选择 SSE 流式响应的心跳包格式
                        </div>
                        <a-select v-model:value="formData.keepaliveMode" style="width: 100%" placeholder="请选择心跳包类型">
                            <a-select-option value="comment">Comment - 注释格式</a-select-option>
                            <a-select-option value="content">Content - 内容格式</a-select-option>
                        </a-select>
                    </div>
                </a-col>
            </a-row>

            <!-- 保存按钮（右下角） -->
            <div style="display: flex; justify-content: flex-end; margin-top: 24px;">
                <a-button type="primary" @click="handleSave">
                    保存设置
                </a-button>
            </div>
        </a-card>

        <!-- 队列设置 -->
        <a-card title="队列设置" :bordered="false" style="width: 100%; margin-top: 10px;">
            <a-row :gutter="[16, 16]">
                <!-- 队列缓冲区大小 -->
                <a-col :xs="24" :md="12">
                    <div style="margin-bottom: 8px;">
                        <div style="font-weight: 600; margin-bottom: 4px;">队列缓冲区大小</div>
                        <div style="font-size: 12px; color: #8c8c8c; margin-bottom: 8px;">
                            非流式请求的额外排队数（设为 0 则不限制非流式请求数量）<br>
                            实际队列上限 = Workers数量 + 缓冲区大小
                        </div>
                        <a-input-number v-model:value="formData.queueBuffer" :min="0" :max="100" placeholder="默认为 2"
                            style="width: 100%" />
                    </div>
                </a-col>

                <!-- 图片数量上限 -->
                <a-col :xs="24" :md="12">
                    <div style="margin-bottom: 8px;">
                        <div style="font-weight: 600; margin-bottom: 4px;">图片数量上限</div>
                        <div style="font-size: 12px; color: #8c8c8c; margin-bottom: 8px;">
                            单次请求最多支持的图片附件数量<br>
                            网页最多支持10个附件，超出会被丢弃
                        </div>
                        <a-input-number v-model:value="formData.imageLimit" :min="1" :max="10" placeholder="默认为 5"
                            style="width: 100%" />
                    </div>
                </a-col>
            </a-row>

            <!-- 保存按钮（右下角） -->
            <div style="display: flex; justify-content: flex-end; margin-top: 24px;">
                <a-button type="primary" @click="handleSave">
                    保存设置
                </a-button>
            </div>
        </a-card>
    </a-layout>
</template>

<style scoped>
/* 确保在手机端也能正常显示 */
.ant-input-number {
    width: 100%;
}
</style>
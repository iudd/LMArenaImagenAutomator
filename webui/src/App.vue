<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { Modal } from 'ant-design-vue';
import {
  DashboardOutlined,
  SettingOutlined,
  ToolOutlined,
  PoweroffOutlined,
  GithubOutlined
} from '@ant-design/icons-vue';
import { useSettingsStore } from '@/stores/settings';
import LoginModal from '@/components/auth/LoginModal.vue';

const router = useRouter();
const settingsStore = useSettingsStore();

const selectedKeys = ref(['dash']);
const collapsed = ref(false);
const loginVisible = ref(false);

const iconLoading = ref(false);
const enterIconLoading = () => {
  iconLoading.value = true;
  settingsStore.setToken('');
  setTimeout(() => {
    iconLoading.value = false;
    loginVisible.value = true;
  }, 500);
};

// 菜单 key 到路由路径的映射
const menuRoutes = {
  'dash': '/',
  'settings-server': '/settings/server',
  'settings-workers': '/settings/workers',
  'settings-browser': '/settings/browser',
  'settings-adapters': '/settings/adapters',
  'tools-display': '/tools/display',
  'tools-cache': '/tools/cache'
};

// 处理菜单点击
const handleMenuClick = ({ key }) => {
  const route = menuRoutes[key];
  if (route) {
    router.push(route);
  }
};

const isInitializing = ref(true);

// 后端连接检测
let connectionCheckInterval = null;
let disconnectModalShown = false;

async function checkConnection() {
  try {
    const res = await fetch('/admin/status', {
      headers: settingsStore.getHeaders(),
      signal: AbortSignal.timeout(5000)
    });
    if (res.ok && disconnectModalShown) {
      // 连接恢复，刷新页面
      disconnectModalShown = false;
      Modal.destroyAll();
      window.location.reload();
    }
  } catch (e) {
    if (!disconnectModalShown && !isInitializing.value) {
      disconnectModalShown = true;
      Modal.warning({
        title: '后端连接断开',
        content: '无法连接到后端服务，请检查服务是否正在运行。连接恢复后页面将自动刷新。',
        okText: '我知道了',
        centered: true
      });
    }
  }
}

// 挂载时检查身份验证
onMounted(async () => {
  // 响应式侧边栏
  const checkScreenSize = () => {
    if (window.innerWidth <= 768) {
      collapsed.value = true;
    }
  };
  checkScreenSize();
  window.addEventListener('resize', checkScreenSize);

  // 身份验证
  try {
    if (!settingsStore.token) {
      loginVisible.value = true;
    } else {
      // 使用真实API验证
      const isValid = await settingsStore.checkAuth();
      if (!isValid) {
        settingsStore.setToken(''); // 清除无效token
        loginVisible.value = true;
      }
    }
  } catch (e) {
    console.error('Auth check failed', e);
    loginVisible.value = true;
  } finally {
    // 隐藏加载状态
    isInitializing.value = false;
  }

  // 启动后端连接检测（每 5 秒检测一次）
  connectionCheckInterval = setInterval(checkConnection, 5000);

  // 清理监听器
  onUnmounted(() => {
    window.removeEventListener('resize', checkScreenSize);
    if (connectionCheckInterval) {
      clearInterval(connectionCheckInterval);
    }
  });
});
</script>

<template>
  <a-spin :spinning="isInitializing" tip="正在验证身份..." size="large"
    style="height: 100vh; display: flex; align-items: center; justify-content: center;" v-if="isInitializing" />
  <div v-else>
    <LoginModal v-model:visible="loginVisible" />
    <a-layout style="min-height: 100vh" theme="light">
      <a-layout-header class="header"
        style="background: rgba(255, 255, 255, 0.7); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); border-bottom: 1.5px solid rgba(0, 0, 0, 0.05); display: flex; align-items: center; padding: 0 24px; position: fixed; width: 100%; top: 0; z-index: 1000;">
        <div class="logo" style="font-size: 1.25rem; font-weight: bold; color: #1890ff; margin-right: 24px;">
          WebAI2API
        </div>
        <a-flex justify="end" align="center" style="flex: 1;">
          <a-button danger :loading="iconLoading" @click="enterIconLoading">
            <template #icon>
              <PoweroffOutlined />
            </template>
            退出登录
          </a-button>
        </a-flex>
      </a-layout-header>
      <a-layout style="margin-top: 64px;">
        <a-layout-sider v-model:collapsed="collapsed" collapsible theme="light"
          style="position: fixed; left: 0; top: 64px; height: calc(100vh - 64px); overflow-y: auto; z-index: 100;">
          <a-menu v-model:selectedKeys="selectedKeys" mode="inline" @click="handleMenuClick">
            <a-menu-item key="dash">
              <DashboardOutlined />
              <span>状态概览</span>
            </a-menu-item>
            <a-sub-menu key="settings">
              <template #title>
                <span>
                  <SettingOutlined />
                  <span>系统设置</span>
                </span>
              </template>
              <a-menu-item key="settings-server">服务器</a-menu-item>
              <a-menu-item key="settings-workers">工作池</a-menu-item>
              <a-menu-item key="settings-browser">浏览器</a-menu-item>
              <a-menu-item key="settings-adapters">适配器</a-menu-item>
            </a-sub-menu>
            <a-sub-menu key="tools">
              <template #title>
                <span>
                  <ToolOutlined />
                  <span>系统管理</span>
                </span>
              </template>
              <a-menu-item key="tools-display">虚拟显示器</a-menu-item>
              <a-menu-item key="tools-cache">缓存与重启</a-menu-item>
            </a-sub-menu>
          </a-menu>
        </a-layout-sider>
        <a-layout
          :style="{ marginLeft: collapsed ? '80px' : '200px', padding: '16px', transition: 'margin-left 0.2s' }">
          <a-layout-content style="min-height: 280px">
            <router-view />
          </a-layout-content>
          <a-layout-footer class="footer" style="padding: 0px; margin-top: 10px;">
            <a-card :bordered="false"
              :bodyStyle="{ padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }">
              <div>
                <a href="https://github.com/foxhui/WebAI2API" target="_blank" style="color: #8c8c8c; font-size: 20px;">
                  <GithubOutlined />
                </a>
              </div>
            </a-card>
          </a-layout-footer>
        </a-layout>
      </a-layout>
    </a-layout>
  </div>
</template>

<style scoped>
/* 滚动条美化 */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-thumb {
  background: #ccc;
  border-radius: 3px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
}
</style>

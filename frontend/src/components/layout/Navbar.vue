<script setup lang="ts">
/** 顶部导航：折叠按钮 + 面包屑 + 系统首页 + 暗黑切换 + 用户下拉。 */
import { Expand, Fold, House, Moon, Sunny } from "@element-plus/icons-vue";
import { ElMessageBox } from "element-plus";

import { useAppStore } from "@/stores/app";
import { useAuthStore } from "@/stores/auth";

const app = useAppStore();
const auth = useAuthStore();
const router = useRouter();
const route = useRoute();

const breadcrumbs = computed(() => {
  // 使用 matched 列表，过滤 hidden + 顶层根
  return route.matched
    .filter((m) => m.meta?.title && !(m.path === "/"))
    .map((m) => ({
      title: m.meta?.title as string,
      path: m.path,
    }));
});

async function logout() {
  await ElMessageBox.confirm("确认退出登录？", "提示", {
    confirmButtonText: "退出",
    cancelButtonText: "取消",
    type: "warning",
  }).catch(() => null);
  await auth.logout();
  router.replace("/login");
}

function goProfile() {
  router.push("/profile");
}

function goHome() {
  router.push("/");
}
</script>

<template>
  <header class="navbar">
    <!-- 左：折叠 + 面包屑 -->
    <div class="left">
      <button class="icon-btn" @click="app.toggleSidebar()" :title="app.sidebarCollapsed ? '展开' : '收起'">
        <el-icon :size="18">
          <component :is="app.sidebarCollapsed ? Expand : Fold" />
        </el-icon>
      </button>
      <el-breadcrumb separator="/" class="bc">
        <el-breadcrumb-item v-for="(b, i) in breadcrumbs" :key="b.path">
          <span :class="['bc-item', i === breadcrumbs.length - 1 && 'is-current']">
            {{ b.title }}
          </span>
        </el-breadcrumb-item>
      </el-breadcrumb>
    </div>

    <!-- 右：系统首页 + 暗黑切换 + 用户 -->
    <div class="right">
      <button class="home-btn" @click="goHome" title="返回系统首页">
        <el-icon :size="17"><House /></el-icon>
        <span>系统首页</span>
      </button>

      <button class="icon-btn" @click="app.toggleDark()" :title="app.dark ? '切换明亮' : '切换暗黑'">
        <el-icon :size="18">
          <component :is="app.dark ? Sunny : Moon" />
        </el-icon>
      </button>

      <el-dropdown trigger="click">
        <div class="user">
          <div class="avatar">
            {{ (auth.user?.name || auth.user?.username || "?").slice(0, 1) }}
          </div>
          <div class="user-meta">
            <div class="name">{{ auth.user?.name || auth.user?.username }}</div>
            <div class="role">{{ auth.user?.role }}</div>
          </div>
        </div>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item @click="goProfile">个人中心</el-dropdown-item>
            <el-dropdown-item divided @click="logout">退出登录</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </header>
</template>

<style scoped>
.navbar {
  height: 56px;
  background: var(--swu-bg-elev);
  border-bottom: 1px solid var(--swu-border);
  display: flex; align-items: center; justify-content: space-between;
  padding: 0 16px;
  flex-shrink: 0;
}
.left, .right { display: flex; align-items: center; gap: 12px; }

.icon-btn {
  width: 36px; height: 36px;
  display: inline-flex; align-items: center; justify-content: center;
  border: none; background: transparent;
  color: var(--swu-text-2);
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.15s ease, color 0.15s ease;
}
.icon-btn:hover { background: var(--swu-divider); color: var(--swu-blue); }

.home-btn {
  height: 34px;
  display: inline-flex; align-items: center; gap: 6px;
  padding: 0 11px;
  border: 1px solid var(--swu-border);
  background: var(--swu-bg-elev);
  color: var(--swu-text-2);
  border-radius: 9px;
  cursor: pointer;
  font-size: 13px;
  white-space: nowrap;
  transition: border-color 0.15s ease, background 0.15s ease, color 0.15s ease;
}
.home-btn:hover {
  border-color: var(--swu-blue);
  background: var(--swu-divider);
  color: var(--swu-blue);
}

.bc { user-select: none; }
.bc-item { color: var(--swu-text-2); font-size: 14px; }
.bc-item.is-current { color: var(--swu-text); font-weight: 500; }

.user {
  display: flex; align-items: center; gap: 10px;
  padding: 4px 10px 4px 4px;
  border-radius: 999px;
  cursor: pointer;
  transition: background 0.15s ease;
}
.user:hover { background: var(--swu-divider); }

.avatar {
  width: 32px; height: 32px;
  display: inline-flex; align-items: center; justify-content: center;
  background: linear-gradient(135deg, #003D7A, #1565C0);
  color: #fff;
  border-radius: 50%;
  font-weight: 600;
  font-size: 14px;
  letter-spacing: 0.02em;
}
.user-meta { line-height: 1.2; text-align: left; }
.name { font-size: 13px; color: var(--swu-text); font-weight: 500; }
.role { font-size: 11px; color: var(--swu-text-3); margin-top: 2px; letter-spacing: 0.04em; }

@media (max-width: 640px) {
  .user-meta { display: none; }
  .bc { display: none; }
  .home-btn { width: 36px; padding: 0; justify-content: center; }
  .home-btn span { display: none; }
}
</style>

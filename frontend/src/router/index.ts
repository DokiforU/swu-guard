import NProgress from "nprogress";
import "nprogress/nprogress.css";
import { createRouter, createWebHistory } from "vue-router";

import { useAuthStore } from "@/stores/auth";
import { routes } from "./routes";

NProgress.configure({ showSpinner: false, trickleSpeed: 100, minimum: 0.18 });

const router = createRouter({
  history: createWebHistory("/"),
  routes,
  scrollBehavior() {
    return { left: 0, top: 0 };
  },
});

router.beforeEach(async (to) => {
  NProgress.start();
  const auth = useAuthStore();

  // 标题
  const title = (to.meta?.title as string) ?? "";
  document.title = title ? `${title} · 西小卫` : "西小卫";

  // 受保护路由
  if (to.meta?.requiresAuth && !auth.isLoggedIn) {
    return {
      path: "/login",
      query: { redirect: to.fullPath },
    };
  }

  // 已登录但未拉到 user：补一次（刷新页面后场景）
  if (auth.isLoggedIn && !auth.user) {
    await auth.fetchMe();
    if (!auth.user) {
      // token 失效
      return { path: "/login", query: { redirect: to.fullPath } };
    }
  }

  // 角色守卫：meta.roles 不为空时必须命中
  const requiredRoles = (to.meta?.roles as string[] | undefined) ?? null;
  if (requiredRoles && auth.user && !requiredRoles.includes(auth.user.role)) {
    // 门卫访问无权页面 → 跳回仪表盘（也是其首页）
    return { path: "/dashboard" };
  }

  return true;
});

router.afterEach(() => {
  NProgress.done();
});

export default router;


import { createRouter, createWebHashHistory, RouteRecordRaw } from "vue-router";

const routes: Array<RouteRecordRaw> = [
  {
    path: "/platform",
    name: "Platform",
    component: () => import("../layout/index.vue"),
    meta: { title: "雨水", requireAuth: true },
    children: [
      {
        path: "/",
        name: "Home",
        component: () => import("../views/home/index.vue"),
        meta: { title: "首页", requireAuth: true },
      },
      {
        path: "/library/:page/:breadcrumbs*",
        name: "Library",
        component: () => import("../views/library/index.vue"),
        meta: { title: "库", requireAuth: true },
      },
      {
        path: "/edit",
        name: "Edit",
        component: () => import("../views/edit/index.vue"),
        meta: { title: "编辑", requireAuth: true },
      },
      {
        path: "/dev/:code",
        name: "Dev",
        component: () => import("../views/dev/index.vue"),
        meta: { title: "开发者模式", requireAuth: true },
      },
      {
        path: "/test",
        name: "Test",
        component: () => import("../views/test/index.vue"),
        meta: { title: "Test", requireAuth: true },
      },
    ]
  },
  {
    path: "/login",
    name: "Login",
    component: () => import("../views/login/index.vue"),
    meta: { title: "登录", requireAuth: true },
  },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes: routes,
});

export default router;
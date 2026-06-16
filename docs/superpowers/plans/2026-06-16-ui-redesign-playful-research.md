# PaperParams 前端 UI 改版实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将 PaperParams 前端从当前的素净风格改造成紫罗兰/珊瑚配色系统，加入 micro-interaction 动效、科研梗文案和精致细节，让用户使用时感到愉悦。

**Architecture:** 通过 CSS 自定义属性定义全局色彩 token，然后逐层改造 Layout（导航渐变）、UI 组件（按钮/卡片/弹窗/徽章）、页面空状态和文案。不改动组件结构或数据流，只改样式和文案。

**Tech Stack:** Tailwind CSS v4, React 19, shadcn/ui 组件（自定义 class overrides）

---

### Task 1: 定义全局 CSS 色彩 Token

**Files:**
- Modify: `frontend/src/index.css` 末尾追加自定义变量

- [ ] **Step 1: 在 index.css 追加主题变量**

追加到 `frontend/src/index.css` 末尾：

```css
@theme {
  --color-brand-primary: #6366F1;
  --color-brand-secondary: #8B5CF6;
  --color-brand-accent: #F472B6;
  --color-brand-coral: #FB7185;
  --color-success-light: #34D399;
  --color-warning-light: #FBBF24;
  --color-info-light: #60A5FA;
  --color-danger-light: #FB7185;
  --color-bg-subtle: #F8FAFC;
}
```

- [ ] **Step 2: 验证构建不报错**

Run:
```bash
cd frontend && npm run build
```
Expected: Build passes without errors.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/index.css
git commit -m "feat: add UI theme color tokens"
```

---

### Task 2: 改造导航侧栏 —— 紫罗兰渐变 + 交互样式

**Files:**
- Modify: `frontend/src/components/Layout.tsx`

- [ ] **Step 1: 改造侧栏背景和选中态**

找到侧栏容器（`<aside>`），将背景色改为紫罗兰渐变：

```tsx
// 侧栏容器
<aside className="fixed left-0 top-0 h-full w-60 bg-gradient-to-b from-[#6366F1] to-[#8B5CF6] flex flex-col shadow-lg">
```

找到 NavItem 组件，将 inactive 状态改为白字/半透明，active 状态改为白字 + 左侧珊瑚色光晕：

```tsx
// NavItem 组件内的 className 替换
const baseClass = "flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all duration-150 border-l-2 " +
  (isActive
    ? "text-white bg-white/15 border-l-[#F472B6] shadow-sm"
    : "text-white/70 hover:text-white hover:bg-white/10 border-l-transparent")
```

- [ ] **Step 2: 分割线颜色调整**

找到管理区域的 `<div className="border-t ...">`：

```tsx
<div className="border-t border-white/20 pt-3 mt-3">
  <div className="px-3 mb-1 text-xs font-medium text-white/50 tracking-wider">管理</div>
</div>
```

- [ ] **Step 3: 用户头像/名称区域适配**

将底部用户区域的背景改为白色/半透明层：

```tsx
<div className="border-t border-white/20 p-4">
  {/* 用户信息，text 改为 text-white/90 */}
</div>
```

- [ ] **Step 4: 验证构建**

Run:
```bash
cd frontend && npm run build
```
Expected: Pass.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/components/Layout.tsx
git commit -m "feat: redesign sidebar with gradient and coral accent"
```

---

### Task 3: 统一按钮/卡片/徽章/弹窗样式

**Files:**
- Modify: `frontend/src/components/ui/button.tsx`
- Modify: `frontend/src/components/ui/card.tsx`
- Modify: `frontend/src/components/ui/badge.tsx`
- Modify: `frontend/src/components/ui/dialog.tsx`
- Modify: `frontend/src/components/ui/sheet.tsx`

- [ ] **Step 1: 卡片 hover 动效 —— 替换 card.tsx className**

```tsx
// Card 组件的 className 末尾追加 hover 动画
"group/card flex flex-col gap-(--card-spacing) overflow-hidden rounded-xl bg-card py-(--card-spacing) text-sm text-card-foreground ring-1 ring-foreground/10 transition-all duration-150 hover:-translate-y-0.5 hover:shadow-lg [--card-spacing:--spacing(4)] ..."
```

- [ ] **Step 2: 主按钮改为品牌色 —— 修改 button.tsx default variant**

```tsx
// buttonVariants 的 default variant
default: "bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] text-white hover:from-[#4F46E5] hover:to-[#7C3AED] active:scale-[0.97] transition-all duration-150",
```

- [ ] **Step 3: secondary variant 改为珊瑚色调**

```tsx
// buttonVariants 的 secondary variant
secondary: "border-[#F472B6] bg-white text-[#F472B6] hover:bg-[#F472B6] hover:text-white active:scale-[0.97] transition-all duration-150",
```

- [ ] **Step 4: 成功/错误 Badge 使用语义色**

```tsx
// badgeVariants 增加自定义语义色，或替换 default 为 brand 色
// default: "bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] text-white",
```

- [ ] **Step 5: 弹窗遮罩加深 —— dialog.tsx**

```tsx
// DialogOverlay className
"fixed inset-0 isolate z-50 bg-black/50 duration-200 data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0",
```

- [ ] **Step 6: 验证构建**

Run:
```bash
cd frontend && npm run build
```
Expected: Pass.

- [ ] **Step 7: Commit**

```bash
git add frontend/src/components/ui/button.tsx frontend/src/components/ui/card.tsx frontend/src/components/ui/badge.tsx frontend/src/components/ui/dialog.tsx frontend/src/components/ui/sheet.tsx
git commit -m "feat: unify UI component styles with brand color system"
```

---

### Task 4: 统一各页面空状态和文案

**Files:**
- Modify: `frontend/src/pages/Templates.tsx`
- Modify: `frontend/src/pages/Papers.tsx`
- Modify: `frontend/src/pages/Dashboard.tsx`

- [ ] **Step 1: Templates 空状态文案**

替换 Templates.tsx 空状态中的文案：

```tsx
// 空状态区域
<Layers className="mx-auto mb-3 h-12 w-12 text-slate-300" />
<p className="mb-1 text-slate-500 font-medium">还没有模板呢 🧑‍🔬</p>
<p className="mb-4 text-sm text-slate-400">去建一个吧，比写论文简单多了</p>
```

- [ ] **Step 2: Papers 空状态文案**

找到 Papers.tsx 的空状态渲染位置，替换为：

```tsx
<FileText className="mx-auto mb-3 h-12 w-12 text-slate-300" />
<p className="mb-1 text-slate-500 font-medium">一篇论文都没有… 📄</p>
<p className="mb-4 text-sm text-slate-400">是时候治治你的拖延症了，上传第一篇吧</p>
```

- [ ] **Step 3: 验证构建**

Run:
```bash
cd frontend && npm run build
```
Expected: Pass.

- [ ] **Step 4: Commit**

```bash
git add frontend/src/pages/Templates.tsx frontend/src/pages/Papers.tsx frontend/src/pages/Dashboard.tsx
git commit -m "feat: add playful empty states and branding copy"
```

---

### Task 5: 各页面的 Toast/成功/错误消息使用新文案

**Files:**
- Modify: `frontend/src/pages/Templates.tsx`
- Modify: `frontend/src/pages/Papers.tsx`

- [ ] **Step 1: Templates 页成功/删除/克隆文案**

在 Templates.tsx 中找到 toast.success / toast.error 调用：

```tsx
// handleSave 成功
toast.success('模板已更新 ✅')

// handleClone 成功
toast.success('克隆成功 🧬 比 reviewer 写 review 快多了')

// handleDelete 确认框
if (!confirm(`确定删除模板「${t.name}」？删了 reviewer 也救不回来 😬`)) return

// handleDelete 成功
toast.success('已删除 🗑️ 干干净净')

// catch 错误
toast.error('翻车了 🫠 要不你再试一次？')
```

- [ ] **Step 2: 验证构建**

Run:
```bash
cd frontend && npm run build
```
Expected: Pass.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/pages/Templates.tsx
git commit -m "feat: add playful toast messages and confirm dialogs"
```

---

### Task 6: 加载状态和细节动效收尾

**Files:**
- Modify: `frontend/src/pages/Templates.tsx` (loading state)
- Modify: `frontend/src/services/api.ts` (如果统一拦截 loading)

- [ ] **Step 1: 检查各页面数据加载状态是否显示加载文案**

遍历 `frontend/src/pages/` 下所有带 loading state 的页面，确保显示加载状态时文案友好。例如：

```tsx
// 原来: <div className="p-8 text-gray-400">加载中...</div>
// 改为:
<div className="p-8 text-slate-400 text-center">
  <p className="text-sm">正在拼命解析… 咖啡已经准备好了 ☕</p>
</div>
```

- [ ] **Step 2: 验证构建**

Run:
```bash
cd frontend && npm run build
```
Expected: Pass.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/pages/Templates.tsx frontend/src/pages/Dashboard.tsx frontend/src/pages/Papers.tsx
git commit -m "feat: add loading state copy and polish"
```

---

## Spec Coverage Check

Spec requirement → Task mapping:
- 色彩系统 CSS 变量 → Task 1
- 导航渐变 → Task 2
- 按钮/卡片/弹窗统一样式 → Task 3
- 空状态文案梗 → Task 4
- 操作反馈文案梗 → Task 5
- 加载状态 → Task 6

## Notes for implementation

- Tailwind v4 使用 `@theme` 指令定义变量，如果构建失败回退到 `:root { --color-brand-primary: ... }` 传统方式。
- 全局渐变导航会与已打开的侧栏菜单（下拉菜单）的 z-index 冲突，注意检查。
- 动效部分只改 transition duration 和 transform，不额外引入 framer-motion 等库。
- 改完后需要到浏览器逐一验证：导航选中态、按钮 hover、卡片 hover、弹窗打开/关闭动画。

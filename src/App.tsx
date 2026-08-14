/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useRef, ReactNode } from "react";
import {
  Shield,
  Download,
  Smartphone,
  Monitor,
  Globe,
  Wallet,
  ChevronRight,
  ChevronDown,
  AlertCircle,
  Menu,
  X,
  CheckCircle2,
  ShieldCheck,
  ArrowDownToLine,
  UserPlus,
  Info,
  ArrowUpDown,
  Laptop,
  Apple,
  Zap,
  BarChart3,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import Markdown from "react-markdown";
import { useRouter } from "next/router";
import Head from "next/head";
import { type PageData } from "./constants";
import {
  buildPathForLocale,
  getPagesByLocale,
  localizeText,
  resolveLocaleFromPath,
  stripLocalePrefix,
  toHtmlLang,
  type Locale,
} from "./i18n";
import BackToTop from "./components/BackToTop";
import MobileStickyFooter from "./components/MobileStickyFooter";

const CANONICAL_ORIGIN = "https://chuckmcchi.github.io/okyi";
const SITE_BASE_PATH: string = "/okyi";
const stripSiteBasePath = (pathname: string) => {
  if (!SITE_BASE_PATH) return pathname;
  if (pathname === SITE_BASE_PATH) return "/";
  if (pathname.startsWith(`${SITE_BASE_PATH}/`)) {
    return pathname.slice(SITE_BASE_PATH.length) || "/";
  }
  return pathname;
};

const toCanonicalPath = (pathname: string) => {
  const normalized = pathname.replace(/\/+$/, "");
  return normalized === "" ? "/" : normalized;
};

const toLocalizedInternalHref = (href: string | undefined, locale: Locale) => {
  if (!href || /^(https?:|mailto:|tel:|#)/i.test(href)) return href;

  const match = href.match(/^([^?#]*)([?#].*)?$/);
  const pathPart = match?.[1] || href;
  const suffix = match?.[2] || "";
  if (!pathPart.startsWith("/")) return href;

  const withoutBase = stripSiteBasePath(pathPart);
  const sourceLocale = resolveLocaleFromPath(withoutBase);
  const withoutLocale = stripLocalePrefix(withoutBase, sourceLocale);
  const pageId =
    withoutLocale === "/" || withoutLocale === ""
      ? "home"
      : withoutLocale.replace(/^\/+|\/+$/g, "");

  return `${SITE_BASE_PATH}${buildPathForLocale(pageId, locale)}${suffix}`;
};

const getHeroTitleParts = (rawTitle: string) => {
  const stripTail = (text: string) =>
    text
      .replace(/(_o[^_\s]+)\s*$/u, "")
      .replace(/\s*\|\s*o[^|\s]+$/u, "")
      .trim();

  const source = stripTail(rawTitle.trim());
  let main = source;
  let sub = "";

  const dashIndex = source.indexOf(" - ");
  const cnColonIndex = source.indexOf("\uFF1A");
  const enColonIndex = source.indexOf(":");
  const splitIndex =
    dashIndex >= 0
      ? dashIndex
      : cnColonIndex >= 0
        ? cnColonIndex
        : enColonIndex >= 0
          ? enColonIndex
          : -1;

  if (splitIndex >= 0) {
    const separator =
      source.slice(splitIndex, splitIndex + 3) === " - "
        ? " - "
        : source[splitIndex];
    const [left, ...rest] = source.split(separator);
    main = (left || source).trim();
    sub = rest.join(separator).trim();
  }

  sub = sub.replace(/^\u6B27\u610FOKX\s*/u, "").trim();
  return { main, sub };
};

const BEGINNER_ARTICLE_IDS = new Set([
  "ouyi-okx-account-transfer",
  "ouyi-okx-android-download",
  "ouyi-okx-buy-first-coin",
  "ouyi-okx-c2c-safe",
  "ouyi-okx-earn-guide",
  "ouyi-okx-earn-live",
  "ouyi-okx-fee",
  "ouyi-okx-invite",
  "ouyi-okx-leverage-warning",
  "ouyi-okx-reward-guide",
  "ouyi-okx-security",
  "ouyi-okx-simulate-trade",
  "ouyi-okx-vs-ouyi",
  "ouyi-okx-web3",
  "ouyi-okx-withdraw",
]);

// --- 子组件 ---

const Breadcrumbs = ({
  currentPath,
  onNavigate,
  pages,
  compact = false,
}: {
  currentPath: string;
  onNavigate: (path: string) => void;
  pages: Record<string, PageData>;
  compact?: boolean;
}) => {
  if (currentPath === "home") return null;

  const crumbs = [];
  let temp = pages[currentPath];
  while (temp) {
    crumbs.unshift(temp);
    temp = temp.parentId ? pages[temp.parentId] : undefined;
  }

  // Ensure home is at the base
  if (crumbs[0]?.id !== "home") {
    crumbs.unshift(pages["home"]);
  }

  return (
    <nav
      className={`flex items-center gap-1 text-xs md:text-sm text-slate-400 font-bold ${compact ? "mb-6" : "mb-10"}`}
    >
      {crumbs.map((crumb, index) => (
        <React.Fragment key={crumb.id}>
          {index > 0 && (
            <ChevronRight
              size={14}
              className="mx-1 text-slate-400"
              strokeWidth={3}
            />
          )}
          <button
            onClick={() => onNavigate(crumb.id)}
            className={`hover:text-blue-600 transition-colors uppercase tracking-wider ${index === crumbs.length - 1 ? "text-slate-600 cursor-default pointer-events-none" : ""}`}
          >
            {crumb.breadcrumbName}
          </button>
        </React.Fragment>
      ))}
    </nav>
  );
};

const Navbar = ({
  onNavigate,
  onSwitchLocale,
  currentPath,
  locale,
}: {
  onNavigate: (path: string) => void;
  onSwitchLocale: (nextLocale: Locale) => void;
  currentPath: string;
  locale: Locale;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    setIsOpen(false);
    setActiveDropdown(null);
  }, [currentPath]);

  const handleMobileToggle = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsOpen((prev) => !prev);
  };

  const menuItems = [
    { label: "首页", id: "home" },
    { label: "Web网址", id: "ouyi-okx-web" },
    { label: "APP下载", id: "ouyi-okx-download" },
    { label: "PC端", id: "ouyi-okx-pc" },
    { label: "注册安装", id: "ouyi-okx-register" },
    {
      label: "常见问题",
      id: "home",
      children: [
        { label: "安卓下载", id: "ouyi-okx-android-download" },
        { label: "手续费", id: "ouyi-okx-fee" },
        { label: "账户安全", id: "ouyi-okx-security" },
        { label: "提现提币", id: "ouyi-okx-withdraw" },
        { label: "Web3钱包", id: "ouyi-okx-web3" },
        { label: "全部专题", id: "home", isDivider: true },
      ],
    },
    {
      label: "安卓",
      id: "ouyi-okx-android",
      children: [
        { label: "华为专区", id: "ouyi-okx-huawei" },
        { label: "小米专区", id: "ouyi-okx-xiaomi" },
        { label: "OPPO专区", id: "ouyi-okx-oppo" },
        { label: "一加专区", id: "ouyi-okx-oneplus" },
        { label: "真我专区", id: "ouyi-okx-realme" },
        { label: "VIVO专区", id: "ouyi-okx-vivo" },
        { label: "荣耀专区", id: "ouyi-okx-honor" },
        { label: "魅族专区", id: "ouyi-okx-meizu" },
        { label: "三星专区", id: "ouyi-okx-samsung" },
        { label: "酷派专区", id: "ouyi-okx-coolpad" },
        { label: "夸克专区", id: "ouyi-okx-quark" },
        { label: "全部机型", id: "ouyi-okx-android", isDivider: true },
      ],
    },
    { label: "华为", id: "ouyi-okx-huawei" },
    { label: "苹果", id: "ouyi-okx-ios" },
  ];
  const t = (text: string) => localizeText(text, locale);

  return (
    <nav className="fixed top-0 w-full z-50 relative overflow-visible bg-white/95 backdrop-blur-md border-b border-slate-100 h-16 sm:h-20 flex items-center">
      <div className="section-container w-full min-w-0 flex justify-between items-center gap-2">
        <div
          className="flex items-center cursor-pointer min-w-0"
          onClick={() => onNavigate("home")}
        >
          <div className="bg-slate-950 text-white p-1.5 rounded-lg mr-2 shrink-0">
            <Shield size={24} />
          </div>
          <span className="font-extrabold text-xl tracking-tight text-slate-900 truncate">
            {t("欧意交易所入口")}
          </span>
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:flex space-x-8 items-center">
          {menuItems.map((item) => (
            <div
              key={item.id}
              className="relative group"
              onMouseEnter={() => item.children && setActiveDropdown(item.id)}
              onMouseLeave={() => setActiveDropdown(null)}
            >
              <button
                onClick={() => onNavigate(item.id)}
                className={`text-[15px] font-bold transition-colors hover:text-slate-950 flex items-center gap-1 py-4 ${
                  currentPath === item.id ||
                  item.children?.some((c) => c.id === currentPath)
                    ? "text-slate-950"
                    : "text-slate-500"
                }`}
              >
                {t(item.label)}
                {item.children && (
                  <ChevronDown
                    size={14}
                    className={`transition-transform duration-200 ${activeDropdown === item.id ? "rotate-180" : ""}`}
                  />
                )}
              </button>

              {item.children && (
                <AnimatePresence>
                  {activeDropdown === item.id && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute top-full left-0 w-48 bg-white shadow-2xl rounded-2xl border border-slate-100 py-3 overflow-hidden"
                    >
                      {item.children.map((child, i) => (
                        <button
                          key={i}
                          onClick={() => {
                            onNavigate(child.id);
                            setActiveDropdown(null);
                          }}
                          className={`w-full text-left px-5 py-2.5 text-[13px] font-bold transition-all hover:bg-slate-50 ${
                            child.isDivider
                              ? "text-slate-950 border-t border-slate-50 mt-1 pt-3"
                              : "text-slate-600 hover:text-slate-950"
                          }`}
                        >
                          {t(child.label)}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              )}
            </div>
          ))}
          <select
            value={locale}
            onChange={(event) => onSwitchLocale(event.target.value as Locale)}
            className="text-[13px] font-bold text-slate-600 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-200"
            aria-label={t("语言切换")}
            data-cta="false"
          >
            <option value="zh-Hans">{t("简体")}</option>
            <option value="zh-Hant">{t("繁體")}</option>
          </select>
          <button
            type="button"
            data-cta="true"
            className="bg-cyan-600 text-white px-6 py-2.5 rounded-full text-sm font-bold hover:bg-cyan-700 transition-all shadow-sm shadow-cyan-600/20"
          >
            {t("欧意OKX入口")}
          </button>
        </div>

        {/* Mobile Toggle */}
        <button
          type="button"
          className="md:hidden p-2 text-slate-900 shrink-0 ml-1"
          onClick={handleMobileToggle}
          data-cta="false"
          aria-label="打开菜单"
        >
          {isOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="md:hidden absolute left-0 right-0 top-full bg-white z-[70] px-4 pt-4 pb-[calc(2rem+env(safe-area-inset-bottom))] flex flex-col gap-2 border-b border-slate-100 shadow-xl max-h-[calc(100dvh-4rem)] sm:max-h-[calc(100dvh-5rem)] overflow-y-auto overscroll-contain"
            style={{ WebkitOverflowScrolling: "touch" }}
            data-cta="false"
          >
            {menuItems.map((item) => (
              <div
                key={item.id}
                className="flex flex-col gap-2 border-b border-slate-100 pb-3 last:border-0"
              >
                {!item.children ? (
                  <button
                    type="button"
                    onClick={(event) => {
                      event.preventDefault();
                      event.stopPropagation();
                      onNavigate(item.id);
                      setIsOpen(false);
                    }}
                    className={`w-full text-left text-base font-black py-2.5 ${
                      currentPath === item.id
                        ? "text-slate-950"
                        : "text-slate-900"
                    }`}
                    data-cta="false"
                  >
                    <span className="leading-snug whitespace-normal break-words">
                      {t(item.label)}
                    </span>
                  </button>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        setActiveDropdown(
                          activeDropdown === item.id ? null : item.id,
                        );
                      }}
                      className={`w-full text-left text-base font-black py-2.5 flex items-center justify-between ${
                        currentPath === item.id
                          ? "text-slate-950"
                          : "text-slate-900"
                      }`}
                      data-cta="false"
                    >
                      <span className="leading-snug whitespace-normal break-words">
                        {t(item.label)}
                      </span>
                      <ChevronDown
                        size={18}
                        className={
                          activeDropdown === item.id ? "rotate-180" : ""
                        }
                      />
                    </button>
                    {activeDropdown === item.id && (
                      <div className="grid grid-cols-1 gap-2 pl-1">
                        {item.children.map((child, i) => (
                          <button
                            type="button"
                            key={i}
                            onClick={(event) => {
                              event.preventDefault();
                              event.stopPropagation();
                              onNavigate(child.id);
                              setIsOpen(false);
                            }}
                            className="text-left text-sm font-bold text-slate-600 py-2.5 bg-slate-50 px-3 rounded-xl active:bg-blue-50 whitespace-normal break-words leading-snug"
                            data-cta="false"
                          >
                            {t(child.label)}
                          </button>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            ))}
            <div className="border-b border-slate-100 pb-3">
              <label className="block text-xs font-bold text-slate-400 mb-2">
                {t("语言")}
              </label>
              <select
                value={locale}
                onChange={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  onSwitchLocale(event.target.value as Locale);
                  setIsOpen(false);
                }}
                className="w-full text-sm font-bold text-slate-900 bg-white border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-200"
                aria-label={t("语言切换")}
                data-cta="false"
              >
                <option value="zh-Hans">{t("简体")}</option>
                <option value="zh-Hant">{t("繁體")}</option>
              </select>
            </div>
            <div className="mt-8 pt-8 border-t border-slate-100 italic text-[10px] text-slate-400">
              欧意OKX入口 @ {currentYear}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

const SectionHeader = ({ title, desc }: { title: string; desc?: string }) => (
  <div className="mb-12">
    <h2 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">
      {title}
    </h2>
    {desc && (
      <p className="text-slate-500 text-lg max-w-3xl leading-relaxed">{desc}</p>
    )}
  </div>
);

const articleMarkdownComponents = {
  h2: ({ children }: { children?: ReactNode }) => (
    <h2 className="mt-12 mb-5 border-l-4 border-blue-600 pl-4 text-2xl md:text-3xl font-black leading-snug text-slate-950">
      {children}
    </h2>
  ),
  h3: ({ children }: { children?: ReactNode }) => (
    <h3 className="mt-8 mb-3 text-xl font-black leading-snug text-slate-900">
      {children}
    </h3>
  ),
  p: ({ children }: { children?: ReactNode }) => (
    <p className="my-4 text-base leading-8 text-slate-600">{children}</p>
  ),
  ul: ({ children }: { children?: ReactNode }) => (
    <ul className="my-4 space-y-2 pl-6 list-disc text-slate-600">{children}</ul>
  ),
  ol: ({ children }: { children?: ReactNode }) => (
    <ol className="my-4 space-y-2 pl-6 list-decimal text-slate-600">
      {children}
    </ol>
  ),
  li: ({ children }: { children?: ReactNode }) => (
    <li className="leading-8">{children}</li>
  ),
  strong: ({ children }: { children?: ReactNode }) => (
    <strong className="font-black text-slate-900">{children}</strong>
  ),
  hr: () => <hr className="my-10 border-slate-100" />,
  a: ({ href, children }: { href?: string; children?: ReactNode }) => (
    <a href={href} className="font-bold text-blue-600 hover:text-blue-700">
      {children}
    </a>
  ),
};

const commonEntryLinks = [
  { label: "首页", id: "home" },
  { label: "下载入口", id: "ouyi-okx-download" },
  { label: "电脑版", id: "ouyi-okx-pc" },
  { label: "网页版", id: "ouyi-okx-web" },
  { label: "安卓", id: "ouyi-okx-android" },
  { label: "苹果", id: "ouyi-okx-ios" },
  { label: "注册安装", id: "ouyi-okx-register" },
  { label: "入口汇总", id: "home" },
];

const CommonEntryLinks = ({
  currentPath,
  onNavigate,
}: {
  currentPath: string;
  locale: Locale;
  onNavigate: (path: string) => void;
}) => (
  <div className="mb-16 border-y border-slate-100 py-10">
    <div className="flex flex-wrap items-center justify-center gap-3">
      <span className="mr-2 text-sm font-black text-slate-500">常用入口</span>
      {commonEntryLinks.map((link) => (
        <button
          key={link.id}
          onClick={() => onNavigate(link.id)}
          className={`rounded-full border px-5 py-2 text-sm font-black transition-colors ${
            currentPath === link.id
              ? "border-cyan-600 bg-cyan-600 text-white"
              : "border-slate-200 bg-white text-slate-600 hover:border-cyan-200 hover:text-cyan-700"
          }`}
        >
          {link.label}
        </button>
      ))}
    </div>
  </div>
);

const beginnerRelated = [
  { label: "欧意交易所入口汇总", id: "home" },
  { label: "资金账户和交易账户区别", id: "ouyi-okx-account-transfer" },
  { label: "第一笔买币怎么操作", id: "ouyi-okx-buy-first-coin" },
  { label: "C2C 买币安全", id: "ouyi-okx-c2c-safe" },
  { label: "提现提币问题", id: "ouyi-okx-withdraw" },
  { label: "账户安全设置", id: "ouyi-okx-security" },
];

const BeginnerRelatedLinks = ({
  currentPath,
  onNavigate,
}: {
  currentPath: string;
  locale: Locale;
  onNavigate: (path: string) => void;
}) => {
  const links = beginnerRelated
    .filter((link) => link.id !== currentPath)
    .slice(0, 3);
  return (
    <div className="mb-16 max-w-4xl mx-auto rounded-[1.5rem] border border-slate-100 bg-white p-8 shadow-sm">
      <h3 className="mb-5 text-lg font-black text-slate-900">相关阅读：</h3>
      <div className="grid gap-3 sm:grid-cols-3">
        {links.map((link) => (
          <button
            key={link.id}
            onClick={() => onNavigate(link.id)}
            className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-left text-sm font-black text-slate-800 transition-colors hover:border-slate-300 hover:bg-white"
          >
            {link.label}
          </button>
        ))}
      </div>
    </div>
  );
};

const beginnerQuickTopics = [
  {
    title: "Web网址",
    desc: "浏览器访问、网页登录、地址栏核对和临时查看。",
    navId: "ouyi-okx-web",
  },
  {
    title: "APP下载地址",
    desc: "安卓APK、苹果App Store、鸿蒙和国产手机安装。",
    navId: "ouyi-okx-app",
  },
  {
    title: "PC端网址",
    desc: "Windows、Mac、桌面客户端和电脑网页访问。",
    navId: "ouyi-okx-pc",
  },
  {
    title: "注册安装链接",
    desc: "手机号邮箱注册、身份认证、登录保护和资金密码。",
    navId: "ouyi-okx-register",
  },
];

const beginnerTopicGrid = [
  {
    title: "资金账户和交易账户",
    desc: "买 U 后不能交易，通常先看资金位置和划转。",
    navId: "ouyi-okx-account-transfer",
  },
  {
    title: "安卓下载安装",
    desc: "APK、未知应用权限、系统拦截和更新问题。",
    navId: "ouyi-okx-android-download",
  },
  {
    title: "第一笔买币",
    desc: "BTC、ETH、USDT、OKB 分别是什么用途。",
    navId: "ouyi-okx-buy-first-coin",
  },
  {
    title: "C2C 买币安全",
    desc: "订单内交易、到账确认、冻卡原因和商家选择。",
    navId: "ouyi-okx-c2c-safe",
  },
  {
    title: "手续费说明",
    desc: "挂单、吃单、OKB 抵扣和交易频率成本。",
    navId: "ouyi-okx-fee",
  },
  {
    title: "提现提币",
    desc: "C2C 卖出、链上提币、地址和链类型选择。",
    navId: "ouyi-okx-withdraw",
  },
  {
    title: "账户安全设置",
    desc: "谷歌验证、资金密码、防钓鱼码和白名单。",
    navId: "ouyi-okx-security",
  },
  {
    title: "杠杆风险",
    desc: "合约、杠杆、爆仓和新手不该忽略的风险。",
    navId: "ouyi-okx-leverage-warning",
  },
  {
    title: "赚币规则",
    desc: "活期、定期、参考年化和赎回限制。",
    navId: "ouyi-okx-earn-guide",
  },
  {
    title: "邀请与奖励",
    desc: "邀请码、返佣、奖励门槛和活动有效期。",
    navId: "ouyi-okx-invite",
  },
  {
    title: "模拟交易",
    desc: "先用虚拟资金熟悉买卖、挂单和止损。",
    navId: "ouyi-okx-simulate-trade",
  },
  {
    title: "Web3 钱包",
    desc: "助记词、链上转账、授权和钱包风险。",
    navId: "ouyi-okx-web3",
  },
];

const homePrimaryEntryCards = [
  {
    title: "欧意OKX入口",
    desc: "交易所入口、网站地址、访问链接和常用进入路径。",
    navId: "ouyi-okx-exchange",
    icon: Globe,
  },
  {
    title: "PC端网址",
    desc: "Windows、Mac、桌面客户端和电脑浏览器访问。",
    navId: "ouyi-okx-pc",
    icon: Monitor,
  },
  {
    title: "APP下载地址",
    desc: "安卓APK、苹果App Store和手机端安装入口。",
    navId: "ouyi-okx-download",
    icon: Download,
  },
  {
    title: "注册开户",
    desc: "账号注册、身份认证、资金密码和登录保护。",
    navId: "ouyi-okx-register",
    icon: UserPlus,
  },
  {
    title: "安卓安装",
    desc: "APK、未知应用权限、系统拦截和机型适配。",
    navId: "ouyi-okx-android",
    icon: Smartphone,
  },
  {
    title: "苹果安装",
    desc: "iPhone、App Store、地区账号和安装问题。",
    navId: "ouyi-okx-ios",
    icon: Apple,
  },
];

const BeginnerIndexContent = ({pageData}: {pageData: PageData}) => {
  const sections = pageData.homeSections;
  if (!sections) return null;

  return (
    <div className="mb-16 space-y-8">
      <section className="rounded-[2rem] border border-sky-100 bg-sky-50/70 p-7 shadow-sm shadow-sky-100/60 md:p-10">
        <p className="mb-4 text-sm font-black text-cyan-700">{sections.introLabel}</p>
        <h2 className="max-w-4xl text-3xl font-black leading-tight text-slate-950 md:text-4xl">
          {sections.introHeading}
        </h2>
        <div className="mt-5 max-w-4xl space-y-4 text-base leading-8 text-slate-700">
          {sections.introParagraphs.map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>
      </section>

      <section className="grid gap-5 md:grid-cols-3">
        {sections.highlightCards.map((card) => (
          <div
            key={card.title}
            className="rounded-[1.5rem] border border-sky-100 bg-white p-6 shadow-sm shadow-sky-100/50"
          >
            <h2 className="mb-3 text-xl font-black text-slate-950">{card.title}</h2>
            <p className="text-sm leading-7 text-slate-700">{card.text}</p>
          </div>
        ))}
      </section>

      <section className="rounded-[2rem] border border-slate-200 bg-white p-7 shadow-sm md:p-10">
        <div className="grid gap-8 md:grid-cols-[0.9fr_1.1fr]">
          <div>
            <p className="mb-4 text-sm font-black text-cyan-700">{sections.advantages.label}</p>
            <h2 className="text-3xl font-black leading-tight text-slate-950">
              {sections.advantages.heading}
            </h2>
          </div>
          <div className="space-y-5 text-base leading-8 text-slate-700">
            {sections.advantages.paragraphs.map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
        </div>
      </section>

      <section className="rounded-[2rem] border border-sky-100 bg-sky-50/60 p-7 md:p-10">
        <h2 className="mb-5 text-2xl font-black text-slate-950">{sections.safety.heading}</h2>
        <div className="max-w-5xl space-y-4 text-base leading-8 text-slate-700">
          {sections.safety.paragraphs.map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {sections.safety.cards.map((item) => (
            <div key={item.title} className="rounded-2xl border border-sky-100 bg-white p-5">
              <h3 className="mb-2 text-base font-black text-slate-950">{item.title}</h3>
              <p className="text-sm leading-7 text-slate-700">{item.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-[2rem] border border-slate-200 bg-white p-7 shadow-sm md:p-10">
        <h2 className="mb-6 text-2xl font-black text-slate-950">{sections.faqHeading}</h2>
        <div className="space-y-4">
          {(pageData.faqs || []).map((item) => (
            <div key={item.q} className="rounded-2xl border border-slate-100 bg-slate-50/70 p-5">
              <h3 className="mb-2 text-base font-black text-slate-950">{item.q}</h3>
              <p className="text-sm leading-7 text-slate-700">{item.a}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

const Footer = ({
  onNavigate,
  locale,
}: {
  onNavigate: (path: string) => void;
  locale: Locale;
}) => {
  const currentYear = new Date().getFullYear();
  const t = (text: string) => localizeText(text, locale);

  const footLinks = {
    access: [
      { label: "欧意交易所入口", id: "ouyi-okx-exchange" },
      { label: "Web网址", id: "ouyi-okx-web" },
      { label: "APP下载地址", id: "ouyi-okx-download" },
      { label: "PC端网址", id: "ouyi-okx-pc" },
      { label: "注册安装链接", id: "ouyi-okx-register" },
      { label: "欧意/欧易称呼", id: "ouyi-okx-brand-names" },
    ],
    devices: [
      { label: "安卓APP", id: "ouyi-okx-android" },
      { label: "苹果APP", id: "ouyi-okx-ios" },
      { label: "华为/鸿蒙", id: "ouyi-okx-huawei" },
      { label: "小米/澎湃", id: "ouyi-okx-xiaomi" },
      { label: "OPPO/一加", id: "ouyi-okx-oppo" },
      { label: "VIVO/真我", id: "ouyi-okx-vivo" },
      { label: "夸克/UC访问", id: "ouyi-okx-quark" },
    ],
    tutorials: [
      { label: "买U与划转", id: "ouyi-okx-account-transfer" },
      { label: "C2C买币安全", id: "ouyi-okx-c2c-safe" },
      { label: "账户安全设置", id: "ouyi-okx-security" },
      { label: "手续费规则", id: "ouyi-okx-fee" },
      { label: "提现提币", id: "ouyi-okx-withdraw" },
      { label: "新手买币", id: "ouyi-okx-buy-first-coin" },
      { label: "合约风险", id: "ouyi-okx-leverage-warning" },
    ],
  };

  return (
    <footer className="bg-slate-50 border-t border-slate-200 pt-16 pb-8">
      <div className="section-container">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-16">
          <div className="md:col-span-4">
            <div className="flex items-center mb-6">
              <div className="bg-slate-950 text-white p-1.5 rounded-lg mr-2">
                <Shield size={24} />
              </div>
              <span className="font-extrabold text-xl tracking-tight text-slate-900">
                欧意交易所入口
              </span>
            </div>
            <p className="text-slate-500 text-sm leading-relaxed mb-6 pr-4 font-medium opacity-80">
              欧意OKX Web网址、APP下载地址、PC端网址、注册安装链接和新手使用内容。
            </p>
            <div className="p-4 bg-white border border-slate-100 rounded-2xl shadow-sm text-[12px] text-slate-500 leading-6">
              <div className="flex items-start gap-2">
                <AlertCircle
                  size={15}
                  className="text-slate-500 shrink-0 mt-1"
                />
                <p>
                  本站是欧意OKX相关粉丝站，不是官方站。内容主要来自实际使用记录和公开信息，用来帮助新手理解入口、下载、注册和账户安全。
                </p>
              </div>
            </div>
          </div>

          <div className="md:col-span-8 grid grid-cols-2 sm:grid-cols-3 gap-8">
            <div>
              <h4 className="font-bold text-slate-900 mb-6 text-sm uppercase tracking-wider">
                {t("访问入口")}
              </h4>
              <ul className="space-y-4">
                {footLinks.access.map((link, idx) => (
                  <li key={idx}>
                    <button
                      onClick={() => onNavigate(link.id)}
                      className="text-slate-500 hover:text-slate-950 text-sm font-bold transition-colors"
                    >
                      {t(link.label)}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-slate-900 mb-6 text-sm uppercase tracking-wider">
                {t("设备安装")}
              </h4>
              <ul className="space-y-4">
                {footLinks.devices.map((link, idx) => (
                  <li key={idx}>
                    <button
                      onClick={() => onNavigate(link.id)}
                      className="text-slate-500 hover:text-slate-950 text-sm font-bold transition-colors text-left"
                    >
                      {t(link.label)}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-slate-900 mb-6 text-sm uppercase tracking-wider">
                {t("新手使用")}
              </h4>
              <ul className="space-y-4">
                {footLinks.tutorials.map((link, idx) => (
                  <li key={idx}>
                    <button
                      onClick={() => onNavigate(link.id)}
                      className="text-slate-500 hover:text-slate-950 text-sm font-bold transition-colors text-left"
                    >
                      {t(link.label)}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-slate-400 text-[10px] font-bold">
            © {currentYear} 欧意交易所入口.
            Web网址、下载地址、PC端访问与注册安装索引。
          </p>
          <div className="flex items-center gap-4 text-xs font-bold text-slate-500">
            <a
              href="https://ouxpc.com/"
              target="_blank"
              rel="noopener"
              className="text-slate-600 hover:text-blue-600 transition underline underline-offset-4"
            >
              欧意 OKX PC电脑版 (ouxpc.com)
            </a>
            <a
              href="https://oyweb.net/"
              target="_blank"
              rel="noopener"
              className="text-blue-600 hover:text-blue-800 transition underline underline-offset-4"
            >
              欧易web 官方网页版 (oyweb.net)
            </a>
            <a
              href="https://oyipc.com/"
              target="_blank"
              rel="noopener"
              className="text-blue-600 hover:text-blue-800 transition underline underline-offset-4"
            >
              欧易 OKX 官方入口 (oyipc.com)
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

// --- 主程序 ---

export default function App() {
  const router = useRouter();
  /** 首屏 SSG/HTML 不做 opacity:0，避免 JS 加载前白屏；站内跳转仍保留淡入 */
  const skipPageEnterAnimation = useRef(true);
  const pathname = useMemo(() => {
    if (typeof window !== "undefined") {
      return stripSiteBasePath(window.location.pathname || "/");
    }
    const raw = (router.asPath || "/").split("?")[0].split("#")[0];
    return stripSiteBasePath(raw || "/");
  }, [router.asPath, router.isReady]);
  const locale = useMemo<Locale>(
    () => resolveLocaleFromPath(pathname),
    [pathname],
  );
  const localizedPath = useMemo(
    () => stripLocalePrefix(pathname, locale),
    [pathname, locale],
  );
  const normalizedPath = localizedPath.replace(/\/+$/, "");
  const requestedPath =
    normalizedPath === "" || normalizedPath === "/"
      ? "home"
      : normalizedPath.slice(1);
  const pages = useMemo(() => getPagesByLocale(locale), [locale]);
  const isNotFound = requestedPath !== "home" && !pages[requestedPath];
  const currentPath = isNotFound ? "home" : requestedPath;
  const pageData = useMemo(
    () => pages[currentPath] || pages["home"],
    [currentPath, pages],
  );
  const heroDisplayTitle =
    pageData.homeSections?.heroTitle ?? pageData.title;
  const heroTitle = useMemo(
    () => getHeroTitleParts(heroDisplayTitle),
    [heroDisplayTitle],
  );
  const t = (text: string) => localizeText(text, locale);
  const isBeginnerArticle = BEGINNER_ARTICLE_IDS.has(pageData.id);
  const isBeginnerIndex = pageData.id === "home";
  const isBeginnerPage = isBeginnerIndex || isBeginnerArticle;
  const isPrimaryPage = !pageData.id.includes("/");
  const markdownComponents = useMemo(
    () => ({
      ...articleMarkdownComponents,
      a: ({ href, children }: { href?: string; children?: ReactNode }) => (
        <a
          href={toLocalizedInternalHref(href, locale)}
          className="font-bold text-blue-600 hover:text-blue-700"
        >
          {children}
        </a>
      ),
    }),
    [locale],
  );

  useEffect(() => {
    document.documentElement.lang = toHtmlLang(locale);
    window.scrollTo(0, 0);
  }, [locale, pathname]);

  useEffect(() => {
    skipPageEnterAnimation.current = false;
  }, []);

  const pageEnterInitial = skipPageEnterAnimation.current
    ? false
    : { opacity: 0, y: 15 };

  const currentCanonicalPath = isNotFound
    ? toCanonicalPath(pathname)
    : toCanonicalPath(buildPathForLocale(currentPath, locale));
  const canonicalUrl = `${CANONICAL_ORIGIN}${currentCanonicalPath}`;
  const hansUrl = `${CANONICAL_ORIGIN}${buildPathForLocale(currentPath, "zh-Hans")}`;
  const hantUrl = `${CANONICAL_ORIGIN}${buildPathForLocale(currentPath, "zh-Hant")}`;

  const beginnerSuffix = locale === "zh-Hant" ? " | 歐意OKX" : " | 欧意OKX";
  const metaTitle = isNotFound
    ? t("404 - 页面不存在 | 欧意交易所入口")
    : pageData.id === "home"
      ? pageData.title
    : isBeginnerPage
      ? `${pageData?.title}${beginnerSuffix}`
      : pageData?.title;
  const metaDescription = isNotFound
    ? t("您访问的页面不存在，请返回欧意交易所入口继续浏览。")
    : pageData?.description;
  const metaKeywords = isNotFound
    ? t("404,页面不存在,欧意交易所入口")
    : pageData?.keywords?.join(", ");
  const metaRobots = isNotFound ? "noindex,follow" : "index,follow";

  const navigate = (path: string) => {
    router.push(buildPathForLocale(path, locale));
  };

  const switchLocale = (nextLocale: Locale) => {
    if (nextLocale === locale) return;
    router.push(buildPathForLocale(currentPath, nextLocale));
  };

  return (
    <div className="min-h-screen overflow-x-hidden selection:bg-blue-100 selection:text-blue-900">
      <Head>
        <title>{metaTitle}</title>
        <meta name="description" content={metaDescription} />
        {metaKeywords && <meta name="keywords" content={metaKeywords} />}
        <meta name="robots" content={metaRobots} />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content={metaTitle} />
        <meta name="twitter:description" content={metaDescription} />
        <meta property="og:type" content="website" />
        <meta property="og:title" content={metaTitle} />
        <meta property="og:description" content={metaDescription} />
        <meta property="og:url" content={canonicalUrl} />
        <link rel="canonical" href={canonicalUrl} />
        {!isNotFound && (
          <>
            <link rel="alternate" hrefLang="zh-Hans" href={hansUrl} />
            <link rel="alternate" hrefLang="zh-Hant" href={hantUrl} />
            <link rel="alternate" hrefLang="x-default" href={hansUrl} />
          </>
        )}
      </Head>
      <Navbar
        onNavigate={navigate}
        onSwitchLocale={switchLocale}
        currentPath={currentPath}
        locale={locale}
      />

      <main className="pt-20 lg:pt-24 pb-24 lg:pb-0">
        <div className="section-container">
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={pageEnterInitial}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.4 }}
            >
              {isNotFound ? (
                <div className="min-h-[55vh] flex flex-col items-center justify-center text-center">
                  <div className="w-20 h-20 rounded-3xl bg-blue-50 text-blue-600 flex items-center justify-center mb-6">
                    <AlertCircle size={36} />
                  </div>
                  <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-4">
                    404
                  </h1>
                  <p className="text-base md:text-lg text-slate-500 mb-8 max-w-2xl leading-relaxed">
                    页面不存在或链接已失效，请返回首页继续访问独立页面入口。
                  </p>
                  <button
                    onClick={() => navigate("home")}
                    className="btn-primary !py-3 !px-8"
                    data-cta="false"
                  >
                    返回首页
                  </button>
                </div>
              ) : (
                <>
                  <Breadcrumbs
                    currentPath={currentPath}
                    onNavigate={navigate}
                    pages={pages}
                    compact={isBeginnerPage}
                  />

                  {/* --- Hero 区域 --- */}
                  <div
                    className={`grid grid-cols-1 ${isBeginnerIndex ? "mb-6 lg:mb-8" : isBeginnerPage ? "mb-10 lg:mb-14" : "mb-14 lg:mb-20"}`}
                  >
                    <div
                      className={`${isPrimaryPage ? "mx-auto text-center" : ""} max-w-4xl`}
                    >
                      <h1 className="flex flex-col gap-2 md:gap-4 mb-8">
                        <span className="text-4xl md:text-6xl lg:text-7xl font-black text-slate-900 leading-[1.1] tracking-tighter">
                          {heroTitle.main}
                        </span>
                        {heroTitle.sub && (
                          <span className="text-lg md:text-2xl lg:text-3xl font-medium text-slate-600 leading-tight">
                            {heroTitle.sub}
                          </span>
                        )}
                      </h1>
                      <p
                        className={`text-base md:text-lg text-slate-500 leading-relaxed mb-8 max-w-xl ${isPrimaryPage ? "mx-auto" : ""}`}
                      >
                        {pageData.description}
                      </p>

                      <div
                        className={`flex flex-col sm:flex-row gap-4 mb-8 ${isPrimaryPage ? "justify-center" : ""}`}
                      >
                        {pageData.id === "ouyi-okx-exchange" ? (
                          <button
                            className="btn-primary group !py-3 !px-10"
                            data-cta="true"
                          >
                            <Download
                              size={18}
                              className="group-hover:translate-y-0.5 transition-transform"
                            />
                            立刻前往欧易OKX
                          </button>
                        ) : pageData.id === "ouyi-okx-register" ? (
                          <button
                            className="btn-primary group !py-3 !px-10"
                            data-cta="true"
                          >
                            <UserPlus size={18} />
                            点击前往注册入口
                          </button>
                        ) : pageData.id === "home" ? (
                          <>
                            <button
                              className="btn-primary group !py-3"
                              data-cta="true"
                            >
                              <Download
                                size={18}
                                className="group-hover:translate-y-0.5 transition-transform"
                              />
                              欧意OKX入口
                            </button>
                            <button
                              className="btn-secondary !py-3"
                              data-cta="true"
                            >
                              <UserPlus size={18} /> 快速注册开户
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              className="btn-primary group !py-3"
                              data-cta="true"
                            >
                              <Download
                                size={18}
                                className="group-hover:translate-y-0.5 transition-transform"
                              />
                              欧意OKX入口
                            </button>
                            <button
                              className="btn-secondary !py-3"
                              data-cta="true"
                            >
                              <UserPlus size={18} /> 快速注册开户
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* --- 品牌快速入口 (已移除，功能整合至上方主要入口卡片) --- */}

                  {/* --- 核心特性或多端导航 --- */}
                  {!isBeginnerArticle && !isBeginnerIndex && (
                    <div className="mb-24">
                      <SectionHeader
                        title={
                          pageData.id === "home"
                            ? "按设备选择入口"
                            : `${pageData.breadcrumbName}常用入口`
                        }
                        desc={
                          pageData.id === "home"
                            ? "安卓、苹果、电脑端和国产机型的处理方式不同，按自己的设备进入对应页面。"
                            : `按当前场景列出可继续查看的入口，方便回到下载、注册或设备页面。`
                        }
                      />
                      <div
                        className={`grid grid-cols-1 ${
                          (pageData.features?.length || 3) === 3
                            ? "md:grid-cols-3"
                            : (pageData.features?.length || 3) === 4
                              ? "md:grid-cols-2 lg:grid-cols-4"
                              : "md:grid-cols-2 lg:grid-cols-5"
                        } gap-8`}
                      >
                        {(
                          pageData.features || [
                            {
                              title: "手机端下载",
                              desc: "安卓与苹果全平台支持，按设备查看对应入口。",
                              icon: Smartphone,
                              navId: "ouyi-okx-app",
                            },
                            {
                              title: "电脑端访问",
                              desc: "适合看盘、图表分析和长时间账户管理。",
                              icon: Monitor,
                              navId: "ouyi-okx-pc",
                            },
                            {
                              title: "网页入口",
                              desc: "浏览器打开，适合网页端访问和基础设置。",
                              icon: Globe,
                              navId: "ouyi-okx-web",
                            },
                          ]
                        ).map((f, i) => {
                          const Icon = f.icon;
                          return (
                            <button
                              key={i}
                              onClick={() =>
                                (f as any).navId && navigate((f as any).navId)
                              }
                              className={`card-shadow p-8 flex flex-col items-start group hover:-translate-y-1 transition-all duration-300 text-left w-full${(f as any).navId ? " cursor-pointer" : ""}`}
                            >
                              <div className="p-3 bg-sky-50 text-cyan-700 rounded-xl mb-6 group-hover:bg-cyan-600 group-hover:text-white transition-colors">
                                <Icon size={24} />
                              </div>
                              <h3 className="text-2xl font-black mb-3">
                                {t(f.title)}
                              </h3>
                              <p className="text-slate-500 mb-8 leading-relaxed font-medium">
                                {t(f.desc)}
                              </p>
                              {(f as any).navId ? (
                                <div className="mt-auto flex items-center gap-2 text-slate-900 font-bold group-hover:gap-3 transition-all">
                                  查看对应页面 <ChevronRight size={18} />
                                </div>
                              ) : (
                                <div className="mt-auto flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-widest">
                                  <ShieldCheck
                                    size={14}
                                    className="text-blue-500"
                                  />{" "}
                                  按设备入口查看
                                </div>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {false && pageData.id === "home" && (
                    <div className="mb-24">
                      <SectionHeader
                        title="生态入口"
                        desc="欧易 OKX Web3 钱包与 OKB 专题入口"
                      />
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="card-shadow p-8 flex flex-col items-start group hover:-translate-y-1 transition-all duration-300">
                          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl mb-6">
                            <Wallet size={24} />
                          </div>
                          <h3 className="text-2xl font-black mb-3">欧易钱包</h3>
                          <p className="text-slate-500 mb-8 leading-relaxed font-medium">
                            进入 Web3
                            钱包页面，查看多链资产管理与去中心化使用指南。
                          </p>
                          <button
                            onClick={() => navigate("ouyi-okx-wallet")}
                            className="mt-auto flex items-center gap-2 text-blue-600 font-bold hover:gap-3 transition-all"
                          >
                            立即查看 <ChevronRight size={18} />
                          </button>
                        </div>
                        <div className="card-shadow p-8 flex flex-col items-start group hover:-translate-y-1 transition-all duration-300">
                          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl mb-6">
                            <BarChart3 size={24} />
                          </div>
                          <h3 className="text-2xl font-black mb-3">
                            OKB 平台币
                          </h3>
                          <p className="text-slate-500 mb-8 leading-relaxed font-medium">
                            进入 OKB
                            专题页面，查看平台币权益、费率优惠与生态价值解析。
                          </p>
                          <button
                            onClick={() => navigate("ouyi-okx-okb")}
                            className="mt-auto flex items-center gap-2 text-blue-600 font-bold hover:gap-3 transition-all"
                          >
                            立即查看 <ChevronRight size={18} />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* --- SEO 文案深度区块 --- */}
                  {isBeginnerIndex ? (
                    <BeginnerIndexContent pageData={pageData} />
                  ) : isBeginnerArticle ? (
                    <div className="mb-16 max-w-4xl mx-auto">
                      <article className="bg-white border border-slate-100 rounded-[2rem] p-8 md:p-12 shadow-sm">
                        <Markdown components={markdownComponents}>
                          {pageData.content}
                        </Markdown>
                      </article>
                    </div>
                  ) : (
                    <div className="mb-24">
                      <div className="bg-slate-900 text-white rounded-[2.5rem] p-8 md:p-16 relative overflow-hidden">
                        <div className="relative z-10">
                          <div className="prose prose-invert max-w-none text-slate-200 leading-relaxed text-lg space-y-6 [&_p]:!text-slate-200 [&_li]:!text-slate-200 [&_ul]:!text-slate-200 [&_ol]:!text-slate-200 [&_h2]:!text-white [&_h3]:!text-white [&_strong]:!text-white [&_a]:!text-blue-200 [&_hr]:!border-slate-700">
                            <Markdown components={markdownComponents}>
                              {pageData.content}
                            </Markdown>
                          </div>
                        </div>
                        <div className="absolute -right-20 -top-20 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl" />
                      </div>
                    </div>
                  )}

                  {/* --- FAQ / SEO 长尾内容 --- */}
                  {!isBeginnerArticle && !isBeginnerIndex && (
                    <div className="mb-24 max-w-4xl mx-auto">
                      <div className="text-center mb-12">
                        <h3 className="text-3xl font-black text-slate-900">
                          {pageData.id === "home"
                            ? "常见问题 (FAQ)"
                            : `${pageData.title.split(" - ")[0]} 常见问题`}
                        </h3>
                        <p className="mt-4 text-slate-500">
                          针对用户在搜索{" "}
                          {pageData.keywords.slice(0, 3).join("、")}{" "}
                          时常问的问题拆开回答。
                        </p>
                      </div>
                      <div className="space-y-4">
                        {(pageData.faqs || []).map((faq, i) => (
                          <div
                            key={i}
                            className="card-shadow p-8 hover:border-blue-100 transition-colors"
                          >
                            <h4 className="font-black text-slate-900 mb-4 flex gap-3 items-start leading-tight">
                              <span className="shrink-0 w-8 h-8 rounded-full bg-slate-100 text-slate-700 text-xs flex items-center justify-center font-black">
                                Q
                              </span>
                              {faq.q}
                            </h4>
                            <div className="text-slate-500 text-sm leading-relaxed pl-11 relative">
                              <span className="absolute left-0 top-0 font-bold text-slate-300">
                                回答：
                              </span>
                              {faq.a}
                            </div>
                          </div>
                        ))}
                      </div>
                      {pageData.id === "home" && (
                        <div className="mt-8 text-center text-sm text-slate-500">
                          关于“欧易 / 欧意 / OKX / OKEx / 易欧 / o易 / 欧亿 /
                          殴易 / 欧交所”等称呼差异，可查看
                          <button
                            onClick={() => navigate("ouyi-okx-vs-ouyi")}
                            className="ml-1 font-bold text-slate-950 hover:text-black underline underline-offset-2"
                          >
                            称呼关系
                          </button>
                          。
                        </div>
                      )}
                    </div>
                  )}

                  {isBeginnerArticle && (
                    <BeginnerRelatedLinks
                      currentPath={currentPath}
                      locale={locale}
                      onNavigate={navigate}
                    />
                  )}
                  {!isBeginnerIndex && (
                    <CommonEntryLinks
                      currentPath={currentPath}
                      locale={locale}
                      onNavigate={navigate}
                    />
                  )}

                  {/* --- LSI 关键词云 --- */}
                  <div className="text-center pt-8 border-t border-slate-100 flex flex-wrap justify-center gap-3">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mr-4">
                      相关搜索:
                    </span>
                    {pageData.keywords.map((kw) => (
                      <span
                        key={kw}
                        className="text-[11px] font-bold text-slate-400 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100"
                      >
                        {kw}
                      </span>
                    ))}
                  </div>
                </>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      <Footer onNavigate={navigate} locale={locale} />
      <BackToTop />
      <MobileStickyFooter>
        {pageData.id === "home" ? (
          <button
            type="button"
            data-cta="true"
            className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-3.5 rounded-lg flex items-center justify-center transition-colors shadow-lg shadow-cyan-600/20"
          >
            欧意OKX入口
          </button>
        ) : (
          <button
            type="button"
            data-cta="true"
            className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-3.5 rounded-lg flex items-center justify-center transition-colors shadow-lg shadow-cyan-600/20"
          >
            欧意OKX入口
          </button>
        )}
      </MobileStickyFooter>
    </div>
  );
}

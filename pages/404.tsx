import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { ChevronRight, Shield } from "lucide-react";

type LinkItem = {
  label: string;
  href: string;
};

const hansLinks: LinkItem[] = [
  { label: "首页", href: "/" },
  { label: "欧意交易所入口", href: "/ouyi-okx-exchange/" },
  { label: "Web网址", href: "/ouyi-okx-web/" },
  { label: "APP下载地址", href: "/ouyi-okx-download/" },
  { label: "PC端网址", href: "/ouyi-okx-pc/" },
  { label: "安卓APP", href: "/ouyi-okx-android/" },
  { label: "注册安装链接", href: "/ouyi-okx-register/" },
];

const hantLinks: LinkItem[] = [
  { label: "首頁", href: "/zh-hant/" },
  { label: "歐意交易所入口", href: "/zh-hant/ouyi-okx-exchange/" },
  { label: "Web網址", href: "/zh-hant/ouyi-okx-web/" },
  { label: "APP下載地址", href: "/zh-hant/ouyi-okx-download/" },
  { label: "PC端網址", href: "/zh-hant/ouyi-okx-pc/" },
  { label: "安卓APP", href: "/zh-hant/ouyi-okx-android/" },
  { label: "註冊安裝連結", href: "/zh-hant/ouyi-okx-register/" },
];

export default function Custom404() {
  const router = useRouter();
  const isHant = router.asPath.startsWith("/zh-hant");
  const links = isHant ? hantLinks : hansLinks;

  const copy = isHant
    ? {
        lang: "zh-Hant",
        title: "404 - 頁面不存在 | 歐意交易所入口",
        heading: "頁面不存在或連結已失效",
        description:
          "可以繼續訪問歐意OKX Web網址、APP下載地址、PC端網址和註冊安裝連結。",
        section: "入口頁面",
        hint: "如果是手動輸入網址，先檢查路徑拼寫；如果是舊連結，可以回到歐意交易所入口重新進入。",
        related: ["歐意", "歐意OKX", "OKX", "APP下載地址", "註冊安裝連結"],
      }
    : {
        lang: "zh-CN",
        title: "404 - 页面不存在 | 欧意交易所入口",
        heading: "页面不存在或链接已失效",
        description:
          "可以继续访问欧意OKX Web网址、APP下载地址、PC端网址和注册安装链接。",
        section: "入口页面",
        hint: "如果是手动输入网址，先检查路径拼写；如果是旧链接，可以回到欧意交易所入口重新进入。",
        related: ["欧意", "欧意OKX", "OKX", "APP下载地址", "注册安装链接"],
      };

  return (
    <>
      <Head>
        <title>{copy.title}</title>
        <meta name="robots" content="noindex,follow" />
        <meta
          name="description"
          content={
            isHant
              ? "頁面不存在。可繼續訪問歐意OKX Web網址、APP下載地址、PC端網址和註冊安裝連結。"
              : "页面不存在。可继续访问欧意OKX Web网址、APP下载地址、PC端网址和注册安装链接。"
          }
        />
      </Head>

      <main
        className="min-h-screen bg-slate-50 px-5 py-12 text-slate-950 sm:py-16"
        lang={copy.lang}
      >
        <section className="mx-auto flex w-full max-w-4xl flex-col gap-6 rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm sm:p-10">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-950 text-white">
              <Shield className="h-6 w-6" strokeWidth={1.8} />
            </span>
            <span className="text-sm font-semibold tracking-wide text-blue-600">
              404
            </span>
          </div>

          <div className="space-y-3">
            <h1 className="text-3xl font-black leading-tight sm:text-5xl">
              {copy.heading}
            </h1>
            <p className="max-w-2xl text-base leading-8 text-slate-600">
              {copy.description}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <h2 className="text-lg font-bold">{copy.section}</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {links.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="group flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800 transition hover:border-blue-200 hover:text-blue-600 hover:shadow-sm"
                >
                  <span>{item.label}</span>
                  <ChevronRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                </Link>
              ))}
            </div>
          </div>

          <p className="text-sm leading-7 text-slate-500">{copy.hint}</p>

          <div className="flex flex-wrap items-center gap-2 border-t border-slate-100 pt-5 text-xs text-slate-500">
            {copy.related.map((item) => (
              <span
                key={item}
                className="rounded-full border border-slate-200 bg-white px-3 py-1.5"
              >
                {item}
              </span>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}

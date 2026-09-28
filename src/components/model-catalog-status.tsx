"use client";
import { Button } from "@/components/ui/button";
import { useLocale } from "@/lib/i18n";
import type { ModelCatalogStatus as Status } from "@/lib/model-catalog";
export function ModelCatalogStatus({ statuses, pending, onRetry }: { statuses: Status[]; pending: string[]; onRetry: (provider?: string) => void }) {
  const locale = useLocale();
  const isTh = locale === "th";
  const isZh = locale === "zh";

  if (!statuses.length && !pending.length) return null;
  const names = [...new Set([...statuses.map((status) => status.provider), ...pending])].sort();
  const failures = statuses.filter((status) => status.status === "error" || status.status === "fallback").length;

  const tSummary = pending.length
    ? isTh
      ? "กำลังโหลดรายการโมเดล…"
      : isZh
        ? "正在加载模型目录…"
        : "Loading model catalogs…"
    : failures
      ? isTh
        ? `${failures} รายการต้องตรวจสอบ`
        : isZh
          ? `${failures} 项目录需检查`
          : `${failures} catalogs need attention`
      : isTh
        ? "โหลดรายการโมเดลเรียบร้อย"
        : isZh
          ? "模型目录已加载"
          : "Model catalogs loaded";

  const tDesc = isTh
    ? "สถานะรายการไม่ได้หมายถึงคีย์ ยอดคงเหลือ หรือบริการสร้างพร้อมใช้งาน การรีเฟรชที่นี่เพียงอัปเดตรายการเท่านั้น"
    : isZh
      ? "目录状态不代表密钥、余额或生成服务可用。这里只刷新目录，不发起生成。"
      : "Catalog status does not verify credentials, balance or generation availability. Refreshing does not generate content.";

  const localeCode = isTh ? "th-TH" : isZh ? "zh-CN" : "en-US";

  return <details className="my-3 rounded-xl border border-border/60 bg-muted/20 p-3" open={failures > 0 || undefined}>
    <summary className="min-h-11 cursor-pointer py-3 text-xs font-medium">{tSummary}</summary>
    <p className="mb-2 text-xs leading-5 text-muted-foreground">{tDesc}</p>
    {names.map((name) => <div key={name} className="flex flex-wrap items-center justify-between gap-2 border-t border-border/40 py-2">
      <div className="min-w-0 text-xs"><p className="font-medium">{name}</p>{statuses.filter((status) => status.provider === name).map((status) => {
        const mediaLabel = status.mediaType === "image" ? (isTh ? "รูปภาพ" : isZh ? "图片" : "Image") : (isTh ? "วิดีโอ" : isZh ? "视频" : "Video");
        const statusText = status.status === "error"
          ? (isTh ? "ดึงรายการไม่สำเร็จ" : isZh ? "目录请求失败" : "Catalog unavailable")
          : status.status === "fallback"
            ? (isTh ? `อัปเดตไม่สำเร็จ ใช้โมเดลสำรอง ${status.count} รายการ` : isZh ? `更新失败，保留 ${status.count} 个备用模型` : `Refresh failed; ${status.count} fallback models`)
            : status.status === "empty"
              ? (isTh ? "ยังไม่มีโมเดล" : isZh ? "暂无模型" : "No models")
              : `${status.count} ${isTh ? "โมเดล" : isZh ? "个模型" : "models"}`;

        return <p key={status.mediaType} className={`mt-1 ${status.status === "error" || status.status === "fallback" ? "text-amber-600 dark:text-amber-300" : "text-muted-foreground"}`}>
          {mediaLabel} · {statusText} · {new Date(status.checkedAt).toLocaleTimeString(localeCode)}
          {status.catalogUpdatedAt && <span> · {isTh ? "ข้อมูล ณ " : isZh ? "数据时间 " : "Data as of "}{new Date(status.catalogUpdatedAt).toLocaleString(localeCode)}</span>}
        </p>;
      })}</div><Button variant="outline" className="min-h-11" disabled={pending.length > 0} onClick={() => onRetry(name)}>{pending.includes(name) ? (isTh ? "กำลังโหลด" : isZh ? "加载中" : "Loading") : (isTh ? "รีเฟรชรายการ" : isZh ? "刷新目录" : "Refresh")}</Button>
    </div>)}
  </details>;
}

"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { LuPlus, LuFolderOpen, LuLoader, LuTrash2, LuDownload, LuImage, LuPlay, LuTriangleAlert } from "react-icons/lu";
import { useT, useLocale } from "@/lib/i18n";
import { formatRelativeTime } from "@/lib/relative-time";

interface ProjectRow {
  id: string;
  name: string;
  productName: string | null;
  productImages?: string[] | null;
  status: string;
  updatedAt: string | null;
}

interface WorkRow {
  id: string;
  projectId: string;
  projectName: string | null;
  productName: string | null;
  label: string | null;
  duration: number | null;
  createdAt: string | null;
  url: string;
  thumbnailUrl: string | null;
}

// project status → the pipeline step to resume at (done lands on export where the film lives)
function stepFor(status: string): string {
  if (status === "done") return "export";
  if (status === "composing" || status === "video") return "video";
  if (status === "assets") return "assets";
  return "script";
}

// project status → common.status* i18n key
function statusKeyFor(status: string): string {
  switch (status) {
    case "done": return "statusDone";
    case "composing": return "statusComposing";
    case "video": return "statusVideo";
    case "assets": return "statusAssets";
    case "scripting": return "statusScripting";
    default: return "statusDraft";
  }
}

/**
 * Project library with two views:
 * - Projects: every project, searchable, resuming at the right step — now with a poster
 *   (latest render's first frame, falling back to the product photo) and a delete entrance.
 * - Works: the cross-project feed of finished videos, newest first, found by their pictures
 *   instead of by opening N export pages one by one.
 */
export default function ProjectsPage() {
  const t = useT("projectsPage");
  const tc = useT("common");
  const locale = useLocale();
  const [rows, setRows] = useState<ProjectRow[]>([]);
  const [works, setWorks] = useState<WorkRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [view, setView] = useState<"projects" | "works">("projects");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [projRes, workRes] = await Promise.all([
          fetch("/api/project"),
          fetch("/api/works").catch(() => null),
        ]);
        if (!projRes.ok) throw new Error(String(projRes.status));
        const data = await projRes.json();
        const list: ProjectRow[] = Array.isArray(data) ? data : [];
        const ts = (p: ProjectRow) => {
          if (!p.updatedAt) return 0;
          const time = new Date(p.updatedAt).getTime();
          return Number.isFinite(time) ? time : 0;
        };
        if (!cancelled) setRows([...list].sort((a, b) => ts(b) - ts(a)));
        if (workRes?.ok) {
          const w = await workRes.json().catch(() => ({}));
          if (!cancelled && Array.isArray(w?.works)) setWorks(w.works as WorkRow[]);
        }
      } catch {
        if (!cancelled) setLoadError(t("loadError"));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- fetch once; t is stable per locale
  }, []);

  // works are newest-first → first occurrence per project = its latest poster
  const posterByProject = useMemo(() => {
    const m = new Map<string, string>();
    for (const w of works) {
      if (w.thumbnailUrl && !m.has(w.projectId)) m.set(w.projectId, w.thumbnailUrl);
    }
    return m;
  }, [works]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((p) =>
      (p.name || "").toLowerCase().includes(q) || (p.productName || "").toLowerCase().includes(q)
    );
  }, [rows, query]);

  // Custom delete confirmation modal state
  const [deleteTarget, setDeleteTarget] = useState<ProjectRow | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const openDeleteDialog = (p: ProjectRow, e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    setDeleteTarget(p);
    setDeleteError(null);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    setDeleteError(null);
    try {
      const res = await fetch(`/api/project/${deleteTarget.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error(String(res.status));
      setRows((prev) => prev.filter((r) => r.id !== deleteTarget.id));
      setWorks((prev) => prev.filter((w) => w.projectId !== deleteTarget.id));
      setDeleteTarget(null);
    } catch {
      setDeleteError(t("deleteFailed"));
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="min-h-screen grid-bg">
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        {/* Page header: title + primary action, same pattern as the other library pages */}
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{t("pageTitle")}</h1>
            <p className="mt-1 text-sm text-muted-foreground">{t("pageSubtitle")}</p>
          </div>
          <Link href="/project/new">
            <Button size="sm" className="brand-gradient text-white">
              <LuPlus className="h-4 w-4" />
              <span className="ml-1.5">{t("newProject")}</span>
            </Button>
          </Link>
        </div>

        {/* projects / works view switch */}
        <div className="mb-5 flex flex-wrap items-center gap-3">
          <div className="flex rounded-lg border border-border/50 p-0.5">
            {(["projects", "works"] as const).map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setView(v)}
                className={`rounded-md px-4 py-1.5 text-xs font-medium transition-colors ${
                  view === v ? "bg-primary/15 text-primary" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {t(v === "projects" ? "tabProjects" : "tabWorks")}
                {v === "works" && works.length > 0 && <span className="ml-1 opacity-70">({works.length})</span>}
              </button>
            ))}
          </div>
          {view === "projects" && rows.length > 0 && (
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("searchPlaceholder")}
              className="max-w-sm text-sm"
            />
          )}
        </div>

        {loading ? (
          <div className="flex items-center gap-2 py-16 justify-center text-sm text-muted-foreground">
            <LuLoader className="h-4 w-4 animate-spin" />
            {tc("loading")}
          </div>
        ) : loadError ? (
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {loadError}
          </div>
        ) : view === "works" ? (
          works.length === 0 ? (
            <Card className="glass-card">
              <CardContent className="flex flex-col items-center gap-3 py-14 text-center">
                <LuImage className="h-8 w-8 text-muted-foreground/60" />
                <div>
                  <p className="font-medium">{t("worksEmpty")}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{t("worksEmptyDesc")}</p>
                </div>
                <Link href="/start"><Button size="sm" className="mt-2">{t("goStart")}</Button></Link>
              </CardContent>
            </Card>
          ) : (
            <>
              <p className="mb-3 text-xs text-muted-foreground">{t("worksCount", { n: works.length })}</p>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {works.map((w) => {
                  const rel = formatRelativeTime(w.createdAt, locale);
                  return (
                    <Card key={w.id} className="glass-card card-hover group overflow-hidden">
                      <CardContent className="p-0">
                        <Link href={`/project/${w.projectId}/export`} className="block">
                          <div className="relative aspect-[3/4] bg-muted/30">
                            {w.thumbnailUrl ? (
                              // eslint-disable-next-line @next/next/no-img-element -- local file server, next/image adds nothing
                              <img src={w.thumbnailUrl} alt="" loading="lazy" className="h-full w-full object-cover" />
                            ) : (
                              <div className="absolute inset-0 flex items-center justify-center">
                                <LuPlay className="h-7 w-7 text-muted-foreground/50" />
                              </div>
                            )}
                            {w.label && (
                              <span className="absolute left-1.5 top-1.5 max-w-[85%] truncate rounded bg-black/60 px-1.5 py-0.5 text-[10px] text-white">
                                {w.label}
                              </span>
                            )}
                          </div>
                        </Link>
                        <div className="flex items-center justify-between gap-1 p-2.5">
                          <div className="min-w-0">
                            <p className="truncate text-xs font-medium">{w.productName || w.projectName || t("untitled")}</p>
                            <p className="truncate text-[11px] text-muted-foreground">{rel}</p>
                          </div>
                          <a
                            href={`${w.url}?download=1`}
                            title={t("download")}
                            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
                          >
                            <LuDownload className="h-3.5 w-3.5" />
                          </a>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </>
          )
        ) : rows.length === 0 ? (
          <Card className="glass-card">
            <CardContent className="flex flex-col items-center gap-3 py-14 text-center">
              <LuFolderOpen className="h-8 w-8 text-muted-foreground/60" />
              <div>
                <p className="font-medium">{t("empty")}</p>
                <p className="mt-1 text-sm text-muted-foreground">{t("emptyDesc")}</p>
              </div>
              <div className="mt-2 flex gap-2">
                <Link href="/start"><Button size="sm">{t("goStart")}</Button></Link>
                <Link href="/project/new"><Button size="sm" variant="outline">{t("goNew")}</Button></Link>
              </div>
            </CardContent>
          </Card>
        ) : filtered.length === 0 ? (
          <p className="py-10 text-center text-sm text-muted-foreground">{t("noMatch")}</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((p) => {
              const rel = formatRelativeTime(p.updatedAt, locale);
              const poster = posterByProject.get(p.id) ?? (p.productImages?.[0] || null);
              return (
                <Card key={p.id} className="glass-card card-hover group h-full overflow-hidden">
                  <CardContent className="p-0">
                    <Link href={`/project/${p.id}/${stepFor(p.status)}`} className="block">
                      {/* poster: latest render's first frame, falling back to the product photo */}
                      <div className="relative aspect-video bg-muted/30">
                        {poster ? (
                          // eslint-disable-next-line @next/next/no-img-element -- local file server, next/image adds nothing
                          <img src={poster} alt="" loading="lazy" className="h-full w-full object-cover" />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <LuImage className="h-7 w-7 text-muted-foreground/40" />
                          </div>
                        )}
                        <Badge
                          variant={p.status === "done" ? "default" : "secondary"}
                          className="absolute left-2 top-2 text-[11px]"
                        >
                          {tc(statusKeyFor(p.status))}
                        </Badge>
                      </div>
                      <div className="p-4 pb-3">
                        <p className="min-w-0 truncate text-sm font-medium">
                          {p.name || p.productName || t("untitled")}
                        </p>
                        <p className="mt-1.5 truncate text-xs text-muted-foreground">
                          {p.productName || ""}
                          {p.productName && rel ? " · " : ""}
                          {rel || ""}
                        </p>
                      </div>
                    </Link>
                    <div className="flex justify-end px-2 pb-2">
                      <button
                        type="button"
                        onClick={(e) => openDeleteDialog(p, e)}
                        title={t("deleteProject")}
                        className="flex h-7 w-7 items-center justify-center rounded-full text-muted-foreground/70 opacity-100 transition-colors hover:bg-red-500/15 hover:text-red-400 md:opacity-0 md:group-hover:opacity-100"
                      >
                        <LuTrash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Custom Confirmation Dialog for Project Deletion */}
        <Dialog
          open={deleteTarget !== null}
          onOpenChange={(open) => {
            if (!open && !isDeleting) {
              setDeleteTarget(null);
              setDeleteError(null);
            }
          }}
        >
          <DialogContent className="sm:max-w-md border border-white/10 bg-zinc-950/95 p-6 backdrop-blur-xl shadow-2xl shadow-red-950/25">
            <div className="flex flex-col items-center text-center">
              {/* Warning Glow Icon */}
              <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-red-500/10 text-red-400 ring-1 ring-red-500/25 shadow-lg shadow-red-500/15">
                <LuTrash2 className="h-6 w-6" />
              </div>

              <DialogHeader className="space-y-1.5 text-center">
                <DialogTitle className="text-lg font-bold tracking-tight text-foreground">
                  {t("deleteDialogTitle")}
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground leading-relaxed">
                  {t("deleteDialogDesc")}
                </DialogDescription>
              </DialogHeader>

              {/* Target Project Summary Card */}
              {deleteTarget && (
                <div className="mt-4 w-full rounded-xl border border-border/60 bg-muted/20 p-3.5 text-left flex items-center gap-3.5">
                  <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-muted/40 border border-border/40 flex items-center justify-center">
                    {deleteTarget.productImages?.[0] ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={deleteTarget.productImages[0]}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <LuFolderOpen className="h-5 w-5 text-muted-foreground/60" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-sm truncate text-foreground">
                      {deleteTarget.name || deleteTarget.productName || t("untitled")}
                    </p>
                    {deleteTarget.productName && (
                      <p className="text-xs text-muted-foreground truncate mt-0.5">
                        {deleteTarget.productName}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Error Message Display if API fails */}
              {deleteError && (
                <div className="mt-3 flex w-full items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 p-2.5 text-xs text-red-400">
                  <LuTriangleAlert className="h-4 w-4 shrink-0" />
                  <span>{deleteError}</span>
                </div>
              )}
            </div>

            <DialogFooter className="-mx-6 -mb-6 mt-6 border-t border-border/40 bg-zinc-900/40 p-4 flex gap-2 sm:gap-3">
              <Button
                type="button"
                variant="outline"
                disabled={isDeleting}
                onClick={() => setDeleteTarget(null)}
                className="flex-1 border-border/70 bg-background/50 hover:bg-muted/40"
              >
                {t("deleteDialogCancel")}
              </Button>
              <Button
                type="button"
                disabled={isDeleting}
                onClick={confirmDelete}
                className="flex-1 bg-red-600 hover:bg-red-500 text-white font-medium shadow-lg shadow-red-600/30 transition-all border-0"
              >
                {isDeleting ? (
                  <>
                    <LuLoader className="h-4 w-4 animate-spin mr-1.5" />
                    {t("deleteInProgress")}
                  </>
                ) : (
                  <>
                    <LuTrash2 className="h-4 w-4 mr-1.5" />
                    {t("deleteDialogConfirm")}
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}

"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { LuPlus, LuTrash2, LuUser, LuStar } from "react-icons/lu";
import { useT } from "@/lib/i18n";
import { useSettingsStore } from "@/lib/stores/settings-store";
import { useCharacterStore, type Character } from "@/lib/stores/project-store";
import { resolveDefaultModelTarget, buildImageOptions } from "@/lib/gen-params";

/* eslint-disable @next/next/no-img-element -- sheet previews are local uploads served by our own API */

/**
 * Presenter library manager: create/edit presenters and generate their 2x2
 * multi-view reference sheets (the identity anchor consumed by the storyboard
 * grid, the one-tap film and the generic image API).
 *
 * Shared by the dedicated /presenters page and the settings "characters" tab —
 * extracted from the settings page so the library has a first-class home in
 * the sidebar instead of being buried three tabs deep.
 *
 * Sheet generations run per-presenter (a Set of in-flight ids), so styling one
 * presenter no longer locks the button on every other card.
 */
export function PresenterManager() {
  const t = useT("settings");
  const { characters, addCharacter, updateCharacter, removeCharacter } = useCharacterStore();
  const { providers, defaultImageModel, customModels, imageParams } = useSettingsStore();
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", description: "", appearance: "", voiceStyle: "" });
  // per-presenter in-flight sheet generations (the result lands in referenceImages[0])
  const [sheetGenIds, setSheetGenIds] = useState<Set<string>>(new Set());
  const [sheetNotice, setSheetNotice] = useState<string | null>(null);
  // full-size sheet preview dialog (null = closed)
  const [preview, setPreview] = useState<{ url: string; name: string } | null>(null);
  // delete confirmation state
  const [charToDelete, setCharToDelete] = useState<Character | null>(null);

  const confirmDeleteChar = () => {
    if (!charToDelete) return;
    removeCharacter(charToDelete.id);
    if (editingId === charToDelete.id) resetForm();
    setCharToDelete(null);
  };

  // generate the 2x2 turnaround sheet: same person from four angles in ONE generation,
  // then every downstream pass (grid / film / keyframes) can pin the identity to it
  const generateSheet = async (char: Character) => {
    if (!char.appearance?.trim()) {
      setSheetNotice(t("characterSheetNeedsAppearance"));
      return;
    }
    if (sheetGenIds.has(char.id)) return;
    setSheetGenIds((prev) => new Set(prev).add(char.id));
    setSheetNotice(null);
    try {
      const target = await resolveDefaultModelTarget(providers, defaultImageModel, customModels, "image");
      if (!target) throw new Error(t("characterSheetNoModel"));
      const res = await fetch("/api/characters/sheet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          appearance: char.appearance,
          name: char.name,
          provider: target.provider,
          model: target.model,
          apiKey: target.apiKey,
          baseUrl: target.baseUrl,
          // the sheet is a square 2x2 grid, regardless of the user's video aspect default
          options: buildImageOptions(imageParams ? { ...imageParams, aspectRatio: "1:1", count: 1 } : undefined),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || t("characterSheetFailed"));
      updateCharacter(char.id, { referenceImages: [data.url, ...(char.referenceImages ?? []).slice(1)] });
      setSheetNotice(t("characterSheetDone", { name: char.name }));
    } catch (e) {
      setSheetNotice(e instanceof Error ? e.message : t("characterSheetFailed"));
    } finally {
      setSheetGenIds((prev) => {
        const next = new Set(prev);
        next.delete(char.id);
        return next;
      });
    }
  };

  const resetForm = () => {
    setForm({ name: "", description: "", appearance: "", voiceStyle: "" });
    setIsCreating(false);
    setEditingId(null);
  };

  const handleSave = () => {
    if (!form.name.trim()) return;
    if (editingId) {
      updateCharacter(editingId, {
        name: form.name,
        description: form.description,
        appearance: form.appearance,
        voiceProfile: form.voiceStyle ? { style: form.voiceStyle } : undefined,
      });
    } else {
      addCharacter({
        id: crypto.randomUUID(),
        name: form.name,
        description: form.description,
        appearance: form.appearance,
        referenceImages: [],
        voiceProfile: form.voiceStyle ? { style: form.voiceStyle } : undefined,
        isDefault: characters.length === 0,
      });
    }
    resetForm();
  };

  const startEdit = (char: Character) => {
    setEditingId(char.id);
    setIsCreating(true);
    setForm({
      name: char.name,
      description: char.description || "",
      appearance: char.appearance || "",
      voiceStyle: char.voiceProfile?.style || "",
    });
  };

  const setAsDefault = (id: string) => {
    characters.forEach((c) => updateCharacter(c.id, { isDefault: c.id === id }));
  };

  return (
    <div className="space-y-4">
      <Card className="glass-card">
        <CardContent className="p-4">
          <p className="text-sm text-muted-foreground leading-relaxed">
            {t("characterIntro")}
          </p>
        </CardContent>
      </Card>

      {sheetNotice && (
        <div className="rounded-lg border border-border bg-muted/40 px-4 py-2.5 text-xs text-muted-foreground">
          {sheetNotice}
        </div>
      )}

      {characters.length > 0 && (
        <div className="space-y-3">
          {characters.map((char) => (
            <Card key={char.id} className={`glass-card ${char.isDefault ? "ring-1 ring-primary/50" : ""}`}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    {char.referenceImages?.[0] ? (
                      // click opens the full-size sheet so the four views are actually inspectable
                      <button
                        type="button"
                        className="shrink-0 cursor-zoom-in"
                        onClick={() => setPreview({ url: char.referenceImages![0], name: char.name })}
                        title={t("characterSheetAlt", { name: char.name })}
                      >
                        <img
                          src={char.referenceImages[0]}
                          alt={t("characterSheetAlt", { name: char.name })}
                          className="h-16 w-16 rounded-lg object-cover ring-1 ring-border"
                        />
                      </button>
                    ) : (
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                        <LuUser className="w-5 h-5 text-primary" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-sm">{char.name}</h3>
                        {char.isDefault && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-primary/15 px-2 py-0.5 text-xs text-primary">
                            <LuStar className="w-3 h-3" />
                            {t("characterDefault")}
                          </span>
                        )}
                      </div>
                      {char.description && <p className="text-xs text-muted-foreground mb-1">{char.description}</p>}
                      {char.appearance && <p className="text-xs text-muted-foreground/70 line-clamp-1">{t("characterAppearancePrefix", { appearance: char.appearance })}</p>}
                      {char.voiceProfile?.style && <p className="text-xs text-muted-foreground/70 mt-0.5">{t("characterVoicePrefix", { voice: char.voiceProfile.style })}</p>}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs h-7 px-2 text-primary"
                      disabled={sheetGenIds.has(char.id)}
                      onClick={() => generateSheet(char)}
                      title={t("characterSheetTip")}
                    >
                      {sheetGenIds.has(char.id) ? t("characterSheetRunning") : char.referenceImages?.[0] ? t("characterSheetRedo") : t("characterSheetBtn")}
                    </Button>
                    {!char.isDefault && (
                      <Button variant="ghost" size="sm" className="text-xs h-7 px-2" onClick={() => setAsDefault(char.id)}>
                        <LuStar className="w-3 h-3" />
                      </Button>
                    )}
                    <Button variant="ghost" size="sm" className="text-xs h-7 px-2" onClick={() => startEdit(char)}>{t("characterEdit")}</Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs h-7 px-2 text-destructive hover:text-destructive"
                      onClick={() => setCharToDelete(char)}
                      title={t("characterDeleteDialogTitle")}
                    >
                      <LuTrash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {isCreating ? (
        <Card className="glass-card ring-1 ring-primary/30">
          <CardContent className="p-5 space-y-4">
            <h3 className="text-sm font-semibold">{editingId ? t("characterFormEditTitle") : t("characterFormAddTitle")}</h3>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">{t("characterNameLabel")}</Label>
              <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder={t("characterNamePlaceholder")} className="text-sm" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">{t("characterDescLabel")}</Label>
              <Input value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} placeholder={t("characterDescPlaceholder")} className="text-sm" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">{t("characterAppearanceLabel")}</Label>
              <Textarea value={form.appearance} onChange={(e) => setForm((f) => ({ ...f, appearance: e.target.value }))} placeholder={t("characterAppearancePlaceholder")} rows={3} className="text-sm resize-none" />
              <p className="text-[11px] text-muted-foreground/60">{t("characterAppearanceTip")}</p>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">{t("characterVoiceLabel")}</Label>
              <Input value={form.voiceStyle} onChange={(e) => setForm((f) => ({ ...f, voiceStyle: e.target.value }))} placeholder={t("characterVoicePlaceholder")} className="text-sm" />
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={resetForm}>{t("characterCancel")}</Button>
              <Button size="sm" className="brand-gradient text-white" onClick={handleSave} disabled={!form.name.trim()}>
                {editingId ? t("characterSaveEdit") : t("characterAddSubmit")}
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Button variant="outline" className="w-full h-12 border-dashed" onClick={() => setIsCreating(true)}>
          <LuPlus className="w-4 h-4 mr-2" />
          {t("characterAddButton")}
        </Button>
      )}

      {/* full-size sheet preview */}
      <Dialog open={preview !== null} onOpenChange={(open) => !open && setPreview(null)}>
        <DialogContent className="max-w-2xl p-4">
          <DialogTitle className="text-sm">
            {preview ? t("characterSheetAlt", { name: preview.name }) : ""}
          </DialogTitle>
          {preview && (
            <img src={preview.url} alt={t("characterSheetAlt", { name: preview.name })} className="w-full rounded-lg" />
          )}
        </DialogContent>
      </Dialog>

      {/* delete character confirmation dialog */}
      <Dialog open={charToDelete !== null} onOpenChange={(open) => !open && setCharToDelete(null)}>
        <DialogContent className="max-w-md border-white/10 bg-zinc-950/95 backdrop-blur-xl text-zinc-100 shadow-2xl shadow-red-950/25">
          <DialogHeader className="gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-500/10 text-red-400 ring-1 ring-red-500/20 shadow-inner">
                <LuTrash2 className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-base font-semibold text-zinc-100 flex items-center gap-1.5">
                  {t("characterDeleteDialogTitle")}
                </DialogTitle>
                <DialogDescription className="text-xs text-zinc-400 mt-0.5">
                  {t("characterDeleteDialogDesc")}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {charToDelete && (
            <div className="my-2 flex items-center gap-3 rounded-lg border border-white/5 bg-white/[0.03] p-3">
              <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md bg-zinc-900 border border-white/10 flex items-center justify-center">
                {charToDelete.referenceImages?.[0] ? (
                  <img
                    src={charToDelete.referenceImages[0]}
                    alt={charToDelete.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <LuUser className="h-5 w-5 text-zinc-500" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-medium text-sm text-zinc-200 truncate">
                  {charToDelete.name}
                </div>
                {charToDelete.description && (
                  <div className="text-xs text-muted-foreground truncate mt-0.5">
                    {charToDelete.description}
                  </div>
                )}
              </div>
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-2 mt-2">
            <Button
              type="button"
              variant="outline"
              className="border-white/10 bg-white/5 hover:bg-white/10 text-zinc-200 text-xs h-9"
              onClick={() => setCharToDelete(null)}
            >
              {t("characterCancel")}
            </Button>
            <Button
              type="button"
              className="bg-red-600 hover:bg-red-500 text-white font-medium text-xs h-9 shadow-lg shadow-red-600/30 border-0"
              onClick={confirmDeleteChar}
            >
              <LuTrash2 className="h-3.5 w-3.5 mr-1.5" />
              {t("characterDeleteDialogConfirm")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

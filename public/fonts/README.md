# 字幕字体 / Subtitle font

`subtitle.otf` 是 **Noto Sans CJK SC**（Google，SIL OFL 1.1，见 `OFL.txt`）的**子集**，
覆盖简体中文(GB2312) + 日文(JIS X 0208) + 韩文(KS X 1001) + 拉丁 + 常用标点（~14k 字形，2.7MB）。

`src/lib/video-composer/composer.ts` 的 `resolveChineseFontFile()` 优先用本字体，保证
**中/英/日/韩字幕在所有平台一致渲染**（系统字体因 OS 而异：macOS 的 PingFang/STHeiti 不含韩文谚文，会渲染成豆腐块）。

## 重新生成子集
全量 Noto CJK ~16MB，子集到常用字符集压到 2.7MB：

```bash
# 1) 下载全量统一 Noto Sans CJK（含 zh+ja+ko 字形）
curl -sL -o noto-cjk.otf \
  https://github.com/notofonts/noto-cjk/raw/main/Sans/OTF/SimplifiedChinese/NotoSansCJKsc-Regular.otf

# 2) 生成字符集（GB2312 + JIS X 0208 + KS X 1001 + 拉丁/标点/假名/全角），见提交说明里的 python 片段
# 3) 子集化（需 fontTools）
python3 -m fontTools.subset noto-cjk.otf --text-file=chars.txt \
  --output-file=subtitle.otf --no-glyph-names --no-hinting --desubroutinize \
  --layout-features='' --name-IDs='1,2,3,4,6'
```

> ⚠️ 子集只含常用字（覆盖自然语言旁白 99.9%）；极生僻字可能缺字。如需全覆盖换全量 Noto CJK。

## 泰语 / Thai (Noto Sans Thai)

`NotoSansThai-Regular.ttf` + `NotoSansThai-Bold.ttf` — Google Fonts (SIL OFL 1.1, 见 `OFL-NotoSansThai.txt`),
纯泰语字幕时 `resolveFontFileForText()` / `resolveFontFamilyForText()` 自动选用（混排泰+CJK 时保持 CJK 字体，
单个 drawtext 字体文件无法同时覆盖两种文字）。Sarabun 暂不打包：文档字体笔画细，小字号视频字幕可读性不如 Noto Sans Thai。

 Thai subtitles use Noto Sans Thai (screen-optimized, full Thai+Latin+GPOS mark positioning);
 Sarabun is intentionally not bundled (document typeface, too thin for small video captions).

复现（variable font 取静态实例）：
```bash
curl -sL -o NotoSansThai-var.ttf \
  https://raw.githubusercontent.com/google/fonts/main/ofl/notosansthai/NotoSansThai%5Bwdth%2Cwght%5D.ttf
python3 -m fontTools.varLib.instancer NotoSansThai-var.ttf wght=400 -o NotoSansThai-Regular.ttf --update-name-table
python3 -m fontTools.varLib.instancer NotoSansThai-var.ttf wght=700 -o NotoSansThai-Bold.ttf --update-name-table
```

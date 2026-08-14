#!/usr/bin/env python3
"""Genera og-image.png e iconos PNG a partir de la marca (columnas + punto rojo)."""

from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1] / "public"
TEAL = (13, 148, 136)
TEAL2 = (15, 118, 110)
RED = (244, 63, 94)
WHITE = (255, 255, 255)
FONT_BOLD = "/System/Library/Fonts/Supplemental/Arial Bold.ttf"
FONT_REG = "/System/Library/Fonts/Supplemental/Arial.ttf"


def lerp(a: tuple[int, int, int], b: tuple[int, int, int], t: float) -> tuple[int, int, int]:
    t = max(0.0, min(1.0, t))
    return tuple(int(a[i] + (b[i] - a[i]) * t) for i in range(3))  # type: ignore[return-value]


def paint_gradient(size: tuple[int, int]) -> Image.Image:
    w, h = size
    img = Image.new("RGB", size)
    px = img.load()
    for y in range(h):
        for x in range(w):
            t = x / max(w - 1, 1) * 0.55 + y / max(h - 1, 1) * 0.45
            px[x, y] = lerp(TEAL, TEAL2, t)
    return img


def draw_mark(size: int) -> Image.Image:
    bg = paint_gradient((size, size))
    mask = Image.new("L", (size, size), 0)
    ImageDraw.Draw(mask).rounded_rectangle(
        (0, 0, size - 1, size - 1), radius=round(size * 9 / 32), fill=255
    )
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    img.paste(bg, (0, 0), mask)
    d = ImageDraw.Draw(img)
    s = size / 32.0

    def col(x: float, y: float, w: float, h: float, alpha: float) -> None:
        d.rounded_rectangle(
            (x * s, y * s, (x + w) * s, (y + h) * s),
            radius=max(1, round(1.75 * s)),
            fill=(255, 255, 255, round(255 * alpha)),
        )

    col(7, 9, 4.5, 14, 0.92)
    col(13.75, 7, 4.5, 16, 0.92)
    col(20.5, 11, 4.5, 12, 0.55)
    cx, cy, r = 22.75 * s, 9 * s, 2.25 * s
    d.ellipse((cx - r, cy - r, cx + r, cy + r), fill=(*RED, 255))
    return img


def write_icon(path: Path, size: int) -> None:
    draw_mark(size).convert("RGB").save(path, "PNG", optimize=True)
    print(f"wrote {path} ({size}x{size})")


def write_og(path: Path) -> None:
    w, h = 1200, 630
    img = paint_gradient((w, h))
    canvas = img.convert("RGBA")
    mark = draw_mark(168)
    title_font = ImageFont.truetype(FONT_BOLD, 78)
    tag_font = ImageFont.truetype(FONT_REG, 32)
    sub_font = ImageFont.truetype(FONT_REG, 22)
    url_font = ImageFont.truetype(FONT_REG, 18)

    title = "Taskblero"
    tagline = "Tu tablero de tareas, sin ruido."
    sub_lines = (
        "Personaliza columnas, etiquetas y mucho más.",
        "Más fácil que la tabla del uno.",
    )

    scratch = ImageDraw.Draw(canvas)
    title_box = scratch.textbbox((0, 0), title, font=title_font)
    tag_box = scratch.textbbox((0, 0), tagline, font=tag_font)
    sub_boxes = [scratch.textbbox((0, 0), line, font=sub_font) for line in sub_lines]
    title_w, title_h = title_box[2] - title_box[0], title_box[3] - title_box[1]
    tag_w = tag_box[2] - tag_box[0]
    sub_w = max(box[2] - box[0] for box in sub_boxes)
    text_w = max(title_w, tag_w, sub_w)
    gap = 36
    text_block_h = title_h + 18 + 36 + 16 + 26 * len(sub_lines)
    group_w = mark.width + gap + text_w
    group_h = max(mark.height, text_block_h)
    gx = (w - group_w) // 2
    gy = (h - group_h) // 2 - 8

    canvas.paste(mark, (gx, gy + (group_h - mark.height) // 2), mark)

    tx = gx + mark.width + gap
    ty = gy + (group_h - text_block_h) // 2
    d = ImageDraw.Draw(canvas)
    d.text((tx, ty), title, font=title_font, fill=WHITE)
    d.text((tx, ty + title_h + 18), tagline, font=tag_font, fill=(255, 255, 255, 220))
    sub_y = ty + title_h + 18 + 44
    for i, line in enumerate(sub_lines):
        d.text((tx, sub_y + i * 28), line, font=sub_font, fill=(255, 255, 255, 170))
    url = "taskblero.vercel.app"
    url_box = d.textbbox((0, 0), url, font=url_font)
    uw = url_box[2] - url_box[0]
    d.text(((w - uw) // 2, h - 48), url, font=url_font, fill=(255, 255, 255, 150))

    canvas.convert("RGB").save(path, "PNG", optimize=True)
    print(f"wrote {path} ({w}x{h})")


def main() -> None:
    ROOT.mkdir(parents=True, exist_ok=True)
    write_icon(ROOT / "favicon.png", 48)
    write_icon(ROOT / "icon-512.png", 512)
    write_icon(ROOT / "icon-192.png", 192)
    write_icon(ROOT / "apple-touch-icon.png", 180)
    write_icon(ROOT / "google-oauth-logo.png", 120)
    write_og(ROOT / "og-image.png")


if __name__ == "__main__":
    main()

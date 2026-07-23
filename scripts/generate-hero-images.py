#!/usr/bin/env python3
"""
Gera as fotos de hero (skyline urbano genérico, sem marco específico) para
as cidades de src/content/cities/*.json que ainda não têm heroImage.
Usa OpenRouter (openai/gpt-5-image-mini), recorta pra 16:9 e otimiza como WebP.

Rodar: python3 scripts/generate-hero-images.py
Precisa de OPENROUTER_API_KEY no .env do projeto.
"""

import base64
import json
import os
import sys
import time
import urllib.request
from pathlib import Path

from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parent.parent
CITIES_DIR = ROOT / "src" / "content" / "cities"
IMAGES_DIR = ROOT / "public" / "images"
ENV_FILE = ROOT / ".env"

MODEL = "openai/gpt-5-image-mini"
TARGET_W, TARGET_H = 1600, 900

VIEWPOINTS = [
    "wide aerial view of the city skyline",
    "street-level view of a busy downtown avenue",
    "residential street lined with buildings and palm trees",
    "elevated view over rooftops toward the horizon",
]
LIGHTING = [
    "golden hour, warm sunset light",
    "bright clear midday light, blue sky",
    "soft overcast morning light",
    "late afternoon light, long shadows",
]


def load_api_key():
    for line in ENV_FILE.read_text().splitlines():
        if line.startswith("OPENROUTER_API_KEY="):
            return line.split("=", 1)[1].strip()
    raise RuntimeError("OPENROUTER_API_KEY not found in .env")


def generate_image(api_key: str, seed: int) -> bytes:
    viewpoint = VIEWPOINTS[seed % len(VIEWPOINTS)]
    lighting = LIGHTING[(seed // len(VIEWPOINTS)) % len(LIGHTING)]
    prompt = (
        f"Realistic photo of a generic mid-size Brazilian city, {viewpoint}, "
        f"{lighting}, mix of residential and commercial buildings, some palm trees, "
        "ordinary traffic and pedestrians, photorealistic, natural colors, "
        "no text, no watermark, no logo, no specific famous landmark or monument"
    )

    body = json.dumps(
        {
            "model": MODEL,
            "messages": [{"role": "user", "content": prompt}],
            "modalities": ["image", "text"],
        }
    ).encode()

    req = urllib.request.Request(
        "https://openrouter.ai/api/v1/chat/completions",
        data=body,
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        },
        method="POST",
    )

    with urllib.request.urlopen(req, timeout=120) as resp:
        data = json.loads(resp.read())

    usage = data.get("usage", {})
    msg = data["choices"][0]["message"]
    images = msg.get("images", [])
    if not images:
        raise RuntimeError(f"no image returned: {str(msg.get('content'))[:300]}")

    img_data_url = images[0]["image_url"]["url"]
    _, b64data = img_data_url.split(",", 1)
    return base64.b64decode(b64data), usage.get("cost", 0)


def optimize_and_save(raw_bytes: bytes, dst_path: Path):
    from io import BytesIO

    img = Image.open(BytesIO(raw_bytes))
    img = ImageOps.exif_transpose(img)
    img = img.convert("RGB")

    target_ratio = TARGET_W / TARGET_H
    w, h = img.size
    current_ratio = w / h

    if current_ratio > target_ratio:
        new_w = int(h * target_ratio)
        left = (w - new_w) // 2
        img = img.crop((left, 0, left + new_w, h))
    else:
        new_h = int(w / target_ratio)
        top = (h - new_h) // 2
        img = img.crop((0, top, w, top + new_h))

    img = img.resize((TARGET_W, TARGET_H), Image.LANCZOS)
    img.save(dst_path, "WEBP", quality=82, method=6)


def main():
    api_key = load_api_key()
    IMAGES_DIR.mkdir(parents=True, exist_ok=True)

    files = sorted(CITIES_DIR.glob("*.json"))
    pending = []
    for f in files:
        data = json.loads(f.read_text())
        if "heroImage" not in data:
            pending.append(f)

    limit = os.environ.get("HERO_GEN_LIMIT")
    if limit:
        pending = pending[: int(limit)]

    print(f"Total de arquivos: {len(files)} | Sem heroImage: {len(pending)}")

    total_cost = 0.0
    done = 0
    errors = []

    for i, f in enumerate(pending):
        data = json.loads(f.read_text())
        slug = data["slugCity"]
        slug_uf = data["slugUf"]
        city = data["city"]
        img_filename = f"hero-{slug_uf}-{slug}.webp"
        img_path = IMAGES_DIR / img_filename

        try:
            raw, cost = generate_image(api_key, i)
            optimize_and_save(raw, img_path)

            data["heroImage"] = {
                "url": f"/images/{img_filename}",
                "alt": f"Paisagem urbana genérica representando {city}",
            }
            f.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

            total_cost += cost or 0
            done += 1
            print(f"[{done}/{len(pending)}] {city} ({data['uf']}) -> {img_filename} (${cost:.4f})")
        except Exception as e:
            errors.append((city, str(e)))
            print(f"[ERRO] {city}: {e}", file=sys.stderr)

        time.sleep(0.3)

    print("\n--- Resumo ---")
    print(f"Geradas: {done}/{len(pending)}")
    print(f"Custo total: ${total_cost:.4f} (~R${total_cost * 5.5:.2f})")
    if errors:
        print(f"Erros: {len(errors)}")
        for city, err in errors:
            print(f"  - {city}: {err}")


if __name__ == "__main__":
    main()

from PIL import Image, ImageDraw, ImageFilter
import math

PHOTO_IN  = r"C:\Users\pande\OneDrive\Pictures\Screenshots\Screenshot 2026-08-15 061650.png"
PHOTO_OUT = r"D:\resume 2.0\photo_glass.png"

# ── Load & center-crop to square ──────────────────────────
img = Image.open(PHOTO_IN).convert("RGBA")
w, h = img.size
size = min(w, h)
left = (w - size) // 2
top  = max(0, (h - size) // 2 - size // 10)   # slight upward crop for face
img  = img.crop((left, top, left + size, top + size))

TARGET = 320
img = img.resize((TARGET, TARGET), Image.LANCZOS)

# ── Circular mask for photo ───────────────────────────────
mask = Image.new('L', (TARGET, TARGET), 0)
ImageDraw.Draw(mask).ellipse((0, 0, TARGET - 1, TARGET - 1), fill=255)
img.putalpha(mask)

# ── Build glassmorphic card ───────────────────────────────
PAD   = 22
CARD  = TARGET + PAD * 2    # 364 x 364

# 1. Base: dark navy semi-transparent
card = Image.new('RGBA', (CARD, CARD), (0, 0, 0, 0))

# 2. Outer glow ring (larger circle, blurred blue)
glow = Image.new('RGBA', (CARD, CARD), (0, 0, 0, 0))
gd   = ImageDraw.Draw(glow)
gd.ellipse((4, 4, CARD - 5, CARD - 5), fill=(80, 144, 195, 90))
glow = glow.filter(ImageFilter.GaussianBlur(12))
card = Image.alpha_composite(card, glow)

# 3. Frosted glass background circle (navy translucent)
frost = Image.new('RGBA', (CARD, CARD), (0, 0, 0, 0))
fd    = ImageDraw.Draw(frost)
fd.ellipse((8, 8, CARD - 9, CARD - 9), fill=(22, 56, 83, 160))
card  = Image.alpha_composite(card, frost)

# 4. Inner blur layer — white frost shimmer
shimmer = Image.new('RGBA', (CARD, CARD), (0, 0, 0, 0))
sd      = ImageDraw.Draw(shimmer)
sd.ellipse((12, 12, CARD - 13, CARD - 13), fill=(255, 255, 255, 28))
card    = Image.alpha_composite(card, shimmer)

# 5. White border ring
border = Image.new('RGBA', (CARD, CARD), (0, 0, 0, 0))
bd     = ImageDraw.Draw(border)
bd.ellipse((10, 10, CARD - 11, CARD - 11), outline=(255, 255, 255, 200), width=3)
card   = Image.alpha_composite(card, border)

# 6. Blue accent ring (inner)
accent = Image.new('RGBA', (CARD, CARD), (0, 0, 0, 0))
ad     = ImageDraw.Draw(accent)
ad.ellipse((16, 16, CARD - 17, CARD - 17), outline=(80, 144, 195, 180), width=2)
card   = Image.alpha_composite(card, accent)

# 7. Paste circular photo centered
card.paste(img, (PAD, PAD), img)

card.save(PHOTO_OUT)
print("Glass photo saved:", PHOTO_OUT)

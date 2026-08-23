import fitz

# Analyze Drushti's CV colors and layout
doc = fitz.open(r'D:\resume 2.0\Drushti Chohan CV.pdf')
page = doc[0]

print('=== DRUSHTI CV DETAILED FORMAT ===')
print('Page size:', page.rect)
print()

blocks = page.get_text('dict')
for block in blocks['blocks']:
    if block['type'] == 0:  # text block
        for line in block['lines']:
            for span in line['spans']:
                text = span['text'][:60]
                size = span['size']
                color = span['color']
                font = span['font']
                bbox = span['bbox']
                # Convert color int to RGB
                r = (color >> 16) & 0xFF
                g = (color >> 8) & 0xFF
                b = color & 0xFF
                print(f"Text={repr(text)}")
                print(f"  Size={size:.1f}, Color=#{r:02X}{g:02X}{b:02X}, Font={font}")
                print(f"  Bbox=({bbox[0]:.0f},{bbox[1]:.0f},{bbox[2]:.0f},{bbox[3]:.0f})")
                print()

# Also extract images info
print("=== IMAGES ===")
for img in page.get_images():
    print(img)

doc.close()

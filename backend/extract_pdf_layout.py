import fitz

doc = fitz.open(r'C:\Users\pande\Downloads\From_Alert_to_Evidence_Research_Paper.pdf')
print(f'Total Pages: {len(doc)}')
print(f'Page size (pts): width={doc[0].rect.width:.1f} height={doc[0].rect.height:.1f}')
print(f'Page size (inches): width={doc[0].rect.width/72:.2f}" height={doc[0].rect.height/72:.2f}"')
print()

for pg_num in range(len(doc)):
    page = doc[pg_num]
    print(f'=== PAGE {pg_num+1} ===')
    blocks = page.get_text('dict')
    margin_left = 999
    margin_right = 0
    margin_top = 999
    for block in blocks['blocks']:
        if block['type'] == 0:
            if block['bbox'][0] < margin_left:
                margin_left = block['bbox'][0]
            if block['bbox'][2] > margin_right:
                margin_right = block['bbox'][2]
            if block['bbox'][1] < margin_top:
                margin_top = block['bbox'][1]
    print(f'  Approx margins: left={margin_left:.1f}pts, right={doc[pg_num].rect.width - margin_right:.1f}pts, top={margin_top:.1f}pts')

print()
print('=== FONTS & SIZES ON PAGE 1 ===')
page = doc[0]
blocks = page.get_text('dict')
seen = set()
for block in blocks['blocks']:
    if block['type'] == 0:
        for line in block['lines']:
            for span in line['spans']:
                key = (span['font'], round(span['size'],1))
                if key not in seen:
                    seen.add(key)
                    print(f'  font={span["font"]}  size={span["size"]:.1f}  sample={repr(span["text"][:60])}')

print()
print('=== COLUMN STRUCTURE PAGE 1 ===')
page = doc[0]
blocks = page.get_text('dict')
x_centers = []
for block in blocks['blocks']:
    if block['type'] == 0:
        cx = (block['bbox'][0] + block['bbox'][2]) / 2
        x_centers.append((cx, block['bbox'][0], block['bbox'][2]))

left_col = [x for x in x_centers if x[0] < page.rect.width/2]
right_col = [x for x in x_centers if x[0] >= page.rect.width/2]
print(f'  Left col blocks: {len(left_col)}')
print(f'  Right col blocks: {len(right_col)}')
if left_col:
    print(f'  Left col x range: {min(x[1] for x in left_col):.1f} to {max(x[2] for x in left_col):.1f}')
if right_col:
    print(f'  Right col x range: {min(x[1] for x in right_col):.1f} to {max(x[2] for x in right_col):.1f}')

print()
print('=== FULL TEXT EXTRACTION PAGE 1 ===')
page = doc[0]
text = page.get_text('text')
print(text[:3000])
print()
print('=== FULL TEXT EXTRACTION PAGE 2 ===')
if len(doc) > 1:
    page2 = doc[1]
    text2 = page2.get_text('text')
    print(text2[:3000])

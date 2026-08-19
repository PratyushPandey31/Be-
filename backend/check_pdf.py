import fitz

doc = fitz.open(r'd:\project\CyberShield_AI_IEEE_Research_Paper.pdf')
print(f'Total: {len(doc)} pages')
for i, page in enumerate(doc):
    txt = page.get_text('text').strip()
    first = txt.split('\n')[0] if txt else ''
    last = txt.split('\n')[-1] if txt else ''
    print(f'Page {i+1}: length={len(txt)} chars | start="{first[:40]}" | end="{last[:40]}"')

import fitz

doc = fitz.open(r'C:\Users\pande\Downloads\From_Alert_to_Evidence_Research_Paper.pdf')

for pg_num in range(2, len(doc)):
    page = doc[pg_num]
    text = page.get_text('text')
    print(f'=== PAGE {pg_num+1} ===')
    print(text[:4000])
    print()

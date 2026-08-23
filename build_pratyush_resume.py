from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.pdfgen import canvas
import os, sys, shutil

W, H = A4  # 595.28 x 841.89

# ─── COLOR PALETTE ─────────────────────────────────────────
NAVY   = colors.HexColor('#163853')   # sidebar bg, name, headers
BLUE   = colors.HexColor('#4da3e0')   # accents, school names, role, sub-labels, links
GRAY   = colors.HexColor('#383838')   # clean readable body text
WHITE  = colors.white
LGRAY  = colors.HexColor('#707070')   # tech stack inline & separators

SIDEBAR_W  = 196
CONTENT_X  = 208
MARGIN_R   = 16
CONTENT_W  = W - CONTENT_X - MARGIN_R

GLASS_PHOTO = r"D:\resume 2.0\photo_glass.png"
OUTPUT      = r"D:\resume 2.0\Pratyush_Pandey_Resume.pdf"

# ─── HELPERS ──────────────────────────────────────────────

def wrap_text(c, text, x, y, max_w, font, size, col, lh):
    c.setFont(font, size)
    c.setFillColor(col)
    words = text.split()
    cur_line, cur_w, lines_out = [], 0, []
    for w in words:
        ww = c.stringWidth(w + ' ', font, size)
        if cur_w + ww > max_w and cur_line:
            lines_out.append(' '.join(cur_line))
            cur_line, cur_w = [w], ww
        else:
            cur_line.append(w); cur_w += ww
    if cur_line: lines_out.append(' '.join(cur_line))
    for ln in lines_out:
        c.drawString(x, y, ln)
        y -= lh
    return y

def sidebar_header(c, text, y):
    """White bold section header in sidebar with blue underline and proper spacing"""
    c.setFillColor(WHITE)
    c.setFont('Helvetica-Bold', 11)
    c.drawString(14, y, text)
    y -= 5
    c.setStrokeColor(BLUE)
    c.setLineWidth(1.0)
    c.line(14, y, SIDEBAR_W - 14, y)
    return y - 13

def right_header(c, text, y):
    """Navy bold section header on right with navy underline and proper spacing"""
    c.setFillColor(NAVY)
    c.setFont('Helvetica-Bold', 11.5)
    c.drawString(CONTENT_X, y, text)
    y -= 4
    c.setStrokeColor(NAVY)
    c.setLineWidth(0.8)
    c.line(CONTENT_X, y, W - MARGIN_R, y)
    return y - 11.5

def draw_vector_arrow(c, x, y, size=4.2, color=NAVY):
    """Draws a crisp diagonal vector arrow icon ↗"""
    c.saveState()
    c.setStrokeColor(color)
    c.setFillColor(color)
    c.setLineWidth(0.85)
    # diagonal stem
    c.line(x, y, x + size, y + size)
    # arrow head
    c.line(x + size, y + size, x + size - 2.2, y + size)
    c.line(x + size, y + size, x + size, y + size - 2.2)
    c.restoreState()

def draw_premium_badge(c, text, x, y, url=None):
    """Draws a refined, stylish glassmorphic badge button with arrow icon and clickable link"""
    font = 'Helvetica-Bold'
    size = 7.6
    c.setFont(font, size)
    tw = c.stringWidth(text, font, size)
    arrow_gap = 3.5
    arrow_sz = 4.2
    pad_h = 7.0
    pad_v = 2.4
    bw = tw + arrow_gap + arrow_sz + pad_h * 2
    bh = size + pad_v * 2
    by = y - pad_v - 0.5
    
    c.saveState()
    # Soft translucent background pill
    c.setFillColor(colors.HexColor('#e2eef8'))
    c.roundRect(x + 0.5, by - 0.5, bw, bh, radius=3.5, fill=1, stroke=0)
    
    # Premium glass body
    c.setFillColor(colors.HexColor('#f0f7fd'))
    c.setStrokeColor(colors.HexColor('#b2d8f3'))
    c.setLineWidth(0.65)
    c.roundRect(x, by, bw, bh, radius=3.5, fill=1, stroke=1)
    
    # Badge text
    c.setFillColor(NAVY)
    c.drawString(x + pad_h, y + 0.5, text)
    
    # Diagonal vector arrow
    arrow_x = x + pad_h + tw + arrow_gap
    arrow_y = y + 1.2
    draw_vector_arrow(c, arrow_x, arrow_y, size=arrow_sz, color=NAVY)
    c.restoreState()
    
    if url:
        c.linkURL(url, (x, by, x + bw, by + bh), relative=0)
    return bw

# ─── BUILD ────────────────────────────────────────────────
c = canvas.Canvas(OUTPUT, pagesize=A4)
c.setTitle("Pratyush Pandey - Resume")

# ══════════════════════════════════════════════════════════
#  SIDEBAR — full navy background
# ══════════════════════════════════════════════════════════
c.setFillColor(NAVY)
c.rect(0, 0, SIDEBAR_W, H, fill=1, stroke=0)

# ── GLASSMORPHIC CIRCULAR PHOTO ──
PHOTO_BLOCK_H = 162
IMG_SIZE      = 134
px = (SIDEBAR_W - IMG_SIZE) / 2
py = H - PHOTO_BLOCK_H + (PHOTO_BLOCK_H - IMG_SIZE) / 2

if os.path.exists(GLASS_PHOTO):
    c.drawImage(GLASS_PHOTO, px, py, IMG_SIZE, IMG_SIZE, mask='auto')
else:
    c.setFillColor(BLUE)
    c.circle(SIDEBAR_W/2, H - PHOTO_BLOCK_H/2, IMG_SIZE/2, fill=1, stroke=0)

c.setStrokeColor(BLUE)
c.setLineWidth(1.2)
c.line(14, H - PHOTO_BLOCK_H, SIDEBAR_W - 14, H - PHOTO_BLOCK_H)

sy = H - PHOTO_BLOCK_H - 15

# ── CONTACT ──
sy = sidebar_header(c, 'CONTACT', sy)
contacts = [
    ('+91 7208325721', 'tel:+917208325721'),
    ('pandeypratyush348@gmail.com', 'mailto:pandeypratyush348@gmail.com'),
    ('Malad, Mumbai, India', None),
    ('pratyush-portfolio-eta.vercel.app', 'https://pratyush-portfolio-eta.vercel.app/'),
    ('linkedin.com/in/pratyush-pandey', 'https://linkedin.com/in/pratyush-pandey'),
    ('github.com/PratyushPandey31', 'https://github.com/PratyushPandey31'),
]
for text, url in contacts:
    font = 'Helvetica'
    c.setFont(font, 8.6)
    c.setFillColor(WHITE)
    disp_text = text
    if c.stringWidth(disp_text, font, 8.6) > 168:
        disp_text = disp_text[:31] + '...'
    tw = c.stringWidth(disp_text, font, 8.6)
    c.drawString(16, sy, disp_text)
    if url:
        c.linkURL(url, (16, sy - 2, 16 + tw, sy + 9), relative=0)
    sy -= 15.5
sy -= 8

# ── EDUCATION ──
sy = sidebar_header(c, 'EDUCATION', sy)
c.setFont('Helvetica-Bold', 8.8)
c.setFillColor(BLUE)
c.drawString(14, sy, 'THAKUR COLLEGE OF ENGG.')
sy -= 12
c.drawString(14, sy, '& TECHNOLOGY')
sy -= 13

c.setFont('Helvetica', 8.5)
c.setFillColor(WHITE)
c.drawString(16, sy, 'B.E. in CSE (Cyber Security)')
sy -= 12.5
c.setFont('Helvetica-Bold', 8.5)
c.drawString(16, sy, 'CGPA: 9.5')
c.setFont('Helvetica', 8.5)
c.drawString(64, sy, ' |  Jul 2023 - May 2027')
sy -= 12.5
c.drawString(16, sy, 'Mumbai, India')
sy -= 18

# ── TECHNICAL SKILLS ──
sy = sidebar_header(c, 'TECHNICAL SKILLS', sy)
skill_data = [
    ('Languages',   'C,  C++,  Java,  Python,  SQL'),
    ('Frameworks',  'React.js,  Node.js,  Express.js,\nMongoDB,  Spring Boot,  Angular'),
    ('Tools',       'Git,  GitHub,  Postman,\nVS Code,  Netlify,  Vercel'),
    ('Web',         'HTML5,  CSS3,  Tailwind CSS,\nBootstrap,  REST APIs'),
]
for label, val in skill_data:
    c.setFont('Helvetica-Bold', 8.6)
    c.setFillColor(BLUE)
    c.drawString(14, sy, label + ':')
    sy -= 11
    for part in val.split('\n'):
        c.setFont('Helvetica', 8.3)
        c.setFillColor(WHITE)
        c.drawString(18, sy, part.strip())
        sy -= 11
    sy -= 3
sy -= 6

# ── CERTIFICATIONS ──
sy = sidebar_header(c, 'CERTIFICATIONS', sy)
certs = [
    ('Java Training', 'IIT Bombay, Mar 2024'),
    ('Intro to Modern AI', 'Cisco, Jun 2025'),
    ('Intro to Cyber Security', 'Cisco, Jun 2025'),
    ('Foundations of Cybersecurity', 'Google, Jun 2025'),
    ('Ethical Hacking', 'Udemy, Jun 2026'),
]
for title, detail in certs:
    c.setFont('Helvetica-Bold', 8.6)
    c.setFillColor(BLUE)
    c.drawString(14, sy, title)
    sy -= 11
    c.setFont('Helvetica', 8.3)
    c.setFillColor(WHITE)
    c.drawString(18, sy, detail)
    sy -= 12.5

# ══════════════════════════════════════════════════════════
#  RIGHT CONTENT — WITH REFINED BADGES & CLEAR SEPARATION
# ══════════════════════════════════════════════════════════
y = H - 24

# ── NAME ──
c.setFillColor(NAVY)
c.setFont('Helvetica-Bold', 25)
fw = c.stringWidth('PRATYUSH ', 'Helvetica-Bold', 25)
c.drawString(CONTENT_X, y, 'PRATYUSH ')
c.setFont('Helvetica', 25)
c.drawString(CONTENT_X + fw, y, 'PANDEY')
y -= 16

# ── SUBTITLE ──
c.setFillColor(GRAY)
c.setFont('Helvetica', 9)
c.drawString(CONTENT_X, y, 'B.E. COMPUTER SCIENCE (CYBER SECURITY)  |  FULL STACK DEVELOPER')
y -= 9

# thin separator
c.setStrokeColor(colors.HexColor('#cccccc'))
c.setLineWidth(0.5)
c.line(CONTENT_X, y, W - MARGIN_R, y)
y -= 11

# ── PROFILE ──
y = right_header(c, 'PROFILE', y)
profile = ('Passionate Full Stack Developer and Cyber Security enthusiast with hands-on '
           'experience in MERN stack, Spring Boot, and Angular. Committed to building '
           'secure, scalable web applications with strong fundamentals in networking, '
           'operating systems, and ethical hacking. CGPA: 9.5.')
y = wrap_text(c, profile, CONTENT_X, y, CONTENT_W, 'Helvetica', 8.8, GRAY, 11.6)
y -= 8

# ── INTERNSHIP ──
y = right_header(c, 'INTERNSHIP', y)

# 1. Coincent.ai
c.setFillColor(GRAY); c.setFont('Helvetica-Bold', 9.8)
c.drawString(CONTENT_X, y, 'Coincent.ai, India')
c.setFont('Helvetica', 8.6); c.setFillColor(BLUE)
c.drawRightString(W - MARGIN_R, y, 'Jul 2025 - Aug 2025  |  Remote')
y -= 11.5
c.setFont('Helvetica-Oblique', 8.6); c.setFillColor(BLUE)
c.drawString(CONTENT_X + 8, y, 'Cyber Security Intern')
y -= 11.5

coincent_bullets = [
    'Built strong foundation in cybersecurity concepts, Linux commands, and system security practices.',
    'Gained practical experience using Kali Linux and security tools for analysis and problem-solving.',
    'Developed cybersecurity reports and awareness content on real-world threats and solutions.',
]
for b in coincent_bullets:
    c.setFillColor(NAVY); c.setFont('Helvetica-Bold', 8.6)
    c.drawString(CONTENT_X + 8, y, '\u2022')
    y = wrap_text(c, b, CONTENT_X + 18, y, CONTENT_W - 18, 'Helvetica', 8.6, GRAY, 11.2)
    y -= 1.5
y -= 5

# 2. Wave Mind Solutions
c.setFillColor(GRAY); c.setFont('Helvetica-Bold', 9.8)
c.drawString(CONTENT_X, y, 'Wave Mind Solutions')
c.setFont('Helvetica', 8.6); c.setFillColor(BLUE)
c.drawRightString(W - MARGIN_R, y, 'Jul 2026 - Jan 2027  |  Remote')
y -= 11.5
c.setFont('Helvetica-Oblique', 8.6); c.setFillColor(BLUE)
c.drawString(CONTENT_X + 8, y, 'Web/App Development Intern')
y -= 11.5

wavemind_bullets = [
    'Assisting in website and application development on real-time projects and assigned tasks.',
    'Collaborating with the team to meet deadlines and maintain code quality with proper documentation.',
    'Gaining real startup exposure with opportunity for future paid role based on performance.',
]
for b in wavemind_bullets:
    c.setFillColor(NAVY); c.setFont('Helvetica-Bold', 8.6)
    c.drawString(CONTENT_X + 8, y, '\u2022')
    y = wrap_text(c, b, CONTENT_X + 18, y, CONTENT_W - 18, 'Helvetica', 8.6, GRAY, 11.2)
    y -= 1.5
y -= 7

# ── PROJECTS ──
y = right_header(c, 'PROJECTS', y)

projects = [
    ('TnPConnect', 'Spring Boot 3.5, Angular 19, PostgreSQL', 'Mar 2025 - Jun 2025',
     'https://tnp-connect.netlify.app/auth/login', 'https://github.com/PratyushPandey31/TnP-Connect.git', [
        'Developed an AI-driven placement ecosystem for automated career guidance, powered by Google Gemini.',
        'Designed scalable Spring Boot backend using PostgreSQL and JWT-based RBAC to secure data and manage placement drives.',
        'Deployed frontend on Netlify and backend on Render with custom UI featuring 3D skill visualizers and targeted notifications.',
    ]),
    ('AIGPT Chat Application', 'MERN Stack', 'Aug 2025 - Oct 2025',
     'https://pratyush-aigpt-frontend.vercel.app', 'https://github.com/PratyushPandey31/AIGPT-Chat-Application.git', [
        'Built a full-stack AI chat application using React, Node.js, and MongoDB to manage chat threads and conversation history.',
        'Implemented secure JWT-based authentication for user signup and login.',
        'Designed RESTful APIs for chat and message management with responsive markdown-supported interface.',
    ]),
    ('Wanderlust - Full Stack Airbnb Clone', 'MERN Stack', 'Jul 2025 - Aug 2025',
     'https://pratyush-wanderlust.vercel.app', 'https://github.com/PratyushPandey31/wanderLust.git', [
        'Developed a property booking platform with authentication, listing management, and reviews.',
        'Built RESTful APIs for CRUD operations on property listings, bookings, and user reviews.',
        'Designed responsive frontend using React.js with MongoDB backend for listing storage and booking workflow.',
    ]),
    ('TradeVista - Stock Trading Dashboard', 'MERN Stack', 'Jan 2026 - May 2026',
     'https://pratyush-tradevista.vercel.app', 'https://github.com/PratyushPandey31/tradevista-trading.git', [
        'Developed a simulated trading dashboard for portfolio tracking, analytics, and order management.',
        'Built RESTful APIs using Node.js and Express.js to handle simulated trading and portfolio data.',
        'Designed responsive React interface for interactive portfolio analytics and stock visualization.',
    ]),
]

for name, tech, period, live, gh, bullets in projects:
    c.setFillColor(GRAY); c.setFont('Helvetica-Bold', 9.6)
    nw = c.stringWidth(name + '  ', 'Helvetica-Bold', 9.6)
    c.drawString(CONTENT_X, y, name)
    c.setFont('Helvetica', 8.3); c.setFillColor(LGRAY)
    c.drawString(CONTENT_X + nw, y, '|  ' + tech)
    c.setFont('Helvetica-Oblique', 8.2); c.setFillColor(BLUE)
    c.drawRightString(W - MARGIN_R, y, period)
    y -= 12.0  # Clear distinct gap between project name line and buttons!

    # Refined Glassmorphic Badge Buttons with vector arrows
    bx = CONTENT_X + 8
    bw1 = draw_premium_badge(c, 'Live Demo', bx, y, live)
    bw2 = draw_premium_badge(c, 'GitHub Repo', bx + bw1 + 8, y, gh)
    y -= 12.0  # Clear distinct gap between buttons and first bullet point!

    for b in bullets:
        c.setFillColor(NAVY); c.setFont('Helvetica-Bold', 8.6)
        c.drawString(CONTENT_X + 8, y, '\u2022')
        y = wrap_text(c, b, CONTENT_X + 18, y, CONTENT_W - 18, 'Helvetica', 8.5, GRAY, 11.0)
        y -= 1.0
    y -= 3.0
y -= 4

# ── EXTRACURRICULAR ──
y = right_header(c, 'EXTRACURRICULAR', y)

extras = [
    ('OWASP TCET, Thakur College of Engineering and Technology', '2024 - 2025',
     'Creative Team Member - Contributed to content and design for the OWASP Bulletin, strengthening community engagement.'),
    ('TCET Green Club, Thakur College of Engineering and Technology', '2023 - 2026',
     'Creative Team Member - Developed creative content for the Nisarag Magazine, promoting sustainability through impactful storytelling.'),
]
for org, period, desc in extras:
    c.setFillColor(GRAY); c.setFont('Helvetica-Bold', 9.3)
    c.drawString(CONTENT_X, y, org)
    c.setFont('Helvetica-Oblique', 8.2); c.setFillColor(BLUE)
    c.drawRightString(W - MARGIN_R, y, period)
    y -= 10.5
    c.setFillColor(NAVY); c.setFont('Helvetica-Bold', 8.6)
    c.drawString(CONTENT_X + 8, y, '\u2022')
    y = wrap_text(c, desc, CONTENT_X + 18, y, CONTENT_W - 18, 'Helvetica', 8.5, GRAY, 11.0)
    y -= 2.5
y -= 4

# ── COURSEWORK / SKILLS ──
y = right_header(c, 'COURSEWORK / SKILLS', y)
courses = [
    'Data Structures & Algorithms', 'Object-Oriented Programming (OOP)',
    'Web Development',              'Database Management (DBMS)',
    'Computer Networks',            'Operating Systems',
    'Cyber Security',               'Software Engineering',
]
c.setFont('Helvetica', 8.6); c.setFillColor(GRAY)
col_w = CONTENT_W / 2
for i in range(0, len(courses), 2):
    c.drawString(CONTENT_X + 8, y, '\u2022  ' + courses[i])
    if i + 1 < len(courses):
        c.drawString(CONTENT_X + 8 + col_w, y, '\u2022  ' + courses[i+1])
    y -= 11.0

# ─── SAVE ─────────────────────────────────────────────────
c.save()
print("Resume saved: " + OUTPUT)

local_out = os.path.join(os.path.dirname(__file__), "Pratyush_Pandey_Resume.pdf")
try:
    shutil.copy2(OUTPUT, local_out)
    print("Resume also copied to: " + local_out)
except Exception as e:
    pass

import os
import shutil
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image, PageBreak
from reportlab.pdfgen import canvas

class NumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            super().showPage()
        super().save()

    def draw_page_decorations(self, page_count):
        self.saveState()
        w, h = letter
        
        # Sidebar vertical separator line
        sidebar_w = 195
        self.setStrokeColor(colors.HexColor('#D5DFEB'))
        self.setLineWidth(1)
        self.line(sidebar_w, 20, sidebar_w, h - 16)
        
        # Top Accent Header Bar
        self.setFillColor(colors.HexColor('#102C57'))
        self.rect(0, h - 4, w, 4, fill=1, stroke=0)
        
        # Bottom Accent Gold Line
        self.setFillColor(colors.HexColor('#C59B27'))
        self.rect(0, 0, w, 3.0, fill=1, stroke=0)
        
        self.restoreState()

def build_pdf():
    pdf_path = r'd:\project\Maneesh_Pandey_WA_Template_CV.pdf'
    down_pdf = r'C:\Users\pande\Downloads\Maneesh_Pandey_WA_Template_CV.pdf'
    
    doc = SimpleDocTemplate(
        pdf_path,
        pagesize=letter,
        leftMargin=0,
        rightMargin=0,
        topMargin=0,
        bottomMargin=0
    )

    styles = getSampleStyleSheet()
    
    s_lbl = ParagraphStyle('SideLabel', parent=styles['Normal'], fontName='Helvetica-Bold', fontSize=8.8, leading=11.2, textColor=colors.HexColor('#102C57'), spaceBefore=2.5, spaceAfter=0.5)
    s_val = ParagraphStyle('SideVal', parent=styles['Normal'], fontName='Helvetica', fontSize=8.4, leading=11.0, textColor=colors.HexColor('#2D3748'), spaceAfter=3.5)
    s_head = ParagraphStyle('SideHead', parent=styles['Normal'], fontName='Helvetica-Bold', fontSize=9.8, leading=12.5, textColor=colors.HexColor('#102C57'), spaceBefore=5.5, spaceAfter=2.5)
    s_bullet = ParagraphStyle('SideBullet', parent=styles['Normal'], fontName='Helvetica', fontSize=8.2, leading=10.8, textColor=colors.HexColor('#2D3748'), leftIndent=7, spaceAfter=1.8)
    
    m_name = ParagraphStyle('MainName', parent=styles['Normal'], fontName='Helvetica-Bold', fontSize=18.5, leading=22, textColor=colors.HexColor('#102C57'), spaceAfter=1.5)
    m_sub = ParagraphStyle('MainSub', parent=styles['Normal'], fontName='Helvetica-Bold', fontSize=9.8, leading=13, textColor=colors.HexColor('#1D4ED8'), spaceAfter=4.5)
    m_sec = ParagraphStyle('MainSec', parent=styles['Normal'], fontName='Helvetica-Bold', fontSize=10.8, leading=13.5, textColor=colors.HexColor('#102C57'), spaceBefore=6, spaceAfter=2.5)
    
    m_job_title = ParagraphStyle('JobTitle', parent=styles['Normal'], fontName='Helvetica-Bold', fontSize=9.4, leading=12.2, textColor=colors.HexColor('#102C57'), spaceBefore=4, spaceAfter=1)
    m_job_meta = ParagraphStyle('JobMeta', parent=styles['Normal'], fontName='Helvetica-Oblique', fontSize=8.4, leading=10.8, textColor=colors.HexColor('#64748B'), spaceAfter=1.8)
    m_body = ParagraphStyle('MainBody', parent=styles['Normal'], fontName='Helvetica', fontSize=8.5, leading=11.6, textColor=colors.HexColor('#2D3748'), spaceAfter=3)
    m_bullet = ParagraphStyle('MainBullet', parent=styles['Normal'], fontName='Helvetica', fontSize=8.4, leading=11.4, textColor=colors.HexColor('#2D3748'), leftIndent=8, spaceAfter=1.5)

    col1_w = 195
    col2_w = 417

    def create_page_table(side_flowables, main_flowables):
        t = Table([[side_flowables, main_flowables]], colWidths=[col1_w, col2_w])
        t.setStyle(TableStyle([
            ('VALIGN', (0,0), (-1,-1), 'TOP'),
            ('BACKGROUND', (0,0), (0,0), colors.HexColor('#F2F6FA')),
            ('LEFTPADDING', (0,0), (0,0), 15),
            ('RIGHTPADDING', (0,0), (0,0), 12),
            ('TOPPADDING', (0,0), (0,0), 14),
            ('BOTTOMPADDING', (0,0), (0,0), 14),
            ('LEFTPADDING', (1,0), (1,0), 16),
            ('RIGHTPADDING', (1,0), (1,0), 20),
            ('TOPPADDING', (1,0), (1,0), 14),
            ('BOTTOMPADDING', (1,0), (1,0), 14),
        ]))
        return t

    # ==================== PAGE 1 ====================
    side_1 = [
        Image(r'd:\project\maneesh_glass_photo.png', width=105, height=105),
        Spacer(1, 3),
        Paragraph("CONTACT DETAILS", s_head),
        Paragraph("Address:", s_lbl),
        Paragraph("Flat No. 404, Shree Azad SRA CHS Ltd, Azad Link Road, Sanjay Nagar Pathanwadi, Rani Sati Marg, Malad East, Mumbai – 400097", s_val),
        Paragraph("Mobile / WhatsApp:", s_lbl),
        Paragraph("+91 9819253815", s_val),
        Paragraph("Email Addresses:", s_lbl),
        Paragraph("maneeshp1@gmail.com<br/>pandeymaneesh@ymail.com", s_val),
        Paragraph("Date of Birth:", s_lbl),
        Paragraph("December 20, 1985", s_val),
        Paragraph("Personal Information:", s_lbl),
        Paragraph("Gender: Male<br/>Marital Status: Married<br/>Father: Indramani Pandey<br/>Languages: English, Hindi", s_val),
        Spacer(1, 2),
        Paragraph("SKILLS & CORE CAPABILITIES", s_head),
        Paragraph("• Leadership & Team Development", s_bullet),
        Paragraph("• Client Servicing & Relationship Management", s_bullet),
        Paragraph("• Business Improvement & Strategic Execution", s_bullet),
        Paragraph("• Audit, SLA Compliance & Metrics", s_bullet),
        Paragraph("• Critical Thinking & Talent Recruitment", s_bullet),
        Paragraph("• Digital Investment Platforms & Demat Growth", s_bullet),
        Paragraph("• Multi-Product Cross-Sell (MF, GI, LI, PMS)", s_bullet),
        Paragraph("• RM Productivity Enhancement & MIP Plans", s_bullet),
    ]

    main_1 = [
        Paragraph("MANEESH KUMAR PANDEY", m_name),
        Paragraph("Regional Business Head (Digital Business) | Broking & Financial Services", m_sub),
        Paragraph("PROFILE SUMMARY", m_sec),
        Paragraph("Seasoned financial services professional with <b>19+ years' leadership experience</b> across Broking, Digital Wealth Advisory, and Multi-Product Distribution, specializing in sales capability development, digital investment platforms, RM productivity enhancement, quality audits, team recruitment, and large sales force leadership (50+ Relationship Managers & 5 Team Leaders). Proven track record in scaling digital Demat acquisition, executing high-yield Monthly Incentive Plans (MIP), driving multi-segment revenues across Equity, Derivatives, Mutual Funds, and Insurance, and consistently exceeding business targets.", m_body),
        Spacer(1, 1.5),
        Paragraph("KEY ACHIEVEMENTS", m_sec),
        Paragraph("• <b>Pan India 2nd Best Performer Award:</b> Conferred national award for superlative business volume, team activation, and revenue generation across all regional units.", m_bullet),
        Paragraph("• <b>Executive Director's Letter of Appreciation:</b> Received formal commendation letter from Executive Director, Angel Broking Ltd for extraordinary sales leadership and consistent target exceedance.", m_bullet),
        Paragraph("• <b>Pan India Wealth Management Contest Winner (2014):</b> Qualified nationwide Wealth Management contest and achieved sponsored foreign trip reward.", m_bullet),
        Paragraph("• <b>Trained & Mentored 500+ Sales Professionals:</b> Successfully developed sales capabilities, digital platform proficiency, and product knowledge across banking and broking channels.", m_bullet),
        Paragraph("• <b>Led High-Capacity Business Units:</b> Managed sales units with 150+ members historically and currently commanding 50 RMs + 5 TLs digital acquisition unit at HDFC Securities.", m_bullet),
        Spacer(1, 1.5),
        Paragraph("PROFESSIONAL EXPERIENCE", m_sec),
        Paragraph("HDFC Securities Ltd — Regional Business Head (Digital Business)", m_job_title),
        Paragraph("July 2021 – Present | Mumbai", m_job_meta),
        Paragraph("• <b>Team Leadership & Span of Control:</b> Managing a team size of 50 Relationship Managers (RMs) supervised through 5 Team Leaders (TLs) in Demat Account Business Generation and digital acquisition.", m_bullet),
        Paragraph("• <b>Digital Demat Acquisition:</b> Managing online lead-based Demat account acquisition and ensuring consistent account opening, onboarding, and activation.", m_bullet),
        Paragraph("• <b>Multi-Segment Revenue Driving:</b> Driving team revenue through multiple segments, including Account Opening Charges (AOC), Value Plan, Brokerage (Equity & Derivatives), Mutual Funds, Life Insurance, Health Insurance, and Paid Stock Baskets.", m_bullet),
        Paragraph("• <b>Target Planning & Execution:</b> Responsible for achieving daily, monthly, and overall revenue targets through effective team planning and strategic execution.", m_bullet),
        Paragraph("• <b>Sales Force Recruitment & Training:</b> Recruiting new RMs & TLs and providing comprehensive need-based training on Equity, Derivatives, Wealth, and specialized financial products.", m_bullet),
        Paragraph("• <b>MIP Strategies & Contests:</b> Creating and implementing MIP (Monthly Incentive Plan) strategies and performance contests for the team to motivate RMs, increase productivity, and boost business.", m_bullet),
        Paragraph("• <b>Performance Reviews & MIS Analysis:</b> Conducting daily performance reviews to track individual and team-level KPIs, analyzing MIS reports, and acting accordingly on bottom performer RMs & TLs to improve output.", m_bullet),
        Paragraph("• <b>Strategic Tech & Marketing Collaboration:</b> Actively involved in key meetings like LMS (Lead Management System), Dialling software, Marketing team for lead generation, and CRM.", m_bullet),
        Paragraph("• <b>Client Feedback Desk:</b> Daily calling to new clients for taking their feedback and suggestions; compiling and analyzing sales figures.", m_bullet),
    ]

    # ==================== PAGE 2 ====================
    side_2 = [
        Paragraph("QUALIFICATION", s_head),
        Paragraph("Graduation (B.A.):", s_lbl),
        Paragraph("U.P. Board | March 2007<br/>Second Class", s_val),
        Paragraph("H.S.C. (12th):", s_lbl),
        Paragraph("U.P. Board | March 2004<br/>Second Class", s_val),
        Paragraph("S.S.C. (10th):", s_lbl),
        Paragraph("U.P. Board | March 2002<br/>Second Class", s_val),
        Spacer(1, 3),
        Paragraph("CERTIFICATIONS (2026)", s_head),
        Paragraph("NISM Series 25A Certification:", s_lbl),
        Paragraph("• Completed in Year 2026<br/>Comprehensive securities market advisory, operations & compliance certification.", s_val),
        Paragraph("IRDA Examination:", s_lbl),
        Paragraph("• Completed in Year 2026<br/>Insurance Regulatory and Development Authority Certified for Life & General Insurance.", s_val),
        Spacer(1, 3),
        Paragraph("TECHNICAL & TOOL EXPERTISE", s_head),
        Paragraph("• <b>CRM & LMS Platforms:</b> Lead tracking, lead allocation funnels, pipeline stages", s_bullet),
        Paragraph("• <b>Dialling Systems:</b> Auto-diallers, predictive telephony, call analytics", s_bullet),
        Paragraph("• <b>Trading Platforms:</b> ODIN Diet, Omnesys, Web & Mobile Trading Apps", s_bullet),
        Paragraph("• <b>Office Suite:</b> Advanced MS Excel, Word, PowerPoint (MIS reporting)", s_bullet),
        Paragraph("• <b>Operating Systems:</b> Windows XP, Win 7, Win 10, Win 11", s_bullet),
    ]

    main_2 = [
        Paragraph("PROFESSIONAL EXPERIENCE (Continued)", m_sec),
        Paragraph("IIFL Securities Ltd — Area Sales Manager", m_job_title),
        Paragraph("20 August 2018 – 2 June 2021 | Mumbai", m_job_meta),
        Paragraph("• <b>Sales Force Supervision:</b> Supervised a sales force of 20 sales associates with 2 Sales Managers (SMs).", m_bullet),
        Paragraph("• <b>Cross-Functional Initiatives:</b> Spearheaded cross-functional initiatives to achieve sales improvement, revenue growth, and category strategy changes.", m_bullet),
        Paragraph("• <b>Coaching & Mentoring:</b> Trained, coached, and mentored executives and Sales Managers to consistently achieve volume, revenue, and product targets.", m_bullet),
        Paragraph("• <b>Product & Process Training:</b> Delivered product and process training, client need analysis, and digital platform demos across Equity, Mutual Funds, Bonds & Derivatives.", m_bullet),
        Paragraph("• <b>Stakeholder & Customer Relationship Management:</b> Customer-oriented relationship management; managed customer relationships and business stakeholders, executed joint collaborative initiatives, and monitored sales team.", m_bullet),
        Paragraph("• <b>SOPs & Policy Implementation:</b> Facilitated the development, implementation, and maintenance of processes, policies, guidelines, Standard Operating Procedures (SOPs), and Business Operating Principles.", m_bullet),
        Spacer(1, 2.5),
        Paragraph("Kunvarji Finstock Pvt. Ltd — Area Sales Manager", m_job_title),
        Paragraph("9 January 2018 – 8 August 2018 | Mumbai", m_job_meta),
        Paragraph("• <b>Investor Awareness Activities:</b> Organized multiple awareness activities like investor meets for Equity, Commodities, and Currency, plus promotional activities in corporate environments.", m_bullet),
        Paragraph("• <b>Product & Advisory Awareness:</b> Created awareness regarding Equity, Currency, Commodity, and Portfolio Management Services (PMS), and also selling insurance products.", m_bullet),
        Paragraph("• <b>Margin & Revenue Reports:</b> Maintained Margin reports and Revenue reports of the team; created multiple reports to represent as a team in front of senior management.", m_bullet),
        Paragraph("• <b>Team Grooming & Training:</b> Conducted training for sales team to groom them for sales activities; set goals for individuals as well as the team.", m_bullet),
        Paragraph("• <b>Omni-Channel Lead Pipelines:</b> Increased business opportunities through various routes to market like SMS campaigns, email campaigns, referral programs for clients, etc.", m_bullet),
        Paragraph("• <b>Recruitment & Territory Expansion:</b> Handled team recruitment and expansion of business; established, maintained, and expanded customer base for the organization.", m_bullet),
        Paragraph("• <b>Sales Strategy & Contests:</b> Developed sales strategies to meet targets; designed different contests for the sales team and monitored performance to reach goals.", m_bullet),
        Paragraph("• <b>Customer Portfolio Diversification:</b> Serviced the needs of existing customers and helped them diversify their investment portfolios.", m_bullet),
        Spacer(1, 2.5),
        Paragraph("Angel Broking Ltd — Area Sales Manager (Total 10 Years: 2008 – 2018)", m_job_title),
        Paragraph("1 October 2017 – 8 January 2018 | Mumbai", m_job_meta),
        Paragraph("• <b>Awareness & Multi-Product Sales:</b> Creating awareness regarding Equity, Currency, Commodity, and Portfolio Management Services, and also selling insurance products.", m_bullet),
        Paragraph("• <b>Target Achievement & Escalation Desk:</b> Reaching the targets and goals set for the area; managing & resolving escalation queries of customers.", m_bullet),
        Paragraph("• <b>Client Feedback & Engagement:</b> Daily calling to new clients for taking their feedback and suggestions; executing joint collaborative initiatives and monitoring sales team.", m_bullet),
    ]

    # ==================== PAGE 3 ====================
    side_3 = [
        Paragraph("LEADERSHIP ATTRIBUTES", s_head),
        Paragraph("• High-Energy Team Leadership", s_bullet),
        Paragraph("• Strategic Sales Forecasting", s_bullet),
        Paragraph("• Data-Driven MIS Analytics", s_bullet),
        Paragraph("• Dispute & Grievance Redressal", s_bullet),
        Paragraph("• Self-Initiative & Persistence", s_bullet),
        Paragraph("• Seeking Continuous Improvement", s_bullet),
        Paragraph("• Client Retention & Trust Building", s_bullet),
        Spacer(1, 4),
        Paragraph("HOBBIES & INTERESTS", s_head),
        Paragraph("• Interacting With People & Networking", s_bullet),
        Paragraph("• Reading Newspapers & Financial Press", s_bullet),
        Paragraph("• Listening to Music", s_bullet),
        Paragraph("• Continuous Skill Learning", s_bullet),
        Spacer(1, 5),
        Paragraph("FORMAL DECLARATION", s_head),
        Paragraph("I hereby declare that all the particulars, experience, and educational qualifications stated above are true, complete, and correct to the best of my knowledge and belief.", s_val),
    ]

    main_3 = [
        Paragraph("PROFESSIONAL EXPERIENCE (Continued — Angel Broking 10 Years Journey)", m_sec),
        Paragraph("Angel Broking Ltd — Sales Manager", m_job_title),
        Paragraph("January 2014 – September 2017 | Mumbai", m_job_meta),
        Paragraph("• <b>Team Sales Delivery:</b> Creating awareness regarding Equity, Currency, Commodity, and Portfolio Management Services (PMS) and also selling insurance products from team.", m_bullet),
        Paragraph("• <b>Target Setting & Achievement:</b> Setting up targets for the team and motivating them to achieve monthly milestones; maintaining healthy relations between clients and team members.", m_bullet),
        Paragraph("• <b>Promotion Milestone:</b> Got promoted from Unit Manager to Sales Manager post based on consistent high performance.", m_bullet),
        Spacer(1, 2.5),
        Paragraph("Angel Broking Ltd — Unit Manager", m_job_title),
        Paragraph("June 2010 – December 2013 | Mumbai", m_job_meta),
        Paragraph("• <b>Business Unit Expansion:</b> Creating awareness regarding Equity, Currency, Commodity, and PMS, and selling insurance products from the team; setting targets and achieving quota.", m_bullet),
        Paragraph("• <b>Trading Demos & Software Training:</b> Trained sales representatives on online trading platforms (ODIN/Diet Odin) and product/process systems.", m_bullet),
        Paragraph("• <b>Promotion Milestone:</b> Got promoted from Senior Relationship Executive to Unit Manager post.", m_bullet),
        Spacer(1, 2.5),
        Paragraph("Angel Broking Ltd — Sr. Relationship Executive", m_job_title),
        Paragraph("7 January 2008 – December 2010 | Mumbai", m_job_meta),
        Paragraph("• <b>Cross-Selling & Demat Acquisition:</b> Cross-selling insurance products along with opening of Demat accounts; achieving the set targets consistently over initial years.", m_bullet),
        Paragraph("• <b>Demos & Query Coordination:</b> Providing demos to clients for trading products; resolving issues by coordinating with the respective dealer & advisory of the client.", m_bullet),
        Spacer(1, 2.5),
        Paragraph("India Infoline Ltd (IIFL) — Relationship Executive", m_job_title),
        Paragraph("14 July 2007 – December 2007 | Mumbai", m_job_meta),
        Paragraph("• <b>Lead Generation & Account Opening:</b> Generating new leads; opening of Trading & Demat accounts for retail investors.", m_bullet),
        Paragraph("• <b>Client Support & Conversion:</b> Providing after-sales service to existing clients; solving issues of prospective clients & converting into active accounts.", m_bullet),
        Spacer(1, 3.5),
        Paragraph("KEY DOMAIN EXPERTISE & STRATEGIC HIGHLIGHTS", m_sec),
        Paragraph("• <b>Digital Tele-Sales & Lead Generation:</b> In-depth expertise in managing LMS (Lead Management Systems), auto-dialling telephony software, CRM, and digital marketing team alignments for maximum acquisition ROI.", m_body),
        Paragraph("• <b>Regulatory & Compliance Governance:</b> 100% compliant adherence to SEBI, NSE, BSE, NSDL, CDSL, and IRDA guidelines across client KYC, margin collection, and risk disclosure standards.", m_body),
        Paragraph("• <b>Multi-Product Cross-Sell Architecture:</b> Deep domain expertise in structuring multi-product financial solutions encompassing Equity, F&O, Mutual Funds, Life Insurance, Health Insurance, and PMS.", m_body),
        Spacer(1, 5),
        Paragraph("<b>Place:</b> Mumbai<br/><b>Date:</b> ____________________", m_body),
        Spacer(1, 2),
        Paragraph("<b>MANEESH KUMAR PANDEY</b>", m_job_title)
    ]

    story = [
        create_page_table(side_1, main_1),
        PageBreak(),
        create_page_table(side_2, main_2),
        PageBreak(),
        create_page_table(side_3, main_3)
    ]

    doc.build(story, canvasmaker=NumberedCanvas)
    shutil.copy2(pdf_path, down_pdf)
    print("PDF updated to 19+ years experience successfully!")

if __name__ == '__main__':
    build_pdf()

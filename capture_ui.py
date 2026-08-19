import time
from playwright.sync_api import sync_playwright

def capture_all():
    with sync_playwright() as p:
        browser = p.chromium.launch(channel="msedge", headless=True)
        context = browser.new_context(viewport={'width': 1920, 'height': 1080}, device_scale_factor=1.5)
        page = context.new_page()
        
        # 1. Dashboard
        print("1. Capturing Dashboard...")
        page.goto('http://localhost:5173', wait_until='networkidle')
        time.sleep(2)
        page.screenshot(path='docs/screenshots/01_dashboard.png', full_page=False)

        # 2. Asset Inventory
        print("2. Capturing Asset Inventory...")
        page.click('button:has-text("Asset Inventory")', force=True)
        time.sleep(1.5)
        page.screenshot(path='docs/screenshots/02_asset_inventory.png', full_page=False)

        # 3. AI Risk Engine & Prioritizer
        print("3. Capturing AI Risk Engine...")
        page.click('button:has-text("AI Risk Engine")', force=True)
        time.sleep(1.5)
        page.screenshot(path='docs/screenshots/03_risk_prioritizer.png', full_page=False)

        # 4. Vulnerability Scanner Showdown
        print("4. Capturing Vulnerability Scanner Showdown...")
        page.click('button:has-text("Vulnerability Scanner")', force=True)
        time.sleep(1.5)
        showdown_tab = page.query_selector('button:has-text("Beat Real Tools")')
        if showdown_tab:
            showdown_tab.click(force=True)
            time.sleep(1.5)
        page.screenshot(path='docs/screenshots/04_scanner_showdown.png', full_page=False)

        # 5. IEEE Evaluation & Real-World Visualizer
        print("5. Capturing IEEE Evaluation & Real-World Visualizer...")
        page.click('button:has-text("IEEE Evaluation")', force=True)
        time.sleep(2)
        # Click Citrix Bleed Scenario
        citrix_sc = page.query_selector('button:has-text("CVE-2023-4966")')
        if citrix_sc:
            citrix_sc.click(force=True)
            time.sleep(1.5)
        page.screenshot(path='docs/screenshots/05_ieee_evaluation_visualizer.png', full_page=False)

        # 6. Report Generator
        print("6. Capturing Report Generator...")
        page.click('button:has-text("Report Generator")', force=True)
        time.sleep(1.5)
        page.screenshot(path='docs/screenshots/06_report_generator.png', full_page=False)

        # 7. AI Copilot Drawer (Open and trigger query at the end)
        print("7. Capturing AI Copilot Drawer...")
        copilot_btn = page.query_selector('button:has-text("AI Copilot")')
        if copilot_btn:
            copilot_btn.click(force=True)
            time.sleep(1.5)
            chat_input = page.query_selector('input[type="text"]')
            if chat_input:
                chat_input.fill("Fix Citrix Bleed on DMZ Edge Gateway")
                page.keyboard.press('Enter')
                time.sleep(2.5)
            page.screenshot(path='docs/screenshots/07_ai_copilot.png', full_page=False)

        browser.close()
        print("SUCCESS: ALL 7 GLASSMORPHIC SCREENSHOTS CAPTURED!")

if __name__ == '__main__':
    capture_all()

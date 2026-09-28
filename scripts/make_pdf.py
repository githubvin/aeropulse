import os
from playwright.sync_api import sync_playwright

def convert_html_to_pdf():
    html_path = os.path.abspath("docs/presentation_deck.html")
    pdf_path = os.path.abspath("docs/AeroPulse_BRICS_Presentation.pdf")
    
    with sync_playwright() as p:
        browser = p.chromium.launch(channel="msedge", headless=True)
        page = browser.new_page()
        page.goto(f"file:///{html_path.replace(os.sep, '/')}", wait_until="networkidle")
        page.pdf(
            path=pdf_path,
            width="1920px",
            height="1080px",
            print_background=True,
            margin={"top": "0px", "right": "0px", "bottom": "0px", "left": "0px"}
        )
        browser.close()
    
    print(f"[SUCCESS] PDF generated at: {pdf_path}")

if __name__ == "__main__":
    convert_html_to_pdf()

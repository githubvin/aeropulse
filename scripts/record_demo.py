import os
import time
import subprocess
from playwright.sync_api import sync_playwright
import imageio_ffmpeg

def record_demo():
    output_dir = os.path.abspath("docs/demo_temp")
    final_mp4 = os.path.abspath("docs/aeropulse_demo.mp4")
    os.makedirs(output_dir, exist_ok=True)
    
    print("[1/4] Launching headless browser with video recording...")
    with sync_playwright() as p:
        browser = p.chromium.launch(channel="msedge", headless=True)
        context = browser.new_context(
            viewport={"width": 1920, "height": 1080},
            record_video_dir=output_dir,
            record_video_size={"width": 1920, "height": 1080}
        )
        page = context.new_page()
        
        print("[2/4] Navigating to http://localhost:5173 ...")
        page.goto("http://localhost:5173", wait_until="networkidle")
        time.sleep(3)  # Show initial live map & wind streamlines
        
        print("  - Stepping through 48h predictive scrubber...")
        # Step through timeline
        buttons = page.locator("button:has-text('NOW'), button:has-text('+6h'), button:has-text('+12h'), button:has-text('+18h'), button:has-text('+24h')")
        count = buttons.count()
        for i in range(min(count, 5)):
            try:
                buttons.nth(i).click()
                time.sleep(1.2)
            except Exception as e:
                pass
                
        time.sleep(1.5)
        
        print("  - Opening AeroTrace Inspector (User Innovation Feature)...")
        inspect_btn = page.locator("button:has-text('Inspect Source')")
        if inspect_btn.count() > 0:
            inspect_btn.first.click()
            time.sleep(2.5)  # Modal view
            
            # Click execute button
            exec_btn = page.locator("button:has-text('Execute AeroTrace Reverse Attribution')")
            if exec_btn.count() > 0:
                exec_btn.first.click()
                time.sleep(4.0)  # Wait for calculation & show results
                
            # Close modal to show map line
            close_btn = page.locator("button:has(svg.lucide-x)")
            if close_btn.count() > 0:
                close_btn.first.click()
                time.sleep(3.5)  # View back-trajectory line on map
                
        print("  - Opening BRICS FedMesh Modal...")
        fed_btn = page.locator("button:has-text('FedMesh')")
        if fed_btn.count() > 0:
            fed_btn.first.click()
            time.sleep(2.5)
            # Trigger round
            trig_btn = page.locator("button:has-text('Trigger Round')")
            if trig_btn.count() > 0:
                trig_btn.first.click()
                time.sleep(2.0)
            close_btn = page.locator("button:has(svg.lucide-x)")
            if close_btn.count() > 0:
                close_btn.first.click()
                time.sleep(1.5)
                
        print("  - Opening Policy Sandbox Modal...")
        policy_btn = page.locator("button:has-text('Policy Sandbox')")
        if policy_btn.count() > 0:
            policy_btn.first.click()
            time.sleep(2.5)
            close_btn = page.locator("button:has(svg.lucide-x)")
            if close_btn.count() > 0:
                close_btn.first.click()
                time.sleep(1.5)
                
        print("  - Opening OASIS CAP Alerts Modal...")
        cap_btn = page.locator("button:has-text('CAP Alerts')")
        if cap_btn.count() > 0:
            cap_btn.first.click()
            time.sleep(2.5)
            close_btn = page.locator("button:has(svg.lucide-x)")
            if close_btn.count() > 0:
                close_btn.first.click()
                time.sleep(2.0)

        # Get video path before closing
        video_path = page.video.path() if page.video else None
        context.close()
        browser.close()
        
    print(f"[3/4] Raw video recorded at: {video_path}")
    if video_path and os.path.exists(video_path):
        ffmpeg_exe = imageio_ffmpeg.get_ffmpeg_exe()
        print(f"[4/4] Transcoding to H.264 MP4 using {ffmpeg_exe} ...")
        cmd = [
            ffmpeg_exe, "-y",
            "-i", video_path,
            "-c:v", "libx264",
            "-pix_fmt", "yuv420p",
            "-preset", "fast",
            "-crf", "22",
            final_mp4
        ]
        subprocess.run(cmd, check=True)
        print(f"[SUCCESS] Demo video generated successfully: {final_mp4}")
        
        # Cleanup temp directory
        try:
            for f in os.listdir(output_dir):
                os.remove(os.path.join(output_dir, f))
            os.rmdir(output_dir)
        except Exception:
            pass

if __name__ == "__main__":
    record_demo()

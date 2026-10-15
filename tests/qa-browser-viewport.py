#!/usr/bin/env python3
"""Marine Tools browser regression + responsive viewport matrix.
Install: pip install playwright && python -m playwright install chromium
Run: python tests/qa-browser-viewport.py --url https://YOUR-PAGES-PREVIEW.pages.dev --output qa-artifacts
Run on a trusted preview; this script writes synthetic test data to that origin's localStorage.
"""
import argparse, json, pathlib, re
from playwright.sync_api import sync_playwright

SIZES = [(1920,1080),(1366,768),(1024,768),(768,1024),(390,844),(360,640)]
PAGES = ["home","fuel","energy-log","engineering","electrical","vessel-calcs",
         "voyage-estimate","quick","weather","navigation","live-experimental",
         "profile","settings","survey","suggestions","support","contact","about","privacy"]
THEMES = ["dark","bridge"]

def test_case(page, page_id, fields, calc_id, result_id, required, forbidden=None):
    page.evaluate("(id) => window.__marineToolsOpenPage(id)", page_id)
    for selector, val in fields.items():
        page.locator(selector).fill(str(val))
    page.locator("#"+calc_id).click()
    text = page.locator("#"+result_id).inner_text()
    return {"case":calc_id, "ok":required.lower() in text.lower() and not (forbidden and forbidden.lower() in text.lower()),"actual":text}

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--url", required=True)
    ap.add_argument("--output", default="qa-artifacts")
    ap.add_argument("--headed", action="store_true")
    args=ap.parse_args()
    output=pathlib.Path(args.output);output.mkdir(parents=True, exist_ok=True)
    results=[];errors=[]
    with sync_playwright() as pw:
        browser=pw.chromium.launch(headless=not args.headed)
        for width,height in SIZES:
            for theme in THEMES:
                context=browser.new_context(viewport={"width":width,"height":height},
                    device_scale_factor=1, is_mobile=width<=390,has_touch=width<=390)
                page=context.new_page()
                page.on("pageerror",lambda exc:errors.append(str(exc)))
                # Set initial theme without touching real user data.
                page.add_init_script("(theme)=>{localStorage.setItem('mt.theme',JSON.stringify(theme));}", theme)
                try:
                    page.goto(args.url,wait_until="domcontentloaded",timeout=45000)
                    page.wait_for_function("!!window.__marineToolsOpenPage",timeout=30000)
                    for page_id in PAGES:
                        ok=page.evaluate("(id)=>!!document.getElementById(id)",page_id)
                        if not ok:continue
                        try:
                            page.evaluate("(id)=>window.__marineToolsOpenPage(id)",page_id)
                            page.wait_for_timeout(120)
                            data=page.evaluate("""() => ({
                              width:innerWidth,
                              client:document.documentElement.clientWidth,
                              scroll:document.documentElement.scrollWidth,
                              brokenImages:[...document.images].filter(i=>i.complete&&!i.naturalWidth).map(i=>i.src),
                              heading:document.querySelector('.page.active h1')?.textContent||''
                            })""")
                            success=data["scroll"] <= data["client"]+2 and not data["brokenImages"]
                            results.append({"page":page_id,"viewport":f"{width}x{height}","theme":theme,"ok":success,"metrics":data})
                            if not success:
                                page.screenshot(path=str(output/f"OVERFLOW-{page_id}-{width}x{height}-{theme}.png"),full_page=True)
                        except Exception as exc:
                            results.append({"page":page_id,"viewport":f"{width}x{height}","theme":theme,"ok":False,"error":str(exc)})
                    page.evaluate("()=>window.__marineToolsOpenPage('home')")
                    page.screenshot(path=str(output/f"home-{width}x{height}-{theme}.png"),full_page=True)
                    if (width,height)==(1366,768) and theme=="dark":
                        results+= [
                           test_case(page,"navigation",{"#windCourse":"0","#windDir":"0","#windSpeed":"20"},"calcWindComp","resWindComp","Headwind 20.0"),
                           test_case(page,"navigation",{"#etaDist":"120","#etaStw":"5","#etaCur":"-5"},"calcEta","resEta","ETA unavailable","12000"),
                           test_case(page,"fuel",{"#rob":"38","#robDay":"0","#robRes":"20"},"calcRob","resRob","Check ROB","304000"),
                           test_case(page,"vessel-calcs",{"#airDraft":""},"calcAirDraft","resAirDraft","required","23.20"),
                           test_case(page,"quick",{"#qDist":"15.99","#qSpeed":"8"},"calcDST","resDST","2 h 0 min","60 min"),
                        ]
                except Exception as exc:
                    results.append({"viewport":f"{width}x{height}","theme":theme,"ok":False,"error":str(exc)})
                finally:
                    context.close()
        browser.close()
    summary={"url":args.url,"tests":len(results),"failures":sum(not x["ok"] for x in results),
             "browserErrors":errors,"results":results}
    (output/"results.json").write_text(json.dumps(summary,indent=2,ensure_ascii=False))
    print(json.dumps({k:v for k,v in summary.items() if k!="results"},indent=2))
    if summary["failures"] or errors:raise SystemExit(1)

if __name__=="__main__":
    main()

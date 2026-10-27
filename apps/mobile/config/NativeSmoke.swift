#if DEBUG
// Activated only by the CI simulator environment. Not compiled into Release.
@MainActor private enum MarineNativeSmoke {
    static func start(_ controller: CAPBridgeViewController?) {
        guard ProcessInfo.processInfo.environment["MT_CI_SMOKE"] == "1",
              let controller = controller else { return }
        var attempts = 0
        func poll() {
            attempts += 1
            guard let web = controller.webView else {
                if attempts < 60 { DispatchQueue.main.asyncAfter(deadline: .now() + 1, execute: { poll() }) }
                return
            }
            web.evaluateJavaScript("Boolean(window.MT_APP_NAV)") { value, error in
                if value as? Bool == true {
                    NSLog("MT_CI_APP_READY")
                    web.evaluateJavaScript("document.getElementById('mtReleaseDialog')?.close();MT_APP_NAV.go('vessel-calcs');document.getElementById('calcAirDraft').click();document.getElementById('resAirDraft').scrollIntoView();document.getElementById('resAirDraft').textContent") { result, _ in
                        if let text = result as? String, text.contains("3.20") { NSLog("MT_CI_CALC_OK") }
                        else { NSLog("MT_CI_CALC_FAILED") }
                    }
                    web.evaluateJavaScript("void window.MT_PLATFORM.copyText('Marine Tools native copy check')")
                    DispatchQueue.main.asyncAfter(deadline: .now() + 2) {
                        if UIPasteboard.general.string == "Marine Tools native copy check" { NSLog("MT_CI_CLIPBOARD_OK") }
                        else { NSLog("MT_CI_CLIPBOARD_FAILED") }
                        web.evaluateJavaScript("void window.MT_PLATFORM.saveText('native-smoke.json','{\"ci\":true}','application/json')")
                        var shareAttempts = 0
                        func sharePoll() {
                            shareAttempts += 1
                            if let presented = controller.presentedViewController, presented is UIActivityViewController {
                                NSLog("MT_CI_SHARE_PRESENTED")
                                let cache = FileManager.default.urls(for: .cachesDirectory, in: .userDomainMask)[0].appendingPathComponent("marine-exports")
                                if let files = try? FileManager.default.contentsOfDirectory(at: cache, includingPropertiesForKeys: nil),
                                   let file = files.last(where: { $0.lastPathComponent.hasSuffix("-native-smoke.json") }),
                                   let text = try? String(contentsOf: file, encoding: .utf8), text == "{\"ci\":true}" {
                                    NSLog("MT_CI_EXPORT_CACHE_OK")
                                } else { NSLog("MT_CI_EXPORT_CACHE_FAILED") }
                                presented.dismiss(animated: false) { NSLog("MT_CI_SMOKE_FINISHED") }
                            } else if shareAttempts < 15 { DispatchQueue.main.asyncAfter(deadline: .now() + 1, execute: { sharePoll() }) }
                            else { NSLog("MT_CI_SHARE_FAILED") }
                        }
                        DispatchQueue.main.asyncAfter(deadline: .now() + 1, execute: { sharePoll() })
                    }
                } else if attempts < 60 {
                    if attempts == 10 || attempts == 30 {
                        web.evaluateJavaScript("JSON.stringify({url:location.href,ready:document.readyState,title:document.title,config:!!window.MT_APP_CONFIG,platform:!!window.MT_PLATFORM})") { state, _ in NSLog("MT_CI_WAIT %@", String(describing: state)) }
                    }
                    DispatchQueue.main.asyncAfter(deadline: .now() + 1, execute: { poll() })
                } else { NSLog("MT_CI_READY_TIMEOUT %@", String(describing: error)) }
            }
        }
        DispatchQueue.main.asyncAfter(deadline: .now() + 1, execute: { poll() })
    }
}
#endif

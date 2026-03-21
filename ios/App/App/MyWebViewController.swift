import UIKit
import Capacitor
import WebKit

class MyWebViewController: CAPBridgeViewController, WKNavigationDelegate {

    override func viewDidLoad() {
        super.viewDidLoad()

        self.webView?.navigationDelegate = self
    }

    func webView(_ webView: WKWebView,
                 decidePolicyFor navigationAction: WKNavigationAction,
                 decisionHandler: @escaping (WKNavigationActionPolicy) -> Void) {

        guard let url = navigationAction.request.url else {
            decisionHandler(.allow)
            return
        }

        let urlString = url.absoluteString

        // 🔥 CLOSE APP
        if urlString.contains("#mobile-close") {

            print("APP CLOSE TRIGGERED")

            #if targetEnvironment(macCatalyst)
            NSApplication.shared.terminate(nil)
            #else
            DispatchQueue.main.asyncAfter(deadline: .now() + 0.2) {
                UIApplication.shared.perform(#selector(NSXPCConnection.suspend))

                DispatchQueue.main.asyncAfter(deadline: .now() + 0.3) {
                    exit(0)
                }
            }
            #endif

            decisionHandler(.cancel)
            return
        }

        // ❗ KRITICKÉ – default správanie
        decisionHandler(.allow)
    }
}

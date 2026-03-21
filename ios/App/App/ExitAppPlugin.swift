import Foundation
import Capacitor

@objc(ExitAppPlugin)
public class ExitAppPlugin: CAPPlugin {

    @objc(exitApp:)
    public func exitApp(_ call: CAPPluginCall) {
        DispatchQueue.main.async {
            exit(0)
        }
        call.resolve()
    }
}

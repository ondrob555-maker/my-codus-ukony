import Foundation
import CoreNFC
import Capacitor

@objc(NfcManager)
public class NfcManager: CAPPlugin, CAPBridgedPlugin, NFCTagReaderSessionDelegate {
    
    public let identifier = "NfcManager"
    public let jsName = "NfcManager"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "startScan", returnType: CAPPluginReturnPromise)
    ]
    
    var session: NFCTagReaderSession?
    
    @objc func startScan(_ call: CAPPluginCall) {
        
        guard NFCTagReaderSession.readingAvailable else {
            call.reject("NFC not available")
            return
        }
        
        session = NFCTagReaderSession(
            pollingOption: [.iso14443, .iso15693],
            delegate: self
        )
        
        session?.alertMessage = "Prilož kartu"
        session?.begin()
        
        call.resolve()
    }
    
    public func tagReaderSessionDidBecomeActive(_ session: NFCTagReaderSession) {
        print("NFC session started")
    }
    
    public func tagReaderSession(_ session: NFCTagReaderSession, didInvalidateWithError error: Error) {
        print("NFC error: \(error.localizedDescription)")
    }
    
    public func tagReaderSession(_ session: NFCTagReaderSession, didDetect tags: [NFCTag]) {
        
        guard let tag = tags.first else { return }
        
        session.connect(to: tag) { error in
            
            if let error = error {
                print("Connect error: \(error)")
                session.invalidate()
                return
            }
            
            var tagId = ""
            var ndefText = ""
            
            switch tag {
                
            case .miFare(let mifare):
                
                tagId = mifare.identifier.map {
                    String(format: "%02x", $0)
                }.joined()
                
                // 🔥 pokus o NDEF
                mifare.queryNDEFStatus { status, _, _ in
                    
                    if status == .readWrite || status == .readOnly {
                        
                        mifare.readNDEF { message, _ in
                            
                            if let records = message?.records {
                                for record in records {
                                    if let text = self.parseTextRecord(record) {
                                        ndefText = text
                                        break
                                    }
                                }
                            }
                            
                            self.sendResult(tagId: tagId, ndef: ndefText)
                            session.invalidate()
                        }
                        
                    } else {
                        self.sendResult(tagId: tagId, ndef: "")
                        session.invalidate()
                    }
                }
                
                return
                
            case .iso15693(let iso):
                
                tagId = iso.identifier.map {
                    String(format: "%02x", $0)
                }.joined()
                
            default:
                break
            }
            
            self.sendResult(tagId: tagId, ndef: "")
            session.invalidate()
        }
    }
    
    // MARK: - SEND TO JS
    
    private func sendResult(tagId: String, ndef: String) {
        DispatchQueue.main.async {
            self.notifyListeners("nfcScan", data: [
                "id": tagId,
                "ndef": ndef
            ])
        }
    }
    
    // MARK: - PARSE NDEF TEXT
    
    private func parseTextRecord(_ record: NFCNDEFPayload) -> String? {
        
        let payload = record.payload
        
        if payload.count < 3 { return nil }
        
        return String(data: payload.advanced(by: 3), encoding: .utf8)
    }
    
    override public func load() {
        print("🔥 NfcManager LOADED")
    }
}

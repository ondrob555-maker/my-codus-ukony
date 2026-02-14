/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
 
// helper – vytiahne plugin z Capacitoru
function getBarcodeScannerPlugin() {
  if (
    window.Capacitor &&
    window.Capacitor.Plugins &&
    window.Capacitor.Plugins.BarcodeScanner
  ) {
    return window.Capacitor.Plugins.BarcodeScanner;
  }
  return null;
}

$("#login_code").off("click").on("click", async function () {
  const BarcodeScanner = getBarcodeScannerPlugin();

  if (!BarcodeScanner) {
    alert("Skenovanie nie je dostupné (Capacitor BarcodeScanner).");
    return;
  }

  try {
    // 1) povolenie kamery
    let perm;
    try {
      perm = await BarcodeScanner.requestPermissions();
      const status = (perm && perm.camera) || perm;

      if (status !== "granted" && status !== "limited") {
        const openSettings = confirm(
          "Aplikácia nemá povolený prístup ku kamere.\n\n" +
          "Bez toho nemožno skenovať.\n\n" +
          "Chcete zobraziť inštrukcie, ako to povoliť v nastaveniach?"
        );

        if (openSettings) {
          // 1) ak plugin má vlastnú metódu na nastavenia (niektoré ju majú)
          if (typeof BarcodeScanner.openSettings === "function") {
            try {
              await BarcodeScanner.openSettings();
            } catch (e) {
              alert(
                "Nemožno automaticky otvoriť nastavenia.\n\n" +
                "Prosím, povoľte kameru ručne v nastaveniach telefónu:\n" +
                "Nastavenia → Aplikácie → DODS Úkony → Povolenia → Kamera."
              );
            }
          }
          // 2) inak len textový návod
          else {
            alert(
              "Prosím, povoľte kameru ručne v nastaveniach telefónu:\n\n" +
              "Nastavenia → Aplikácie → DODS Úkony → Povolenia → Kamera."
            );
          }
        }

        return; // bez povolenia nepokračujeme
      }
    } catch (e) {
      console.log("[SCAN] requestPermissions error", e);
      // môžeš tu dať aj return; ak chceš prísnejšie správanie
    }

    // 2) samotné skenovanie
    const result = await BarcodeScanner.scan();

    const first = result && result.barcodes && result.barcodes[0];
    if (!first) {
      resetnfcfing();
      return;
    }

    const scannedCode =
      first.rawValue || first.displayValue || first.raw || "";

    if (!scannedCode) {
      alert("Kód sa nepodarilo prečítať.");
      resetnfcfing();
      return;
    }

    // 3) pôvodná AJAX logika
    $.ajax({
      type: "POST",
      url: "https://dods.sk/app_load.php",
      data: { co: "over_kod", kod: scannedCode },
      cache: false,
      dataType: "text",
      success: function (datax) {
        if (datax == "kodoff") {
          alert("Vaše konto má vypnutú podporu čiarových kódov zamestnancov");
          resetnfcfing();
        } else if (datax == "bad") {
          alert(
            "Daný kód nie je kódom zamestnanca (môže ísť o úkon, klienta alebo úplne cudzí kód)"
          );
          resetnfcfing();
        } else if (datax == "nozam") {
          alert("Daný kód nepatrí žiadnemu aktívnemu zamestnancovi");
          resetnfcfing();
        } else if (datax == "badcode") {
          alert(
            "Nesprávny identifikátor hesla zamestnanca, požiadajte o aktuálny kód"
          );
          resetnfcfing();
        } else {
          var datax2 = datax.split("|");
          zamestnanec = datax2[0];
          $("#logged").text("Vitajte " + datax2[1]);
          $("#loggedbutton").hide();
          $("#logout").show();
          konto = datax2[4];

          if (datax2[2] == "1") {
            app_manage = 1;
          } else {
            app_manage = 0;
          }

          if (datax2[9] == "1") {
            app_ukony = 1;
          } else {
            app_ukony = 0;
          }

          if (datax2[2] == "1" && datax2[9] == "0") {
            $("#managebutton").click();
          }

          if (datax2[9] == "1") {
            $("#ukony").click();
            $("input:radio[name=offline]")
              .filter("[value=0]")
              .prop("checked", true);
          }

          if (datax2[7] == "1") {
            $("#zavri").show();
            app_off = 1;
          } else {
            app_off = 0;
          }
          allStop();
        }
      },
      error: function () {
        alert("Chyba: pravdepodobne nie ste pripojení na internet");
        resetnfcfing();
      },
    });
  } catch (err) {
    console.log("[SCAN] error", err);
    alert(
      "Naskenovanie kódu sa nepodarilo: " +
        (err && err.message ? err.message : err)
    );
    resetnfcfing();
  }
});



var app = {
    // Application Constructor
    initialize: function() {
        document.addEventListener('deviceready', this.onDeviceReady.bind(this), false);
    },

    // deviceready Event Handler
    //
    // Bind any cordova events here. Common events are:
    // 'pause', 'resume', etc.

    onDeviceReady: function() {
        this.receivedEvent('deviceready');
    },

    // Update DOM on a Received Event
        receivedEvent: function(id) {
	        var parentElement = document.getElementById(id);
	        var listeningElement = parentElement.querySelector('.listening');
	        var receivedElement = parentElement.querySelector('.received');

	        listeningElement.setAttribute('style', 'display:none;');
	        receivedElement.setAttribute('style', 'display:block;');
            console.log('Received Event: ' + id);
        }
};



function onNfc(nfcEvent) {
    var tag = nfcEvent.tag;
    var tagId = nfc.bytesToHexString(tag.id);
    alert("Kód karty: "+tagId);
}

function nfcwin() {
	//document.getElementById('no_nfc').innerHTML = "";
    console.log("Listening for NFC Tags");
}

function nfcfail(error) {
	//document.getElementById('no_nfc').innerHTML = "<h1 style='color:#f00;'>Chyba: Neaktivny NFC senzor !</h1>";
    alert("Error adding NFC listener");
}

app.initialize();
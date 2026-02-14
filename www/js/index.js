// js/index.js

var app = {
    // Spustenie aplik�cie
    initialize: function () {
        var self = this;

        // Namiesto Cordova "deviceready" pou�ijeme DOMContentLoaded
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', function () {
                self.onDeviceReady();
            }, false);
        } else {
            self.onDeviceReady();
        }
    },

    // Toto sa zavolá, ked je DOM pripraveny
    onDeviceReady: function () {
        this.receivedEvent('deviceready');

        // Bezpe�n� fokusovanie na prv� input (aby nepadalo na null.focus())
        try {
            // ak m� konkr�tny input, m�e� si to premenova� napr. na #txtBarCode
            var input =
                document.querySelector('input[type="text"]') ||
                document.querySelector('input') ||
                null;

            if (input) {
                input.focus();
            } else {
                console.log('[app] �iadny input na fokus nena�iel.');
            }
        } catch (e) {
            console.warn('[app] Chyba pri focus():', e);
        }

        // sem pr�padne vie� doplni� �al�ie veci, �o si mal kedysi v deviceready
    },

    // P�vodn� Cordova uk�ka � len o�etren� na ch�baj�ci #deviceready
    receivedEvent: function (id) {
        var parentElement = document.getElementById(id);

        if (!parentElement) {
            console.log('[app] receivedEvent("' + id + '") � element #' + id + ' neexistuje, UI toggle preskakujem.');
            return;
        }

        var listeningElement = parentElement.querySelector('.listening');
        var receivedElement  = parentElement.querySelector('.received');

        if (listeningElement) {
            listeningElement.style.display = 'none';
        }
        if (receivedElement) {
            receivedElement.style.display = 'block';
        }

        console.log('Received Event: ' + id);
    }
};

app.initialize();

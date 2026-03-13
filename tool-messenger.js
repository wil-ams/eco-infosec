// tool-messenger.js
// Simpele communicatie service tussen alle tools
// Versie 1.0 - PoC Gemeente Amsterdam

const ToolMessenger = {
    // Verstuur bericht van een tool naar andere tool(s)
    send: function(vanTool, naarTool, berichtType, data) {
        try {
            // Haal bestaande berichten op
            const berichten = JSON.parse(localStorage.getItem('toolBerichten') || '[]');
            
            // Maak nieuw bericht
            const nieuwBericht = {
                id: Date.now() + '_' + Math.random().toString(36).substr(2, 9),
                van: vanTool,
                naar: naarTool,
                type: berichtType,
                data: data,
                tijd: new Date().toISOString(),
                gelezen: false
            };
            
            // Voeg toe aan berichten
            berichten.push(nieuwBericht);
            
            // Bewaar (max 100 berichten om localStorage niet vol te maken)
            if (berichten.length > 100) {
                berichten.shift(); // Verwijder oudste
            }
            
            localStorage.setItem('toolBerichten', JSON.stringify(berichten));
            
            console.log(`📤 Bericht verstuurd van ${vanTool} naar ${naarTool}: ${berichtType}`);
            
            // Trigger een custom event voor real-time updates
            window.dispatchEvent(new CustomEvent('toolMessage', {
                detail: nieuwBericht
            }));
            
            return true;
        } catch (error) {
            console.error('ToolMessenger send error:', error);
            return false;
        }
    },
    
    // Check nieuwe berichten voor specifieke tool
    check: function(voorTool) {
        try {
            const berichten = JSON.parse(localStorage.getItem('toolBerichten') || '[]');
            
            // Filter ongelezen berichten voor deze tool
            const nieuweBerichten = berichten.filter(b => 
                (b.naar === voorTool || b.naar === 'all') && !b.gelezen
            );
            
            // Markeer als gelezen
            berichten.forEach(b => {
                if ((b.naar === voorTool || b.naar === 'all') && !b.gelezen) {
                    b.gelezen = true;
                }
            });
            
            // Update localStorage
            localStorage.setItem('toolBerichten', JSON.stringify(berichten));
            
            console.log(`📥 ${voorTool} heeft ${nieuweBerichten.length} nieuwe berichten`);
            
            return nieuweBerichten;
        } catch (error) {
            console.error('ToolMessenger check error:', error);
            return [];
        }
    },
    
    // Haal alle berichten op (voor debugging)
    getAllMessages: function() {
        return JSON.parse(localStorage.getItem('toolBerichten') || '[]');
    },
    
    // Clear alle berichten (voor debugging/reset)
    clearAll: function() {
        localStorage.removeItem('toolBerichten');
        console.log('🗑️ Alle berichten gewist');
    },
    
    // Set actieve directie (voor context)
    setActiveDirectie: function(toolNaam, directieId) {
        const context = {
            tool: toolNaam,
            directieId: directieId,
            timestamp: new Date().toISOString()
        };
        localStorage.setItem('ibatActiveContext', JSON.stringify(context));
        console.log(`🎯 Actieve directie gezet: ${directieId} door ${toolNaam}`);
        
        // Stuur bericht naar alle tools
        this.send(toolNaam, 'all', 'directie-changed', { directieId: directieId });
    },
    
    // Get actieve directie
    getActiveDirectie: function() {
        const context = localStorage.getItem('ibatActiveContext');
        if (context) {
            return JSON.parse(context).directieId;
        }
        return null;
    }
};

// Auto-check voor berichten elke 5 seconden (optioneel)
if (typeof window !== 'undefined') {
    window.ToolMessenger = ToolMessenger;
}
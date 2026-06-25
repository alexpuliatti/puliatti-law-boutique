# Configurazione Modulo di Contatto (Prenota una Consulenza)

Questo sito web è statico ed è ospitato su GitHub Pages. Per ricevere i messaggi inviati dagli utenti direttamente nella tua casella di posta elettronica, utilizziamo il servizio gratuito **Web3Forms**.

Segui questi semplici passaggi per attivare l'invio delle email:

---

## 1. Come funziona attualmente (Modalità Demo)

Nel file `index.html`, il modulo è configurato con una chiave provvisoria:
```html
<input type="hidden" name="access_key" value="YOUR_ACCESS_KEY_HERE">
```

Quando il valore è `"YOUR_ACCESS_KEY_HERE"`, lo script presente in `script.js` simula l'invio mostrando un messaggio di successo fittizio dopo un secondo, senza inviare alcuna email reale. Questo ti permette di testare la grafica e la validazione dei campi localmente.

---

## 2. Come ricevere le email reali sulla tua casella di posta

1. **Ottieni una chiave di accesso (Access Key) gratuita**:
   - Vai sul sito **[web3forms.com](https://web3forms.com/)**.
   - Inserisci l'indirizzo email sul quale desideri ricevere le richieste di consulenza dei clienti.
   - Riceverai immediatamente un'email contenente la tua **Access Key** personale (ad esempio: `1234abcd-12ab-34cd-56ef-1234567890ab`).

2. **Inserisci la tua chiave nel codice**:
   - Apri il file `index.html`.
   - Cerca la riga contenente `YOUR_ACCESS_KEY_HERE` (riga ~490).
   - Sostituisci il valore con la tua chiave reale. Ad esempio:
     ```html
     <input type="hidden" name="access_key" value="la-tua-access-key-reale">
     ```

3. **Salva e pubblica online**:
   - Salva il file.
   - Esegui il commit e fai il push su GitHub per aggiornare il sito live su GitHub Pages:
     ```bash
     git add index.html
     git commit -m "Attiva modulo di contatto con chiave Web3Forms reale"
     git push origin main
     ```

Una volta aggiornato il sito, tutte le richieste compilate dagli utenti (Nome, Email, Telefono, Messaggio) verranno recapitate istantaneamente al tuo indirizzo email.

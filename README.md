# 🚀 ft_transcendence

> **Progetto Finale della Scuola 42**  
> Realizzato da [@minestrinad](https://github.com/minestrinad), [@fracerba](https://github.com/fracerba) e [@ncortigi](https://github.com/ncortigi) 🎓

Benvenuto nel repository di **ft_transcendence**!  
Questa piattaforma di gioco web-based rappresenta il progetto finale della [Scuola 42](https://42.fr/), sviluppato con passione, collaborazione e tante sfide.  
Sfida i tuoi amici a Pong 🏓 e Tris ❌⭕, partecipa a tornei 🏆, gestisci il tuo profilo 👤 e consulta le tue statistiche 📊.  
Tutto in un'unica applicazione moderna, sicura e responsive!

---

## 📚 Indice

- [Panoramica](#panoramica)
- [Funzionalità](#funzionalità)
- [Tecnologie](#tecnologie)
- [Installazione](#installazione)
- [Guida all'Uso](#guida-alluso)
- [Licenza](#licenza)

---

## 🌟 Panoramica

**ft_transcendence** è una piattaforma di gioco multiplayer che permette di:

- Giocare a Pong e Tris in tempo reale contro altri utenti
- Partecipare a tornei organizzati
- Gestire il proprio profilo, avatar e lista amici
- Visualizzare la cronologia delle partite e le statistiche personali

---

## 🕹️ Funzionalità

- **Pong & Tris**: Sfida altri utenti o amici in partite veloci e tornei
- **Tornei**: Crea o partecipa a tornei per scalare la classifica
- **Gestione Utenti**: Registrazione, login sicuro, profilo personalizzabile
- **Amici**: Aggiungi amici per sfidarli facilmente
- **Cronologia**: Consulta le statistiche e la cronologia delle partite
- **Responsive**: Interfaccia moderna e adattabile a tutti i dispositivi
- **Sicurezza**: HTTPS, autenticazione JWT, protezione da SQL injection/XSS
- **DevOps**: Setup semplice con Docker, CI/CD e strumenti di monitoraggio

---

## 🛠️ Tecnologie

- **Backend**: Django, Django Channels, PostgreSQL, JWT
- **Frontend**: JavaScript, HTML5 Canvas, Bootstrap
- **DevOps**: Docker Compose, GitHub Actions, ELK Stack, Prometheus, Grafana

---

## ⚙️ Installazione

### Prerequisiti

- [Docker](https://www.docker.com/)

### Istruzioni

1. **Clona il repository**
   ```sh
   git clone https://github.com/ncortigi/42_ft_trancendence.git
   cd ft_transcendence
   ```
2. **Configura le variabili d'ambiente**
   - Crea un file `.env` nella cartella `src/` oppure compila il file `.env.example`
3. **Avvia l'applicazione**
   ```sh
   docker compose up --build
   ```
4. **Accedi all'applicazione**
   - Apri il browser su `http://localhost:3000`

---

## 📖 Guida all'Uso

1. **Registrazione e Login**
   - Crea un account e accedi in modo sicuro
2. **Gestione Profilo**
   - Personalizza il profilo, aggiungi avatar e amici
3. **Gioca a Pong o Tris**
   - Avvia una partita o partecipa a un torneo
4. **Consulta Statistiche**
   - Visualizza cronologia e statistiche delle partite

Per maggiori dettagli consulta la [User Guide](docs/USER_GUIDE.md).

---

## 📄 Licenza

Questo progetto è distribuito sotto licenza MIT. Vedi il file [LICENSE](docs/LICENSE) per dettagli.

---

<div align="center">
  Grazie per aver visitato il nostro progetto! ✨
</div>

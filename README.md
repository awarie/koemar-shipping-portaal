# Koemar Shipping Pakket Portaal

Complete logistics dashboard application met role-based authenticatie, Nederlandse interface, pakket tracking en email notificaties.

## 🚀 Features

- **Role-based Authentication**: Admin en Verkoper rollen met verschillende toegangsrechten
- **Nederlandse Interface**: Volledig Nederlandse gebruikersinterface
- **Pakket Management**: Registratie en tracking van pakketten met 4 statussen
- **Email Notificaties**: Automatische bevestigingsemails via suripost.nl
- **Prijzen Beheer**: Beheer van zeevracht en luchtvracht tarieven per bestemming
- **Manifest Functionaliteit**: Genereren en exporteren van manifesten
- **Gebruikersbeheer**: Beheer van gebruikers en wachtwoorden
- **Activity Logging**: Volledig audit trail van alle activiteiten
- **Dashboard Statistieken**: Gesplitste statistieken voor lucht/zeevracht

## 🏗️ Tech Stack

### Frontend
- **React 18** met TypeScript
- **Vite** als build tool
- **TailwindCSS** voor styling
- **Shadcn/UI** componenten
- **TanStack Query** voor server state management
- **Wouter** voor routing
- **React Hook Form** voor formulieren

### Backend
- **Express.js** met TypeScript
- **Drizzle ORM** met PostgreSQL
- **Passport.js** voor authenticatie
- **Nodemailer** voor email verzending
- **WebSocket** voor real-time updates

### Database
- **PostgreSQL** (Neon serverless)
- **Drizzle ORM** voor database management

## 🚀 Deployment

### Vercel (Frontend Only)
Dit project is geconfigureerd voor Vercel deployment van alleen de frontend:

1. **GitHub Repository**: https://github.com/awarie/koemar-shipping-portaal
2. **Vercel Setup**: 
   - Connect je GitHub repository met Vercel
   - Vercel gebruikt automatisch de `vercel.json` configuratie
   - De frontend wordt gebouwd en gedeployed

### Full-Stack Deployment
Voor een complete deployment met backend functionaliteit:

1. **Frontend**: Deploy op Vercel/Netlify
2. **Backend**: Deploy op Railway/Render/Heroku
3. **Database**: Gebruik Neon/Supabase/PlanetScale

## 🛠️ Development

### Prerequisites
- Node.js 18+
- PostgreSQL database
- SMTP configuratie voor emails

### Environment Variables
```env
DATABASE_URL=your_postgresql_url
SENDGRID_API_KEY=your_sendgrid_key
```

### Local Development
```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

## 📁 Project Structure

```
├── client/              # Frontend React app
│   ├── src/
│   │   ├── components/  # UI componenten
│   │   ├── pages/       # App pagina's
│   │   └── lib/         # Utilities
├── server/              # Backend Express app
│   ├── auth.ts          # Authenticatie logic
│   ├── routes.ts        # API endpoints
│   ├── storage.ts       # Database operations
│   └── emailService.ts  # Email functionaliteit
├── shared/              # Gedeelde types en schema's
└── attached_assets/     # Static assets
```

## 🔧 Configuration

### Vercel Deployment
De `vercel.json` configureert Vercel voor frontend-only deployment:
- Build command: `vite build`
- Output directory: `dist/public`
- SPA routing support

### Database Schema
Het project gebruikt Drizzle ORM met PostgreSQL. Belangrijkste tabellen:
- `users` - Gebruikersbeheer
- `packages` - Pakket registraties
- `shipping_prices` - Tarieven per bestemming
- `user_logs` - Activity logging

## 📧 Email Service
Email notificaties worden verzonden via:
- **SMTP Server**: Configureerbaar via suripost.nl/mail.php
- **Templates**: HTML email templates voor bevestigingen
- **Notifications**: Automatische verzending bij pakket registratie

## 🎯 Admin Toegang
- **Email**: aniel@poeran.nl
- **Wachtwoord**: welkom01
- **Rol**: Admin (volledige toegang)

## 📝 License
MIT License

## 🤝 Contributing
1. Fork de repository
2. Maak een feature branch
3. Commit je wijzigingen
4. Push naar de branch
5. Open een Pull Request

---
**Ontwikkeld door**: [Poeranet.nl](https://poeranet.nl)
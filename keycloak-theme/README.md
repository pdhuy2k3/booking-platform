# BookingSmart Keycloak Theme

Custom Keycloak theme for BookingSmart application using Keycloakify and TailwindCSS.

## Features

- 🎨 Modern UI with TailwindCSS styling
- 🌙 Dark/Light theme support
- 📱 Responsive design
- 🔐 Custom login, register, and password reset pages
- ✨ Consistent branding with BookingSmart

## Theme Structure

```
keycloak-theme/
├── src/
│   ├── globals.css              # Global styles with Tailwind
│   ├── login/
│   │   ├── KcPage.tsx          # Main page router
│   │   ├── KcContext.ts        # Context definitions
│   │   ├── i18n.ts            # Internationalization
│   │   └── pages/
│   │       ├── Login.tsx       # Login page
│   │       ├── Register.tsx    # Registration page
│   │       ├── LoginResetPassword.tsx
│   │       ├── LoginVerifyEmail.tsx
│   │       ├── Info.tsx
│   │       └── Error.tsx
│   └── main.tsx                # Entry point
├── tailwind.config.ts          # Tailwind configuration
├── postcss.config.cjs          # PostCSS configuration
├── package.json               # Dependencies
└── dist_keycloak/            # Built theme JAR files
```

## Development

### Prerequisites
- Node.js 18+
- pnpm
- Docker & Docker Compose

### Setup
1. Install dependencies:
   ```bash
   cd keycloak-theme
   pnpm install
   ```

2. Start development server:
   ```bash
   pnpm dev
   ```

3. Build theme:
   ```bash
   pnpm run build-keycloak-theme
   ```

### Theme Customization

#### Colors and Styling
Edit `src/globals.css` to customize colors and styles:

```css
.bookingsmart-brand {
  --bs-primary: #3b82f6;
  --bs-secondary: #64748b;
  --bs-success: #10b981;
  --bs-warning: #f59e0b;
  --bs-error: #ef4444;
}
```

#### Custom Components
- Add new pages in `src/login/pages/`
- Update `src/login/KcPage.tsx` to include new pages
- Use BookingSmart CSS classes for consistent styling

#### Tailwind Classes
Available BookingSmart utility classes:
- `.bookingsmart-container` - Main container
- `.bookingsmart-form` - Form styling
- `.bookingsmart-input` - Input fields
- `.bookingsmart-button` - Primary buttons
- `.bookingsmart-button-secondary` - Secondary buttons
- `.bookingsmart-link` - Links
- `.bookingsmart-error` - Error messages
- `.bookingsmart-success` - Success messages
- `.bookingsmart-header` - Page headers
- `.bookingsmart-logo` - Logo container

## Deployment

### Automatic Deployment (Recommended)

#### Windows:
```bash
./deploy-theme.bat
```

#### Linux/macOS:
```bash
./deploy-theme.sh
```

### Manual Deployment

1. Build the theme:
   ```bash
   cd keycloak-theme
   pnpm run build-keycloak-theme
   ```

2. Copy JAR to identity directory:
   ```bash
   cp dist_keycloak/keycloak-theme-for-kc-22-to-25.jar ../identity/bookingsmart-keycloak-theme.jar
   ```

3. Start/Restart Keycloak:
   ```bash
   docker-compose up -d identity
   ```

4. Configure theme in Keycloak Admin:
   - Go to http://localhost:9090
   - Login with admin/admin
   - Select your realm
   - Go to Realm Settings > Themes
   - Set Login Theme to 'bookingsmart-keycloak-theme'
   - Save changes

## Configuration

### Docker Compose
The theme is automatically mounted in docker-compose.yml:

```yaml
services:
  identity:
    # ... other config
    volumes:
      - ./identity/bookingsmart-keycloak-theme.jar:/opt/keycloak/providers/bookingsmart-keycloak-theme.jar
```

### Keycloak Admin Console
1. Access: http://localhost:9090
2. Login: admin/admin
3. Navigate to: Realm Settings > Themes
4. Set Login Theme: bookingsmart-keycloak-theme
5. Save changes

## Testing

### Development Testing
1. Uncomment the mock context in `src/main.tsx`
2. Run `pnpm dev`
3. Test different pages by changing `pageId`

### Production Testing
1. Deploy theme to Keycloak
2. Try login/register flows
3. Test responsive design on mobile devices
4. Verify all form validations work

## Troubleshooting

### Build Issues
- Ensure all dependencies are installed: `pnpm install`
- Check Node.js version: `node --version` (should be 18+)
- Clear build cache: `rm -rf dist dist_keycloak node_modules && pnpm install`

### Theme Not Appearing
- Verify JAR file is in `/opt/keycloak/providers/` inside container
- Check Keycloak logs: `docker-compose logs identity`
- Restart Keycloak container: `docker-compose restart identity`

### Styling Issues
- Check browser console for CSS errors
- Verify Tailwind classes are being applied
- Ensure PostCSS is processing CSS correctly

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This theme is part of the BookingSmart project.

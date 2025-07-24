@echo off
REM Build and deploy BookingSmart Keycloak theme

echo 🔨 Building BookingSmart Keycloak theme...
cd keycloak-theme
call pnpm run build-keycloak-theme

echo 📦 Copying theme JAR to identity directory...
copy dist_keycloak\keycloak-theme-for-kc-22-to-25.jar ..\identity\bookingsmart-keycloak-theme.jar

echo 🔄 Restarting Keycloak container...
cd ..
docker-compose restart identity

echo ✅ Theme deployment completed!
echo 🌐 Access Keycloak at: http://localhost:9090
echo 👤 Admin credentials: admin/admin
echo.
echo 📝 Next steps:
echo 1. Login to Keycloak Admin Console
echo 2. Go to Realm Settings ^> Themes
echo 3. Set Login Theme to 'bookingsmart-keycloak-theme'
echo 4. Save changes


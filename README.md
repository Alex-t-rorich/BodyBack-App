# BodyBack App

A React Native application for fitness training with separate interfaces for customers and trainers.

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Running with WSL2 and Android Emulator (Windows)

If you're developing on WSL2 with Android Studio running on Windows:

1. **Start Android Studio emulator on Windows**

2. **Enable port forwarding** (run in PowerShell as Administrator):
   ```powershell
   netsh interface portproxy add v4tov4 listenport=8081 listenaddress=0.0.0.0 connectport=8081 connectaddress=172.23.154.47
   ```
   Note: Replace `172.23.154.47` with your WSL2 IP if different (shown when you run `npx expo start`)

3. **Start Expo in WSL2**:
   ```bash
   npx expo start
   ```

4. **Connect from Android emulator**:
   - Install Expo Go from Play Store
   - Open Expo Go
   - Tap "Enter URL manually"
   - Enter: `localhost:8081` or `127.0.0.1:8081`

### Alternative: Tunnel Mode
If port forwarding doesn't work, use tunnel mode:
```bash
npx expo start --tunnel
```
This creates a public URL that works without network configuration.

## Demo Credentials

The app has two user types with demo accounts:

- **Customer**: `customer@bodyback.co.za`
- **Trainer**: `trainer@bodyback.co.za`

## App Structure

```
app/
  index.tsx           # Login screen
  settings.tsx        # Shared settings page
  customer/           # Customer-specific screens
    dashboard.tsx
  trainer/            # Trainer-specific screens
    dashboard.tsx
```

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.

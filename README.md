<div align="center">

# 🧮 EAM Calculator

### *Simplifying Stack Emission Sampling Through Smart Calculation.*

![Expo](https://img.shields.io/badge/Expo-000020?logo=expo&logoColor=white)
![React Native](https://img.shields.io/badge/React%20Native-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)
![Platforms](https://img.shields.io/badge/Platforms-Android%20|%20iOS%20|%20Web-3DDC84)

</div>

---

## 📖 About

A mobile application designed to support environmental professionals and emission sampling technicians in performing stack emission measurement calculations. EAM Calculator provides specialized calculation methods, automatic numerical processing, and session management to make emission sampling workflows more efficient and organized.
---

## ✨ Features

<div align="center">
   
**Main Page**

<img width="417" height="940" alt="image" src="https://github.com/user-attachments/assets/5035ee28-29c2-4a78-a44e-ce3ecc770e87" />
<img width="674" height="737" alt="image" src="https://github.com/user-attachments/assets/e4c6afe7-07cb-42c8-86f4-04f0fdf5a2e1" />
<img width="317" height="265" alt="image" src="https://github.com/user-attachments/assets/bff73e75-1cde-4e9c-af5c-094acef87909" />
<img width="417" height="940" alt="image" src="https://github.com/user-attachments/assets/60505cb2-2e70-4295-8b3d-ac7df9cffb7e" />

</div>

**EAM Calculator** provides specialized tools to support various stages of **stack emission sampling calculations**.

### 🧪 Multiple Calculation Methods

The application provides **five calculation modules** covering different measurement requirements.

<details open>
<summary><b>📍 Method 1 – Traverse Point Calculation</b></summary>

- Support for **circular** and **rectangular** chimney configurations
- Equivalent diameter calculation for rectangular stacks
- Upstream and downstream measurement distance determination
- Traverse point requirement calculation
- Structured traverse point information output

</details>

<details open>
<summary><b>💨 Method 2 – Gas Measurement Calculation</b></summary>

- Absolute gas pressure calculation
- Gas velocity calculation using Pitot tube parameters
- Dry gas volumetric flow calculation
- Stack temperature and pressure measurement processing
- Gas composition and moisture parameter evaluation

</details>

<details open>
<summary><b>⚗️ Method 3 – Gas Composition & Molecular Weight</b></summary>

- CO₂, O₂, and CO concentration processing
- Dry-basis molecular weight calculation
- Wet-basis molecular weight calculation

</details>

<details open>
<summary><b>💧 Method 4 – Moisture Content Determination</b></summary>

- Initial and final gas meter reading input
- Barometric pressure and meter temperature processing
- Multiple impinger measurement support
- Total collected water weight calculation
- Water vapor volume and dry gas volume calculation
- Gas moisture percentage determination

</details>

<details open>
<summary><b>🎯 Method 5 – Isokinetic Sampling Calculation</b></summary>

- Absolute pressure and gas composition parameter calculation
- Sampling nozzle diameter estimation
- Isokinetic sampling factor calculation
- Ideal pressure differential determination
- Isokinetic sampling percentage calculation

</details>

### ⚡ Automatic Calculation & Numerical Processing

| Feature | Description |
|---|---|
| 🔄 **Real-Time Calculation** | Results update as measurement inputs change |
| 🔢 **Automatic Numerical Conversion** | Decimal input formats are converted for calculation processing |
| 🛡️ **Input Validation** | Invalid characters are filtered and decimal separators managed |
| 🎛️ **Conditional Calculations** | Results appear once the required input parameters are available |
| 🧩 **Multiple Measurement Parameters** | Different technical variables handled in one unified interface |

### 🏭 Stack Configuration Management

| Feature | Description |
|---|---|
| ⭕ **Circular Stack Support** | Enter chimney diameter |
| ▭ **Rectangular Stack Support** | Enter chimney length and width |
| 📐 **Equivalent Diameter Calculation** | Determine equivalent diameter for rectangular configurations |
| 📏 **Measurement Parameters** | Store upstream and downstream disturbance distances |
| 🔩 **Flange Configuration** | Select available flange options according to stack geometry |

### 💾 Calculation Session Management

| Feature | Description |
|---|---|
| 📝 **Save Calculation Sessions** | Save current calculation data under a custom session name |
| 📦 **Local Data Persistence** | Sessions are stored on-device using AsyncStorage |
| 🔁 **Session Retrieval** | Restore previously saved calculation data |
| 🗑️ **Session Deletion** | Remove unwanted saved sessions |
| 📋 **Session Information** | See session names, dates, and associated stack location details |

### 🏷️ Stack Information Management

| Feature | Description |
|---|---|
| 🪪 **Stack Identification** | Store stack names and profile information |
| 📍 **Location Information** | Maintain stack location details |
| 🌐 **Geographical Coordinates** | Latitude and longitude data fields |
| 📷 **Stack Photos** | Store stack photo references in calculation data |

### 📱 User Experience & Interface

- 📲 **Mobile-Friendly Interface** – Designed specifically for Android and iOS devices
- 🗂️ **Structured Input Forms** – Measurement parameters organized into manageable sections
- 🌗 **Dark & Light Theme Support** – System-based or manually selectable theme modes
- 🧭 **File-Based Navigation** – Screen routing with Expo Router
- 🔣 **Numeric Input Handling** – Decimal values accepted with comma or period separators
- 🧱 **Native Interaction** – Native mobile components and navigation patterns

# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

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

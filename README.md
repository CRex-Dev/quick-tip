# Quick Tip

An offline tip calculator and bill splitter. Expo SDK 57, React Native 0.86, TypeScript,
managed workflow. No network access, no permissions, no data collection.

## Project layout

```
App.tsx                      Root: SafeAreaProvider + StatusBar
index.ts                     Expo entry point
app.json                     Expo config (package name, version, icons, splash, permissions)
eas.json                     EAS Build profiles (preview .apk / production .aab)
scripts/generate-assets.js   Regenerates the icon + splash PNGs
src/
  TipCalculatorScreen.tsx    The single screen; owns all input state
  theme.ts                   Material 3 colour tokens (light + dark) and spacing scale
  lib/calc.ts                Tip maths, in integer cents
  lib/format.ts              Amount / percent formatting and input sanitising
  lib/calc.test.ts           node:test suite for the maths
  components/                Card, AmountField, PeopleStepper, TipSelector, ResultsPanel
```

## Commands

```bash
npm start                # Metro; open in Expo Go
npm run android          # Metro, targeting a connected Android device
npm test                 # 11 unit tests for the calculation + formatting logic
npm run typecheck        # tsc --noEmit
npm run generate:assets  # redraw assets/*.png after editing colours in the script
npx expo-doctor          # config/dependency sanity check
```

## Design notes

- **Results above the inputs.** The on-screen keyboard covers the lower half of the
  screen while typing, so the numbers live at the top like a calculator display.
- **Integer cents everywhere.** `src/lib/calc.ts` never does floating-point money
  arithmetic; otherwise `0.1 + 0.2` problems surface as `12.000000000000002`.
- **Round up per person** rounds each individual share up to the next whole unit, then
  works backwards: the total rises and the tip absorbs the difference. The results panel
  shows the effective tip percentage, so the extra is never hidden.
- **Theme follows the system** via `useColorScheme()`. There is no in-app toggle.

---

# Building and shipping

## 1. Build the .aab with EAS

```bash
# Install the CLI (or use `npx eas-cli@latest` in place of `eas` below)
npm install -g eas-cli

# Log in with your Expo account
eas login
eas whoami

# One-time: link this project to an EAS project ID.
# This writes expo.extra.eas.projectId into app.json.
eas init

# EAS Build reads from git, so make sure there is at least one commit
git add -A
git commit -m "Quick Tip 1.0.0"

# Production build -> Android App Bundle (.aab) for the Play Store.
# On the first run EAS offers to generate an upload keystore: answer yes and let
# EAS manage it. Back it up (`eas credentials`) -- losing it means you can never
# update the app under this package name again.
eas build --platform android --profile production

# Quick test build -> installable .apk (sideload onto a device)
eas build --platform android --profile preview
```

Download the artifact from the link the CLI prints, from
`https://expo.dev/accounts/<your-account>/projects/quick-tip/builds`, or with:

```bash
eas build:list --platform android --limit 5
eas build:download --platform android          # latest finished build
```

Optional -- upload straight to Play from the CLI once you have a Google Play
service-account JSON saved as `play-service-account.json` in the project root
(already wired up in `eas.json`, and git-ignored):

```bash
eas submit --platform android --profile production --latest
```

## 2. Files to check before every build

| File | What to confirm |
|---|---|
| `app.json` -> `expo.version` | `"1.0.0"` -- the user-visible version name. Bump for each public release. |
| `app.json` -> `expo.android.versionCode` | `1` -- **must increase by 1 for every upload** to Play. Play rejects a re-used versionCode. |
| `app.json` -> `expo.android.package` | `com.crexdevs.quicktip` -- permanent. It can never be changed after the first upload. |
| `app.json` -> `expo.name` | `"Quick Tip"` -- the launcher label. |
| `app.json` -> `expo.android.blockedPermissions` | Keeps `INTERNET` and friends out of the manifest. Leave as-is. |
| `eas.json` -> `build.production.android.buildType` | `"app-bundle"` -> produces the `.aab` Play requires. |
| `eas.json` -> `build.preview.android.buildType` | `"apk"` -> sideloadable test build. |
| `eas.json` -> `cli.appVersionSource` | `"local"` -> version numbers come from `app.json`, not the EAS server. |
| `assets/*.png` | Replace the generated placeholder art if you want custom branding. |

For release 1.0.1 you would set `"version": "1.0.1"` and `"versionCode": 2`.

## 3. Play Console listing (ready to paste)

**App name** (max 30 characters -- this is 26)

```
Quick Tip – Tip Calculator
```

**Short description** (max 80 characters -- this is 74)

```
Offline tip calculator and bill splitter. No ads, no tracking, no internet.
```

**Full description** (max 4000 characters)

```
Quick Tip is a fast, no-nonsense tip calculator and bill splitter that works entirely offline.

Enter the bill, pick a tip, choose how many people are splitting it — the tip, the total and each person's share update instantly as you type. No buttons to press, no screens to navigate.

FEATURES

• Instant results — every number recalculates as you type
• Preset tips at 10%, 15%, 18% and 20%, plus any custom percentage you like
• Split between any number of people, from 1 to 999
• Round up per person — rounds each share up to the next whole unit and shows you the effective tip percentage, so you always know what the rounding costs
• Automatic light and dark mode, following your system setting
• Large, readable numbers designed to be glanced at across a table
• Clean Material Design interface

COMPLETELY OFFLINE AND PRIVATE

Quick Tip requests no Android permissions at all — not even internet access. It cannot connect to the network, because the permission simply isn't there.

• No internet permission
• No accounts, no sign-up, no login
• No ads and no advertising SDKs
• No analytics or crash-reporting trackers
• No data collected, stored or shared — nothing you type ever leaves your device

Nothing is saved between sessions either. Close the app and your numbers are gone.

WHY QUICK TIP

Most tip calculators bury a simple arithmetic problem under ads, sign-in walls and permission prompts. Quick Tip does one thing: it works out the tip and splits the bill. It opens instantly, weighs almost nothing, and works on a plane, in a basement restaurant, or anywhere with no signal.

Perfect for restaurants, cafés, bars, taxis, deliveries, salons, and splitting any shared bill with friends.
```

**Category:** Tools (Finance also fits, but Tools attracts less scrutiny for a calculator)
**Tags:** tip calculator, bill splitter, offline
**Contact email:** your support address
**Privacy policy URL:** required for every app -- see section 6 below

## 4. Data safety form answers

In **Play Console -> App content -> Data safety**:

| Question | Answer |
|---|---|
| Does your app collect or share any of the required user data types? | **No** |
| Is all of the user data collected by your app encrypted in transit? | *(not asked -- only appears if you collect data)* |
| Do you provide a way for users to request that their data is deleted? | *(not asked)* |

That single "No" is the whole form. The resulting store label reads **"No data collected"**
and **"No data shared with third parties"**, which is accurate: the app has no internet
permission, no storage, and no analytics.

Elsewhere under **App content**, answer:

| Section | Answer |
|---|---|
| Ads -- does your app contain ads? | **No** |
| App access -- is any functionality restricted? | **All functionality is available without special access** |
| Content rating | Complete the questionnaire in section 5 |
| Target audience | 13+ or 18+. Do **not** opt into "Designed for Families" -- it adds review requirements you don't need. |
| News app | **No** |
| COVID-19 contact tracing / status | **No** |
| Government app | **No** |
| Financial features | **My app doesn't have any financial features** -- a tip calculator is not a financial product |
| Health apps | **No** |

## 5. Content rating questionnaire -> "Everyone"

Select category: **Utility, Productivity, Communication or Other**.

Then every question is **No**:

| Question | Answer |
|---|---|
| Violence -- does the app contain violence of any kind? | No |
| Sexuality -- sexual or suggestive content? | No |
| Language -- profanity or crude humour? | No |
| Controlled substances -- drug, alcohol or tobacco references? | No |
| Crude humour, horror, or frightening content? | No |
| Gambling -- simulated or real-money gambling? | No |
| Does the app allow users to interact or exchange content with each other? | No |
| Does the app share the user's current location with other users? | No |
| Does the app allow users to purchase digital goods? | No |
| Does the app contain any user-generated content? | No |
| Does the app collect or share personal information? | No |

Result: **ESRB Everyone / PEGI 3 / USK 0 / IARC 3+.**

## 6. Privacy policy

Google requires a hosted privacy policy URL for every app, even one that collects nothing.
Publish this on GitHub Pages, Google Sites, or any static host, then paste the URL into the
Play Console store listing:

```
Privacy Policy for Quick Tip

Last updated: [DATE]

Quick Tip does not collect, store, transmit or share any personal information.

The app requests no Android permissions and has no internet access permission, so it is
technically incapable of sending any information anywhere. The bill amounts, tip
percentages and party sizes you enter are held in memory only while the app is open, and
are discarded when you close it. Nothing is written to storage.

The app contains no advertising, no analytics, no crash reporting, and no third-party SDKs
that collect data. There are no user accounts.

Children's privacy: because the app collects no data from anyone, it collects no data from
children under 13.

Changes: any future version that changes this will be accompanied by an updated policy
published at this address before release.

Contact: [YOUR EMAIL]
```

## 7. A note on the blocked INTERNET permission

`app.json` lists `android.permission.INTERNET` under `blockedPermissions`, which emits a
`tools:node="remove"` directive so the permission is stripped from the merged manifest at
build time. This is what lets the store listing honestly claim no network access.

The trade-off: **anything needing the network will silently fail in a built app.** If you
later add `expo-updates` (OTA updates), a development build with `expo-dev-client`, crash
reporting, or any API call, you must first remove `"android.permission.INTERNET"` from
`blockedPermissions`. Developing against Metro via Expo Go is unaffected -- Expo Go has its
own manifest.

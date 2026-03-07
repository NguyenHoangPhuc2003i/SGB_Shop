# Firebase setup quick guide

1. In Firebase Console (https://console.firebase.google.com), open your project.
2. Go to Settings → Service accounts → Generate new private key. Download the JSON file.
3. Save that JSON as one of:
   - `SGB_Shop/scripts/firebase-service-account.json`
   - or `SGB_Shop/firebase.json`

You can use the template `SGB_Shop/scripts/firebase-service-account.example.json` as a reference.

## Run everything (auto-import + server)
If you placed the JSON in the paths above, just run:

```powershell
PowerShell -ExecutionPolicy Bypass -File .\SGB_Shop\scripts\start-all.ps1
```

Or specify a custom path and enable sync delete during import:

```powershell
PowerShell -ExecutionPolicy Bypass -File .\SGB_Shop\scripts\start-all.ps1 `
  -FirebaseCredsPath "D:\keys\firebase.json" `
  -ImportData `
  -SyncDelete
```

Notes:
- `-ImportData` upserts docs from local JSON to Firestore.
- `-SyncDelete` additionally removes docs not present in local JSON (use with care).

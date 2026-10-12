# Akshaya Stocks & Shares

A responsive public website and private customer relationship manager for Akshaya Stocks & Shares, Salem.

## Features

- Positive, editorial public website with an animated 3D wealth visual
- Firebase email/password authentication, verification and reset flows
- First-login temporary-password reminder with “change later” support
- Customer create/edit/archive workflows; hard deletion is denied in Firestore rules
- Required DOB with daily birthday notifications
- Name, phone, PAN and email search; product filters and A–Z sorting
- CSV template, bulk import validation and complete CSV export
- Selection-based A4 landscape print preview with non-splitting rows
- Responsive layouts for phones, tablets, laptops and desktops

## Local development

```bash
npm install
npm run dev
```

## Verification

```bash
npm test
npm run build
```

Firebase project: `akshayass-crm`  
Vercel configuration: `vercel.json`

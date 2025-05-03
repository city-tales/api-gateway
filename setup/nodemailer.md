# Nodemailer Setup Guide

This guide will help you set up **Nodemailer** for sending emails in your Node.js project.

## Steps to Set Up Nodemailer:

### 1. Create an App Password in Google
To send emails using Gmail with **Nodemailer**, you need to create an **App Password** in Google. Follow these steps:

1. Go to your **Google Account** settings.
2. Navigate to the **Security** tab.
3. Under the **"Signing in to Google"** section, enable **2-Step Verification** (if you haven't already).
4. Once 2-Step Verification is enabled, go to **App passwords**.
5. From the **App passwords** section, create an app password by selecting **Mail** as the app and your device type.
6. Copy the generated password. This will be used in the Nodemailer configuration.

---

### 2. Configure Nodemailer in Your Application
In your application, configure **Nodemailer** using the credentials you’ve just created.

#### Example Configuration:

```javascript

export const transporter = nodemailer.createTransport({
    service: nodeMailerService,
    port: nodeMailerPort,
    secure: true,
    secureConnection: false,
    auth: {
        user: nodeMailerUser,
        pass: nodeMailerPassword,
    },
    tls: {
        rejectUnauthorized: true,
    },
});
```

### ⚠️ Caution Regarding TypeScript & EJS Files

**When working with TypeScript and EJS templates**, there is an issue where **TypeScript** does not automatically compile EJS files. This can lead to issues when updating `.ejs` templates.

#### Fix:

1. **Modify the `build` script** in your `package.json` to copy the `views` folder to the `dist` directory after compilation:
```
"build": "tsc && cp -r src/views dist/views"
```
2. Whenever you make a change to an EJS file, delete the views folder in the dist directory and rebuild your project:
```
rm -rf dist/views
npm run build
```
This ensures that your EJS files are compiled and ready for use after TypeScript compilation.
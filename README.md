# Intastellar Developers (`inta.dev`)

Developer documentation and tools for **Intastellar** products. Public site: **https://inta.dev**.

## Documentation

Guides live under **`/docs`** (versioned URLs). Sign-in content distinguishes:

- **React & plain HTML/CSS/JS** — [`@intastellar/signin-sdk-react`](https://www.npmjs.com/package/@intastellar/signin-sdk-react) plus **`/docs/accounts-sign-in/v1/web/plain-html-css-js`** on inta.dev (migrated from the former [developers-site js-docs](https://developers.intastellarsolutions.com/identity/sign-in/web/docs/js-docs)).
- **OAuth-style code flow** — for custom server and mobile integrations.

Traffic from older developer hostnames should **redirect** to inta.dev; update **OAuth client URIs** to match your live URLs.

## Development

```bash
npm install
npm run dev
```

Set **your** client id and other secrets per your environment (see internal runbooks). Production requires proper session and database configuration for any signed-in features you enable.

```bash
npm run build
npm run start
```

## Stack

React Router 7, React 19, Tailwind CSS, MDX docs.

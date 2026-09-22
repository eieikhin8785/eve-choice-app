# Eve Choice Web App

The web marketplace for discovering homes, land, apartments, rooms, and commercial property across Yangon and Mandalay. It includes public discovery, search filters, listing details, saved-listing interactions, sign-in entry points, and owner/agent surfaces.

## Experience highlights

- Buy/rent discovery modes.
- Search by location, property type, and free text.
- Responsive listing cards and detail modal.
- Saved listings and inquiry/viewing entry points.
- Staff-reviewed marketplace messaging.
- Light/dark mode toggle with a persisted user preference.
- shadcn/ui design system preset `b6rt9CJTU` with an Eve Choice visual theme.

## Run locally

```bash
npm install
npm run dev
```

The app runs at `http://localhost:5173`. It uses curated demo listings by default and shows a live API indicator when the API is available at `http://localhost:4000`.

## Development behavior

The current UI remains useful without the API by using curated local demo listings. When the API is running, the footer confirms the connection. The API integration boundary is documented in [`../api/openapi.yaml`](../api/openapi.yaml).


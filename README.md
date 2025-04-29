# Zoom Message Filter

A Next.js application for filtering and analyzing Zoom chat messages.

## Features

- Upload and parse Zoom chat CSV files
- Filter messages by keyword, date, sender, receiver, and message tone
- Modern, responsive UI built with Material-UI
- API key authentication for dashboard access

## Local Development

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env.local` file with your API key:
   ```
   ZOOM_FILTER_API_KEY=your-secret-api-key-here
   ```
4. Run the development server:
   ```bash
   npm run dev
   ```
5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Deployment to Netlify

### Option 1: Deploy via Netlify UI

1. Push your code to a Git repository (GitHub, GitLab, or Bitbucket)
2. Log in to [Netlify](https://app.netlify.com/)
3. Click "New site from Git"
4. Select your repository
5. Configure the build settings:
   - Build command: `npm run build`
   - Publish directory: `.next`
6. Add environment variables:
   - Go to Site settings > Build & deploy > Environment
   - Add `ZOOM_FILTER_API_KEY` with your secret API key
7. Click "Deploy site"

### Option 2: Deploy via Netlify CLI

1. Install Netlify CLI:
   ```bash
   npm install -g netlify-cli
   ```
2. Login to Netlify:
   ```bash
   netlify login
   ```
3. Initialize and deploy:
   ```bash
   netlify init
   netlify deploy --prod
   ```

## Environment Variables

- `ZOOM_FILTER_API_KEY`: Secret key for dashboard authentication

## License

MIT

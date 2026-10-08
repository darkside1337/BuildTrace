# Local font assets

The interface uses self-hosted Latin variable fonts through `next/font/local`:

- DM Sans, weights 400–700: https://fonts.googleapis.com/css2?family=DM+Sans:wght@400..700
- Newsreader, weights 400–500: https://fonts.googleapis.com/css2?family=Newsreader:opsz,wght@6..72,400..500
- IBM Plex Mono, weight 400: https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400

DM Sans and Newsreader are used for interface text and display headings. IBM Plex Mono is reserved for SKUs, serials, and technical identifiers. The Latin subsets avoid extra font requests. Font files are distributed under the included SIL Open Font Licenses; the licenses were retrieved from `google/fonts` under `ofl/dmsans/OFL.txt`, `ofl/newsreader/OFL.txt`, and `ofl/ibmplexmono/OFL.txt`.

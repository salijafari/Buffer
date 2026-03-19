
  # Code React Native App (Copy)

  This is a code bundle for Code React Native App (Copy). The original project is available at https://www.figma.com/design/nYn4ZxKQ7yMT35anq0hqY0/Code-React-Native-App--Copy-.

  ## Running the code

  Run `npm i` to install the dependencies.

  Run `npm run dev` to start the development server.

  ## Railway / Railpack

  If the repo root is the parent folder (not `Main-page`), set the Railway service **Root Directory** to **`Main-page`**. Otherwise Railpack only sees a subfolder with no `package.json` and cannot detect Node. See the repository root `README.md` for steps.

  ## Search engine verification (before production)

  - **Bing:** In [Bing Webmaster Tools](https://www.bing.com/webmasters), choose XML file verification and copy the code into `public/BingSiteAuth.xml` (replace `REPLACE_WITH_BING_VERIFICATION_CODE` inside `<user>`).
  - **Google:** In [Google Search Console](https://search.google.com/search-console), use either the **HTML tag** method (uncomment and fill the meta tag in root `index.html`) or upload the **exact** `google*.html` file Google provides into `public/` and remove `public/google-site-verification.html` if you no longer need the placeholder instructions.

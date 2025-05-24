# Enables Vietnamese typing using AVIM library.

- Toggle with double `Ctrl` key press.

# Support browsers:

- Chrome
- Firefox (The same source code to Chrome, only different `manifest.json` file)

# Minify

```sh
npm install -g terser
cd src
terser ./scripts/avim.js -o ./scripts/avim.min.js
```

# Build to zip file

```sh
./Makefile
```

# Build to crx file

- Unzip the file from previous step
- Go to `chrome://extensions/`
- Click `Package extension`
- `Extension root directory`: select the unzip directory 
- `Private key file (optional)`: blank
- Click `Package extension`

# References

- https://github.com/1ec5/avim
- https://github.com/kimkha/avim-chrome

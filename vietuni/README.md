# Enables Vietnamese typing using VietUni library.

- Toggle with double `Ctrl` key press.

# Support browsers:

- Chrome
- Firefox (The same source code to Chrome, only different `manifest.json` file)

# Minify

```sh
npm install -g terser
cd vietuni
terser tests/vietuni.js -o chrome/src/scripts/vietuni.min.js
```

# Build

- Chrome:

```sh
cd vietuni
mkdir -p ./chrome/dist && cd ./chrome/src && zip -r ../dist/vietnamese-typing-extension.xpi ./* && cd ../../
zip -sf ./chrome/dist/vietnamese-typing-extension.xpi
```

- Firefox:

```sh
cd vietuni

# TODO: Copy all files and folders in chrome/src to frefix/src (exclude the chrome/src/manifest.json)

mkdir -p ./firefox/dist && cd ./firefox/src && zip -r ../dist/vietnamese-typing-extension.xpi ./* && cd ../../

zip -sf ./firefox/dist/vietnamese-typing-extension.xpi
```

# References

- Thank to `VietUni` (V.1.618 - R.11.11.01 by Tran Anh Tuan (`tuan.tran@avys.de`))
- https://www.codeproject.com/Articles/30204/Fastest-Smallest-Vietnamese-JavaScript-Input-Edito?PageFlow=Fluid
- https://www.codeproject.com/Articles/30204/VietUni2/vietuni_js_1.7_src.zip

# Issues

- `contenteditable` attribute is not correct on multiple rows

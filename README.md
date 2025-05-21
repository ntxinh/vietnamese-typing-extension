# Enables Vietnamese typing using VietUni library.

- Toggle with double `Ctrl` key press.

# Support browsers:

- Chrome
- Firefox (The same source code to Chrome, only different `manifest.json` file)

# Build

# Testing in Chrome (dev env)

Load Extension:

- Open Chrome and go to `chrome://extensions/`.
- Enable “Developer mode” (top right).
- Click “Load unpacked” and select the extension directory `chrome/src`.
- Every change in `chrome/src` directory, just click `Reload` on the Chrome Manage Extensions

Test:

- Visit a webpage with a text input or textarea.
- Double-press the `Ctrl` key to enable/disable Vietnamese typing.
- When enabled, type in an input field using Telex (e.g., `aw` for `ă`, `oo` for `ô`).

# Test in Firefox:

- Open Firefox, go to `about:debugging#/runtime/this-firefox`.
- Click “Load Temporary Add-on”, select `dist/xxx-1.0.0.xpi` or `build/` or `manifest.json`.
- Test:
    + Open the popup and change settings (e.g., “Telex”, “Off”).
    + Type in a text input on an HTTP/HTTPS page (e.g., `https://example.com`) to verify the extension.
    + Double-press `Ctrl` to toggle the extension; check badge updates.
    + Test iframes with editable content (e.g., `contentEditable` elements or `designMode`).
- Check the Browser Console (Tools > Browser Console) for errors.

# References

- Thank to `VietUni` (V.1.618 - R.11.11.01 by Tran Anh Tuan (`tuan.tran@avys.de`))
- https://www.codeproject.com/Articles/30204/Fastest-Smallest-Vietnamese-JavaScript-Input-Edito?PageFlow=Fluid
- https://www.codeproject.com/Articles/30204/VietUni2/vietuni_js_1.7_src.zip

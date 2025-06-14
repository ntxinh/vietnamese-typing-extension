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

## Temporary Installation

- Open Firefox, go to `about:debugging#/runtime/this-firefox`.
- Click “Load Temporary Add-on”, select `dist/xxx-1.0.0.xpi` or `build/` or `manifest.json`.
- Test:
    + Open the popup and change settings (e.g., “Telex”, “Off”).
    + Type in a text input on an HTTP/HTTPS page (e.g., `https://example.com`) to verify the extension.
    + Double-press `Ctrl` to toggle the extension; check badge updates.
    + Test iframes with editable content (e.g., `contentEditable` elements or `designMode`).
- Check the Browser Console (Tools > Browser Console) for errors.

## Permanent Installation (Manually)

- Create a zip file of your extension directory
- Open Firefox, go to `about:addons`
- Click the gear icon and select `Install Add-on From File`.
- Choose the `.xpi` file.
- Note: In stable Firefox, this may fail if the extension isn’t signed unless `xpinstall.signatures.required` is set to `false` (requires Firefox Developer Edition or Nightly).

## Permanent Installation (WebExtensions Auto-Installer)

```sh
npm install -g web-ext
cd firefox/src
# web-ext run
# web-ext run --firefox=firefoxdeveloperedition
web-ext build
```

- Find the `.xpi` file in the `web-ext-artifacts` folder.
- Install it via `about:addons` > `Install Add-on From File`.
- Set `xpinstall.signatures.required` to `false` in `about:config` (Firefox Developer/Nightly) to allow unsigned extensions.

## Use a Custom Firefox Profile

Create a Profile:

- Run Firefox with the profile manager: `firefox -P` (or `firefox --ProfileManager` on Windows).
- Create a new profile (e.g., “VietnameseTypingExtension”).
- Start Firefox with this profile: `firefox -P VietnameseTypingExtension`.

Load Extension:

- Go to `about:debugging` > `This Firefox`.
- Load your extension via `Load Temporary Add-on...`
- To make it permanent, either:
    + Set `xpinstall.signatures.required` to `false` in `about:config`.
    + Install the `.xpi` file as described above.

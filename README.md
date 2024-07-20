# Image Auto Upload Plugin

This plugin automatically uploads images in Obsidian and replaces them with online links, supporting multiple image storage services including GitHub, Qiniu Cloud, and Samba.

## Features

- **Clipboard Image Upload**: Automatically upload and insert an online link when pasting an image from the clipboard into an Obsidian note.
- **Drag-and-Drop Image Upload**: Automatically upload and insert an online link when dragging and dropping an image file into an Obsidian note.
- **File Menu Upload**: Upload selected image files via the file context menu and replace them with online links.
- **Multiple Storage Services**: Supports uploading images to GitHub, Qiniu Cloud, and Samba.
- **Domain Blacklist**: Configure a blacklist of domains to prevent image uploads from specified sources.

## Installation

1. **Install gopic**: For more details, please refer to https://github.com/OSTGO/gopic
2. **Download the Plugin**: Download the plugin code from GitHub or other sources.
3. **Copy the Plugin**: Place the plugin files in the Obsidian plugins directory (typically `<Your Obsidian Directory>/plugins`).
4. **Enable the Plugin**: Open Obsidian, go to Settings -> Community Plugins, find and enable the Image Auto Upload plugin.

## Usage

### Clipboard Upload

1. Copy an image to your clipboard.
2. Paste it into an Obsidian note, and the plugin will automatically upload the image and insert the link.
3. After pasting, the image will be replaced with an online link.

### Drag-and-Drop Upload

1. Drag and drop an image file into an Obsidian note.
2. The plugin will automatically upload the image and insert the link.

### File Menu Upload

1. Right-click the image file you want to upload in Obsidian's file explorer.
2. Select the “Upload” option, and the plugin will automatically upload the image and replace it with an online link.

## Settings

Go to Obsidian Settings -> Image Auto Upload Plugin Settings to configure the following options:

### Primary Storage

Select the primary storage service for image uploads. The following options are supported:

- GitHub
- Qiniu Cloud
- Samba

### Gopic Path

Set the path to the `gopic` tool used for uploading images.

### Enable Upload Services

Enable or disable each upload service in the plugin settings:

- **GitHub**: Enable or disable GitHub upload service.
- **Qiniu Cloud**: Enable or disable Qiniu Cloud upload service.
- **Samba**: Enable or disable Samba upload service.

### Network Domain Blacklist

Configure a blacklist of domains to prevent image uploads from specified sources. Separate multiple domains with commas, for example: `example.com,badsite.org`.

## FAQ

### What to do if the upload fails?

- Ensure the gopic tool path is set correctly.
- Check your network connection to ensure it can access the target storage service.
- Check the error messages in the Obsidian console output for more debugging information.

### How to contribute?

- Contributions and feedback are welcome. Create an issue or submit a pull request on GitHub.

## Contributing

We welcome contributions and feedback from the community. If you have any suggestions or encounter any issues, please create an issue or submit a pull request on GitHub.

## License

This project is licensed under the MIT License. For more details, see the LICENSE file.

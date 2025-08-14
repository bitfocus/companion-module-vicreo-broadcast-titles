# companion-module-vicreo-broadcast-titles

Bitfocus Companion module for VICREO Broadcast Titles. Control your broadcast graphics software remotely via WebSocket API.

See [HELP.md](./companion/HELP.md) and [LICENSE](./LICENSE)

## Features

- **Remote Control**: Navigate through Excel data remotely
- **Live Output**: Send titles to NDI stream with single button press
- **Real-time Variables**: Display current title, subtitle, and other Excel data
- **Smart Feedbacks**: Visual indicators for live status and row selection
- **Auto-reconnect**: Automatic reconnection when connection is lost

## Quick Start

1. Install and run VICREO Broadcast Titles
2. Load your Excel data in the application
3. Note the WebSocket port (shown in Output Controls → WebSocket API)
4. Configure this module in Companion with the correct host and port
5. Create buttons with the provided actions and feedbacks

## Getting started

Executing a `yarn` command should perform all necessary steps to develop the module, if it does not then follow the steps below.

The module can be built once with `yarn build`. This should be enough to get the module to be loadable by companion.

While developing the module, by using `yarn dev` the compiler will be run in watch mode to recompile the files on change.

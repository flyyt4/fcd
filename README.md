# FCD (Fast Change Directory)

**FCD** is a CLI tool that allows you to quickly navigate to frequently used directories and automatically copies the cd command to your clipboard.  
Its goal is to speed up development workflows by providing a fast, minimalist, and configurable navigation experience.

## Installation

```bash
pnpm install -g fcd
# or
bun install fcd -g
# or
yarn global add fcd
# or
npm install -g fcd
```

## Features

- Quick navigation between folders.

- Adaptive display: vertical and horizontal modes.

- Lightweight and focused on productivity.

## Usage

```bash
fcd
```

Navigate through directories and files using tab and arrow keys.
To enter a directory, select the "." option.
Press `s` to toggle between normal and vertical display modes.
Press `q` to exit the application.

## TODO:

- [ ] Add support for a configuration file (e.g., .fcdrc or fcd.config.json).

- [ ] Add file and folder icon association based on type or extension.

- [ ] Add customizable final command execution for files and folders.

- [ ] Implement navigation history for automatic suggestions.

- [ ] Support for directory aliases.

- [ ] Advanced fuzzy search option.

- [ ] Optional shell integration (bash, zsh, fish, powershell).

- [ ] Theme support (configurable colors).

- [ ] Add a "favorites" mode to mark frequent paths.

- [ ] Add help flag and implement less help to press `h`.

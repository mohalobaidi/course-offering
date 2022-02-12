# Contributing to KFUPM Course Offering

Thanks for contributing on [KFUPM Course Offering](https://github.com/mohalobaidi/course-offering)! It’s people like you that make our university a better place.
Before implementing new features and changes, we suggest beginning by [submitting an issue](https://github.com/johannchopin/gitmoji-browser-extension/issues/new/choose) so any high level feedback can be addressed early.

This project uses [VueJS](https://vuejs.org/) to create the interface and is build using [Vite](https://vitejs.dev/).

## How to submit a pull request?

1. Fork this repository.
2. Create a new feature branch. (Eg: `feature/improve-timetable-design`)
3. Make your changes.
4. Commit your changes using a descriptive commit message.
6. Submit your pull request.

## How to start course-offering locally

If you want to make changes to the extension, follow the next steps:

1. Clone the project

```sh
git clone https://github.com/mohalobaidi/course-offering.git
cd course-offering
```

2. Install the dependencies and start the development task.

```sh
yarn install && yarn dev
```

The development task will compile, watch and open the extension in a sandbox webpage. Your are ready to make your changes

## Build course-offering

1. Build the extension to test it in your browser

```sh
yarn build
```

It will compile under the `dist/` folder. Just load this folder as an unpacked extension in your browser:

- in Firefox : [Temporary installation in Firefox](https://extensionworkshop.com/documentation/develop/temporary-installation-in-firefox/)
- in Chrome : See point **1** of [Load an unpacked extension step](https://developer.chrome.com/extensions/getstarted#manifest)
- in Microsoft Edge: Same process for Chrome

It will also create the extension as a zip file called `course-offering-[version].zip` in `/releases` folder.

---

<p align="center">
  This extension is not sponsored by, endorsed by, or an official project of KFUPM
</p>

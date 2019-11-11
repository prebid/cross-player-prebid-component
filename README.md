 # cross-player-prebid-component

> A free and open source library for publishers to quickly implement a Javascript component that will invoke the prebid process and make the results available to any video player.  Since the component is not responsible for rendering the video ad, it can work with any third-party player implementation as well as custom players.  It uses simple `postMessage`-based communication technology to pass the results to a player upon request.

This README is for developers who want to use and/or contribute to `cross-player-prebid-component`.
Additional documentation can be found at [the Cross-Player Prebid Component homepage](http://prebid.org/dev-docs/plugins/cross-player-prebid-component/About-Cross-Player-Prebid-Component.html).
Sample integrations can be found under "Samples" in the "Cross-Player Prebid Component" section of [Prebid.js External Plugins](http://prebid.org/dev-docs/plugins/).

**Table of Contents**

- [Component Partners](#Partners)
- [Install](#Install)
- [Build Prebid Component](#Build)
- [Test Locally](#Test)
- [Build and Run a Project Locally](#Run)
- [Deploy the Comonent](#Deploy)
- [Contribute](#Contribute)

<a name="Partners"></a>

## Component Partners

A successful deployment of this component simply includes a successful build of the prebid component as well as:
- a test page which loads a player that will render the ad.  
- The player can be loaded 
    - into an iframe
    - in the same document where the component was loaded
- The player needs to be able to:
    - send a request for prebid results via `postMessage`
    - listen for a `postMessage` response.

<a name="Install"></a>

## Install

    $ git clone https://github.com/prebid/cross-player-prebid-component.git
    $ cd cross-player-prebid-component
    $ npm install

*Note:* You need to have `NodeJS` 9.x or greater installed.

<a name="Build"></a>

## Build Prebid Component

To build the project on your local machine, run:

    $ gulp

This runs some code quality checks and generates the following files:

-	`./dist/PrebidPluginCP.min.js` - Minified production code of the component
-	`./dist/PrebidPluginCP.js` - Non-minified production code of the component
-	`./dist/PrebidPluginCP.js.map` - Mapping file for the component (used in debugging)


<a name="Test"></a>

## Test Locally

To run the unit tests:

```bash
gulp test
```

To generate and view the code coverage reports:

```bash
gulp ci-test
```

<a name="Run"></a>

## Build and Run a Project Locally

Steps:

1. (optional) Update host file
2. Build the component
3. Select test page to test with  
    a. Modify path to your prebid component build  
    b. (optional) Modify path to the prebid.js

### Update Host File (optional step)

To build and run this project locally, if you are planning on using an AppNexus bidder, you must first modify your host file to setup an alias for local.prebid.  Otherwise, your "localhost" domain may become blacklisted by Xandr.

Add the following line to your host file:

```bash
127.0.0.1       local.prebid
```

### Build the Component

Build and run the project locally with:

```bash
gulp dev-server
```

This builds the plugin and starts a web server at `http://local.prebid:8082` serving from the project root.

### Select Test Page

#### Sample Test Pages

There is one test page provided with the component that demonstrates the use the component in a header bidding case where the player is loaded in an iframe. These test pages are provided in the repository at: `./tests/e2e/testPages/`

You may use the test page provided in this repository or create your own. You may also use other video players for rendering the video ad. See `???n/Cross-Player-Prebid-Component-Configuration-Options.html` for details on all the options that can be passed to the component.

- `prebid-jwplayer-sync.html`
    - This page can be used to implement prebid in the header using JW Player as the renderer.
    - This page queries the user for a url that points to the prebid configuration options defined in a JSON file.
    - This page loads the prebid component in the header, passing in the prebid configuraion url.  
    - The component listens for a `postMessage` from the Player.
    - This page loads an iframe which loads the JW Player.
- `jwplayer-sync.html`
    - This page is loaded by the test page into an iframe.  This page contains the JW Player itself.
    - When the iframe has loaded, it will send a request for prebid results using a `postMessage`, as documented.
    - The prebid componenet responds to the Player's request using a `postMessage`, as documented.
    - The results of Prebid are then rendered by the JW Player as a preroll ad.

#### Test Page Modifications

Before testing, you may need to make the following changes to your selected test page:

- Change the path used to load the Prebid component to point to your component build.
- If you want to use your own instance of the JW Player or another player, you need to replace the JW Player embedding code that is on the provided iframe page.

As an example, to run the prebid-jwplayer-sync.html test page, go to:

+ `http://local.prebid:8082/prebid-jwplayer-sync.html`


<a name="Deploy"></a>

## Deploy the Component

When you are ready to deploy your build of this component, you need to make sure that all the paths are set up correctly.
Make sure the following paths are correct:

- path to your build of the component
- path to your build of prebid.js
- path to your iframe page

<a name="Contribute"></a>

## Contribute

SSPs and publishers may contribute to this project.

For guidelines, see [Contributing](https://github.com/prebid/prebid-js-plugin-brightcove/tree/master/CONTRIBUTING.md).

Our PR review process can be found [here](https://github.com/prebid/prebid-js-plugin-brightcove/tree/master/PR_REVIEW.md).

### Code Quality

Code quality is defined by `.eslintrc` and errors are reported in the terminal during the build process.

If you are contributing code, you should [configure your editor](http://eslint.org/docs/user-guide/integrations#editors) with the provided `.eslintrc` settings.

### Unit Testing with Karma

        $ gulp test

This will run the tests. To keep the Karma test browser open, you need to modify `karma.conf.js` to set `singleRun` to `false`.

- To access the Karma debug page, go to `http://localhost:9876/debug.html`.
- For test results, see the console.
- To set breakpoints in source code, see the developer tools documentation.

Detailed code coverage reporting can be generated explicitly with

        $ gulp ci-test

The results will be in

        ./coverage


### Supported Browsers

cross-player-prebid-component is supported on Internet Explorer 11+ and all modern browsers.

### Governance
Review our governance model [here](https://github.com/prebid/cross-player-prebid-component/tree/master/governance.md).

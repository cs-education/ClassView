# ClassView
Multi-View interface for ClassCapture

## Notes on Video Synchronization Methodology

- One Main Video and Multiple Synchronized Video
- Once main video is complete, it is popped out of the main video frame and the next video from the syncronized videos is queued in to pick up chronologically after the main video.

## Tech Stack
- [AngularJS](https://docs.angularjs.org/api)
- [Videogular](http://www.videogular.com/)
- [Angular UI Bootstrap](https://angular-ui.github.io/bootstrap/)
- [Uses Angular-Fullstack Yeoman Generator](https://github.com/DaftMonk/generator-angular-fullstack)

## Development Setup
Install yeoman, bower, grunt, and angular-fullstack: `npm install -g yo bower grunt-cli generator-angular-fullstack@3.1.1`

### Build Distribution Package
`grunt build:dist` (might need to use `--force` option)

### Start WebApp Server
`grunt serve`

### Linking with ClassCapture Web
Look at the documentation for `bower link` [here](http://bower.io/docs/api/#link)
You need to run `grunt build:dist` to see your changes in ClassCapture Web after you linked it with ClassView
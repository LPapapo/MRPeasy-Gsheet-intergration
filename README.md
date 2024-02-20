* Requirements

  
  Npm nodejs installed


  npm install @google/clasp -g


  npm install typescript

* For local development, you need to `git clone` this repository to your local machine. Then, to install node modules (creating a `node_modules` folder), run:

  ```bash
  $ npm install
  ```

* Create a new local git branch with your changes.

* Copy the provided [.clasp.json.dist](./.clasp.json.dist) to `.clasp.json`.

* Update the `scriptId` in your local `.clasp.json` to the `Script ID` value found under [Project Settings](https://script.google.com/home/projects/1dVHJUibx7GNWWaoi_tPc9XdKdPXretKu9Q2EadMq3HAZqJSihgj8J7mw/settings), `IDs`.

* To test your changes, build the bundle and push to the GAS project by running:

  ```bash
  
  $ npm run push
  ```

* If your changes are working as expected, open a PR on this repository.

## Licence

This code is licenced under the Apache License, Version 2.0.

## Built with

- [Google Cloud Platform](https://cloud.google.com/)
- [Node.js](https://nodejs.org/en/download/)
- [google/clasp](https://github.com/google/clasp)
- [dreamsheets-scripts](https://github.com/product-os/dreamsheets-scripts) (see its README for things like customizing the oauth scopes for the project)

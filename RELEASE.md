## Before the release

* Land relevant changes.
* Ensure CI is passing.

## Prepare the commit

* Update the `CHANGELOG` file.
* Rebuild the readme and run the tests.
  `npx grunt`
* Set the new version in the readme header.

## Commit, push, and publish

Consider using the [np tool](https://www.npmjs.com/package/np) to automate
these steps. Note that "np" will require access to credentials for Git/SSH,
and for npmjs.com.

* Set the new version in `package.json`.
* Update the lock file and re-run the tests.
  `npm install-test`
* Stage and locally commit.
  `git add -p && git commit -m $NEW_VERSION`
* Create the tag.
  `git tag -s v${NEW_VERSION} -m $NEW_VERSION`
* Push commit and tag.
  `git push --follow-tags`
* Publish package.
  `npm publish`

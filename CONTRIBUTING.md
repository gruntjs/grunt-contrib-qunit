# Contributing

Please see the [Contributing to Grunt](https://gruntjs.com/contributing) guide for information on contributing to this project.

## Release process

### Before the release

* Land relevant changes.
* Ensure CI is passing.

### Publish

1. Set the new version in `package.json`.
2. Write section in `CHANGELOG.md` file.
   Include only high-level changes that are relevant and observable to users of the package.
3. Stage and locally commit.
   ```
   git add -p && git commit -m $NEW_VERSION
   ```
4. Create the tag.
   ```
   git tag -s v${NEW_VERSION} -m $NEW_VERSION
   ```
5. Push commit and tag.
   ```
   git push --follow-tags
   ```
6. Publish package.
   ```
   npm publish
   ```

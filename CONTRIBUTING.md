## Release process

1. Set next version in `package.json`.
2. Write section in `CHANGELOG.md` with high-level changes,
   limited to what is relevant and observable to users of the package.
3. Commit to Git and push to a temporary branch (e.g. `release`).
4. Wait for and confirm that CI passes.
5. Push to main, and delete the `release` branch on GitHub.
6. Create and push git tag.
7. Run `npm publish`

## See also

* [Contributing to grunt](https://gruntjs.com/contributing)

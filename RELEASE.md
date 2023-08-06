# Release

**_(TODO: Improve the documentation. It is too easy to make release number mistake.)_**

1. Update the version number in `package.json`
2. Build the release: `yarn build`
3. Create release branch: `git checkout -b release/v<MAJOR>.<MINOR>.<PATCH>`
4. Add `package.json`: `git add package.json`
5. Commit: `git commit -m "release: v<MAJOR>.<MINOR>.<PATCH>"`
6. Tag: `git tag v<MAJOR>.<MINOR>.<PATCH>`
7. Publish: `npm publish --access=public`
8. Push created tag: `git push origin refs/tags/v<MAJOR>.<MINOR>.<PATCH>`
9. Push: `git push origin release/v<MAJOR>.<MINOR>.<PATCH>`

## Example for version `0.1.3`

1. Update the version number in `package.json`
2. Build the release: `yarn build`
3. Create release branch: `git checkout -b release/v0.1.3`
4. Add `package.json`: `git add package.json`
5. Commit: `git commit -m "release: v0.1.3"`
6. Tag: `git tag v0.1.3`
7. Publish: `npm publish --access=public`
8. Push created tag: `git push origin refs/tags/v0.1.3`
9. Push: `git push origin release/v0.1.3`

## Note

If I created release script it should be able to handle failure at any step and proceed because after publishing to npm, i can't un-publish it. Once non-reversible step has been completed, we can not allow the publish script to fail.

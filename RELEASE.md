# Release

1. Update the version number in `package.json`
2. Build the release: `yarn build`
3. Create release branch: `git checkout -b release/v0.1.1`
4. Add `package.json`: `git add package.json`
5. Commit: `git commit -m "release: v0.1.1"`
6. Tag: `git tag v0.1.1`
7. Publish: `npm publish --access=public`
8. Push created tag: `git push origin refs/tags/v0.1.1`
9. Push: `git push origin release/0.1.1`

import { copyFileSync } from 'fs'
import { execSync } from 'child_process'
import rimraf from 'rimraf'

const [, , pkgName, jsx] = process.argv

rimraf(`dist/packages/${pkgName}`, (e) => {
  if (e) {
    throw new Error(e.message)
  }
})

execSync('yarn changeset version')

execSync(
  `yarn microbundle --sourcemap false ${
    jsx
      ? `--jsx React.createElement --jsxFragment React.Fragment --jsxImportSource react`
      : ''
  } -i packages/${pkgName}/src/index.ts -o dist/packages/${pkgName}/${pkgName}.js -f modern,cjs,esm`
)

copyFileSync(
  `packages/${pkgName}/package.json`,
  `dist/packages/${pkgName}/package.json`
)

execSync('yarn changeset publish')

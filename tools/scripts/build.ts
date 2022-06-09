import { copyFileSync } from 'fs'
import editJsonFile from 'edit-json-file'
import { execSync } from 'child_process'
import rimraf from 'rimraf'

const [, , pkgName, jsx] = process.argv

// Delete previous build folder
rimraf(`dist/packages/${pkgName}`, (e) => {
  if (e) {
    throw new Error(e.message)
  }
})

// Actual build with microbundle
execSync(
  `yarn microbundle --sourcemap false --tsconfig packages/${pkgName}/tsconfig.json ${
    jsx
      ? `--jsx React.createElement --jsxFragment React.Fragment --jsxImportSource react`
      : ''
  } -i packages/${pkgName}/src/index.ts -o dist/packages/${pkgName}/${pkgName}.js -f modern,cjs,esm`
)

// Copies the source package.json file to the build folder
copyFileSync(
  `packages/${pkgName}/package.json`,
  `dist/packages/${pkgName}/package.json`
)

// Fix main file of package.json
const file = editJsonFile(`dist/packages/${pkgName}/package.json`)
file.set('main', `./${pkgName}.js`)
file.save()

// Moves index.d.ts from generated folder to build's root folder
copyFileSync(
  `dist/packages/${pkgName}/src/index.d.ts`,
  `dist/packages/${pkgName}/index.d.ts`
)

// Removes src/ folder from dist
rimraf(`dist/packages/${pkgName}/src`, (e) => {
  if (e) {
    throw new Error(e.message)
  }
})

import { exec } from 'child_process'
import rimraf from 'rimraf'

const [, , pkgName, jsx] = process.argv

rimraf(`dist/packages/${pkgName}`, (e) => {
  if (e) {
    throw new Error(e.message)
  }
})

exec(
  `yarn microbundle --sourcemap false ${
    jsx
      ? `--jsx React.createElement --jsxFragment React.Fragment --jsxImportSource react`
      : ''
  } -i packages/${pkgName}/src/index.ts -o dist/packages/${pkgName}/${pkgName}.js -f modern,cjs,esm`,
  (error, stdout) => {
    console.log(error)
    console.log(stdout)
  }
)

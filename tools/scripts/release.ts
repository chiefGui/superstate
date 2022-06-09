import { execSync } from 'child_process'

const [, , pkgName, jsx] = process.argv

execSync('yarn changeset version')
execSync(`yarn nx run ${pkgName}:build ${jsx}`)
execSync('yarn changeset publish')

import { fromStream } from 'ssri'
import {fetchTarball, getPackument, namedScope, namedPackage, prepareManifest, publish, scopedOptions} from './util'
import { writeFileSync } from 'fs';

export async function sync(name: string, from: Record<string, string>, to: Record<string, string>, newScope: string = namedScope(name), dryRun = false) {
  // TODO: handle version spec
  const scope = namedScope(name)
  const pkgName = namedPackage(name)
  
  // get available source versions
  const srcOptions = scopedOptions(scope, from.registry, from.token)
  // fullMetadata may needed to obtain the repository property in manifest
  srcOptions.fullMetadata = true
  const srcPackument = await getPackument(name, srcOptions)
  const srcVersions = srcPackument ? Object.keys(srcPackument.versions) : []
  console.debug('Source versions', srcVersions)

  // get available target versions
  const dstOptions = scopedOptions(newScope, to.registry, to.token)
  const dstPackument = await getPackument(name, dstOptions)
  const dstVersions = dstPackument ? Object.keys(dstPackument.versions) : []
  console.debug('Target versions', dstVersions)

  const missing = srcVersions.filter(x => !dstVersions.includes(x))
  console.log('Missing versions', missing)
  if (!missing.length) {
    return 0
  }

  for (const version of missing) {
    let spec = name + '@' + version
    console.log('Reading %s from %s', spec, from.registry)

    const manifest = prepareManifest(srcPackument, version)
    console.debug('Dist', manifest.dist)

    //const tarball = await getTarball(spec, srcOptions)
    const tarball = await fetchTarball(manifest.dist, from.token)
    console.debug('Tarball length', tarball.length)

    spec = newScope + "/" + pkgName + '@' + version
    console.log('Publishing %s to %s', spec, to.registry)
    
    manifest.name = newScope + "/" + pkgName 
    console.log('manifest: ', manifest.name);

    await publish(manifest, tarball, dstOptions, dryRun)
  }
  return missing.length
}

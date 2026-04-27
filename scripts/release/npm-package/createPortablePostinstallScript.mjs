const PORTABLE_POSTINSTALL_SCRIPT = String.raw`
const fs = require('fs');
const path = require('path');
const cp = require('child_process');
function linuxLibc(){try{return cp.execSync('ldd --version 2>&1',{encoding:'utf8',timeout:5000}).toLowerCase().includes('musl')?'musl':'gnu'}catch{return 'gnu'}}
function ffiSuffix(){const p=process.platform,a=process.arch,l=p==='linux'?linuxLibc():undefined;if(p==='darwin'&&(a==='arm64'||a==='x64'))return 'darwin-'+a;if(p==='linux'&&a==='arm64')return 'linux-arm64-'+l;if(p==='linux'&&a==='x64')return 'linux-x64-'+l;if(p==='linux'&&a==='arm')return 'linux-arm-gnueabihf';if(p==='win32'&&a==='arm64')return 'win32-arm64-msvc';if(p==='win32'&&a==='x64')return 'win32-x64-msvc';if(p==='win32'&&a==='ia32')return 'win32-ia32-msvc';return undefined}
const suffix=ffiSuffix();
if(suffix){const file='ffi-rs.'+suffix+'.node';const src=path.join(process.cwd(),'node_modules','@yuuang','ffi-rs-'+suffix,file);const dst=path.join(process.cwd(),'node_modules','ffi-rs',file);if(fs.existsSync(src)){fs.mkdirSync(path.dirname(dst),{recursive:true});fs.copyFileSync(src,dst)}}
const spawnHelper=path.join(process.cwd(),'node_modules','node-pty','prebuilds','darwin-arm64','spawn-helper');
if(fs.existsSync(spawnHelper))fs.chmodSync(spawnHelper,0o755);
`;

/**
 * Creates the npm postinstall command used by release packages.
 *
 * @returns {string} Portable node postinstall command.
 */
export function createPortablePostinstallScript() {
  return `node -e ${JSON.stringify(PORTABLE_POSTINSTALL_SCRIPT.trim().replace(/\n/g, ""))}`;
}

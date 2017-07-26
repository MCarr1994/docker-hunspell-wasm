/**
  * Preprocessor script to be injected into compiled output
  *
  * In here, detect environment and if it's node, override `Module.locateFile`
  * (https://kripken.github.io/emscripten-site/docs/api_reference/module.html#Module.locateFile)
  * to use relative path for locating memory optimization file (.mem) or wasm binary (.wasm)
  * by default, it always look for current running directory.
  */

// we are building with MODULARIZE option,
// which pre-generates module object in preprocessor context - simply use it

// expose filesystem api selectively
Module["preRun"] = function () {
  Module.FS = {
    filesystems: FS.filesystems,
    stat: FS.stat,
    isDir: FS.isDir,
    isFile: FS.isFile,
    mkdir: FS.mkdir,
    mount: FS.mount,
    writeFile: FS.writeFile,
    unlink: FS.unlink,
    unmount: FS.unmount,
    rmdir: FS.rmdir
  };
};

//Caching init value to resolve subsequent init runtime immediately.
var __hunspell_asm_module_isInitialized = false;

/**
 * Returns promise resolve once runtime initialized.
 */
Module["initializeRuntime"] = function () {
  if (__hunspell_asm_module_isInitialized) {
    return Promise.resolve(true);
  }

  return new Promise(function (resolve, reject) {
    var timeoutId = setTimeout(function () {
      resolve(false);
    }, 3000);

    Module["onRuntimeInitialized"] = function () {
      clearTimeout(timeoutId);
      __hunspell_asm_module_isInitialized = true;
      resolve(true);
    }
  });
}

//if it's overridden via ctor, do not set default
if (!Module["locateFile"]) {
  //using module.exports to detect node environment
  if (typeof module !== 'undefined' && module.exports) {
    if (typeof __dirname === "string") {
      Module["locateFile"] = function (fileName) {
        return require('path').join(__dirname, fileName);
      }
    }
  }
}


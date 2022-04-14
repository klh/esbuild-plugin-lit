import type { PluginBuild } from "esbuild";
import { AssetLoader, LoaderOptions } from "./asset-loader";

export class CSSLoader extends AssetLoader {
  extension = /\.css$/;

  constructor(
    build: PluginBuild,
    options: LoaderOptions = {},
    specifier = "lit",
    minifier?: unknown,
  ) {
    super(build, options, specifier, minifier);
    if (options.extension) this.extension = options.extension;
    if (options.transform) this.transform = options.transform;
    this.minify = build.initialOptions.minify && options.minify !== false;
    this.sourcemap = !!build.initialOptions.sourcemap;
  }

  load(input: string, filename: string): string {
    let output = this.transform(input);
    let sourcemap = "";
    const { code, map } = this.build.esbuild.transformSync(output, {
      loader: "css",
      minify: this.minify,
      sourcemap: this.sourcemap,
      sourcefile: filename,
    });
    if (this.sourcemap) sourcemap = this.toSourceMapURL(map);
    output = this.sanitize(code);
    return `import { css } from '${this.specifier}';
export const styles = css\`${output}\`;
export default styles;${sourcemap}`;
  }
}

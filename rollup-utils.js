// 生成打包配置
import { terser } from "rollup-plugin-terser";
import visualizer from "rollup-plugin-visualizer";
import serve from "rollup-plugin-serve";
import livereload from "rollup-plugin-livereload";

// 处理output对象中的format字段(传入的参数会与rollup所定义的参数不符，因此需要在这里进行转换)
const buildFormat = formatVal => {
  let finalFormatVal = formatVal;
  switch (formatVal) {
    case "esm":
      finalFormatVal = "es";
      break;
    case "common":
      finalFormatVal = "cjs";
      break;
    default:
      break;
  }
  return finalFormatVal;
};

/**
 * 根据外部条件判断是否需要给对象添加属性
 * @param obj 对象名
 * @param condition 条件
 * @param propName 属性名
 * @param propValue 属性值
 */
const addProperty = (obj, condition, propName, propValue) => {
  // 条件成立则添加
  if (condition) {
    obj[propName] = propValue;
  }
};

const buildConfig = (packagingFormat = [], compressedState = "false") => {
  const outputConfig = [];
  for (let i = 0; i < packagingFormat.length; i++) {
    const pkgFormat = packagingFormat[i];
    // 根据packagingFormat字段来构建对应格式的包
    const config = {
      file: `dist/screenShotPlugin.${pkgFormat}.js`,
      format: buildFormat(pkgFormat),
      name: "screenShotPlugin",
      globals: {
        vue: "Vue"
      }
    };
    // 是否需要对代码进行压缩
    addProperty(config, compressedState === "true", "plugins", [terser()]);
    addProperty(config, pkgFormat === "common", "exports", "named");
    outputConfig.push(config);
  }
  return outputConfig;
};

const buildCopyTargetsConfig = (useDevServer = "false") => {
  const result = [
    {
      src: "src/assets/fonts/**",
      dest: "dist/assets/fonts"
    }
  ];
  if (useDevServer === "true") {
    result.push({
      src: "public/**",
      dest: "dist"
    });
  }
  return result;
};

// 生成打包后的模块占用信息
const enablePKGStats = (status = "false") => {
  if (status === "true") {
    return visualizer({
      filename: "dist/bundle-stats.html"
    });
  }
  return null;
};

const enableDevServer = status => {
  const serverConfig = [];
  if (status === "true") {
    serverConfig.push(
      serve({
        // 服务器启动的文件夹,访问此路径下的index.html文件
        contentBase: "dist",
        port: 8123
      }),
      // watch dist目录，当目录中的文件发生变化时，刷新页面
      livereload("dist")
    );
  }
  return serverConfig;
};

export { buildConfig, buildCopyTargetsConfig, enablePKGStats, enableDevServer };

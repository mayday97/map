module.exports = {
  productionSourceMap: false, // 生产环境是否生成 SourceMap
  css: {
    loaderOptions: {
      css: {},
      postcss: {
        plugins: [
          require("postcss-px2rem")({
            remUnit: 37.5,
          }),
        ],
      },
    },
  },
  //   devServer: {
  //     proxy: "",
  //   },
};

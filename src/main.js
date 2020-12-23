/*
 * @Author: xiaoyu
 * @Date: 2020-12-22 09:54:41
 * @LastEditTime: 2020-12-23 16:05:51
 */
import Vue from "vue";
import "./plugins/axios";
import App from "./App.vue";
import router from "./router";

//normalize
import "normalize.css";

//rem 适配
import "lib-flexible";

Vue.config.productionTip = false;

new Vue({
  router,
  render: (h) => h(App),
}).$mount("#app");

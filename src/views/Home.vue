<!--
 * @Author: xiaoyu
 * @Date: 2020-12-22 09:54:41
 * @LastEditTime: 2020-12-25 15:59:50
-->
<template>
  <div class="map-page" ref="scroll">
    <img class="icon-compass" src="../assets/icon/compass.png" alt="" />
    <!-- 地图区域 -->
    <div class="map-wrap">
      <!-- 大风车 -->
      <div class="icon-dfc"></div>
      <!-- 湖泊 -->
      <div class="icon-lake"></div>
      <!-- 小人 -->
      <div class="icon-boy" ref="boy" :style="boyStyle"></div>
      <!-- 地点 -->
      <div class="place" v-for="item in placeList" :key="item.name" :style="{ top: item.top, left: item.left }" @click="bindPlace(item)"></div>
    </div>
  </div>
</template>

<script>
import mydata from "../../public/data.js";
const Unit_Time = 100; //单位时间
const Delay_Time = 500; //切换方向延迟（X轴，Y轴切换）
const Speed_Time = 200; // 走路速度
export default {
  name: "Home",
  watch: {},
  data() {
    return {
      boyStyle: {
        top: "50%",
        left: "50%",
        backgroundPosition: "0% 0%",
        transitionDuration: "0ms",
        transitionProperty: "",
      }, //小人属性
      placeList: [
        {
          name: "地点1",
          top: "66%",
          left: "20%",
        },
        {
          name: "地点2",
          top: "50%",
          left: "70%",
        },
        {
          name: "地点3",
          top: "30%",
          left: "60%",
        },
      ], //地点集合
    };
  },
  created() {
    console.log(mydata);
  },
  mounted() {
    this.init();
  },
  methods: {
    //初始化
    init() {
      //初始化地图 居中
      const scrollElement = this.$refs.scroll;
      const width = scrollElement.scrollWidth;
      const screenWidth = document.body.clientWidth;
      scrollElement.scrollLeft = (width - screenWidth) / 2;
    },

    //获取小人所在位置
    getBoyPosition() {
      const boy = this.$refs.boy;
      return {
        top: boy.style.top,
        left: boy.style.left,
      };
    },
    /**
     *位置     立正     左脚       右脚
     *向上走 (0 00%) (33% 00%) (66% 00%)
     *向下走 (0 32%) (33% 32%) (66% 32%)
     *向左走 (0 66%) (32% 66%) (66% 66%)  (98% 66%)
     *向右走 (0 100%) (32% 100%) (66% 100%) (98% 100%)
     */

    //小人移动 先左右 再上下x  如果xDiff大于0 则向右  yDiff大于0 则向下
    boyMove(placePosition, boyPosition) {
      const placeLeftNum = placePosition.left.split("%")[0]; //地点x轴坐标值
      const placeTopNum = placePosition.top.split("%")[0]; //地点y轴坐标值
      const boyLeftNum = boyPosition.left.split("%")[0]; //小人x轴坐标值
      const boyTopNum = boyPosition.top.split("%")[0]; //小人y轴坐标值

      const xDiff = placeLeftNum - boyLeftNum; //横向差值
      const yDiff = placeTopNum - boyTopNum; //纵向差值

      const xTime = Math.abs(xDiff) * Unit_Time; //x轴移动时间
      const yTime = Math.abs(yDiff) * Unit_Time; //y轴移动时间

      let UpInterval, DownInterval, RightInterval, LeftInterval;

      //=======================================================================
      //x轴移动
      if (xDiff >= 0) {
        // //向右
        this.boyStyle.backgroundPosition = "0% 100%";
        let tag = 0;
        RightInterval = setInterval(() => {
          if (tag === 0) {
            this.boyStyle.backgroundPosition = "32% 100%";
            tag++;
          } else if (tag === 1) {
            this.boyStyle.backgroundPosition = "66% 100%";
            tag++;
          } else if (tag === 2) {
            this.boyStyle.backgroundPosition = "98% 100%";
            tag = 0;
          }
        }, Speed_Time);
      } else {
        // //向左
        this.boyStyle.backgroundPosition = "0% 66%";
        let tag = 0;
        RightInterval = setInterval(() => {
          if (tag === 0) {
            this.boyStyle.backgroundPosition = "32% 66%";
            tag++;
          } else if (tag === 1) {
            this.boyStyle.backgroundPosition = "66% 66%";
            tag++;
          } else if (tag === 2) {
            this.boyStyle.backgroundPosition = "98% 66%";
            tag = 0;
          }
        }, Speed_Time);
      }

      setTimeout(() => {
        this.boyStyle.left = placePosition.left;
        this.boyStyle.transitionProperty = "left";
        this.boyStyle.transitionDuration = xTime + "ms";
      }, Delay_Time);
      //=======================================================================

      //=======================================================================
      //y轴移动
      setTimeout(() => {
        clearInterval(LeftInterval);
        clearInterval(RightInterval);
        if (yDiff >= 0) {
          // //向下
          this.boyStyle.backgroundPosition = "0% 32%";
          let tag = 0;
          DownInterval = setInterval(() => {
            if (tag % 2 == 0) {
              this.boyStyle.backgroundPosition = "33% 32%";
            } else {
              this.boyStyle.backgroundPosition = "66% 32%";
            }
            tag++;
          }, Speed_Time);
        } else {
          // //向上
          this.boyStyle.backgroundPosition = "0% 0%";
          let tag = 0;
          UpInterval = setInterval(() => {
            if (tag % 2 == 0) {
              this.boyStyle.backgroundPosition = "33% 0%";
            } else {
              this.boyStyle.backgroundPosition = "66% 0%";
            }
            tag++;
          }, Speed_Time);
        }

        setTimeout(() => {
          this.boyStyle.top = placePosition.top;
          this.boyStyle.transitionProperty = "top";
          this.boyStyle.transitionDuration = yTime + "ms";
        }, Delay_Time);
      }, xTime + Delay_Time);
      //=======================================================================

      //动画结束 关闭上下走的定时器
      setTimeout(() => {
        clearInterval(UpInterval);
        clearInterval(DownInterval);
      }, xTime + yTime + Delay_Time * 2);
    },

    //点击地点
    bindPlace(e) {
      const boyPosition = this.getBoyPosition(); //小人位置
      this.boyMove(e, boyPosition);
    },
  },
};
</script>

<style lang="scss" scoped>
// 指南针
.icon-compass {
  position: fixed;
  top: 20px;
  left: 20px;
  width: 30px;
  transform: rotate(180deg);
}
.map-page {
  background-color: #fff2c6;
  height: 100vh;
  overflow-x: scroll;
}
// 地图容器
.map-wrap {
  width: 125.3vh;
  height: 70vh;
  background-image: url("~@/assets/image/map.png");
  background-size: contain;
  background-position: center center;
  background-repeat: no-repeat;
  position: relative;
  top: 50%;
  transform: translateY(-50%);
}
// 小人
.icon-boy {
  width: 50px;
  height: 86px;
  background-image: url("~@/assets/icon/man-2.png");
  background-repeat: no-repeat;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  transition-timing-function: linear;
  z-index: 100;
}

//大风车
.icon-dfc {
  width: 100px;
  height: 100px;
  background-image: url("~@/assets/image/dfc.gif");
  background-size: cover;
  background-repeat: no-repeat;
  position: absolute;
  top: 100px;
  left: 100px;
}
//湖泊
.icon-lake {
  width: 100px;
  height: 100px;
  background-image: url("~@/assets/image/lake.gif");
  background-size: cover;
  background-repeat: no-repeat;
  position: absolute;
  top: 200px;
  left: 80px;
}

.place {
  position: absolute;
  width: 30px;
  height: 30px;
  background-color: #fff;
  transform: translate(-50%, -50%);
}
</style>

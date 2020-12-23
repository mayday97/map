<!--
 * @Author: xiaoyu
 * @Date: 2020-12-22 09:54:41
 * @LastEditTime: 2020-12-23 17:27:26
-->
<template>
  <div class="map-page" ref="scroll">
    <img class="icon-compass" src="../assets/icon/compass.png" alt="" />
    <!-- 地图区域 -->
    <div class="map-wrap">
      <div class="icon-boy" ref="boy" :style="boyStyle"></div>
      <div class="place" v-for="item in placeList" :key="item.name" :style="{ top: item.top, left: item.left }" @click="bindPlace(item)"></div>
    </div>
  </div>
</template>

<script>
const Unit_Time = 100; //单位时间
const Delay_Time = 1000; //切换图片时间
export default {
  name: "Home",
  watch: {},
  data() {
    return {
      boyStyle: {
        top: "50%",
        left: "50%",
        backgroundImage: `url(${require("@/assets/icon/back-s.png")})`,
        transitionDuration: "0ms",
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

      let rightInterval, leftInterval, downInterval, upInterval; //切换脚的定时器

      //=======================================================================
      //x轴移动
      if (xDiff >= 0) {
        //向右
        this.boyStyle.backgroundImage = `url(${require("@/assets/icon/right-s.png")})`;

        //切换左右脚
        let flag = 0;
        rightInterval = setInterval(() => {
          // console.log("right", flag);
          if (flag % 2 == 0) {
            this.boyStyle.backgroundImage = `url(${require("@/assets/icon/right-l.png")})`;
            console.log("向右左脚");
          } else {
            this.boyStyle.backgroundImage = `url(${require("@/assets/icon/right-r.png")})`;
            console.log("向右右脚");
          }
          flag++;
        }, 500);
      } else {
        //向左
        this.boyStyle.backgroundImage = `url(${require("@/assets/icon/left-s.png")})`;

        //切换左右脚
        let flag = 0;
        leftInterval = setInterval(() => {
          // console.log("left", flag);
          if (flag % 2 == 0) {
            this.boyStyle.backgroundImage = `url(${require("@/assets/icon/left-l.png")})`;
            console.log("向左左脚");
          } else {
            this.boyStyle.backgroundImage = `url(${require("@/assets/icon/left-r.png")})`;
            console.log("向左右脚");
          }
          flag++;
        }, 500);
      }

      setTimeout(() => {
        this.boyStyle.left = placePosition.left;
        this.boyStyle.transitionDuration = xTime + "ms";
      }, Delay_Time);
      //=======================================================================

      //=======================================================================
      //y轴移动
      setTimeout(() => {
        clearInterval(rightInterval);
        clearInterval(leftInterval);

        if (yDiff >= 0) {
          //向下
          this.boyStyle.backgroundImage = `url(${require("@/assets/icon/front-s.png")})`;

          //切换左右脚
          let flag = 0;
          downInterval = setInterval(() => {
            // console.log("down", flag);
            if (flag % 2 == 0) {
              this.boyStyle.backgroundImage = `url(${require("@/assets/icon/front-l.png")})`;
              console.log("向下左脚");
            } else {
              this.boyStyle.backgroundImage = `url(${require("@/assets/icon/front-r.png")})`;
              console.log("向下右脚");
            }
            flag++;
          }, 500);
        } else {
          //向上
          this.boyStyle.backgroundImage = `url(${require("@/assets/icon/back-s.png")})`;

          //切换左右脚
          let flag = 0;
          upInterval = setInterval(() => {
            // console.log("up", flag);
            if (flag % 2 == 0) {
              this.boyStyle.backgroundImage = `url(${require("@/assets/icon/front-l.png")})`;
              console.log("向上左脚");
            } else {
              this.boyStyle.backgroundImage = `url(${require("@/assets/icon/front-r.png")})`;
              console.log("向上右脚");
            }
            flag++;
          }, 500);
        }

        setTimeout(() => {
          this.boyStyle.top = placePosition.top;
          this.boyStyle.transitionDuration = yTime + "ms";
        }, Delay_Time);
      }, xTime + Delay_Time);
      //=======================================================================

      //动画结束 关闭上下走的定时器
      setTimeout(() => {
        clearInterval(downInterval);
        clearInterval(upInterval);
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
  background-image: url("~@/assets/image/map-5.png");
  background-size: contain;
  background-position: center center;
  background-repeat: no-repeat;
  position: relative;
  top: 50%;
  transform: translateY(-50%);
}
// 小人
.icon-boy {
  width: 30px;
  height: 53px;
  background-size: cover;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  transition-timing-function: linear;
  z-index: 100;
}

.place {
  position: absolute;
  width: 30px;
  height: 30px;
  background-color: #fff;
  transform: translate(-50%, -50%);
}
</style>

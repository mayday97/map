<!--
 * @Author: xiaoyu
 * @Date: 2020-12-22 09:54:41
 * @LastEditTime: 2020-12-28 18:34:42
-->
<template>
  <div class="map-page" ref="scroll">
    <video src="../assets/music/bgm01.mp3" style="display:none" ref="bgmusic"></video>
    <video src="../assets/music/airplane.mp3" style="display:none" ref="airmusic"></video>

    <!-- 指南针 -->
    <img class="icon-compass" src="../assets/icon/compass.png" alt="" />

    <!-- 头部标题 -->
    <h1 class="page-title">萧山地图</h1>
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

    <!-- 开始弹框 -->
    <van-popup v-model="showStart">
      <div class="popup-wrap start-wrap">
        <p class="text">让我们开始探索萧山的秘密吧。</p>
        <button class="start-btn" @click="handleStart">开始</button>
      </div>
    </van-popup>

    <!-- 详情弹框 -->
    <van-popup v-model="showDetail">
      <div class="place-detail-wrap popup-wrap">
        <h2 class="title">区域名</h2>
        <ul class="place-list">
          <li class="place-detail">详情一</li>
          <li class="place-detail">详情二</li>
        </ul>
      </div>
      <img src="@/assets/icon/close.png" class="icon-close" alt="" @click="showDetail = false" />
    </van-popup>
  </div>
</template>

<script>
import mydata from "../../public/data.js";
const Unit_Time = 100; //单位时间
const Delay_Time = 500; //切换方向延迟（X轴，Y轴切换）
const Speed_Time = 200; // 走路速度

import { Popup } from "vant";
export default {
  name: "Home",
  components: {
    [Popup.name]: Popup,
  },
  data() {
    return {
      showStart: false,
      showDetail: false,

      boyStyle: {
        top: "50%",
        left: "50%",
        backgroundPosition: "0% 0%",
        transitionDuration: "0ms",
        transitionProperty: "",
      }, //小人属性
      placeList: [
        {
          name: "测试地点",
          top: "66%",
          left: "20%",
        },
        {
          name: "测试地点2",
          top: "66%",
          left: "80%",
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
    //点击开始
    handleStart() {
      const bgMusic = this.$refs.bgmusic;
      const airMusic = this.$refs.airmusic;
      bgMusic.play();
      airMusic.play();
      this.showStart = false;
    },

    //初始化
    init() {
      //初始化地图 居中
      const scrollElement = this.$refs.scroll;
      const width = scrollElement.scrollWidth;
      const screenWidth = document.body.clientWidth;
      scrollElement.scrollLeft = (width - screenWidth) / 2;
    },

    //页面横向跟随小人  xtime  小人横向走动时间 pleft  小人要移动到的x轴位置
    movePage(xtime, pleft) {
      const scrollElement = this.$refs.scroll;

      const mapWidth = document.body.clientHeight * 1.95; //地图容器的宽度

      console.log(mapWidth, pleft, xtime);
      console.log(scrollElement.animate({ scrollLeft: 10000 }, xtime));
      scrollElement.animate({ scrollLeft: 10000 }, xtime);
      // const mInterval = setInterval(() => {}, 500);
      // setTimeout(() => {
      //   clearInterval(mInterval);
      // }, xtime);
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
    //小人移动 先左右 再上下  如果xDiff大于0 则向右  yDiff大于0 则向下
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
        this.movePage(xTime, placePosition.left);
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
        this.showPlaceDetail();
      }, xTime + yTime + Delay_Time * 2);
    },

    //点击地点
    bindPlace(e) {
      const boyPosition = this.getBoyPosition(); //小人位置
      this.boyMove(e, boyPosition);
    },

    //显示地点详情
    showPlaceDetail() {
      this.showDetail = true;
    },
  },
};
</script>

<style lang="scss" scoped>
//弹框
/deep/ .van-popup {
  background-color: rgba(0, 0, 0, 0);
}
.popup-wrap {
  width: 94vw;
  min-height: 300px;
  max-height: 60vh;
  background-color: #f1f7ea;
  border: 4px solid #7b654a;
  border-radius: 12px;
  padding: 16px;
  background-image: url("~@/assets/image/bg-popup.png");
  background-position: right bottom;
  background-repeat: no-repeat;
}
.start-wrap {
  text-align: center;
  .text {
    font-size: 16px;
    line-height: 150px;
  }
  .start-btn {
    width: 80%;
    line-height: 40px;
    background-color: #ce6738;
    color: #fff;
    font-size: 16px;
    border: none;
    border-radius: 6px;
  }
}
.place-detail-wrap {
  overflow-y: scroll;
  .title {
    font-size: 16px;
    text-align: center;
    margin-top: 0;
  }
  .place-list {
    font-size: 14px;
  }
}
.icon-close {
  display: block;
  width: 30px;
  margin: 30px auto 0 auto;
}

//页面标题
.page-title {
  width: 94%;
  font-size: 16px;
  position: absolute;
  top: 20px;
  left: 3%;
  text-align: center;
}
// 指南针
.icon-compass {
  position: fixed;
  top: 20px;
  left: 20px;
  width: 30px;
}
.map-page {
  background-color: #fff2c6;
  height: 100vh;
  overflow-x: scroll;
  // scroll-behavior: smooth;
}
// 地图容器
.map-wrap {
  width: 195vh;
  height: 90vh;
  background-image: url("~@/assets/image/map.png");
  background-size: contain;
  background-position: center center;
  background-repeat: no-repeat;
  position: relative;
  top: 10%;
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

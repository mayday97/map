<!--
 * @Author: xiaoyu
 * @Date: 2020-12-22 09:54:41
 * @LastEditTime: 2021-01-14 13:58:43
-->
<template>
  <div class="map-page" ref="scroll" id="scroll">
    <div class="prevent-wrap" v-show="showPrevent"></div>
    <audio preload src="../assets/music/bgm01.mp3" loop style="display:none" ref="bgmusic"></audio>
    <audio preload src="../assets/music/airplane.mp3" style="display:none" ref="airmusic"></audio>

    <!-- 飞机 -->
    <img class="fly-plane" :class="fly && 'fly'" src="../assets/icon/plane.png" alt="" v-show="fly" @animationEnd="flyEnd" @webkitAnimationEnd="flyEnd" />
    <!-- 指南针 -->
    <img class="icon-compass" src="../assets/icon/compass.png" alt="" />

    <!-- 头部标题 -->
    <!-- <div class="page-title">萧山年货地图</div> -->
    <!-- 地图区域 -->
    <div class="map-wrap">
      <!-- 大风车 -->
      <!-- <div class="icon-dfc"></div> -->
      <!-- 湖泊 -->
      <!-- <div class="icon-lake"></div> -->
      <!-- 标题 -->
      <div class="page-title"></div>
      <!-- 地图说明 -->
      <div class="map-intro"></div>
      <!-- 小人 -->
      <div class="icon-boy" ref="boy" :style="boyStyle"></div>
      <!-- 地点 -->
      <div class="place" v-for="item in placeList" :key="item.name" :style="{ top: item.position.top, left: item.position.left }" @click="bindPlace(item)">
        <div class="place-icon">
          <span class="place-text">{{ item.name }}</span>
        </div>
      </div>
    </div>

    <!-- 开始弹框 -->
    <van-popup v-model="showStart" :close-on-click-overlay="false">
      <div class="popup-wrap start-wrap">
        <p class="text">让我们开始探索萧山的秘密吧。</p>
        <button class="start-btn" @click="handleStart">开始</button>
      </div>
    </van-popup>

    <!-- 详情弹框 -->
    <van-popup v-model="showDetail">
      <div class="place-detail-wrap popup-wrap">
        <div class="shop-item" v-if="showPlace.shops">
          <h2 class="title">{{ showPlace.shops.title }}</h2>
          <img :src="showPlace.shops.banner" alt="" />
          <div v-if="showPlace.shops.type == 'taobao'">
            <p class="tip">
              复制下方口令在淘宝打开即可
              <button class="copy-btn" data-clipboard-target="#target" @click="copyTbWord">复制口令</button>
            </p>
            <p class="tb-key" id="target">{{ showPlace.shops.key }}</p>
          </div>

          <a :href="showPlace.shops.link" v-if="showPlace.shops.type == '1688'">前往详情</a>
          <p class="bot-text">所属公司：{{ showPlace.name }}</p>
        </div>
      </div>
      <img src="@/assets/icon/close.png" class="icon-close" alt="" @click="showDetail = false" />
    </van-popup>
  </div>
</template>

<script>
import Clipboard from "clipboard";
import Jquery from "jquery";
import mydata from "../../public/data.js";
const Unit_Time = 100; //单位时间
const Delay_Time = 500; //切换方向延迟（X轴，Y轴切换）
const Speed_Time = 200; // 走路速度

import { Popup, Swipe, SwipeItem } from "vant";
export default {
  name: "Home",
  components: {
    [Popup.name]: Popup,
    [Swipe.name]: Swipe,
    [SwipeItem.name]: SwipeItem,
  },
  data() {
    return {
      fly: false,
      showPrevent: false, //小人开始移动时的放触摸遮罩
      showStart: true, //开始弹框
      showDetail: false, //详情弹框

      boyStyle: {
        top: "50%",
        left: "50%",
        backgroundPosition: "0% 0%",
        transitionDuration: "0ms",
        transitionProperty: "",
      }, //小人属性
      placeList: [], //地点集合
      showPlace: {}, //要展示的地点信息
    };
  },
  created() {
    this.resourceLoad();
    this.placeList = mydata.list;
  },
  mounted() {
    this.init();
  },
  methods: {
    //复制口令
    copyTbWord() {
      let copy = new Clipboard(".copy-btn");
      copy.on("success", (e) => {
        console.log(e);
        this.$toast("口令复制成功");
        copy.destroy();
      });
      copy.on("error", function(e) {
        console.log(e);
      });
    },

    //资源加载
    resourceLoad() {
      // let loading=this.$toast.loading({
      //   message:"资源加载中...",
      //   duration:0,
      //   forbidClick:true
      // })
      let imgs = [require("@/assets/image/map.png")];
      for (let img of imgs) {
        let image = new Image();
        image.src = img;
        image.onload = (e) => {
          console.log("背景图预加载成功");
        };
        image.onerror = (e) => {
          console.log("背景图预加载失败", e);
        };
      }
      let audios = [require("@/assets/music/bgm01.mp3"), require("@/assets/music/airplane.mp3")];
      for (let item of audios) {
        let audio = new Audio();
        audio.src = item;
        audio.addEventListener("canplaythrough", (e) => {
          // console.log(e);
        });
      }
    },

    //点击开始
    handleStart() {
      const bgMusic = this.$refs.bgmusic;
      const airMusic = this.$refs.airmusic;
      bgMusic.play();
      airMusic.play();
      this.showStart = false;
      this.fly = true;
      let airInterval = setInterval(() => {
        airMusic.play();
        this.fly = true;
      }, 15000);
      this.$once("hook:beforeDestroy", function() {
        clearInterval(airInterval);
      });
    },

    flyEnd() {
      this.fly = false;
    },

    //初始化
    init() {
      //初始化地图 居中
      const scrollElement = this.$refs.scroll;
      const width = scrollElement.scrollWidth;
      const height = scrollElement.scrollHeight;
      const screenWidth = document.body.clientWidth;
      const screenHeight = document.body.clientHeight;
      scrollElement.scrollLeft = (width - screenWidth) / 2;
      scrollElement.scrollTop = (height - screenHeight) / 2;
    },

    //页面横向跟随小人  xtime  小人横向走动时间 pleft 小人要移动到的x轴位置  boyLeft 小人运动前的位置
    movePage(xtime, pleft, boyLeft, boyTop) {
      const scrollElement = this.$refs.scroll;
      const mapWidth = scrollElement.scrollWidth; //地图容器的宽度
      const screenWidth = document.body.clientWidth; //屏幕宽度

      const scaleNum = pleft.replace("%", "") / 100; //将位置转换为小数
      const boyNum = boyLeft.replace("%", "") / 100;

      const startPosition = mapWidth * boyNum - screenWidth / 2;
      const endPosition = mapWidth * scaleNum - screenWidth / 2; //要滚动到的位置

      scrollElement.scrollLeft = startPosition; //移动到小人位置横向

      const mapHeight = scrollElement.scrollHeight; //地图容器的宽度
      const screenHeight = document.body.clientHeight; //屏幕宽度
      const boyNumTop = boyTop.replace("%", "") / 100;
      const startPositionTop = mapHeight * boyNumTop - screenHeight / 2;
      scrollElement.scrollTop = startPositionTop; //移动到小人位置 竖直方向

      Jquery("#scroll").animate({ scrollLeft: endPosition }, xtime, "linear", function() {
        console.log("aaa");
      });
    },

    //页面上下跟随小人
    movePageVertical(ytime, pTop, boyTop) {
      const scrollElement = this.$refs.scroll;

      const mapHeight = scrollElement.scrollHeight; //地图容器的宽度
      const screenHeight = document.body.clientHeight; //屏幕宽度

      const scaleNum = pTop.replace("%", "") / 100; //将位置转换为小数

      const endPosition = mapHeight * scaleNum - screenHeight / 2; //要滚动到的位置

      Jquery("#scroll").animate({ scrollTop: endPosition }, ytime, "linear", function() {
        console.log("bbb");
      });
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

     *位置     立正     左脚       右脚
     *向下走 (0 00%) (50% 00%) (100% 00%)
     *向上走 (0 33%) (50% 33%) (100% 33%)
     *向左走 (0 66%) (50% 66%) (100% 66%)
     *向右走 (0 100%) (50% 100%) (100% 100%)
     */
    //小人移动 先左右 再上下  如果xDiff大于0 则向右  yDiff大于0 则向下
    boyMove(place, boyPosition) {
      const placeLeftNum = place.position.left.split("%")[0]; //地点x轴坐标值
      const placeTopNum = place.position.top.split("%")[0]; //地点y轴坐标值
      const boyLeftNum = boyPosition.left.split("%")[0]; //小人x轴坐标值
      const boyTopNum = boyPosition.top.split("%")[0]; //小人y轴坐标值

      const xDiff = placeLeftNum - boyLeftNum; //横向差值
      const yDiff = placeTopNum - boyTopNum; //纵向差值

      const xTime = Math.abs(xDiff) * Unit_Time; //x轴移动时间
      const yTime = Math.abs(yDiff) * Unit_Time; //y轴移动时间

      let UpInterval, DownInterval, RightInterval, LeftInterval;

      //=======================================================================
      this.showPrevent = true; //打开防止小人运动时用户触摸的遮罩
      //x轴移动
      if (xDiff >= 0) {
        // //向右
        this.boyStyle.backgroundPosition = "0% 100%";
        let tag = 0;
        RightInterval = setInterval(() => {
          if (tag % 2 == 0) {
            this.boyStyle.backgroundPosition = "50% 100%";
          } else {
            this.boyStyle.backgroundPosition = "100% 100%";
          }
          tag++;
        }, Speed_Time);
      } else {
        // //向左
        this.boyStyle.backgroundPosition = "0% 66%";
        let tag = 0;
        RightInterval = setInterval(() => {
          if (tag % 2 == 0) {
            this.boyStyle.backgroundPosition = "50% 66%";
          } else {
            this.boyStyle.backgroundPosition = "100% 66%";
          }
          tag++;
        }, Speed_Time);
      }

      setTimeout(() => {
        this.boyStyle.left = place.position.left;
        this.boyStyle.transitionProperty = "left";
        this.boyStyle.transitionDuration = xTime + "ms";
        this.movePage(xTime, place.position.left, boyPosition.left, boyPosition.top);
      }, Delay_Time);
      //=======================================================================

      //=======================================================================
      //y轴移动
      setTimeout(() => {
        clearInterval(LeftInterval);
        clearInterval(RightInterval);
        if (yDiff >= 0) {
          // //向下
          this.boyStyle.backgroundPosition = "0% 0%";
          let tag = 0;
          DownInterval = setInterval(() => {
            if (tag % 2 == 0) {
              this.boyStyle.backgroundPosition = "50% 0%";
            } else {
              this.boyStyle.backgroundPosition = "100% 0%";
            }
            tag++;
          }, Speed_Time);
        } else {
          // //向上
          this.boyStyle.backgroundPosition = "0% 33%";
          let tag = 0;
          UpInterval = setInterval(() => {
            if (tag % 2 == 0) {
              this.boyStyle.backgroundPosition = "50% 33%";
            } else {
              this.boyStyle.backgroundPosition = "100% 33%";
            }
            tag++;
          }, Speed_Time);
        }

        setTimeout(() => {
          this.boyStyle.top = place.position.top;
          this.boyStyle.transitionProperty = "top";
          this.boyStyle.transitionDuration = yTime + "ms";
          this.movePageVertical(yTime, place.position.top, boyPosition.top);
        }, Delay_Time);
      }, xTime + Delay_Time);
      //=======================================================================

      //动画结束 关闭上下走的定时器
      setTimeout(() => {
        clearInterval(UpInterval);
        clearInterval(DownInterval);
        this.showPlaceDetail(place);
        this.showPrevent = false; //关闭防止小人运动时用户触摸的遮罩
      }, xTime + yTime + Delay_Time * 2);
    },

    //点击地点
    bindPlace(e) {
      const boyPosition = this.getBoyPosition(); //小人位置
      this.boyMove(e, boyPosition);
    },

    //显示地点详情
    showPlaceDetail(e) {
      this.showPlace = e;
      this.showDetail = true;
    },
  },
};
</script>

<style lang="scss" scoped>
.prevent-wrap {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0);
  z-index: 50;
}
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
  .shop-item {
    font-size: 14px;
    .title {
      text-align: center;
      font-size: 16px;
      font-weight: bold;
      margin-top: 0;
    }
    img {
      width: 100%;
    }
    .tb-key {
      font-weight: bold;
    }
    .bot-text {
      text-align: right;
      font-size: 12px;
    }
    .copy-btn {
      color: #fff;
      font-size: 12px;
      background-color: #c16a46;
      border: none;
      border-radius: 2px;
      padding: 5px;
    }
  }
}
.icon-close {
  display: block;
  width: 30px;
  margin: 30px auto 0 auto;
}

//页面标题
.page-title {
  position: absolute;
  left: 10%;
  top: 10%;
  width: 234.4px;
  height: 47.6px;
  background-image: url("~@/assets/image/title.png");
  background-size: contain;
  background-repeat: no-repeat;
}
//地图说明
.map-intro {
  position: absolute;
  left: 40%;
  top: 70%;
  width: 300px;
  height: 300px;
  background-image: url("~@/assets/image/intro.png");
  background-size: contain;
  background-repeat: no-repeat;
}
// 飞行飞机
.fly-plane {
  position: absolute;
  top: 100px;
  left: 0;
  width: 50px;
  z-index: 50;
}
.fly {
  animation: flyAnimation 2s ease-in;
}
@keyframes flyAnimation {
  from {
    left: 0;
  }
  to {
    left: 100%;
  }
}
// 指南针
.icon-compass {
  position: fixed;
  top: 20px;
  left: 20px;
  width: 30px;
  z-index: 11;
  transform: rotate(30deg);
}
.map-page {
  background-color: #fff2c6;
  // background-color: #fff;
  height: 100vh;
  overflow-x: scroll;
  // scroll-behavior: smooth;
}
// 地图容器
.map-wrap {
  width: 432vh;
  height: 180vh;
  background-image: url("~@/assets/image/map-4000-3.png");
  background-size: contain;
  background-position: center center;
  background-repeat: no-repeat;
  position: relative;
  // top: 10%;
}
// 小人
.icon-boy {
  width: 50px;
  height: 86px;
  background-image: url("~@/assets/icon/man-5.png");
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
  transform: translate(-50%, -50%);
  .place-icon {
    width: 40px;
    height: 62.5px;
    background-image: url("~@/assets/icon/location.png");
    background-size: contain;
    background-repeat: no-repeat;
  }
  .place-text {
    font-size: 12px;
    color: #333;
    display: block;
    background-color: rgba(0, 0, 0, 0);
    position: absolute;
    top: 74%;
    width: 90px;
    text-align: center;
    transform: scale(0.7);
    left: -25px;
    line-height: 1;
    font-weight: bold;
  }
}
</style>

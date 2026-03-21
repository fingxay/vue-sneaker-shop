<template>
  <div class="banner-slider">
    <div class="banner-viewport">
      <div class="banner-track" :style="trackStyle">
        <div
          class="banner-item"
          v-for="(banner, index) in banners"
          :key="index"
        >
          <img :src="banner" :alt="`Banner ${index + 1}`" class="banner-image" />
        </div>
      </div>

      <button class="nav-btn prev" @click="prevSlide">‹</button>
      <button class="nav-btn next" @click="nextSlide">›</button>

      <div class="banner-dots">
        <span
          v-for="(banner, index) in banners"
          :key="index"
          class="dot"
          :class="{ active: currentIndex === index }"
          @click="currentIndex = index"
        ></span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "BannerSlider",
  data() {
    return {
      currentIndex: 0,
      intervalId: null,
      banners: [
        require("@/assets/banners/banner1.png"),
        require("@/assets/banners/banner2.png"),
        require("@/assets/banners/banner3.png"),
        require("@/assets/banners/banner4.png"),
      ],
    };
  },
  computed: {
    trackStyle() {
      return {
        width: `${this.banners.length * 100}%`,
        transform: `translateX(-${100 / this.banners.length * this.currentIndex}%)`,
      };
    },
  },
  methods: {
    nextSlide() {
      this.currentIndex = (this.currentIndex + 1) % this.banners.length;
    },
    prevSlide() {
      this.currentIndex =
        (this.currentIndex - 1 + this.banners.length) % this.banners.length;
    },
    startAutoSlide() {
      this.intervalId = setInterval(() => {
        this.nextSlide();
      }, 5000);
    },
    stopAutoSlide() {
      clearInterval(this.intervalId);
    },
  },
  mounted() {
    this.startAutoSlide();
  },
  beforeUnmount() {
    this.stopAutoSlide();
  },
};
</script>

<style scoped>
.banner-slider {
  width: 100%;
  margin-bottom: 24px;
}

.banner-viewport {
  position: relative;
  width: 100%;
  max-width: 100%;
  aspect-ratio: 2048 / 922;
  overflow: hidden;
}

.banner-track {
  display: flex;
  height: 100%;
  transition: transform 0.5s ease-in-out;
}

.banner-item {
  width: 25%;
  height: 100%;
  flex-shrink: 0;
}

.banner-image {
  width: 100%;
  height: 100%;
  display: block;
  object-fit: cover;
}

.nav-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 42px;
  height: 42px;
  border: none;
  cursor: pointer;
  z-index: 2;
  background: rgba(0, 0, 0, 0.35);
  color: white;
  font-size: 26px;
}

.prev {
  left: 12px;
}

.next {
  right: 12px;
}

.banner-dots {
  position: absolute;
  left: 50%;
  bottom: 16px;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 10px;
  z-index: 3;
}

.dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  transition: all 0.3s ease;
}

.dot.active {
  background: rgba(0, 0, 0, 0.55);
  transform: scale(1.15);
}
</style>
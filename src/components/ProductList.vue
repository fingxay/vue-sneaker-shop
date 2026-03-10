<template>
  <div class="product">
    <img src="require(`@/assets/image/`)" alt="" />
    <h3>hiển thị tên sp</h3>
  </div>
  <!-- <div >
    <span>Sản phẩm không hợp lệ</span>
  </div> -->

</template>

<script setup>

</script>

<style scoped>

.product {
  background: #f5f2ed;
  padding: 20px;
  width: 220px;
  border-radius: 10px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
  transition: transform 0.3s, box-shadow 0.3s;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  text-align: center;
}
.product:hover {
  transform: translateY(-10px);
  box-shadow: 0 10px 25px rgba(0,0,0,0.2);
}
.product h3 {
  margin-top: 15px;
  font-size: 18px;
  color: #333;
}
.product::after {
  content: "Mua";
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%) translateY(20px);
  background: rgba(179, 4, 4, 0.7);
  color: #fff;
  padding: 5px 15px;
  border-radius: 20px;
  opacity: 0;
  transition: opacity 0.4s, transform 0.4s;
}
.product:hover::after {
  opacity: 1;
  transform: translateX(-50%) translateY(0);
}
.product img{
  width: 100px;
  height: 100px;
}
</style>

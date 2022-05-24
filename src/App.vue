<script setup lang="ts">

</script>

<template>
  <main>
    <Painter :max-width="500" :min-width="2" />
  </main>
</template>

<style>
#app {
  max-width: 1280px;
  margin: 0 auto;
  padding: 2rem;
  font-weight: normal;
}

main {
  display: flex;
  flex-direction: column;
  align-items: center;
  line-height: 1.5;
}
</style>

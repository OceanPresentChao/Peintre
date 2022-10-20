<script setup lang="ts">
const press = ref('yes')
</script>

<template>
  <main class="flex justify-center items-center flex-col">
    <p>
      <span>
        You can paint with
      </span>
      <select v-model="press">
        <option value="yes">
          with
        </option>
        <option value="no">
          without
        </option>
      </select>
      <span>
        pressure
      </span>
    </p>
    <Painter :pressure="press === 'yes'" />
  </main>
</template>

<style>

</style>

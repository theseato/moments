<template>
  <div class="footer p-4 flex justify-center items-center text-xs ">
    <div class="flex flex-col gap-1 items-center">
      <a class="my-2 text-gray-500" v-if="beian" href="https://beian.miit.gov.cn/" target="_blank">{{ beian }}</a>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { User } from '~/lib/types';

const response = await $fetch('/api/user/settings/get?user=0');

const beian = response.data.beianNo

</script>

<style scoped>

</style>
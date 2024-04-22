<template>
  <div class="footer p-4 flex justify-center items-center text-xs ">
    <div class="flex flex-col gap-1 items-center">
      <a class="my-2 text-gray-500" v-if="userinfo.beianNo" href="https://beian.miit.gov.cn/" target="_blank">{{ userinfo.beianNo }}</a>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { User } from '~/lib/types';

const userinfo = useState<User>('userinfo')
</script>

<style scoped>

</style>
<template>
  <div class="wrapper w-full h-full bg-[#f1f5f9] dark:bg-slate-800 rounded-md dark:text-[#C0BEBF]">
    <ScrollArea class="h-full" type="hover">
      <div class="main lg:w-[567px] mx-auto shadow-2xl bg-white dark:bg-[#181818]">
        <slot />
        <Footer />
      </div>
      <ScrollBar orientation="vertical" />
    </ScrollArea>
  </div>

  <Toaster position="top-center" rich-colors />



</template>
<script setup lang="ts">
import { Toaster } from '@/components/ui/sonner';
import type { User } from '~/lib/types';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { useState, useAsyncData } from '#imports';

onMounted(async () => {
  const userinfo = useState<User>('userinfo')
  const response = await $fetch('/api/user/settings/get?user=0');
  console.log("default.vue", response)
  const { data: res } = await useAsyncData('userinfo', async () => response);
  userinfo.value = res.value?.data as any as User;
  useHead({
    link: [
      {
        rel: 'shortcut icon',
        type: 'image/png',
        href: userinfo.value?.favicon || '/favicon.png',
      },
    ],
    style: [
      {
        textContent: userinfo.value?.css || '',
      }
    ],
    script: [
      {
        type: 'text/javascript',
        textContent: userinfo.value?.js || '',
      }
    ],
    title: userinfo.value.title || 'Randall的小屋',
  })
});

</script>
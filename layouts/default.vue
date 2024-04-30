<template>
<!--  <button id="nothing_button"></button>-->
  <div class="wrapper w-full h-full bg-[#f1f5f9] dark:bg-slate-800 rounded-md dark:text-[#C0BEBF]">
    <ScrollArea class="h-full" type="hover">
      <div class="main lg:w-[567px] mx-auto shadow-2xl bg-white dark:bg-[#181818]">
        <slot />
        <Footer />
      </div>
      <ScrollBar orientation="vertical" />
    </ScrollArea>
  </div>
  <Toaster position="top-right" :expand="true" rich-colors />
  <div style="position: absolute;right: 10px ;bottom: 30vh;">
    <DropdownMenuRoot v-model:open="toggleState">
      <DropdownMenuTrigger
          class="rounded-full w-[35px] h-[35px] inline-flex items-center justify-center text-grass11 bg-white shadow-[0_2px_10px] shadow-blackA7 outline-none hover:bg-green3 focus:shadow-[0_0_0_2px] focus:shadow-black"
          aria-label="Customise options"
      >
        <svg t="1714293805645" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="4275" width="200" height="200"><path d="M511.998977 113.725134c219.514529 0 398.103974 178.588421 398.103974 398.103974S731.513506 909.933081 511.998977 909.933081 113.895003 731.34466 113.895003 511.829108 292.485471 113.725134 511.998977 113.725134M511.998977 63.961754c-246.947322 0-447.867354 200.919009-447.867354 447.867354s200.920032 447.867354 447.867354 447.867354c246.944252 0 447.867354-200.919009 447.867354-447.867354S758.943228 63.961754 511.998977 63.961754L511.998977 63.961754z" fill="#272636" p-id="4276"></path><path d="M327.384305 511.829108m-45.216831 0a44.187 44.187 0 1 0 90.433662 0 44.187 44.187 0 1 0-90.433662 0Z" fill="#272636" p-id="4277"></path><path d="M511.997953 511.829108m-45.216831 0a44.187 44.187 0 1 0 90.433662 0 44.187 44.187 0 1 0-90.433662 0Z" fill="#272636" p-id="4278"></path><path d="M696.612625 511.829108m-45.216831 0a44.187 44.187 0 1 0 90.433662 0 44.187 44.187 0 1 0-90.433662 0Z" fill="#272636" p-id="4279"></path></svg>
      </DropdownMenuTrigger>

      <DropdownMenuPortal>
        <DropdownMenuContent
            class="min-w-[150px] outline-none bg-white rounded-md p-[5px] shadow-[0px_10px_38px_-10px_rgba(22,_23,_24,_0.35),_0px_10px_20px_-15px_rgba(22,_23,_24,_0.2)] will-change-[opacity,transform] data-[side=top]:animate-slideDownAndFade data-[side=right]:animate-slideLeftAndFade data-[side=bottom]:animate-slideUpAndFade data-[side=left]:animate-slideRightAndFade"
            :side-offset="5"
        >
          <DropdownMenuItem
              value="New Tab"
              class="group text-[13px] leading-none text-grass11 rounded-[3px] flex items-center h-[25px] px-[5px] relative pl-[25px] select-none outline-none data-[disabled]:text-mauve8 data-[disabled]:pointer-events-none data-[highlighted]:bg-green9 data-[highlighted]:text-green1"
              @click="navigateTo('/login')"
          >
            登陆
          </DropdownMenuItem>

          <DropdownMenuSeparator class="h-[1px] bg-green6 m-[5px]" />

          <DropdownMenuItem
              value="New Tab"
              class="group text-[13px] leading-none text-grass11 rounded-[3px] flex items-center h-[25px] px-[5px] relative pl-[25px] select-none outline-none data-[disabled]:text-mauve8 data-[disabled]:pointer-events-none data-[highlighted]:bg-green9 data-[highlighted]:text-green1"
              @click="navigateTo('/register')"
          >
            注册
          </DropdownMenuItem>

          <DropdownMenuArrow class="fill-white" />
        </DropdownMenuContent>
      </DropdownMenuPortal>
    </DropdownMenuRoot>
  </div>
</template>
<script setup lang="ts">
import { Toaster } from '@/components/ui/sonner';
import type { User } from '~/lib/types';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { useState, useAsyncData } from '#imports';
import { ref } from 'vue'
import {
  DropdownMenuArrow,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuItemIndicator,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuRoot,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from 'radix-vue'

const toggleState = ref(false)
const checkboxOne = ref(false)
const checkboxTwo = ref(false)
const person = ref('pedro')


onMounted(async () => {
  const userinfo = useState<User>('userinfo')
  const userId = useCookie('userId');
  const url = window.location.pathname
  let findId = userId.value
  if(url.startsWith('/user/')) {
    findId = url.split('/user/')[1]
  }
  const response = await $fetch('/api/user/settings/get?user=' + (findId == 'undefined' ? '0' : findId));
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
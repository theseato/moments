<template>
  <div class="header relative mb-8 ">
    <img class="header-img w-full  max-h-[300px]" :src="getImgUrl(res?.data?.coverUrl!)" alt="" />
    <div class="absolute right-2 bottom-[-40px]">
      <div class="userinfo flex flex-col">
        <div class="flex flex-row items-center gap-4 justify-end">
          <div class="username text-lg font-bold text-white">{{ res?.data?.nickname }}</div>
          <img :src="getImgUrl(res?.data?.avatarUrl!)" class="avatar w-[70px] h-[70px] rounded-xl" />
        </div>
        <div class="slogon text-gray truncate w-full text-end text-xs mt-2">{{ res?.data?.slogan }}</div>
      </div>
    </div>
  </div>

</template>

<script setup lang="ts">
import { settingsUpdateEvent } from '~/lib/event'
import { getImgUrl } from '~/lib/utils';
import { Sun, MoonStar, LogIn, ArrowLeft } from 'lucide-vue-next'
import {useAsyncData} from "#imports";
import type {User} from "~/lib/types";
const token = useCookie('token')
const route = useRoute()
const showBack = () => {
  return route.path.startsWith('/detail') || route.path.startsWith('/settings') || route.path.startsWith('/config')
}

const userId = useCookie('userId');
const url = window.location.pathname
let findId = userId.value
if(url.startsWith('/user/')) {
  findId = url.split('/user/')[1]
}
const response = await $fetch('/api/user/settings/get?user=' + (findId == 'undefined' ? '0' : findId));

const { data: res, refresh } = await useAsyncData('userinfo', async () => response)

settingsUpdateEvent.on(async () => {
  await refresh()
})

</script>

<style scoped></style>
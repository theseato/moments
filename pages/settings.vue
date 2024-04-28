<template>
  <HeaderImg />

  <div class="flex flex-col gap-4 p-2 sm:p-4">

    <div class="flex flex-col gap-2">
      <Label for="username" class="font-bold">登陆名</Label>
      <Input type="text" id="username" placeholder="登陆名" autocomplete="off" v-model="state.username" />
    </div>

    <div class="flex flex-col gap-2">
      <Label for="password" class="font-bold">密码</Label>
      <Input type="password" id="password" placeholder="留空则不修改密码" autocomplete="off" v-model="state.password" />
    </div>

    <div class="flex flex-col gap-2">
      <Label for="nickname" class="font-bold">昵称</Label>
      <Input type="text" id="nickname" placeholder="头像左边的作者名字" autocomplete="off" v-model="state.nickname" />
    </div>


    <div class="flex flex-col gap-2">
      <Label for="slogan" class="font-bold">心情状态</Label>
      <Input type="text" id="slogan" placeholder="头像下方文字,最好别超过15个汉字" autocomplete="off" v-model="state.slogan" />
    </div>

    <div class="flex flex-col gap-2">
      <Label for="avatarUrl" class="font-bold">头像</Label>
      <div class="flex gap-2">
        <Input type="file" id="avatarUrl" @change="(e: Event) => { uploadImgs(e, 'avatarUrl') }" style="width: 35%"/>
        <Label for="avatarUrl-input" class="font-medium" style="align-content: center;">或者输入在线地址:</Label>
        <Input type="text" id="avatarUrl-input" placeholder="或者填入在线地址" autocomplete="off" v-model="state.avatarUrl" style="width: 35%" />
      </div>
      <img :src="state.avatarUrl" alt="avatar" class="w-[70px] h-[70px] rounded-xl" v-if="state.avatarUrl" />
    </div>
    <div class="flex flex-col gap-2">
      <Label for="coverUrl" class="font-bold">顶部图片</Label>
      <div class="flex gap-2">
        <Input type="file" id="coverUrl" autocomplete="off" @change="(e: Event) => { uploadImgs(e, 'coverUrl') }" style="width: 35%"/>
        <Label for="coverUrl-input" class="font-medium" style="align-content: center;">或者输入在线地址:</Label>
        <Input type="text" id="coverUrl-input" placeholder="或者填入在线地址" autocomplete="off" v-model="state.coverUrl" style="width: 35%"/>
      </div>
      <img class="w-full h-[250px]" v-if="state.avatarUrl" :src="state.coverUrl" alt="" />
    </div>

    <div class="flex flex-col gap-2">
      <Label for="css" class="font-bold">自定义个人页面CSS</Label>
      <Textarea id="css" v-model="state.css" rows="3"></Textarea>
    </div>

    <div class="flex flex-col gap-2">
      <Label for="js" class="font-bold">自定义个人页面JS</Label>
      <Textarea id="js" v-model="state.js" rows="3"></Textarea>
    </div>

    <div class="flex flex-col gap-2 ">
      <Button @click="saveSettings">保存</Button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { settingsUpdateEvent } from '~/lib/event'
const token = useCookie('token')
import { useStorage } from "@vueuse/core";
import type { User } from '~/lib/types';
import {toast} from "vue-sonner";

const response = await $fetch('/api/user/settings/get?user=0');

useHead({
  title: '设置-'+(response.data.title || 'Randall的小屋'),
})

const enableS3 = useStorage("enableS3", false);


const state = reactive({
  username: '',
  password: '',
  nickname: '',
  slogan: '',
  avatarUrl: '',
  coverUrl: '',
  css: '',
  js: '',
})

const { data: res } = await useFetch<{ data: typeof state }>('/api/user/settings/full',{key:'settings'})
const data = res.value?.data
state.coverUrl = data?.coverUrl || '/cover.webp'
state.avatarUrl = data?.avatarUrl || '/avatar.webp'
state.username = data?.username || ''
state.nickname = data?.nickname || ''
state.slogan = data?.slogan || ''
state.css = data?.css || ''
state.js = data?.js || ''


const uploadImgs = async (event: Event, id: string) => {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) {
    return
  }

  await useUpload(file, async (res) => {
    if (res.success) {
      (event.target as HTMLInputElement).value = ''
      if (id === 'coverUrl') {
        state.coverUrl = res.filename
      } else if (id === 'avatarUrl') {
        state.avatarUrl = res.filename
      } else {
        toast.warning('上传失败: 未知图片类型')
      }
    } else {
      toast.warning('上传失败: ' + res.message)
    }
  })
}

const saveSettings = async () => {
  toast.promise(
      $fetch('/api/user/settings/save', {
        method: 'POST',
        body: JSON.stringify(state)
      }), {
        loading: '保存中...',
        success: (data) => {
          state.password = ''
          settingsUpdateEvent.emit()
          if (state.password) {
            token.value = ''
            navigateTo('/login')
            return ('密码修改成功,请重新登录')
          } else {
            location.reload()
            throw new Error(data.message)
          }
        },
        error: (error) => `保存失败: ${error || '未知错误'}`,
      }
  );
}
</script>

<style scoped></style>
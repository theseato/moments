<template>
  <HeaderImg />
  <div class="flex flex-col gap-4 p-2 sm:p-4">

    <div class="flex flex-col gap-2">
      <Label for="title" class="font-bold">网站标题</Label>
      <Input type="text" id="title" placeholder="网站标题" autocomplete="off" v-model="state.title" />
    </div>

    <div class="flex flex-col gap-2">
      <Label for="favicon" class="font-bold">Favicon</Label>
      <div class="flex gap-2">
        <Input type="file" id="favicon" autocomplete="off" @change="(e: Event) => { uploadImgs(e, 'favicon') }" style="width: 35%" />
        <Label for="favicon-input" class="font-medium" style="align-content: center;">或者输入在线地址:</Label>
        <Input type="text" id="favicon-input" placeholder="或者填入在线地址" autocomplete="off" v-model="state.favicon" style="width: 35%" />
      </div>
      <img class="max-w-[50px] max-h-[50px]" v-if="state.favicon" :src="state.favicon" alt="" />
    </div>

    <div class="flex flex-col gap-2">
      <Label for="css" class="font-bold">全局自定义CSS</Label>
      <Textarea id="css" v-model="state.css" rows="3"></Textarea>
    </div>

    <div class="flex flex-col gap-2">
      <Label for="js" class="font-bold">全局自定义JS</Label>
      <Textarea id="js" v-model="state.js" rows="3"></Textarea>
    </div>

    <div class="flex flex-col gap-2">
      <Label for="beianNo" class="font-bold">备案号</Label>
      <Input type="text" id="beianNo" placeholder="备案号,没有可不填写" autocomplete="off" v-model="state.beianNo" />
    </div>

    <div class="flex flex-col gap-2">
      <Label for="enableS3" class="font-bold">启用S3存储</Label>
      <Switch id="enableS3" v-model:checked="state.enableS3" />
    </div>

    <template v-if="state.enableS3">

      <div class="flex flex-col gap-2">
        <Label for="domain" class="font-bold">域名</Label>
        <Input type="text" id="domain" placeholder="S3 CDN域名" autocomplete="off" v-model="state.domain" />
      </div>

      <div class="flex flex-col gap-2">
        <Label for="bucket" class="font-bold">桶名</Label>
        <Input type="text" id="bucket" placeholder="bucket" autocomplete="off" v-model="state.bucket" />
      </div>

      <div class="flex flex-col gap-2">
        <Label for="region" class="font-bold">地区</Label>
        <Input type="text" id="region" placeholder="" autocomplete="off" v-model="state.region" />
      </div>

      <div class="flex flex-col gap-2">
        <Label for="accessKey" class="font-bold">accessKey</Label>
        <Input type="text" id="accessKey" placeholder="" autocomplete="off" v-model="state.accessKey" />
      </div>

      <div class="flex flex-col gap-2">
        <Label for="secretKey" class="font-bold">secretKey</Label>
        <Input type="text" id="secretKey" placeholder="" autocomplete="off" v-model="state.secretKey" />
      </div>

      <div class="flex flex-col gap-2">
        <Label for="endpoint" class="font-bold">S3接口地址</Label>
        <Input type="text" id="endpoint" placeholder="" autocomplete="off" v-model="state.endpoint" />
      </div>

      <div class="flex flex-col gap-2">
        <Label for="thumbnailSuffix" class="font-bold">后缀</Label>
        <Input type="text" id="thumbnailSuffix" placeholder="" autocomplete="off" v-model="state.thumbnailSuffix" />
      </div>

    </template>

<!--    <div class="flex flex-col gap-2">-->
<!--      <Label for="enableEmail" class="font-bold">启用邮箱</Label>-->
<!--      <Switch id="enableEmail" v-model:checked="state.enableEmail" />-->
<!--    </div>-->

<!--    <template v-if="state.enableEmail">-->
<!--      <div class="flex flex-col gap-2">-->
<!--        <Label for="mailHost" class="font-bold">邮局服务器地址</Label>-->
<!--        <Input type="text" id="mailHost" placeholder="邮局服务器地址" autocomplete="off" v-model="state.mailHost" />-->
<!--      </div>-->

<!--      <div class="flex flex-col gap-2">-->
<!--        <Label for="email" class="font-bold">邮局服务器端口</Label>-->
<!--        <Input type="password" id="mailPort" placeholder="邮局服务器端口" autocomplete="off" v-model="state.mailPort" />-->
<!--      </div>-->

<!--      <div class="flex flex-col gap-2">-->
<!--        <Label for="mailSecure" class="font-bold">邮局安全连接</Label>-->
<!--        <Switch id="mailSecure" v-model:checked="state.mailSecure" />-->
<!--      </div>-->

<!--      <div class="flex flex-col gap-2">-->
<!--        <Label for="mailUser" class="font-bold">邮局用户名</Label>-->
<!--        <Input type="text" id="mailUser" placeholder="邮局用户名，一般同邮局发件人" autocomplete="off" v-model="state.mailUser" />-->
<!--      </div>-->

<!--      <div class="flex flex-col gap-2">-->
<!--        <Label for="mailPass" class="font-bold">邮局密码</Label>-->
<!--        <Input type="password" id="mailPass" placeholder="邮局密码" autocomplete="off" v-model="state.mailPass" />-->
<!--      </div>-->

<!--      <div class="flex flex-col gap-2">-->
<!--        <Label for="mailFrom" class="font-bold">邮局发件人</Label>-->
<!--        <Input type="text" id="mailFrom" placeholder="邮局发件人，一般同邮局用户名" autocomplete="off" v-model="state.mailFrom" />-->
<!--      </div>-->

<!--      <div class="flex flex-col gap-2">-->
<!--        <Label for="mailName" class="font-bold">邮局发件人名</Label>-->
<!--        <Input type="text" id="mailName" placeholder="邮局发件人名" autocomplete="off" v-model="state.mailName" />-->
<!--      </div>-->

<!--    </template>-->

    <div class="flex flex-col gap-2 ">
      <Button @click="saveConfig">保存</Button>
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
  enableS3: false,
  domain: '',
  bucket: '',
  region: '',
  accessKey: '',
  secretKey: '',
  endpoint: '',
  thumbnailSuffix: '',
  title: '',
  favicon: "",
  css:"",
  js:"",
  beianNo:""
})

const { data: res } = await useFetch<{ data: typeof state }>('/api/site/config/get',{key:'settings'})
const data = res.value?.data
state.title = data?.title || 'Randall的小屋'
state.favicon = data?.favicon || '/favicon.png'
state.enableS3 = data?.enableS3 || false
state.domain = data?.domain || ''
state.bucket = data?.bucket || ''
state.region = data?.region || ''
state.accessKey = data?.accessKey || ''
state.secretKey = data?.secretKey || ''
state.endpoint = data?.endpoint || ''
state.thumbnailSuffix = data?.thumbnailSuffix || ''
state.css = data?.css || ''
state.js = data?.js || ''
state.beianNo = data?.beianNo || ''
enableS3.value = state.enableS3


const uploadImgs = async (event: Event, id: string) => {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) {
    return
  }

  await useUpload(file, async (res) => {
    if (res.success) {
      (event.target as HTMLInputElement).value = ''
      if (id === 'favicon') {
        state.favicon = res.filename
      }
    } else {
      toast.warning('上传失败' + res.message)
    }
  })
}

const saveConfig = async () => {
  const { success } = await $fetch('/api/site/config/save', {
    method: 'POST',
    body: JSON.stringify(state)
  })
  if (success) {
    enableS3.value = state.enableS3
    toast.success('保存成功')
      location.reload()
    settingsUpdateEvent.emit()
  }
}
</script>

<style scoped></style>
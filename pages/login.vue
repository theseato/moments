<template>
  <HeaderImg />
  <div class="p-2 sm:p-4 flex justify-center min-h-[500px w-full]">
    <div class="p-8 rounded shadow-md max-w-sm w-full">
      <div class="mb-4">
        <Label for="username" class="block text-gray-700 mb-2">用户名</Label>
        <Input v-model="state.username" autocomplete="off" type="text" id="username" />
      </div>
      <div class="mb-6">
        <Label for="password" class="block text-gray-700 mb-2">密码</Label>
        <Input v-model="state.password" autocomplete="off" type="password" id="password" />
      </div>
      <div class="flex flex-row gap-2">
        <Button @click="login" type="button">登录</Button>
        <Button variant="ghost" @click="navigateTo('/')" type="button">返回首页</Button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {toast} from "vue-sonner";


const state = reactive({
  username: '',
  password: ''
})

const login = async () => {
  toast.promise(
      $fetch('/api/user/login', {
        method: 'POST',
        body: JSON.stringify(state)
      }), {
        loading: '登陆中...',
        success: (data) => {
          if (data.success) {
            navigateTo('/')
            return '登录成功';
          } else {
            throw new Error(data.message)
          }
        },
        error: (error) => `操作失败: ${error || '未知错误'}`,
      }
  );
}
</script>

<style scoped></style>
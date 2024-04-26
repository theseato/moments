<template>
  <HeaderImg />
  <div class="p-2 sm:p-4 flex justify-center min-h-[500px w-full]">
    <div class="p-8 rounded shadow-md max-w-sm w-full">
      <div class="mb-4">
        <Label for="username" class="block text-gray-700 mb-2">用户名</Label>
        <Input v-model="state.username" autocomplete="off" type="text" id="username" />
      </div>
      <div class="mb-4">
        <Label for="username" class="block text-gray-700 mb-2">邮箱</Label>
        <div class="flex flex-row gap-2">
          <Input v-model="state.email" autocomplete="off" type="text" id="username" />
          <Button id="sendMail" type="button">发送验证码</Button>
        </div>
      </div>
      <div class="mb-6" id="vcode">
        <Label for="password" class="block text-gray-700 mb-2">邮箱验证码</Label>
        <Input v-model="state.emailVerificationCode" autocomplete="off" type="text" id="emailVerificationCode" />
      </div>
      <div class="mb-6">
        <Label for="password" class="block text-gray-700 mb-2">密码</Label>
        <Input v-model="state.password" autocomplete="off" type="password" id="password" />
      </div>
      <div class="flex flex-row gap-2">
        <Button @click="register" type="button">注册</Button>
        <Button variant="ghost" @click="navigateTo('/')" type="button">返回首页</Button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'


const state = reactive({
  username: '',
  email: '',
  password: '',
  emailVerificationCode: ''
})


onMounted(() => {

  document.getElementById('vcode').hidden = true
  const sendMail = async () => {
    // 按钮禁用
    document.getElementById('sendMail').disabled = true
    const res = await $fetch('/api/user/sendMail', {
      method: 'POST',
      body: JSON.stringify({ email: state.email })
    })

    if (res.success) {
      this.$rNotification.rStatusMessage.success('发送成功')
      // 平滑显示验证码输入框
      document.getElementById('vcode').hidden = false
    } else {
      this.$rNotification.rStatusMessage.warning(res.message, '发送失败')
    }
    // 恢复按钮
    document.getElementById('sendMail').disabled = false
  }

  document.getElementById('sendMail').addEventListener('click', sendMail)
})


const register = async () => {
  const res = await $fetch('/api/user/register', {
    method: 'POST',
    body: JSON.stringify(state)
  })

  if (res.success) {
    rStatusMessage.success('注册成功')
    await navigateTo('/login')
  } else {
    rStatusMessage.warning(res.message, '注册失败')
  }
}
</script>

<style scoped></style>
<template>
  <div class="p-2 rounded text-sm ">
    <div class="relative">
      <Textarea @keyup.ctrl.enter="saveComment" ref="textareaRef" autocomplete="new-text" rows="3" v-model="content" class="dark:bg-slate-500 border-separate" :placeholder="placeholder" />
      <div class="absolute right-2 bottom-1 cursor-pointer text-xl" @click="toggleShowEmoji" ref="showEmojiRef">😊</div>
    </div>
    <Emoji v-if="showEmoji" class="mt-2" @emoji-selected="emojiSelected"/>
    <div class="flex flex-row items-center justify-end mt-2 gap-2">
      <Input placeholder="昵称,必填" type="text"  v-model="info.username" class=" dark:bg-slate-500 text-xs sm:text-sm  py-0.5"></Input>
      <Input placeholder="主页,可空" type="text" v-model="info.website" class="dark:bg-slate-500 text-xs sm:text-sm  py-0.5"> </Input>
      <Input placeholder="邮箱,可空" type="text" v-model="info.email" class="hidden sm:block dark:bg-slate-500 text-xs sm:text-sm py-0.5"></Input>
      <Button size="sm" @click="saveComment" :disabled="pending">发表评论</Button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {useAnimate, useStorage} from '@vueuse/core'
import { insertTextAtCursor } from '~/lib/utils';

const textareaRef = ref()
const content = ref('')
const placeholder = ref('发表评论')
const emit = defineEmits(['commentAdded'])
const showEmoji = ref(false)
const keyframes = { transform: 'rotate(360deg)' }
const props = defineProps<{ memoId: number, reply?: string }>()
const showEmojiRef = ref<HTMLElement>()
const info = useStorage('anonymous', {
  email:'',
  website:'',
  username:''
})



const toggleShowEmoji = ()=>{
  showEmoji.value = !showEmoji.value
  useAnimate(showEmojiRef.value, keyframes, { duration: 1000, easing: 'ease-in-out' })
}
const emojiSelected = (emoji: string) => {
  const target = textareaRef.value?.getRef() as HTMLTextAreaElement
  insertTextAtCursor(emoji, target)
  content.value = target.value!
  // showEmoji.value = false
}

const pending = ref(false)

const saveComment = async (e) => {
  e.preventDefault();
  const config = useRuntimeConfig();
  console.log(config.public.RECAPTCHA_SITE_KEY);
  if(config.public.RECAPTCHA_SITE_KEY === undefined || config.public.RECAPTCHA_SITE_KEY === '' || config.public.RECAPTCHA_SITE_KEY === 'undefined' || config.public.RECAPTCHA_SITE_KEY === 'null'){
    if (!content.value) {
      rSttusMessage.warning('先填写评论');
      return;
    }
    if (!info.value.username) {
      rStatusMessage.warning('用户名必填');
      return;
    }
    pending.value = true;
    try {
      const res = await $fetch('/api/comment/save', {
        method: 'POST',
        body: JSON.stringify({
          content: content.value,
          memoId: props.memoId,
          replyTo: props.reply,
          author:false,
          email:info.value.email,
          website:info.value.website,
          username:info.value.username,
          reToken:''
        })
      });

      if (res.success) {
        rStatusMessage.success('评论成功');
        content.value = '';
        emit('commentAdded');
      } else {
        rStatusMessage.warning(res.message, '评论失败');
      }
    } catch (error) {
      rStatusMessage.warning('网络错误', '评论失败');
    }
    pending.value = false;
  }else{
    grecaptcha.ready(function() {
      grecaptcha.execute(config.public.RECAPTCHA_SITE_KEY, {action: 'submit'}).then(async function(token: string) {
        if (!content.value) {
          rStatusMessage.warning('先填写评论');
          return;
        }
        if (!info.value.username) {
          rStatusMessage.warning('用户名必填');
          return;
        }
        pending.value = true;
        try {
          const res = await $fetch('/api/comment/save', {
            method: 'POST',
            body: JSON.stringify({
              content: content.value,
              memoId: props.memoId,
              replyTo: props.reply,
              author:false,
              email:info.value.email,
              website:info.value.website,
              username:info.value.username,
              reToken:token,
            })
          });

          if (res.success) {
            rStatusMessage.success('评论成功');
            content.value = '';
            emit('commentAdded');
          } else {
            rStatusMessage.warning(res.message, '评论失败');
          }
        } catch (error) {
          rStatusMessage.warning('网络错误', '评论失败');
        }
        pending.value = false;
      });
    });
  }
}


onMounted(async () => {

  if (props.reply) {
    placeholder.value = "回复给@" + props.reply
  }
})
</script>

<style scoped></style>

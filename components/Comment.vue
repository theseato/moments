<template>
  <div class="relative select-none" style="text-align: left">
      <PopoverRoot
          :open="showCommentInput"
      >
        <PopoverTrigger>
          <div class="relative select-none" style="text-align: left">

            <div class="dark:text-[#9F9F9F] ">
          <span class="text-[#576b95] text-nowrap"><a class="cursor-pointer" v-if="comment.website" target="_blank" :href="comment.website">{{
              comment.username ?? '匿名' }}</a>
        <span v-else>{{ comment.username ?? '匿名' }}</span>
        <b v-if="comment.author==1"
           class="border text-xs border-[#C64A4A] rounded mx-0.5 px-0.5 text-[#C64A4A]">本文作者</b>
      <b v-if="comment.author==2"
         class="border text-xs border-[#D0B880] rounded mx-0.5 px-0.5 text-[#D0B880]">同站道友</b></span>
          <span v-if="comment.replyTo" class="text-nowrap mx-1">回复<span class="text-[#576b95] ml-1">{{ comment.replyTo }}</span> </span>
          <span class="mr-0.5">:</span>
          <span :title="`点击回复${comment.username}`" @click="showCommentInput = !showCommentInput" class="inline w-full break-all cursor-pointer">{{ comment.content }}</span>
          <AlertDialog v-if="belongToMe ">
            <AlertDialogTrigger asChild>
              <Trash2 :size=14 class="align-text-top ml-2 cursor-pointer inline-block text-gray-300" @click.stop="openDeleteDialog" />            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>确定删除评论吗?</AlertDialogTitle>
                <AlertDialogDescription>
                  <div><span class="font-bold">评论内容</span>:</div>
                  <div>{{ comment.content }}</div>
                  <div class="my-2 text-red-400">无法恢复,你确定删除吗?</div>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>取消</AlertDialogCancel>
                <AlertDialogAction @click="removeComment">确定</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
            </div>
          </div>
        </PopoverTrigger>
        <PopoverPortal
        >
          <PopoverContent
              side="bottom"
              :side-offset="5"
              class="rounded p-5 mx-auto bg-white shadow-[0_10px_38px_-10px_hsla(206,22%,7%,.35),0_10px_20px_-15px_hsla(206,22%,7%,.2)] focus:shadow-[0_10px_38px_-10px_hsla(206,22%,7%,.35),0_10px_20px_-15px_hsla(206,22%,7%,.2),0_0_0_2px_theme(colors.green7)] will-change-[transform,opacity] data-[state=open]:data-[side=top]:animate-slideDownAndFade data-[state=open]:data-[side=right]:animate-slideLeftAndFade data-[state=open]:data-[side=bottom]:animate-slideUpAndFade data-[state=open]:data-[side=left]:animate-slideRightAndFade"
              style="width: 100%"
          >
            <div class="flex flex-col gap-2.5" ref="popoverRef">
              <p class="text-mauve12 text-[15px] leading-[19px] font-semibold mb-2.5">
                回复 {{ comment.username }}
              </p>
              <FriendsCommentInput @commentAdded="refreshComment" :memoId="comment.memoId" :commentId="comment.id"
                                   :reply="comment.username" :replyId="comment.id" />
            </div>
            <PopoverArrow class="fill-white" />
          </PopoverContent>
        </PopoverPortal>
      </PopoverRoot>
  </div>
</template>

<script setup lang="ts">
import type { Comment } from '@/lib/types';
import { Trash2 } from 'lucide-vue-next'
import { toast } from 'vue-sonner';
import {PopoverArrow, PopoverClose, PopoverPortal, PopoverRoot} from "radix-vue";
import {onClickOutside} from "@vueuse/core";


const emit = defineEmits(['memo-update'])

const token = useCookie('token')
const showCommentInput = ref(false)
const props = withDefaults(
  defineProps<{
    comment: Comment
    belongToMe: boolean
  }>(), {}
)

const refreshComment = async () => {
  emit('memo-update')
  showCommentInput.value = false
}
const openDeleteDialog = () => {
  showCommentInput.value = false
}

const popoverRef = ref(null);
let stopOutsideClickListener: any = null;
// 使用 popoverRef 作为侦听点击外部的元素
watchEffect(() => {
  if (showCommentInput.value) {
    // 当弹窗展开时，激活外部点击监听
    stopOutsideClickListener = onClickOutside(popoverRef, () => {
      showCommentInput.value = false;
    });
  } else {
    // 当弹窗关闭时，移除监听器
    if (stopOutsideClickListener) {
      stopOutsideClickListener();
      stopOutsideClickListener = null;
    }
  }
});

const removeComment = async () => {
  toast.promise($fetch('/api/comment/remove', {
        method: 'POST',
        body: JSON.stringify({
          commentId: props.comment.id
        })
      }), {
        loading: '删除中...',
        success: (data) => {
          if (data.success) {
            emit('memo-update')
            return '删除成功';
          } else {
            throw new Error(data.message)
          }
        },
        error: (error) => `删除失败: ${error || '未知错误'}`,
      }
  );
}

</script>

<style scoped></style>
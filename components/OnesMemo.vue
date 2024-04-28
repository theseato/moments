<template>
  <div class="memo flex flex-row sm:gap-4 text-sm border-0 sm:py-2 sm:px-4 w-full" :class="{'bg-slate-100 dark:bg-neutral-900':props.memo.pinned}">
    <div class="flex flex-col w-1/5">
      {{ props.memo.displayDay }}
      <div v-if="(!props.memo.pinned) && props.memo.displayDay">
        <span style="font-size: 25px">{{dayjs(props.memo.createdAt).locale('zh-cn').format('DD')}}</span> <span>{{dayjs(props.memo.createdAt).locale('zh-cn').format('M')}}月</span>
      </div>
      <div class="text-[#576b95] font-medium dark:text-white text-xs mt-2 mb-1 select-none" v-if="(!props.memo.pinned) && props.memo.displayDay">
        {{props.memo.location?.split(/\s+/g).join(' · ')}}
      </div>
      <div class="flex flex-row justify-between items-center" v-if="props.memo.pinned" style="width: 100%; height: 100%">
        <div style="width: 100%; height: 100%; display: flex; align-items: center;"><span style="font-size: 30px">置顶</span></div>
      </div>
    </div>
    <div class="flex w-full">
      <div class="w-32 h-32" v-if="imgs.length">
        <FancyBox class="grid my-1 gap-0.5" :style="gridStyle"
                  :options="{ Carousel: { infinite: false } }">
          <img loading="lazy"
               class="cursor-pointer rounded full-cover-image-mult"
               v-lazy="getImgUrl(img)"
               v-for="(img, index) in imgs" :key="index"
               style="object-fit: cover; object-position: center;" />
        </FancyBox>
      </div>
      <div class="flex w-full" style="flex-direction: column;" @click="$router.push('/detail/'+props.memo.id)">
        <div class="memo-content text-sm friend-md bg-[#f7f7f7] dark:bg-[#202020]" style="width:100%; padding: 10px" ref="el" v-if="!imgs.length" v-html="marked(props.memo.content)"> </div>
        <div class="memo-content text-sm friend-md" style="width:100%; padding: 10px" ref="el" v-if="imgs.length" v-html="marked(props.memo.content)"> </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Memo } from '@/lib/types';
import { useElementSize, onClickOutside, watchOnce, useStorage } from '@vueuse/core';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/zh-cn';
import { Heart, HeartCrack, MessageSquareMore, Trash2, FilePenLine, Pin } from 'lucide-vue-next'
import { memoUpdateEvent } from '@/lib/event'
import { getImgUrl } from '~/lib/utils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import {marked} from "marked";
const token = useCookie('token')

const imgs = computed(() => props.memo.imgs ? props.memo.imgs.split(',') : []);
let userId = ref(0)

const gridStyle = computed(() => {
  let style = 'align-items: start;';
  switch (imgs.value.length) {
    case 1:
      style += 'grid-template-columns: 1fr; aspect-ratio: 1 / 1;';
      break;
    case 2:
      style += 'grid-template-columns: 1fr 1fr; aspect-ratio: 2 / 1;';
      break;
    case 3:
      style += 'grid-template-columns: 1fr 1fr 1fr; aspect-ratio: 3 / 1;';
      break;
    case 4:
      style += 'grid-template-columns: 1fr 1fr; aspect-ratio: 1;';
      break;
    default:
      style += 'grid-template-columns: 1fr 1fr 1fr; aspect-ratio: 3 / 1;';
  }
  return style;
});

dayjs.extend(relativeTime)

const props = withDefaults(
  defineProps<{
    memo: Memo,
    showMore: boolean,
  }>(), {}
)


const emit = defineEmits(['memo-update'])

const showAll = ref(false)
const showToolbar = ref(false)
const showCommentInput = ref(false)
const toolbarRef = ref(null)
const showUserCommentArray = ref<Array<boolean>>([])
const el = ref<any>(null)
let hh = ref(0)
const { height } = useElementSize(el)
const likeList = useStorage<Array<number>>('likeList', [])

onMounted(async () => {
  if (token) {
    userId = useCookie('userId')
  }
})

onClickOutside(toolbarRef, () => showToolbar.value = false)

watchOnce(height, () => {
  hh.value = height.value
  if (height.value > 96) {
    el.value.classList.add('line-clamp-4')
    // 将内容截断为4行，后面的内容删除
    el.value.style.height = '93px'
  }
})

</script>

<style>
.full-cover-image-mult {
  object-fit: cover;
  object-position: center;
  width: 100%;
  aspect-ratio: 1 / 1;
  border: transparent 1px solid;
}

.full-cover-image-single {
  object-fit: cover;
  object-position: center;
  max-height: 200px;  /* 最大高度为200px */
  height: auto;      /* 高度自动调整以保持横宽比 */
  width: auto;
  border: transparent 1px solid;
}

</style>
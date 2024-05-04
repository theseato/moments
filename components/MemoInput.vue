<template>
  <div class="p-2 sm:p-4 pb-2 border-b dark:border-[#C0BEBF]/10">
    <div class="flex flex-row my-2 ">
      <div class="flex flex-1 gap-2 ">
        <Popover :open="linkOpen">
          <PopoverTrigger as="div">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger as-child>
                  <Link :stroke-width="1.5" class="cursor-pointer w-[20px] h-[20px]" @click="linkOpen = true" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>插入链接</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </PopoverTrigger>
          <PopoverContent as-child @interact-outside="linkOpen = false">
            <div class="flex flex-col gap-2">
              <div class="text-xs my-2 flex justify-between"><span>插入链接</span>
              </div>
              <Input class="my-2" placeholder="请输入链接地址" v-model="externalUrl" />
              <template v-if="externalFetchError">
                <Input class="my-2" placeholder="请输入链接标题" v-model="externalTitle" />
                <Input class="my-2" placeholder="请输入链接图标,选填" v-model="externalFavicon" />
              </template>
              <div class="text-sm my-1" v-if="externalPending">获取信息中...</div>
              <Button size="sm" @click="addLink">提交</Button>
              <Button size="sm" class="ml-2" variant="secondary" @click="clearExternalUrl()">清空并关闭</Button>
            </div>
          </PopoverContent>
        </Popover>


        <Label for="imgUpload">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger as-child>
                <Image :stroke-width="1.5" class="cursor-pointer w-[20px] h-[20px]" />
              </TooltipTrigger>
              <TooltipContent>
                <p>上传本地图片</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <input type="file" id="imgUpload" class="hidden" name="file" @change="uploadImgs">
        </Label>

        <Popover :open="music163Open">
          <PopoverTrigger as="div">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger as-child>
                  <Music4 :stroke-width="1.5" class="cursor-pointer w-[20px] h-[20px]" @click="music163Open = true" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>嵌入网易云音乐</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

          </PopoverTrigger>
          <PopoverContent as-child @interact-outside="music163Open = false">
            <div class="">
              <div class=" text-xs my-2 flex justify-between"><span>嵌入网易云音乐</span>
              </div>
              <Input class="my-2" placeholder="请输入网易云音乐代码" v-model="music163Url" />
              <Button size="sm" @click="importMusic">提交</Button>
            </div>
          </PopoverContent>
        </Popover>


        <Popover :open="bilibiliOpen">
          <PopoverTrigger as="div">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger as-child>
                  <Youtube :stroke-width="1.5" class="cursor-pointer w-[20px] h-[20px]" @click="bilibiliOpen = true" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>嵌入B站视频</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

          </PopoverTrigger>
          <PopoverContent as-child @interact-outside="bilibiliOpen = false">
            <div class="">
              <div class=" text-xs my-2 flex justify-between"><span>嵌入B站视频</span>
              </div>
              <Input class="my-2" placeholder="请输入B站视频代码" v-model="bilibiliUrl" />
              <Button size="sm" @click="importBiliBili">提交</Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>
      <div v-if="shouConfigButton" class="flex flex-row gap-2">
        <Button
            @click="submitMemo"
            :disabled="(!content) && imgs.length === 0"
        >提交</Button>
      </div>
    </div>
    <div class="relative">
      <Textarea ref="textareaRef" @paste="pasteImg" autocomplete="new-text" v-model="content" rows="4" @keyup.ctrl.enter="submitMemo()"
                placeholder="今天发点什么呢?" class=" dark:text-[#C0BEBF]"></Textarea>
    </div>

    <iframe class="rounded" frameborder="no" border="0" marginwidth="0" marginheight="0" width=330 height=86
            :src="music163IfrUrl" v-if="music163IfrUrl"></iframe>

    <iframe class="w-full h-[250px] my-2" v-if="bilibiliIfrUrl" :src="bilibiliIfrUrl" scrolling="no" border="0"
            frameborder="no" framespacing="0" allowfullscreen="true"> </iframe>

    <div class="flex flex-row gap-2 my-2 bg-[#f7f7f7] dark:bg-[#212121] items-center p-2 border rounded"
         v-if="externalFavicon && externalTitle">
      <div class="flex-1 flex flex-row gap-2 items-center"><img class="w-8 h-8" :src="externalFavicon" alt="">
        <div class="text-sm text-[#576b95] cursor-pointer" v-if="!externalTitleEditing" title="点击编辑标题"
             @click="externalTitleEditing = true">{{ externalTitle }}</div>
        <Input placeholder="请输入链接标题" v-model="externalTitle" v-if="externalTitleEditing" />
      </div>
      <Check class="w-5 h-5 mr-2 cursor-pointer" color="green" v-if="externalTitleEditing"
             @click="externalTitleEditing = false" />
      <CircleX class="w-5 h-5 cursor-pointer" color="red" @click="clearExternalUrl" />
    </div>

    <div class="grid grid-cols-3 my-2 gap-2" v-if="imgs && imgs.length > 0">
      <div v-for="(img, index) in imgs" :key="index" class="relative" draggable="true"
           @dragstart="event => dragStart(event, index)"
           @dragover="dragOver"
           @drop="event => drop(event, index)">
        <img :src="getImgUrl(img)" class="cursor-pointer rounded full-cover-image-mult" />
        <Trash2 color="#379d1b" :size="15" class="absolute top-1 right-1 cursor-pointer"
                @click="imgs.splice(index, 1)" />
      </div>
    </div>

    <div class="flex flex-row justify-between mt-2 items-center gap-2 ">
      <div class="text-sm flex flex-row gap-1 flex-1 items-center">
        <Popover>
          <PopoverTrigger>
            <div class="text-[#576b95] text-sm cursor-pointer">{{ fmtLocation }}</div>
          </PopoverTrigger>
          <PopoverContent class="w-80">
            <div class="flex flex-row gap-2 text-sm">
              <Input v-model="location" placeholder="空格分割" />
              <Button variant="outline" @click="updateLocation">自动获取</Button>
              <Button variant="outline" @click="location = ''">清空</Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>
      <div class="text-sm flex flex-row gap-1 flex-1 items-center">
        <Popover>
          <PopoverTrigger>
            <div class="text-[#576b95] text-sm cursor-pointer">{{ fmtAite }}</div>
          </PopoverTrigger>
          <PopoverContent class="w-80">
            <div class="flex flex-row gap-2 text-sm">
              <TagsInputRoot
                  v-model="atpeople"
                  class="flex gap-2 items-center border p-2 rounded-lg w-full max-w-[480px] flex-wrap border-blackA7"
              >
                <TagsInputItem v-for="item in atpeopleNickname" :key="item" :value="item" class=" flex shadow-md items-center justify-center gap-2 bg-green8 aria-[current=true]:bg-green9 rounded p-1">
                  <TagsInputItemText class="text-sm pl-1" />
                  <TagsInputItemDelete
                      class="p-0.5 rounded bg-transparent hover:bg-blackA4"
                      @click="atpeopleNickname.splice(atpeopleNickname.indexOf(item), 1); atpeople.splice(atpeople.indexOf(atpeopleNickname.indexOf(item)), 1)"
                  >
                    X
                  </TagsInputItemDelete>
                </TagsInputItem>
                <ComboboxRoot v-model="v" class="relative">
                  <ComboboxAnchor class="min-w-[160px] inline-flex items-center justify-between rounded px-[15px] text-[13px] leading-none h-[35px] gap-[5px] text-grass11 shadow-[0_2px_10px] shadow-black/10 hover:bg-mauve3 focus:shadow-[0_0_0_2px] focus:shadow-black data-[placeholder]:text-grass9 outline-none">
                    <ComboboxInput
                        :modelValue="inputs"
                        @input="handleInput"
                        class="!bg-transparent outline-none text-grass11 h-full selection:bg-grass5 placeholder-mauve8"
                        placeholder="请输入需要查询的用户"
                    />
                  </ComboboxAnchor>

                  <ComboboxContent class="absolute z-10 w-full mt-2 min-w-[200px] bg-white dark:bg-black overflow-hidden rounded shadow-[0px_10px_38px_-10px_rgba(22,_23,_24,_0.35),_0px_10px_20px_-15px_rgba(22,_23,_24,_0.2)] will-change-[opacity,transform] data-[side=top]:animate-slideDownAndFade data-[side=right]:animate-slideLeftAndFade data-[side=bottom]:animate-slideUpAndFade data-[side=left]:animate-slideRightAndFade">
                    <ComboboxViewport class="p-[5px]">
                      <ComboboxEmpty class="text-mauve8 text-xs font-medium text-center py-2" />

                      <ComboboxGroup>

                        <ComboboxItem
                            v-for="(option, index) in state.options" :key="index"
                            class="text-[13px] leading-none text-grass11 rounded-[3px] flex items-center h-[25px] pr-[35px] pl-[25px] relative select-none data-[disabled]:text-mauve8 data-[disabled]:pointer-events-none data-[highlighted]:outline-none data-[highlighted]:bg-grass9 data-[highlighted]:text-grass1"
                            :value="option"
                            @click="
                            if(atpeople.indexOf(option.id) === -1){
                              atpeopleNickname.push(option.nickname);
                              atpeople.push(option.id); inputs = ''
                            }"
                        >
                          <ComboboxItemIndicator
                              class="absolute left-0 w-[25px] inline-flex items-center justify-center"
                          >
                          </ComboboxItemIndicator>
                          <img :src="option.avatarUrl" class="w-[20px] h-[20px] rounded-full" />
                          <span>
                            {{ option.nickname }}
                          </span>
                          <span style="color: #999; font-size: 12px;margin-left: 5px">
                            id：{{ option.id }}
                          </span>
                        </ComboboxItem>
                        <ComboboxSeparator class="h-[1px] bg-grass6 m-[5px]" />
                      </ComboboxGroup>
                    </ComboboxViewport>
                  </ComboboxContent>
                </ComboboxRoot>
              </TagsInputRoot>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { getImgUrl, insertTextAtCursor } from '~/lib/utils';
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { memoUpdateEvent } from '@/lib/event'
import type { Memo } from '~/lib/types';
import { useAnimate } from '@vueuse/core';
import { Image, Music4, Settings, Trash2, LogOut,  Link, Youtube, CircleX, Check, FileSliders } from 'lucide-vue-next'
import { ref } from 'vue';
import jsonp from "jsonp";
import {toast} from "vue-sonner";
import {
  TagsInputInput,
  TagsInputItem,
  TagsInputItemDelete,
  TagsInputItemText,
  TagsInputRoot,
  ComboboxAnchor,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxInput,
  ComboboxItem,
  ComboboxItemIndicator,
  ComboboxLabel,
  ComboboxRoot,
  ComboboxSeparator,
  ComboboxTrigger,
  ComboboxViewport
} from "radix-vue";
const location = ref('');
const inputs = ref('');

const v = ref('')

const state = reactive({
  options: Array<any>(),
  // page: 1,
  // hasNext: false
})

const find = () => {
  if(inputs.value === '') {
    state.options = [];
    return;
  }
  $fetch('/api/user/list', {
    method: 'POST',
    body: JSON.stringify({ find: inputs.value })
  }).then((res) => {
    if (res.success) {
      console.log(res.data)
      state.options = res.data;
    } else {
      state.options = [];
    }
  });
}

const handleInput=() =>{
  inputs.value = event.target.value;
  find();
}

const textareaRef = ref()
const showEmojiRef = ref<HTMLElement>()
const keyframes = { transform: 'rotate(360deg)' }
const showEmoji = ref(false)
const emit = defineEmits(['memoAdded'])
const toggleShowEmoji = () => {
  showEmoji.value = !showEmoji.value
  useAnimate(showEmojiRef.value, keyframes, { duration: 1000, easing: 'ease-in-out' })
}
const fmtLocation = computed(() => {
  if (location.value) {
    return location.value.split(' ').join(' · ')
  }
  return '所在位置'
})

const fmtAite = computed(() => {
  if(atpeopleNickname.value.length > 0) {
    return '提醒: ' + atpeopleNickname.value.join('、')
  }
  return '提醒谁看'
})

const content = ref('')
const id = ref(-1)
const music163Url = ref('')
const music163IfrUrl = ref('')
const music163Open = ref(false)

const bilibiliUrl = ref('')
const bilibiliIfrUrl = ref('')
const bilibiliOpen = ref(false)

const linkOpen = ref(false)
const externalUrl = ref('')
const externalTitle = ref('')
const externalFavicon = ref('')
const externalPending = ref(false)
const externalFetchError = ref(false)
const externalTitleEditing = ref(false)
let shouConfigButton = false
let userId = ref(0)
userId = useCookie('userId') || 0
if (userId.value === 1) {
  shouConfigButton = true
}
const clearExternalUrl = () => {
  externalUrl.value = ''
  externalTitle.value = ''
  externalFavicon.value = ''
  linkOpen.value = false
  externalFetchError.value = false
}
const addLink = async () => {
  if (externalFetchError.value && externalTitle.value === '') {
    toast.warning('请填写标题和图标')
    return
  }
  if (externalFetchError.value && externalTitle.value !== '') {
    externalFetchError.value = false
    linkOpen.value = false
    externalPending.value = false
    externalFavicon.value = externalFavicon.value || '/favicon.png'
    return
  }
  externalPending.value = true
  externalFetchError.value = false
  const { data: res } = await useAsyncData('external_' + externalUrl.value, async () => {
    return await $fetch('/api/memo/readExternal', {
      method: 'POST',
      body: JSON.stringify({ url: externalUrl.value })
    })
  })
  if (res.value?.success) {
    externalTitle.value = res.value?.title || '无法获取标题'
    externalFavicon.value = res.value?.favicon || '/favicon.png'
    linkOpen.value = false
    externalPending.value = false
  } else {
    toast.warning('获取失败: ' + res.value?.message)
    externalPending.value = false
    externalFetchError.value = true
  }
}



const dragStart = (event, index) => {
  event.dataTransfer.setData('text/plain', index);
}

const dragOver = (event) => {
  event.preventDefault();
}

const drop = (event, dropIndex) => {
  event.preventDefault();
  const dragIndex = event.dataTransfer.getData('text/plain');
  const dragImg = imgs.value[dragIndex];
  imgs.value.splice(dragIndex, 1);  // 删除被拖拽的图片
  imgs.value.splice(dropIndex, 0, dragImg);  // 在放置位置插入被拖拽的图片
}


const imgs = ref<string[]>([])
const atpeople = ref<number[]>([])
const atpeopleNickname = ref<string[]>([])

const submitMemo = async () => {
  if (content.value === '') {
    toast.warning('请输入内容')
    return
  }
  toast.promise($fetch('/api/memo/save', {
        method: 'POST',
        body: JSON.stringify({
          id: id.value,
          content: content.value,
          imgUrls: imgs.value,
          atpeople: atpeople.value,
          music163Url: music163IfrUrl.value,
          bilibiliUrl: bilibiliIfrUrl.value,
          location: location.value,
          externalFavicon: externalFavicon.value,
          externalTitle: externalTitle.value,
          externalUrl: externalUrl.value
        })
      }), {
        loading: '提交中...',
        success: (data) => {
          if (data.success) {
            content.value = ''
            id.value = -1
            imgs.value = []
            atpeople.value = []
            atpeopleNickname.value = []
            music163IfrUrl.value = ''
            music163Url.value = ''
            bilibiliIfrUrl.value = ''
            bilibiliUrl.value = ''
            location.value = ''
            externalFavicon.value = ''
            externalTitle.value = ''
            externalUrl.value = ''
            showEmoji.value = false
            emit('memoAdded')
            return '提交成功';
          } else {
            throw new Error(data.message)
          }
        },
        error: (error) => `提交失败: ${error || '未知错误'}`,
      }
  );
}

const pasteImg = async (event: ClipboardEvent) => {
  var items = event.clipboardData?.files
  if (!items || items.length === 0) {
    return;
  }
  await useUpload(items[0], async (res) => {
    if (res.success) {
      imgs.value = [...imgs.value, res.filename]
    } else {
      toast.warning('上传失败' + res.message)
    }
  })
}

const uploadImgs = async (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) {
    return
  }

  await useUpload(file, async (res) => {
    if (res.success) {
      (event.target as HTMLInputElement).value = ''
      imgs.value = [...imgs.value, res.filename]
    } else {
      toast.warning('上传失败' + res.message)
    }
  })
}

const importMusic = () => {
  if (music163Url.value === '') {
    toast.warning('请输入网易云音乐代码')
    return
  }
  const match = music163Url.value.match(/src="(.*)&auto.*"/)
  if (match && match.length > 1) {
    const url = match[1]
    music163IfrUrl.value = url + '&auto=0&height=66'
    music163Open.value = false
  }
}


const importBiliBili = () => {
  if (bilibiliUrl.value === '') {
    toast.warning('请输入B站视频代码')
    return
  }
  const match = bilibiliUrl.value.match(/src="(.*?)"/)
  if (match && match.length > 1) {
    const url = match[1]
    bilibiliIfrUrl.value = url + '&autoplay=0&high_quality=1&as_wide=1'
    bilibiliOpen.value = false
  }
}



const emojiSelected = (emoji: string) => {
  const target = textareaRef.value?.getRef() as HTMLTextAreaElement
  insertTextAtCursor(emoji, target)
  content.value = target.value!
  // showEmoji.value = false
}
memoUpdateEvent.on((event: Memo) => {
  content.value = event.content
  id.value = event.id
  if (event.imgs) {
    imgs.value = event.imgs?.split(',')
  }
  if(event.atpeople) {
    atpeople.value = event.atpeople.split(',').map(Number)
    for (let i = 0; i < atpeople.value.length; i++) {
      $fetch('/api/user/settings/get?user='+atpeople.value[i]).then((res) => {
        if (res.success) {
          atpeopleNickname.value.push(res.data.nickname)
        }
      })
    }
  }
  location.value = event.location || ''
  externalFavicon.value = event.externalFavicon || ''
  externalTitle.value = event.externalTitle || ''
  externalUrl.value = event.externalUrl || ''
})


const getTmpLocation = async () => {
  return new Promise(async (resolve, reject) => {
    try {
      let tencentMapKey = '';
      const siteConfig = await $fetch('/api/site/config/get')
      if (siteConfig && siteConfig.success && siteConfig.data && siteConfig.data.enableTencentMap) {
        tencentMapKey = siteConfig.data.tencentMapKey;
      } else {
        reject('当前站点未开启地图服务，请手动输入位置或者联系管理员开启地图服务');
      }
      const url = 'https://apis.map.qq.com/ws/location/v1/ip';
      const params = {
        key: tencentMapKey,
        output: 'jsonp'
      };
      const queryString = new URLSearchParams(params).toString();
      const jsonpUrl = `${url}?${queryString}`;
      jsonp(jsonpUrl, null, (err, data) => {
        if (err) {
          return '获取位置失败';
        } else {
          const ipLocation = data;
          if (ipLocation.status === 0) {
            let pos = ipLocation.result.ad_info.nation;
            if (ipLocation.result.ad_info.province !== undefined && ipLocation.result.ad_info.province !== '') {
              pos += '-' + ipLocation.result.ad_info.province;
            }
            if (ipLocation.result.ad_info.city !== undefined && ipLocation.result.ad_info.city !== '' && ipLocation.result.ad_info.city !== ipLocation.result.ad_info.province) {
              pos += '-' + ipLocation.result.ad_info.city;
            }
            if (ipLocation.result.ad_info.district !== undefined && ipLocation.result.ad_info.district !== '') {
              pos += '-' + ipLocation.result.ad_info.district;
            }
            if (ipLocation.result.address_reference !== undefined && ipLocation.result.address_reference !== '') {
              if (ipLocation.result.address_reference.famous_area !== undefined && ipLocation.result.address_reference.famous_area !== '') {
                pos += ' ' + ipLocation.result.address_reference.famous_area.title;
              } else if (ipLocation.result.address_reference.business_area !== undefined && ipLocation.result.address_reference.business_area !== '') {
                pos += ' ' + ipLocation.result.address_reference.town.title;
              } else if (ipLocation.result.address_reference.town !== undefined && ipLocation.result.address_reference.town !== '') {
                pos += ' ' + ipLocation.result.address_reference.town.title;
              } else if (ipLocation.result.address_reference.landmark_l1 !== undefined && ipLocation.result.address_reference.landmark_l1 !== '') {
                pos += ' ' + ipLocation.result.address_reference.town.title;
              } else if (ipLocation.result.address_reference.landmark_l2 !== undefined && ipLocation.result.address_reference.landmark_l2 !== '') {
                pos += ' ' + ipLocation.result.address_reference.town.title;
              } else if (ipLocation.result.address_reference.street !== undefined && ipLocation.result.address_reference.street !== '') {
                pos += ' ' + ipLocation.result.address_reference.town.title;
              } else if (ipLocation.result.address_reference.street_number !== undefined && ipLocation.result.address_reference.street_number !== '') {
                pos += ' ' + ipLocation.result.address_reference.town.title;
              } else if (ipLocation.result.address_reference.crossroad !== undefined && ipLocation.result.address_reference.crossroad !== '') {
                pos += ' ' + ipLocation.result.address_reference.town.title;
              } else if (ipLocation.result.address_reference.water !== undefined && ipLocation.result.address_reference.water !== '') {
                pos += ' ' + ipLocation.result.address_reference.town.title;
              } else if (ipLocation.result.address_reference.ocean !== undefined && ipLocation.result.address_reference.ocean !== '') {
                pos += ' ' + ipLocation.result.address_reference.town.title;
              }
            }
            resolve(pos);
          }
        }
        reject('获取位置失败');
      });
    } catch (error) {
      console.error(error);
    }
  });
}

async function updateLocation() {
  try {
    toast.promise(getTmpLocation(), {
      loading: '获取位置中...',
      success: (data) => {
        location.value = data;
        return '获取位置成功';
      },
      error: (error) => {
        location.value = '';
        return error;
      }
    });
  } catch (error) {
    console.error(error);
  }
}

</script>

<style scoped>
.full-cover-image-mult {
  object-fit: cover;
  object-position: center;
  width: 100%;
  aspect-ratio: 1 / 1;
  border: transparent 1px solid;
}
</style>
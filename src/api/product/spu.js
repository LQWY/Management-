// 引入二次分装的axios函数
import request from "@/utils/request"

// 获取spu列表
/* /admin/product/{page}/{limit} get
这里还需要category3Id，这样才能知道请求的是哪个分类下的数据 */
export const reqSpuList = (page, limit, category3Id) => request({
  url: `/admin/product/${page}/${limit}`,
  method: "get",
  params: { category3Id }
})

// 获取spu信息
export const reqSpuInfo = (spuId) => request({
  url: `/admin/product/getSpuById/${spuId}`,
  method: "get"
})

// 获取品牌信息
export const reqTradeMark = () => request({
  url: '/admin/product/baseTrademark/getTrademarkList',
  method: "get"
})

// 获取spu图片
export const reqSpuImage = (spuId) => request({
  url: `/admin/product/spuImageList/${spuId}`,
  method: "get"
})

// 获取销售属性----一共三个
export const reqSaleAttr = () => request({
  url: '/admin/product/baseSaleAttrList',
  method: "get"
})

// 修改spu|添加spu：对于修改和添加携带给服务器的参数大致一样，唯一的区别就是是否带id
export const reqAddOrUpdataSpu = (spuInfo) => {
  if (spuInfo.id) {
    // 携带id,修改spu
    return request({
      url: '/admin/product/updateSpuInfo',
      method: 'post',
      data: spuInfo
    })
  } else {
    // 没携带id,添加spu
    return request({
      url: '/admin/product/saveSpuInfo',
      method: 'post',
      data: spuInfo
    })
  }
}

// 删除spu  /admin/product/deleteSpu/{spuId} delete
export const reqDeleteSpu = (spuId) => request({
  url: `/admin/product/deleteSpu/${spuId}`,
  method: 'delete'
})

// 获取SKU列表数据
export const reqSkuList = (spuId) => request({
  url: `/admin/product/findBySpuId/${spuId}`,
  method: 'get'
})

import request from '@/utils/request'

// 获取spu图片
export const reqSpuImageList = (spuId) => request({
  url: `/admin/product/spuImageList/${spuId}`,
  method: 'get'
})
// 获取spu销售属性
export const reqSpuSaleAttrList = (spuId) => request({
  url: `/admin/product/spuSaleAttrList/${spuId}`,
  method: 'get'
})
// 获取平台属性
export const reeqAttrInfoList = (category1Id, category2Id, category3Id) => request({
  url: `/admin/product/attrInfoList/${category1Id}/${category2Id}/${category3Id}`,
  method: 'get'
})

// 添加sku
export const reqAddSku = (skuInfo) => request({
  url: '/admin/product/saveSkuInfo',
  method: 'post',
  data: skuInfo
})

// ------------SKU模块------------------------
// 获取SKU列表
export const reqSkuList = (page, limit) => request({
  url: `/admin/product/list/${page}/${limit}`,
  method: 'get'
})

// 上架
export const reqOnSale = (skuId) => request({
  url: `/admin/product/onSale/${skuId}`,
  method: 'get'
})
// 下架
export const reqCancelSale = (skuId) => request({
  url: `/admin/product/cancelSale/${skuId}`,
  method: 'get'
})
// 查看SKU详情 
export const reqSkuInfo = (skuId) => request({
  url: `/admin/product/getSkuById/${skuId}`,
  method: 'get'
})

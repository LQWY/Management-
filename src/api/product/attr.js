// 引入axios二次封装函数
import request from "@/utils/request"

// 获取一级分类接口
// /admin/product/getCategory1 get
export const reqCategoryList1 = () => request({
  url: "/admin/product/getCategory1",
  method: "get"
})
// 获取二级分类接口
// /admin/product/getCategory2/{category1Id} get
export const reqCategoryList2 = (category1Id) => request({
  url: `/admin/product/getCategory2/${category1Id}`,
  method: "get"
})
// 获取三级级分类接口
// /admin/product/getCategory3/{category2Id} get
export const reqCategoryList3 = (category2Id) => request({
  url: `/admin/product/getCategory3/${category2Id}`,
  method: "get"
})

// 获取平台属性的接口
// /admin/product/attrInfoList/{category1Id}/{category2Id}/{category3Id} get
export const reqAttrList = (category1Id, category2Id, category3Id) => request({
  url: `/admin/product/attrInfoList/${category1Id}/${category2Id}/${category3Id}`,
  method: "get"
})

// 添加属性和属性值的接口
// /admin/product/saveAttrInfo post
// post请求一定是需要带参的
export const reqSaveAttr = (data) => request({
  url: `/admin/product/saveAttrInfo`,
  method: "post",
  data
})
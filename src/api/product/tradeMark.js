import request from "@/utils/request"

// 获取品牌列表
// /admin/product/baseTrademark/{page}/{limit} get
export const reqTradeMarkList = (page, limit) => request({ url: `/admin/product/baseTrademark/${page}/${limit}`, method: "get" })

// 新增品牌信息
// /admin/product/baseTrademark/save post请求 携带参数：品牌名称、品牌logo
// 切记：对于新增，给服务器传递数据不需要Id，id由服务器生成的
// 修改品牌信息
// /admin/product/baseTrademark/update put请求  携带餐宿：id、品牌名称、品牌logo
// 修改需要携带id，这样才能知道是修改谁
export const reqAddOrUpdateTreadeMark = (trademark) => {
  if (trademark.id) {
    // 有id，修改品牌
    return request({
      url: "/admin/product/baseTrademark/update",
      method: "put",
      data: trademark
    })
  } else {
    // 没id，新增品牌
    return request({
      url: "/admin/product/baseTrademark/save",
      method: "post",
      data: trademark
    })
  }
}

// 删除品牌
// /admin/product/baseTrademark/remove/{id} delete
export const reqDeleteTreadeMark = (id) => request.delete(`/admin/product/baseTrademark/remove/${id}`)
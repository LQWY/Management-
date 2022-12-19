<template>
  <div>
    <el-Form label-width="100px">
      <el-form-item label="SPU名称">{{ spu.spuName }}</el-form-item>
      <el-form-item label="SKU名称">
        <el-input placeholder="SKU名称" v-model="skuInfo.skuName"></el-input>
      </el-form-item>
      <el-form-item label="价格（元）"
        ><el-input
          placeholder="价格（元）"
          type="number"
          v-model="skuInfo.price"
        ></el-input
      ></el-form-item>
      <el-form-item label="重量（千克）"
        ><el-input
          placeholder="重量（千克）"
          v-model="skuInfo.weight"
        ></el-input
      ></el-form-item>
      <el-form-item label="规格描述"
        ><el-input
          placeholder="规格描述"
          type="textarea"
          rows="4"
          v-model="skuInfo.skuDesc"
        ></el-input
      ></el-form-item>
      <el-form-item label="平台属性">
        <el-form inline label-width="80px">
          <el-form-item
            :label="attr.attrName"
            v-for="attr in attrInfoList"
            :key="attr.id"
          >
            <el-select placeholder="请选择" v-model="attr.attrIdAndValueId">
              <!-- 将option中value收集的数据用v-model收集到attrInfoList身上 -->
              <el-option
                :label="attrValue.valueName"
                :value="`${attr.id}:${attrValue.id}`"
                v-for="attrValue in attr.attrValueList"
                :key="attrValue.id"
              >
              </el-option>
            </el-select>
          </el-form-item>
        </el-form>
      </el-form-item>
      <el-form-item label="销售属性">
        <el-form inline label-width="80px">
          <el-form-item
            :label="saleAttr.saleAttrName"
            v-for="saleAttr in spuSaleAttrList"
            :key="saleAttr.id"
          >
            <el-select
              placeholder="请选择"
              v-model="saleAttr.saleAttrIdAndAttrValueId"
            >
              <!-- 将option中value收集的数据用v-model收集到spuSaleAttrList身上 -->
              <el-option
                :value="`${saleAttr.id}:${saleAttrValue.id}`"
                :label="saleAttrValue.saleAttrValueName"
                v-for="saleAttrValue in saleAttr.spuSaleAttrValueList"
                :key="saleAttrValue.id"
              >
              </el-option>
            </el-select>
          </el-form-item>
        </el-form>
      </el-form-item>
      <el-form-item label="图片列表">
        <el-table
          border
          :data="spuImageList"
          @selection-change="handleSelectionChange"
        >
          <!-- 图片table的复选框 -->
          <el-table-column type="selection" width="80"> </el-table-column>
          <el-table-column label="图片">
            <template v-slot="{ row }">
              <img
                :src="row.imgUrl"
                :alt="row.imgName"
                style="width: 100px; height: 100px"
              />
            </template>
          </el-table-column>
          <el-table-column prop="imgName" label="名称"> </el-table-column>
          <el-table-column label="操作">
            <template v-slot="{ row }">
              <el-button
                type="primary"
                size="mini"
                v-if="row.isDefault == 0"
                @click="changeDefault(row)"
                >设置默认</el-button
              >
              <el-button type="success" plain size="mini" v-else
                >默认</el-button
              >
            </template>
          </el-table-column>
        </el-table>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="save">保存</el-button>
        <el-button @click="cancel">取消</el-button>
      </el-form-item>
    </el-Form>
  </div>
</template>

<script>
export default {
  name: "SkuForm",
  data() {
    return {
      // 存储spu图片
      spuImageList: [],
      // 存储spu销售属性
      spuSaleAttrList: [],
      // 存储平台属性
      attrInfoList: [],
      // 收集sku数据的字段（将来向服务器发请求的参数）
      skuInfo: {
        // 从父组件中获得的
        category3Id: "",
        spuId: "",
        tmId: "",
        // 双向绑定获得（v-model)
        skuName: "",
        price: 0,
        weight: "",
        skuDesc: "",
        // 其他操作获得
        skuDefaultImg: "",
        skuAttrValueList: [
          // {
          //   attrId: 0,
          //   attrName: "string",
          //   skuId: 0,
          //   valueId: 0,
          //   valueName: "string",
          // },
        ],
        skuSaleAttrValueList: [
          // {
          //   saleAttrId: 0,
          //   saleAttrName: "string",
          //   saleAttrValueId: 0,
          //   saleAttrValueName: "string",
          //   skuId: 0,
          //   spuId: 0,
          // },
        ],
        skuImageList: [
          // {
          //   imgName: "string",
          //   imgUrl: "string",
          //   isDefault: "string",
          //   skuId: 0,
          //   spuImgId: 0,
          // },
        ],
      },
      // 父组件带来的数据
      spu: {},
      // 暂存复选框选中的图片信息
      imgList: [],
    };
  },
  methods: {
    // 获取SkuForm的数据，由父组件调用
    async getData(category1Id, category2Id, spu) {
      // 收集父组件给的数据（将来要带给服务器的参数）
      this.skuInfo.category3Id = spu.category3Id;
      this.skuInfo.spuId = spu.id;
      this.skuInfo.tmId = spu.tmId;
      this.spu = spu;
      // 获取spu图片
      let result1 = await this.$API.sku.reqSpuImageList(spu.id);
      if (result1.code == 200) {
        let list = result1.data;
        // 服务器返回的数据没有isDefault字段，但是设置默认的时候需要
        list.forEach((item) => {
          item.isDefault = 0;
        });
        this.spuImageList = list;
      }
      // 获取spu销售属性
      let result2 = await this.$API.sku.reqSpuSaleAttrList(spu.id);
      if (result2.code == 200) {
        this.spuSaleAttrList = result2.data;
      }
      // 存储平台属性
      let result3 = await this.$API.sku.reeqAttrInfoList(
        category1Id,
        category2Id,
        spu.category3Id
      );
      if (result3.code == 200) {
        this.attrInfoList = result3.data;
      }
    },

    // 图片table复选框的回调
    handleSelectionChange(selection) {
      // selection会获取到选中复选框的数据(每一条row)【数组对象】
      this.imgList = selection;
    },

    // 利用排他设置选中默认
    changeDefault(row) {
      // 图片列表isDefault字段全部设为0
      this.spuImageList.forEach((item) => {
        item.isDefault = 0;
      });
      // 只有选中的那个的isDefault字段设为1
      row.isDefault = 1;
      // 收集默认图片的地址
      this.skuInfo.skuDefaultImg = row.imgUrl;
    },

    // 取消按钮的回调
    cancel() {
      // 切换场景，触发父组件的自定义事件
      this.$emit("changeScene2", 0);
      // 清理数据
      Object.assign(this._data, this.$options.data());
    },
    // 保存按钮的回调
    async save() {
      // 整理数据
      // 解构出来的数据只读
      // 这里前三个用的reduce和map都是返回新数组
      // skuInfo也没有直接操作，操作的是下一层结构skuInfo.xxx
      const { attrInfoList, spuSaleAttrList, imgList, skuInfo } = this;
      // 平台属性数据整理
      skuInfo.skuAttrValueList = attrInfoList.reduce((prev, item) => {
        if (item.attrIdAndValueId) {
          // split分隔出来的新数组
          const [attrId, valueId] = item.attrIdAndValueId.split(":");
          // 服务器需要的数据格式是对象，总体是数组对象
          prev.push({ attrId, valueId });
        }
        // 需要return
        return prev;
        //没有收集到id默认就是一个空数组
      }, []);
      // 销售属性数据整理
      skuInfo.skuSaleAttrValueList = spuSaleAttrList.reduce((prev, item) => {
        if (item.saleAttrIdAndAttrValueId) {
          const [saleAttrId, saleAttrValueId] =
            item.saleAttrIdAndAttrValueId.split(":");
          prev.push({ saleAttrId, saleAttrValueId });
        }
        return prev;
      }, []);
      // 图片列表数据整理
      skuInfo.skuImageList = imgList.map((item) => {
        return {
          imgName: item.imgName,
          imgUrl: item.imgUrl,
          isDefault: item.isDefault,
          spuImgId: item.id,
        };
      });
      // 发请求
      let result = await this.$API.sku.reqAddSku(skuInfo);
      console.log(result);
      if (result.code == 200) {
        this.$message({ type: "success", message: "添加SKU成功！" });
        this.$emit("changeScene2", 0);
      }
      // 清理数据
      Object.assign(this._data, this.$options.data());
    },
  },
};
</script>


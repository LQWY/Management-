<template>
  <div>
    <!-- 展示表格 -->
    <el-table :data="records" border>
      <el-table-column type="index" label="序号" width="80" align="center">
      </el-table-column>
      <el-table-column prop="skuName" label="名称" width="width">
      </el-table-column>
      <el-table-column prop="skuDesc" label="描述" width="width">
      </el-table-column>
      <!-- prop就是records.xxx,不需要展示就不用填写，或者prop="prop",不要置为空，不然row接收不到数据 -->
      <el-table-column label="默认图片" width="110">
        <template v-slot="{ row }">
          <img :src="row.skuDefaultImg" style="width: 100px; height: 100px" />
        </template>
      </el-table-column>
      <el-table-column prop="weight" label="重量" width="80"> </el-table-column>
      <el-table-column prop="price" label="价格" width="80"> </el-table-column>
      <el-table-column prop="prop" label="操作" width="width">
        <template v-slot="{ row }">
          <el-button
            type="info"
            size="mini"
            icon="el-icon-top"
            title="上架"
            v-if="row.isSale == 0"
            @click="onSale(row)"
          ></el-button>
          <el-button
            type="success"
            size="mini"
            icon="el-icon-bottom"
            title="下架"
            v-else
            @click="cancelSale(row)"
          ></el-button>
          <el-button
            type="primary"
            size="mini"
            icon="el-icon-edit"
            title="编辑"
            @click="edit"
          ></el-button>
          <el-button
            type="info"
            size="mini"
            icon="el-icon-info"
            title="查看"
            @click="getSkuInfo(row)"
          ></el-button>
          <el-button
            type="danger"
            size="mini"
            icon="el-icon-delete"
            title="删除"
          ></el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- 分页器 -->
    <el-pagination
      @size-change="sizeChange"
      @current-change="currentChange"
      :current-page.sync="page"
      :page-sizes="[3, 5, 10]"
      :page-size="limit"
      :total="total"
      layout="prev, pager, next, jumper, ->,sizes,total "
      style="text-align: center"
    >
    </el-pagination>
    <!-- 抽屉 -->
    <el-drawer :show-close="false" :visible.sync="showDrawer" size="50%">
      <el-row :gutter="10">
        <el-col :span="6"> 名称 </el-col>
        <el-col :span="16"> {{ skuInfo.skuName }} </el-col>
      </el-row>
      <el-row :gutter="10">
        <el-col :span="6"> 描述 </el-col>
        <el-col :span="16"> {{ skuInfo.skuDesc }} </el-col>
      </el-row>
      <el-row :gutter="10">
        <el-col :span="6"> 价格 </el-col>
        <el-col :span="16"> {{ skuInfo.price }} </el-col>
      </el-row>
      <el-row :gutter="10">
        <el-col :span="6"> 重量 </el-col>
        <el-col :span="16"> </el-col>
      </el-row>
      <el-row :gutter="10">
        <el-col :span="6"> 平台属性 </el-col>
        <el-col :span="16">
          <el-tag
            v-for="attr in skuInfo.skuAttrValueList"
            :key="attr.id"
            style="margin-right: 5px"
            type="success"
            size="mini"
            >{{ attr.attrName }}-{{ attr.valueName }}</el-tag
          >
        </el-col>
      </el-row>
      <el-row :gutter="10">
        <el-col :span="6"> 销售属性 </el-col>
        <el-col :span="16">
          <el-tag
            v-for="saleAttr in skuInfo.skuSaleAttrValueList"
            :key="saleAttr.id"
            style="margin-right: 5px"
            type="success"
            size="mini"
            >{{ saleAttr.saleAttrName }}-{{
              saleAttr.saleAttrValueName
            }}</el-tag
          >
        </el-col>
      </el-row>
      <el-row :gutter="10">
        <el-col :span="6"> 商品图片 </el-col>
        <el-col :span="16">
          <div class="block">
            <el-carousel trigger="click" height="200px">
              <el-carousel-item
                v-for="item in skuInfo.skuImageList"
                :key="item.id"
                style="text-align: center"
              >
                <img :src="item.imgUrl" style="width: 200px; height: 200px" />
              </el-carousel-item>
            </el-carousel></div
        ></el-col>
      </el-row>
    </el-drawer>
  </div>
</template>

<script>
export default {
  name: "Sku",
  data() {
    return {
      // 初始化数据
      page: 1,
      limit: 3,
      showDrawer: false, // 抽屉展示
      // 收集服务器返回的数据
      records: [],
      total: 0,
      skuInfo: {},
    };
  },
  mounted() {
    this.getSkuList();
  },
  methods: {
    // 获取skuList的数据
    async getSkuList() {
      // 没有的参数就在data中初始化
      const { page, limit } = this;
      let result = await this.$API.sku.reqSkuList(page, limit);
      if (result.code == 200) {
        // 存储数据
        this.total = result.data.total;
        this.records = result.data.records;
      }
    },

    // 分页器--改变当前页码
    currentChange(page) {
      this.page = page;
      // 改变页面需要发请求获取页面信息
      this.getSkuList();
    },
    // 分页器--改变展示条数
    sizeChange(size) {
      this.limit = size;
      // 改变页面需要发请求获取页面信息
      this.getSkuList();
    },

    // 上架按钮
    async onSale(row) {
      let result = await this.$API.sku.reqOnSale(row.id);
      if (result.code == 200) {
        // 服务器数据已经变更了，这里只是让按钮切换
        row.isSale = 1;
        this.$message({ type: "success", message: "上架成功" });
      }
    },
    // 下架按钮
    async cancelSale(row) {
      let result = await this.$API.sku.reqCancelSale(row.id);
      if (result.code == 200) {
        row.isSale = 0;
        this.$message({ type: "success", message: "下架成功" });
      }
    },
    // 编辑按钮
    edit() {
      this.$message("功能开发中");
    },
    // 详情按钮---获取skuInfo来展示
    async getSkuInfo(sku) {
      this.showDrawer = true;
      let result = await this.$API.sku.reqSkuInfo(sku.id);
      console.log(result);
      if (result.code == 200) {
        this.skuInfo = result.data;
      }
    },
  },
};
</script>
<style>
.el-carousel__item h3 {
  color: #475669;
  font-size: 14px;
  opacity: 0.75;
  line-height: 150px;
  margin: 0;
}

.el-carousel__item:nth-child(2n) {
  background-color: #99a9bf;
}

.el-carousel__item:nth-child(2n + 1) {
  background-color: #d3dce6;
}
.el-carousel__button {
  width: 5px;
  height: 5px;
  background: pink;
  border-radius: 50%;
}
</style>

<style scoped>
.el-row {
  font-size: 18px;
}
.el-row .el-col-6 {
  text-align: right;
}
.el-col {
  margin: 10px auto;
}
</style>
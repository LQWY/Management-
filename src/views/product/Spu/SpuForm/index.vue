<template>
  <div>
    <el-form label-width="80px" :model="spuInfo">
      <el-form-item label="SPU名称">
        <el-input placeholder="SPU名称" v-model="spuInfo.spuName"></el-input>
      </el-form-item>
      <el-form-item label="品牌">
        <el-select placeholder="请选择品牌" v-model="spuInfo.tmId">
          <el-option
            :value="tm.id"
            :label="tm.tmName"
            v-for="tm in tradeMarkList"
            :key="tm.id"
          >
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="SPU描述">
        <el-input
          type="textarea"
          placeholder="SPU描述"
          rows="4"
          v-model="spuInfo.description"
        ></el-input>
      </el-form-item>
      <el-form-item label="SPU图片">
        <!-- 
          action是上传地址，但是要注意这里需要加上baseUrl(dev-api)，之前的Url没加是因为在axios中配置过了，现在没有用axios所以只能自己加上 
          list-type="picture-card"文件列表类型：照片墙
          file-list上传的文件列表
        -->
        <el-upload
          action="/dev-api/admin/product/fileUpload"
          list-type="picture-card"
          :file-list="spuImage"
          :on-preview="handlePictureCardPreview"
          :on-remove="handleRemove"
          :on-success="handleUploadSuccess"
        >
          <i class="el-icon-plus"></i>
        </el-upload>
        <!-- .sync实现父子组件的实时同步 -->
        <!-- 这里：visible控制显示隐藏，弹框和图片同时显示和隐藏 -->
        <el-dialog :visible.sync="dialogVisible">
          <img width="100%" :src="dialogImageUrl" alt="" />
        </el-dialog>
      </el-form-item>
      <el-form-item label="销售属性">
        <el-select
          :placeholder="`还有${unSelectSaleAttr.length}个未选择`"
          v-model="attrInfo"
        >
          <!-- value是需要收集的数据
            这里用v-mode中的attrInfo收集value中的unselect.id和unselect.name-->
          <el-option
            :value="`${unselect.id}:${unselect.name}`"
            :label="unselect.name"
            v-for="unselect in unSelectSaleAttr"
            :key="unselect.id"
          >
          </el-option>
        </el-select>
        <el-button
          type="primary"
          icon="el-icon-plus"
          :disabled="!attrInfo"
          @click="addSaleAttr"
          >添加销售属性</el-button
        >
        <!-- table展示当前spu的销售属性 -->
        <el-table border :data="spuInfo.spuSaleAttrList">
          <el-table-column type="index" label="序号" width="80" align="center">
          </el-table-column>
          <el-table-column prop="saleAttrName" label="属性名" width="120">
          </el-table-column>
          <el-table-column prop="prop" label="属性值名称列表" width="width">
            <!-- row就是销售属性（spuInfo.spuSaleAttrList中对应的数组元素） -->
            <template v-slot="{ row }">
              <el-tag
                :key="tag.id"
                v-for="(tag, index) in row.spuSaleAttrValueList"
                closable
                :disable-transitions="false"
                @close="row.spuSaleAttrValueList.splice(index, 1)"
              >
                {{ tag.saleAttrValueName }}
              </el-tag>
              <!-- 将inputVisible添加到row中（row.inputVisible，数组语法：有的属性修改，没有的属性添加，row没有inputVisible，所以是添加），
                用row是为了知道切换的具体是哪一个，要不然全部添加按钮会一起切换状态 -->
              <!-- 但这里有个细节值得注意：inputVisible添加到row中，要变成响应式数据需要$set -->
              <el-input
                class="input-new-tag"
                v-if="row.inputVisible"
                v-model="row.inputValue"
                ref="saveTagInput"
                size="small"
                @keyup.enter.native="$event.target.blur"
                @blur="handleInputConfirm(row)"
              >
                <!-- 使用原来的@keyup.enter.native="handleInputConfirm(row)"有个问题，按下回车会触发两次handleInputConfirm(row) -->
              </el-input>
              <el-button
                v-else
                class="button-new-tag"
                size="small"
                icon="el-icon-plus"
                @click="addAttrValue(row)"
                >添加</el-button
              >
            </template>
          </el-table-column>
          <el-table-column prop="prop" label="操作" width="350">
            <template v-slot="{ $index }">
              <!-- 删除属性 -->
              <el-button
                type="danger"
                icon="el-icon-delete"
                size="mini"
                @click="spuInfo.spuSaleAttrList.splice($index, 1)"
              ></el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="addOrUpdateSpu">保存</el-button>
        <!-- 双引号里面不能再用双引号了 -->
        <el-button @click="cancel">取消</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
export default {
  name: "SpuForm",
  data() {
    return {
      dialogImageUrl: "",
      dialogVisible: false,
      // 收集照片墙数据
      imgList: [],
      // 存储spu信息,将来需要这里的数据给服务器
      spuInfo: {
        category3Id: 0,
        description: "",
        spuName: "",
        tmId: "",
        spuImageList: [
          // {
          //   id: 0,
          //   imgName: "string",
          //   imgUrl: "string",
          //   spuId: 0,
          // },
        ],
        spuSaleAttrList: [
          // {
          //   baseSaleAttrId: 0,
          //   id: 0,
          //   saleAttrName: "string",
          //   spuId: 0,
          //   spuSaleAttrValueList: [
          //     {
          //       baseSaleAttrId: 0,
          //       id: 0,
          //       isChecked: "string",
          //       saleAttrName: "string",
          //       saleAttrValueName: "string",
          //       spuId: 0,
          //     },
          //   ],
          // },
        ],
      },
      // 存储品牌信息
      tradeMarkList: [],
      // 存储从服务器获取的Spu图片
      spuImage: [],
      // 存储全部销售属性
      saleAttr: [],
      // 收集未选择的销售属性的信息（id和name）---将来只用在发请求之前整理参数就可以
      attrInfo: "",
    };
  },
  computed: {
    // 未选择的销售属性
    unSelectSaleAttr() {
      // 整个平台的销售属性------saleAttr一共三个：颜色、版本、尺码
      // 当前spu所拥有的销售属性spuInfo.spuSaleAttrList
      // 需要筛选出未选择的属性展示在option中
      // filter返回新数组
      let unSelectSaleAttrs = this.saleAttr.filter((item) => {
        return this.spuInfo.spuSaleAttrList.every((spuitem) => {
          return item.name != spuitem.saleAttrName;
          // 返回当前spu还没有的属性
          // item是全部平台属性中的一个
          // spuitem是当前spu所拥有的属性
        });
      });
      return unSelectSaleAttrs;
    },
  },
  methods: {
    // 删除图片的回调
    handleRemove(file, fileList) {
      // 收集删除之后剩余的图片
      this.imgList = fileList;
    },
    // 预览图片的回调
    handlePictureCardPreview(file) {
      // file是当前图片的对象，url图片地址，为了给放大图片使用
      this.dialogImageUrl = file.url;
      // 切换dialog（放大图片的容器）可见
      this.dialogVisible = true;
    },
    // 上传成功的回调
    handleUploadSuccess(response, file, fileList) {
      // 收集上传的图片
      this.imgList = fileList;
    },

    // 添加新的销售属性
    addSaleAttr() {
      // 处理已经收集到的数据,需要传递给服务器，所以字段的命名需要和服务器数据一致
      // attrInfo=[id：name]
      const [baseSaleAttrId, saleAttrName] = this.attrInfo.split(":");
      // 整理新添加的属性，格式同服务器的一致
      // 不需要inputValue和inputVisible
      let newSaleAttr = {
        baseSaleAttrId,
        saleAttrName,
        spuSaleAttrValueList: [],
      };
      // 添加新属性到最终给服务器发送的数据中
      this.spuInfo.spuSaleAttrList.push(newSaleAttr);
      // 清空数据
      this.attrInfo = "";
    },
    // 点击添加按钮------添加属性值
    addAttrValue(row) {
      // 在已有数据上新增数据需要$set变为响应式数据,不然页面不会展示
      // inpuVisible（切换input和button）
      this.$set(row, "inputVisible", true);
      // inpuValue（新增的销售属性值）
      this.$set(row, "inputValue", "");
      // 切换为input之后获取焦点
      this.$nextTick(() => {
        this.$refs.saveTagInput.focus();
      });
    },
    // input框blur和enter事件
    handleInputConfirm(row) {
      // 解构出销售属性中收集的数据
      const { baseSaleAttrId, saleAttrName, inputValue } = row;
      // 新增的销售属性值不能为空
      if (inputValue.trim() == "") {
        this.$message("属性值不能为空！");
        this.$refs.saveTagInput.focus();
        return;
      }
      // 新增的销售属性值不能重复
      // some返回布尔值
      let result = row.spuSaleAttrValueList.some(
        (item) => item.saleAttrValueName.trim() == inputValue
      );
      if (result) {
        // 如果some检测出有重复的
        this.$message("属性值不能重复！");
        // 将输入置空
        // inputValue = "";  //解构出来的数据只读，不能赋值
        row.inputValue = "";
        this.$refs.saveTagInput.focus();
        return;
      }
      // 整理新增的销售属性值
      let newSaleAttrValue = {
        baseSaleAttrId,
        saleAttrName,
        saleAttrValueName: inputValue,
      };
      // 添加
      row.spuSaleAttrValueList.push(newSaleAttrValue);
      // 切换显示为button
      row.inputVisible = false;
    },

    // 点击保存按钮
    async addOrUpdateSpu() {
      // 整理参数:照片墙的参数单独存放,现在需要整理到spuInfo中
      this.spuInfo.spuImageList = this.imgList.map((item) => {
        return {
          imgName: item.name,
          // 有response说明是刚上传的,需要服务器返回的url而不是本地的url
          // 没有response则是本来就有的(删除后剩下的),url可以直接用
          imgUrl: (item.response && item.response.data) || item.url,
        };
      });
      console.log(this.spuInfo);
      // 发请求;
      let result = await this.$API.spu.reqAddOrUpdataSpu(this.spuInfo);
      console.log(result);
      if (result.code == 200) {
        // 提示成功
        this.$message({ type: "suceess", message: "保存成功" });
        // 通知父组件返回场景0
        this.$emit("changeScene", {
          scene: 0,
          flag: this.spuInfo.id ? "修改" : "添加",
        });
        // 置空数据
        Object.assign(this._data, this.$options.data());
      }
    },
    // 点击取消按钮
    cancel() {
      // 通知父组件返回场景0
      this.$emit("changeScene", { scene: 0, flag: "" });
      // 置空数据
      // 组件实例this._data，可以操作data中的响应式数据
      // this.$options可以获取配置对象，就是现在编写在script中的内容
      // 配置对象的data()函数就是在data中配置的初始值
      // assign一合并，响应式数据就变为空
      Object.assign(this._data, this.$options.data());
    },

    // 父组件spu点击修改按钮的时候调用
    // 初始化spuForm的数据
    async initSpuForm(spu) {
      // 获取spu信息
      let spuReusult = await this.$API.spu.reqSpuInfo(spu.id);
      if (spuReusult.code == 200) {
        this.spuInfo = spuReusult.data;
      }
      // 获取spu图片
      let spuImageResult = await this.$API.spu.reqSpuImage(spu.id);
      if (spuImageResult.code == 200) {
        // this.spuImage = spuImageResult.data;
        // 需要处理服务器返回的数据
        // 和el-upload的file-list中需要的字段一致，照片墙才会正常显示
        // 即把imgName替换为name，imgUrl替换为url
        let arrList = spuImageResult.data;
        arrList.forEach((item) => {
          item.name = item.imgName;
          item.url = item.imgUrl;
        });
        this.spuImage = arrList;
      }
      // 品牌信息和销售属性
      this.initData();
      // 测试
      // console.log("spuReusult", spuReusult);
      // console.log("tradeMarkRsult", tradeMarkRsult);
      // console.log("spuImageResult", spuImageResult);
      // console.log("saleResult", saleResult);
    },
    // 父组件点击添加spu按钮时调用
    // 添加spuform
    addSpuData(category3Id) {
      // 收集三级分类id(父组件传来的)
      this.spuInfo.category3Id = category3Id;
      // 品牌信息和销售属性
      this.initData();
    },

    // 品牌信息和销售属性是添加和修改是都要获取的
    async initData() {
      // 获取品牌信息
      let tradeMarkRsult = await this.$API.spu.reqTradeMark();
      if (tradeMarkRsult.code == 200) {
        this.tradeMarkList = tradeMarkRsult.data;
      }
      // 获取销售属性----一共三个
      let saleResult = await this.$API.spu.reqSaleAttr();
      if (saleResult.code == 200) {
        this.saleAttr = saleResult.data;
      }
    },
  },
};
</script>

<style>
.el-tag + .el-tag {
  margin-left: 10px;
}
.button-new-tag {
  margin-left: 10px;
  height: 32px;
  line-height: 30px;
  padding-top: 0;
  padding-bottom: 0;
}
.input-new-tag {
  width: 90px;
  margin-left: 10px;
  vertical-align: bottom;
}
</style>


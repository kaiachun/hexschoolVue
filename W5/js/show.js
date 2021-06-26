import { createApp } from 'https://cdnjs.cloudflare.com/ajax/libs/vue/3.0.9/vue.esm-browser.js';
import pagination from './pagination.js';  // 載入分頁元件

// 接近全域變數
let productModal = {};
let delProductModal = {};

const app = createApp({
  // 基本架構
  data() {
    return {
      // 定義資料結構
      apiUrl: apiUrl ,
      apiPath: apiPath,
      products: [],  // 產品列表
      isNew: false,  // 判斷點擊的按鈕
      tempProduct: {   // 稍後調整資料使用的結構(存放新增的欄位)
        imagesUrl: [], // 修改產品的預存結構，將資料結構做額外定義以避免錯誤(第二層沒有先定義容易出錯)
      },
      // 從外層傳分頁資訊
      pagination: {}
    };
  },
  // 在根元件上做區域註冊
  components: {
    pagination
  },
  // 取得資料並抓到 DOM 元素
  mounted() {
    // 補上驗證
    // 取得 token ，並將 token 放入 headers 中
    const token = document.cookie.replace(/(?:(?:^|.*;\s*)hexToken\s*=\s*([^;]*).*$)|^.*$/, '$1');
    axios.defaults.headers.common['Authorization'] = token;

    // 建立 Bootstrap 實體
    productModal = new bootstrap.Modal(document.getElementById('productModal'));
    delProductModal = new bootstrap.Modal(document.getElementById('delProductModal'));

    this.getProducts();  // 執行取得產品列表(可能反覆運用時會放在 mounted 中)
  },

  methods: {
    getProducts(page = 1) { // 取得產品列表(無法直接在此用 axios 取資料，要代入 token 才能取到資料)
      const url = `${this.apiUrl}/api/${this.apiPath}/admin/products?page=${page}`;

      // 請求
      axios.get(url)
        .then((res) => {
          // console.log(res);  // 此時會驗證錯誤，要加入 token
          if (res.data.success) {
            this.products = res.data.products;
            this.pagination = res.data.pagination;
            // console.log(this.products);
          } else {
            toastr.error(res.data.messages);  // 代入錯誤訊息
          }
        })
        .catch((error) =>{
          toastr.error(error);
        });
    },
    openModal(type, item) {
      if(type === 'new'){  // 新增產品
        this.tempProduct ={
          // 清空暫存產品資料
          imagesUrl: []
        };
        this.isNew = true;
        productModal.show();
      } else if(type === 'edit') {
        this.tempProduct = { ...item };
        this.isNew = false;
        productModal.show();
      } else if(type === 'delete') {
        this.tempProduct = { ...item };
        delProductModal.show();
      }
    },
    
    updateProduct(tempProduct) {
      let url = `${this.apiUrl}/api/${this.apiPath}/admin/product`;
      let method = 'post';  // 預設為新增
      // 判斷是否為編輯
      if (!this.isNew) {
        url = `${this.apiUrl}/api/${this.apiPath}/admin/product/${tempProduct.id}`;
        method = 'put';
      }
      // 判斷為post 或 put
      axios[method](url, { data: tempProduct })
        .then(res => {
          if (res.data.success) {
            this.getProducts();  // 重新取得產品列表
            productModal.hide(); // 關閉 productModal
          } else {
            toastr.error(res.data.message);
          }
        })
        .catch((error)=>{
          toastr.error(error);
        });
    },
    delProduct(tempProduct){
      const url = `${this.apiUrl}/api/${this.apiPath}/admin/product/${tempProduct.id}`;
      axios.delete(url).then((res)=>{
        if(res.data.success){
          toastr.success(res);
          delProductModal.hide();
          this.getProducts();
        } else {
          toastr.error(res.data.message);
        }
      })
      .catch((error)=>{
        toastr.error(error);
      })
    }
  }
});
// 定義全域元件在 createApp 後 mount 前
// app.component('pagination', 匯出)
// 改為區域註冊

app.component('productModal', {
  template: `<div id="productModal" ref="productModal" class="modal fade" tabindex="-1" aria-labelledby="productModalLabel"
  aria-hidden="true">
  <div class="modal-dialog modal-xl">
    <div class="modal-content border-0">
      <div class="modal-header bg-dark text-white">
        <h5 id="productModalLabel" class="modal-title">
          <span v-if="isNew">新增產品</span>
          <span v-else>編輯產品</span>
        </h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>
      <div class="modal-body">
        <div class="row">
          <div class="col-sm-4">
            <div class="form-group">
              <!-- 單圖新增 -->
              <label for="imageUrl">主要圖片</label>
              <input v-model="tempProduct.imageUrl" type="text" class="form-control" placeholder="請輸入圖片連結">
              <img class="img-fluid" :src="tempProduct.imageUrl">
            </div>
            <div class="mb-1">多圖新增</div>
            <!-- 檢查是否為陣列(Array為建構函式) -->
            <div v-if="Array.isArray(tempProduct.imagesUrl)">
              <!-- 資料建構(是陣列) -->
              <div class="mb-1" v-for="(image, key) in tempProduct.imagesUrl" :key="key">
                <div class="form-group">
                  <label for="imageUrl">圖片網址</label>
                  <!-- 將資料寫入陣列內 -->
                  <input v-model="tempProduct.imagesUrl[key]" type="text" class="form-control"
                    placeholder="請輸入圖片連結">
                </div>
                <img class="img-fluid" :src="image">
              </div>
              <!-- 若是第 0 個不顯示刪除圖片按鈕，新增多個(有內容可再新增) -->
              <div v-if="!tempProduct.imagesUrl.length || tempProduct.imagesUrl[tempProduct.imagesUrl.length - 1]">
                <button class="btn btn-outline-primary btn-sm d-block w-100"
                  @click="tempProduct.imagesUrl.push('')">
                  <!-- push 新增到陣列最後一個 -->
                  新增多個圖片
                </button>
              </div>
              <!-- 刪除圖片不能在第 0 個 -->
              <div v-else>
                <button class="btn btn-outline-danger btn-sm d-block w-100" @click="tempProduct.imagesUrl.pop()">
                  <!-- pop 刪除陣列最後一個 -->
                  刪除圖片
                </button>
              </div>
            </div>
            <!-- 新增欄位(不是陣列) -->
            <div v-else>
              <button class="btn btn-outline-primary btn-sm d-block w-100" @click="createImages">
                新增圖片
              </button>
            </div>
          </div>
          <div class="col-sm-8">
            <div class="form-group">
              <label for="title">標題<b><font color="red">(必填項目)</font></b></label>
              <input id="title" v-model="tempProduct.title" type="text" class="form-control" placeholder="請輸入標題">
            </div>

            <div class="row">
              <div class="form-group col-md-6">
                <label for="category">分類<b><font color="red">(必填項目)</font></b></label>
                <input id="category" v-model="tempProduct.category" type="text" class="form-control"
                  placeholder="請輸入分類">
              </div>
              <div class="form-group col-md-6">
                <label for="price">單位<b><font color="red">(必填項目)</font></b></label>
                <input id="unit" v-model="tempProduct.unit" type="text" class="form-control" placeholder="請輸入單位">
              </div>
            </div>

            <div class="row">
              <div class="form-group col-md-6">
                <label for="origin_price">原價<b><font color="red">(必填項目)</font></b></label>
                <input id="origin_price" v-model.number="tempProduct.origin_price" type="number" min="0"
                  class="form-control" placeholder="請輸入原價">
              </div>
              <div class="form-group col-md-6">
                <label for="price">售價<b><font color="red">(必填項目)</font></b></label>
                <input id="price" v-model.number="tempProduct.price" type="number" min="0" class="form-control"
                  placeholder="請輸入售價">
              </div>
            </div>
            <hr>

            <div class="form-group">
              <label for="description">產品描述</label>
              <textarea id="description" v-model="tempProduct.description" type="text" class="form-control"
                placeholder="請輸入產品描述">
            </textarea>
            </div>
            <div class="form-group">
              <label for="content">說明內容</label>
              <textarea id="description" v-model="tempProduct.content" type="text" class="form-control"
                placeholder="請輸入說明內容">
            </textarea>
            </div>
            <div class="form-group">
              <div class="form-check">
                <input id="is_enabled" v-model="tempProduct.is_enabled" class="form-check-input" type="checkbox"
                  :true-value="1" :false-value="0">
                <label class="form-check-label" for="is_enabled">是否啟用</label>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">
          取消
        </button>
        <button type="button" class="btn btn-primary" @click="$emit('update-product',tempProduct)">
          確認
        </button>
      </div>
    </div>
  </div>
</div>`,
  props: ['tempProduct','isNew'],
  methods: {
    createImages() {
      this.tempProduct.imagesUrl = [
        ''
      ]
    },
  }
});

app.component('delProductModal', {
  template: `<div id="delProductModal" ref="delProductModal" class="modal fade" tabindex="-1"
    aria-labelledby="delProductModalLabel" aria-hidden="true">
    <div class="modal-dialog">
        <div class="modal-content border-0">
            <div class="modal-header bg-danger text-white">
                <h5 id="delProductModalLabel" class="modal-title">
                    <span>刪除產品</span>
                </h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
                是否刪除
                <strong class="text-danger">{{ tempProduct.title }}</strong> 商品(刪除後將無法恢復)。
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">
                    取消
                </button>
                <button type="button" class="btn btn-danger" @click="$emit('del-product', tempProduct)">
                    確認刪除
                </button>
            </div>
        </div>
    </div>
  </div>`,
  props: ['tempProduct', 'isNew'],
});


app.mount('#app'); // 生成位置
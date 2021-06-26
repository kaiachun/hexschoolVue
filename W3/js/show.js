// 顯示提示訊息
toastr.success('登入成功')

// 載入 Vue
import { createApp } from 'https://cdnjs.cloudflare.com/ajax/libs/vue/3.0.9/vue.esm-browser.js';

let productModal = null;
let delProductModal = null;

createApp({
  data() {  // 生成 Vue 元件
    return {
      apiUrl: apiUrl + '/api',
      apiPath: apiPath,
      products: [],
      isNew: false,
      tempProduct: {  // 暫存資料用
        imagesUrl: [],
      },
    }
  },
  // 元素掛載 (初始化)
  mounted() {
    productModal = new bootstrap.Modal(document.getElementById('productModal'), {
      keyboard: false
    });

    delProductModal = new bootstrap.Modal(document.getElementById('delProductModal'), {
      keyboard: false
    });

    // 取出 token，一進入畫面就要用取得資料
    const token = document.cookie.replace(/(?:(?:^|.*;\s*)hexToken\s*=\s*([^;]*).*$)|^.*$/, '$1');
    if (token === '') {
      alert('您尚未登入請重新登入。');
      window.location = 'login.html';
    }

    // 每次發出請求時可設定預設值，此處代入已驗證過的 token
    axios.defaults.headers.common.Authorization = token;
    this.getData();
  },
  methods: {
    // 取得產品資訊
    getData(page = 1) {
      const url = `${this.apiUrl}/${this.apiPath}/admin/products?page=${page}`;
      axios.get(url).then((response) => {
        if (response.data.success) {  // 驗證是否成功才代資料，避免錯誤(此處用 if 因後端沒有回傳狀態碼)
          this.products = response.data.products;
        } else {
          alert(response.data.message);
        }
      })
        .catch((error) => {  // 記得加上 catch 避免後端出錯
          console.log(error)
        })
    },
    // 更新產品資訊
    // 觸發 @click="updateProduct"
    updateProduct() {
      // 預設為新增(沒有代 id )
      let url = `${this.apiUrl}/${this.apiPath}/admin/product`;
      let http = 'post';

      // 依 isNew 判斷要接 post/put API
      if (!this.isNew) {
        // false 編輯狀態(代 id)
        url = `${this.apiUrl}/${this.apiPath}/admin/product/${this.tempProduct.id}`;
        http = 'put'
      }
      // POST 代入輸入的資料
      // 此處 http 為變數，要使用[]
      axios[http](url, { data: this.tempProduct })
        .then((response) => {
          // 注意非同步問題，要寫在 then 內
          if (response.data.success) {
            toastr.success(response.data.message);
            productModal.hide();  // 成功，關閉productModal
            this.getData();  // 重新渲染
          } else {
            toastr.error(response.data.message);
          }
        })
        .catch((error) => {
          console.log(error);
        })
    },
    // 打開 model 元件
    // @click="openModal('new') 新增 / @click="openModal('edit', item) 編輯 / @click="openModal('delete', item) 刪除
    openModal(isNew, item) {
      switch (isNew) {
        case 'new':
          // 使用 tempProduct 存單筆資料
          // 因使用同一個 item ，所以要先清空資料
          this.tempProduct = {
            imagesUrl: [],  // 重新定義第二層
          };
          this.isNew = true;  // 關係到 POST/PUT
          productModal.show();  // 開啟 model
          break;

        case 'edit':
          // this.tempProduct = item; 會改到原始資料
          this.tempProduct = { ...item }; // 淺拷貝
          this.isNew = false;
          productModal.show();
          break;

        case 'delete':
          // Modal 需要拿到 title 和刪除按鈕時需要獲得 id
          this.tempProduct = { ...item };
          delProductModal.show();
          break;
        default:
          break;
      }

    },
    // 刪除產品
    delProduct() {
      const url = `${this.apiUrl}/${this.apiPath}/admin/product/${this.tempProduct.id}`;

      axios.delete(url)
        .then((response) => {
          if (response.data.success) {
            toastr.success(response.data.message);
            delProductModal.hide();
            this.getData();
          } else {
            toastr.error(response.data.message);
          }
        })
        .catch((error) => {
          console.log(error);
        });
    },
    createImages() {
      this.tempProduct.imagesUrl = [];
      this.tempProduct.imagesUrl.push('');
    },
  }

}).mount('#app');







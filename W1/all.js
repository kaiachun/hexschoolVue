// 任務拆解
// 1. 取得input的值
// 2. 建立 array 存放新增產品的 input
// 3. 按下建立按鈕將 array 內的資料顯示在下方產品列表 & 可取得資料總筆數
// 4. 下方列表內各個產品項目可刪除 & 變更為啟用或未啟用
// 5. 可刪除單筆資料
// 6. 按下清除全部按鈕可刪除下方產品列表內全部項目

// 取得產品標題 title、原價 origin_price、售價 price 等 id 資料 
const productTitle = document.getElementById('title');
const productOriginPrice = document.getElementById('origin_price');
const productPrice = document.getElementById('price');
// 按鈕監聽
const addBtn = document.getElementById('addProduct');
const clearAllBtn = document.getElementById('clearAll');
const countProduct = document.getElementById('productCount');
// 顯示畫面
const productList = document.getElementById('productList');

// 按鈕事件觸發
addBtn.addEventListener('click', addProduct);  // 按下建立按鈕
clearAllBtn.addEventListener('click', delAllProductData);  // 按下清除全部


// 建立 array 存放新增的資料
let productData = [];

function addProduct() {
  if (productTitle.value =='' || productOriginPrice.value =='' || productPrice.value =='') {
    alert('請輸入資料')
  } else {
    // 取得資料並新增到 productData
    productData.push({
      // 給定一隨機數為唯一 id 值，讓單筆資料可被刪除
      id: Math.floor(Date.now()),
      title: productTitle.value,
      originPrice: productOriginPrice.value,
      price: productPrice.value,
      is_enabled: false
    })
    renderProductList(productData);

    // 清空輸入值
    productTitle.value = '';
    productOriginPrice.value = '';
    productPrice.value = '';
  }

}

// 渲染畫面
function renderProductList(data) {
  let str = '';
  data.forEach((item) => {
    str += `
    <tr>
          <td>${item.title}</th>
          <td width="120">
            ${item.originPrice}
          </td>
          <td width="120">
            ${item.price}
          </td>
          <td width="150">
            <div class="form-check form-switch">
               <input class="form-check-input" type="checkbox" id="${item.id}" ${item.is_enabled ? 'checked' : ''} 
               data-action="status" data-id="${item.id}" >
               <label class="form-check-label" for="${item.id}">${item.is_enabled ? '啟用' : '未啟用'}</label>
            </div >
          </td >
      <td width="120">
        <button type="button" class="btn btn-sm btn-outline-danger move" data-action="remove" data-id="${item.id}"> 刪除 </button>
      </td>
        </tr >
      `
  })
  productList.innerHTML = str;
  countProduct.textContent = data.length;

  console.log(productData);
}

// 偵測資料操作
function dataOperating(e) {
  const action = e.target.dataset.action;
  const id = e.target.dataset.id;
  console.log(action);

  // 刪除單筆資料
  if (action === 'remove') {
    delProduct(id);
  }
  // 變更單筆資料狀態
  if (action === 'status') {
    changeStatus(id);
  }

}
// 變更資料狀態
productList.addEventListener('click', dataOperating);

// 刪除單筆資料
function delProduct(id) {
  let index = 0;  //取得刪除第n筆
  productData.forEach((item, key) => {
    if (id == item.id) {
      index = key;
    }
  })

  productData.splice(index, 1);
  renderProductList(productData);

}

// 修改資料狀態
function changeStatus(id) {
  productData.forEach((item) => {
    if (id == item.id) {
      item.is_enabled = !item.is_enabled;
    }
    renderProductList(productData);
  })
  renderProductList(productData);
}

// 刪除全部資料
function delAllProductData(e) {
  e.preventDefault();
  productData = [];
  renderProductList(productData);
}

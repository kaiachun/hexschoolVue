// 顯示提示訊息
toastr.success('登入成功')

console.log(apiUrl);

// 調出資料
const app = {
  data: {
    products: [],
  },
  getData() {
    axios.get(`${apiUrl}/api/${apiPath}/admin/products`)
      .then(res => {
        if (res.data.success) {
          this.data.products = res.data.products;
          console.log(this.data.products);
          this.render();
        }
      }).catch((error) => {
        // 顯示錯誤訊息
        toastr.error('連線錯誤');
        console.log(error);

      })
  },
  render() {
    // 產生商品列表
    const productListDom = document.querySelector('#productList');
    let template = '';
    this.data.products.forEach((item) => {
      template = template + `
      <tr>
            <td>${item.title}</td>
            <td width="120">
              ${item.origin_price}
            </td>
            <td width="120">
            ${item.price}
            </td>
            <td width="100">
              <span class="">${item.is_enabled}</span>
            </td>
            <td width="120">
              <button type="button"  class="btn btn-sm btn-outline-danger move deleteBtn del" data-action="remove"
                data-id="${item.id}"> 刪除 </button>
            </td>
          </tr>
      `;
    });

    productListDom.innerHTML = template;

    // 取得總商品筆數
    const productCount = document.querySelector('#productCount');
    productCount.innerHTML = (this.data.products).length;


    // DOM元素在innerHTML後才生成
    const deleteBtns =
      document.querySelectorAll('.del');
    //console.log([...deleteBtns]);  //可用[...]轉成純陣列，此處不需要
    deleteBtns.forEach(btn => {
      btn.addEventListener('click', this.deleteProduct);
    })
  },
  deleteProduct(evt) {
    // // 觸發事件物件 evt (MouseEvent target dataset id)
    const id = evt.target.dataset.id;
    axios.delete(`${apiUrl}/api/${apiPath}/admin/product/${id}`)
      .then(res => {
        if (res.data.success) {
          console.log(res);
          app.getData();  //不能用this，因dom元素中指向會改變
        }else{
          toastr.error('刪除失敗');
          console.log(error);
        }

      })



  },
  init() {
    // 取回 Cookie
    const token = document.cookie.replace(/(?:(?:^|.*;\s*)hexToken\s*=\s*([^;]*).*$)|^.*$/, '$1');
    axios.defaults.headers.common['Authorization'] = token;

    this.getData();
  }
}

app.init();


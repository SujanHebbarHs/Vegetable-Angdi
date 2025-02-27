(async () => {
  try {
    const response = await fetch("/orders");
    
    if (response.ok && response != null) {
      const orders = await response.json(); // Parse the response as JSON
      orders.forEach(order => {
        if (order.status === "Pending") {
          const productId = order.productId;
          const productName = order.pName;
          const category = order.category;
          const pricePerLb = order.price;
          const imgSrc = `/Images/${order.img}`;


          // Continue with your code here
          createCard(productName, pricePerLb, imgSrc, category, productId);
          console.log("Product Name:", productName);
        }

      });



      const checkout = document.getElementById('checkout');

      checkout.addEventListener('click', async function () {
        console.log('checkout button clicked');

        const response = await fetch("/orders");

        if (response.ok && response != null) {

          const orders = await response.json(); // Parse the response as JSON

          orders.forEach(async (order) => {

            if (order.status === "Pending") {

              const quantityInput = document.getElementById(`quantity-${order.productId}`);
              let totalPrice = quantityInput.value * order.price;

              const resp = await fetch('/cart', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  productId: order.productId,
                  orderId: order._id,
                  quantity: quantityInput.value,
                  totalPrice: totalPrice,

                })
              });

            }

          });

        }

        window.location.href = "/payment";
      });

      // Adding price when page loads
      let subTotal = document.getElementById("subtotal");
      let totalPrice = document.getElementById("totalPrice");
      total = calculateTotalPrice();
      console.log("Total: " + total);
      subTotal.innerText = "$" + total;
      totalPrice.innerText = "$" + (total + 10);

    } else {
      console.error("Failed to fetch data from the server");
    }
  } catch (error) {
    console.error("An error occurred:", error);
  }
})();

let rowCount = 0;
let productsID = [];

function createCard(name, price, imgSrc, category, productId) {

  const cardTemplate = `
    <tr class="key" data-product-id="${productId}">
      <th scope="row" class="border-0">
        <div class="p-2">
          <img src="${imgSrc}" alt="" width="70" class="img-fluid rounded shadow-sm">
          <div class="ml-3 d-inline-block align-middle">
            <h5 class="mb-0">
              <a href="#" class="text-dark d-inline-block align-middle" id="productName" name="productName">${name}</a>
            </h5>
            <span class="text-muted font-weight-normal font-italic d-block" id="category" name="category">Category: ${category}</span>
          </div>
        </div>
      </th>
      <td class="border-0 align-middle" id="price" name="price"><strong>$${price}</strong></td>
      <td class="border-0 align-middle">
        <div class="input-group">
          <input type="Number" class="quantity-input px-2" id=quantity-${productId} value="1" placeholder="1" min="1" max="10" style="width: 50px; border: 1px solid black; border-radius: 4px;">
          <div class="input-group-append"></div>
      </td>
      <td class="border-0 align-middle">
        <button href="#" class="btn btn-danger delete" id="delete"><i class="bi bi-trash "></i></button>
      </td>
    </tr>
  `;
  const cartTable = document.getElementById("cartTable");
  console.log("Now again");
  cartTable.innerHTML += cardTemplate;

  productsID.push(productId);
  rowCount++;

  // Add event listener to each quantity input to recalculate total
  productsID.forEach((productId) => {
    const quantityInput = document.getElementById(`quantity-${productId}`);
    if (quantityInput) {
      quantityInput.addEventListener('change', () => {
        total = calculateTotalPrice();
        console.log("Total: " + total);
        let subTotal = document.getElementById("subtotal");
        let totalPrice = document.getElementById("totalPrice");
        subTotal.innerText = "$" + total;
        totalPrice.innerText = "$" + (total + 10);
      });
    }
  });

  total = calculateTotalPrice();
  console.log("Total" + total);

  console.log(rowCount);
  const deleteButtons = document.querySelectorAll(".delete");
  deleteButtons.forEach(async (deleteButton) => {
    deleteButton.addEventListener("click", async function () {
      
      const productKey = this.closest(".key");
      const productId = productKey.getAttribute("data-product-id");
      const response = await fetch(`/orders/${productId}`, {
        method: "DELETE",
      });
      if (response.ok) {
        const rowToRemove = document.querySelector(`tr[data-product-id="${productId}"]`)
        rowToRemove.remove();

        total = calculateTotalPrice();
      console.log("Total: " + total);
      let subTotal = document.getElementById("subtotal");
      let totalPrice = document.getElementById("totalPrice");
      subTotal.innerText = "$" + total;
      totalPrice.innerText = "$" + (total + 10);

        console.log("Deleted");
      } else {
        console.error("Failed to delete");
      }
    });
  })
}

// Define calculateTotalPrice function
const calculateTotalPrice = () => {
  let total = 0;
  productsID.forEach((productId) => {
    const quantityInput = document.getElementById(`quantity-${productId}`);
    const priceElement = document.querySelector(`tr[data-product-id="${productId}"] #price`);
    if (quantityInput) {
      const price = parseFloat(priceElement.innerText.replace(/\$/g, '').trim());
      const quantity = parseInt(quantityInput.value, 10);
      total += price * quantity;
    }
  });
  return total;
};

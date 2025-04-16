document.addEventListener("DOMContentLoaded", () => {
  // Elements
  const categoryButtons = document.querySelectorAll(".category-btn")
  const categoryItems = document.querySelectorAll(".category-items")
  const addButtons = document.querySelectorAll(".add-btn")
  const orderItems = document.getElementById("orderItems")
  const totalAmount = document.getElementById("totalAmount")
  const orderForm = document.getElementById("orderForm")
  const modal = document.getElementById("orderConfirmation")
  const closeModal = document.querySelector(".close")
  const closeModalBtn = document.getElementById("closeModal")
  const orderNumber = document.getElementById("orderNumber")
  const confirmTableNumber = document.getElementById("confirmTableNumber")

  // Cart data
  let cart = []
  let total = 0

  // Switch menu categories
  categoryButtons.forEach((button) => {
      button.addEventListener("click", function () {
          // Remove active class from all buttons
          categoryButtons.forEach((btn) => btn.classList.remove("active"))

          // Add active class to clicked button
          this.classList.add("active")

          // Hide all category items
          categoryItems.forEach((item) => (item.style.display = "none"))

          // Show the selected category items
          const category = this.getAttribute("data-category")
          document.querySelector(`.category-items[data-category="${category}"]`).style.display = "block"
      })
  })

  // Add item to cart
  addButtons.forEach((button) => {
      button.addEventListener("click", function () {
          const id = this.getAttribute("data-id")
          const name = this.getAttribute("data-name")
          const price = Number.parseFloat(this.getAttribute("data-price"))

          // Check if item already in cart
          const existingItem = cart.find((item) => item.id === id)

          if (existingItem) {
              existingItem.quantity++
          } else {
              cart.push({
                  id,
                  name,
                  price,
                  quantity: 1,
              })
          }

          updateOrderSummary()
      })
  })

  // Update order summary
  function updateOrderSummary() {
      if (cart.length === 0) {
          orderItems.innerHTML = '<p class="empty-order">No items added yet</p>'
          totalAmount.textContent = "₹ 0.00"
          return
      }

      orderItems.innerHTML = ""
      total = 0

      cart.forEach((item) => {
          const itemTotal = item.price * item.quantity
          total += itemTotal

          const orderItem = document.createElement("div")
          orderItem.className = "order-item"
          orderItem.innerHTML = `
              <span class="item-name">${item.name}</span>
              <span class="item-quantity">x${item.quantity}</span>
              <span class="item-price">₹${itemTotal.toFixed(2)}</span>
              <button type="button" class="remove-btn" data-id="${item.id}">Remove</button>
          `

          orderItems.appendChild(orderItem)
      })

      totalAmount.textContent = `₹${total.toFixed(2)}`

      // Add event listeners to remove buttons
      document.querySelectorAll(".remove-btn").forEach((button) => {
          button.addEventListener("click", function () {
              const id = this.getAttribute("data-id")
              removeItem(id)
          })
      })
  }

  // Remove item from cart
  function removeItem(id) {
      const index = cart.findIndex((item) => item.id === id)

      if (index !== -1) {
          if (cart[index].quantity > 1) {
              cart[index].quantity--
          } else {
              cart.splice(index, 1)
          }

          updateOrderSummary()
      }
  }

  // Submit order
  orderForm.addEventListener("submit", (e) => {
      e.preventDefault()

      const tableNumberInput = document.getElementById("tableNumber");
      const tableNumber = tableNumberInput ? tableNumberInput.value : null; // Get table number if it exists
      const customerName = document.getElementById("customerName").value;

      const urlParams = new URLSearchParams(window.location.search);
      const orderType = urlParams.get('order_type');

      if ((orderType !== 'takeaway' && !tableNumber) || !customerName || cart.length === 0) {
          alert("Please fill in all required fields and add at least one item to your order.");
          return;
      }

      // Generate random order number
      const orderNum = Math.floor(Math.random() * 1000) + 1000;

      // Create order object
      const order = {
          id: orderNum,
          tableNumber: orderType === 'takeaway' ? 'Takeaway' : tableNumber, // Indicate takeaway
          customerName,
          items: cart,
          total,
          status: "pending",
          timestamp: new Date().toISOString(),
          orderType: orderType || 'on_table' // Add order type to the order object
      };

      // Save order to localStorage (simulating a database)
      saveOrder(order);

      // Show confirmation modal
      orderNumber.textContent = orderNum;
      if (orderType === 'takeaway') {
          document.getElementById('confirmTableNumberLabel').style.display = 'none';
          document.getElementById('confirmTableNumber').style.display = 'none';
          document.getElementById('confirmTakeawayLabel').style.display = 'block';
      } else {
          confirmTableNumber.textContent = tableNumber;
          document.getElementById('confirmTableNumberLabel').style.display = 'block';
          document.getElementById('confirmTableNumber').style.display = 'block';
          document.getElementById('confirmTakeawayLabel').style.display = 'none';
      }
      modal.style.display = "block";

      // Reset form and cart
      orderForm.reset();
      cart = [];
      updateOrderSummary();
  });

  // Save order to localStorage
  function saveOrder(order) {
      const orders = JSON.parse(localStorage.getItem("restaurantOrders")) || []
      orders.push(order)
      localStorage.setItem("restaurantOrders", JSON.stringify(orders))
  }

  // Close modal
  closeModal.addEventListener("click", () => {
      modal.style.display = "none"
  })

  closeModalBtn.addEventListener("click", () => {
      modal.style.display = "none"
  })

  // Close modal when clicking outside
  window.addEventListener("click", (event) => {
      if (event.target === modal) {
          modal.style.display = "none"
      }
  })
})
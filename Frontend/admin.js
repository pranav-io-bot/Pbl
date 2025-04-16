document.addEventListener("DOMContentLoaded", () => {
  // Elements
  const tabButtons = document.querySelectorAll(".tab-btn")
  const orderLists = document.querySelectorAll(".order-list")
  const refreshButton = document.getElementById("refreshOrders")
  const modal = document.getElementById("orderDetails")
  const closeModal = document.querySelector(".close")

  // Order details elements
  const detailOrderNumber = document.getElementById("detailOrderNumber")
  const detailTableNumber = document.getElementById("detailTableNumber")
  const detailCustomerName = document.getElementById("detailCustomerName")
  const detailTimestamp = document.getElementById("detailTimestamp")
  const detailStatus = document.getElementById("detailStatus")
  const detailItems = document.getElementById("detailItems")
  const detailTotal = document.getElementById("detailTotal")

  // Action buttons
  const startPreparingBtn = document.getElementById("startPreparingBtn")
  const markReadyBtn = document.getElementById("markReadyBtn")
  const markDeliveredBtn = document.getElementById("markDeliveredBtn")
  const deleteOrderBtn = document.getElementById("deleteOrderBtn")

  // Current selected order
  let currentOrderId = null

  // Load orders on page load
  loadOrders()

  // Switch tabs
  tabButtons.forEach((button) => {
    button.addEventListener("click", function () {
      // Remove active class from all buttons and lists
      tabButtons.forEach((btn) => btn.classList.remove("active"))
      orderLists.forEach((list) => list.classList.remove("active"))

      // Add active class to clicked button
      this.classList.add("active")

      // Show the selected order list
      const status = this.getAttribute("data-status")
      document.getElementById(`${status}Orders`).classList.add("active")
    })
  })

  // Refresh orders
  refreshButton.addEventListener("click", loadOrders)

  // Load orders from localStorage
  function loadOrders() {
    const orders = JSON.parse(localStorage.getItem("restaurantOrders")) || []

    // Clear all order containers
    document.querySelectorAll(".orders").forEach((container) => {
      const status = container.getAttribute("data-status")
      container.innerHTML = `<p class="no-orders">No ${status} orders</p>`
    })

    if (orders.length === 0) {
      return
    }

    // Group orders by status
    const groupedOrders = {
      pending: [],
      preparing: [],
      ready: [],
      delivered: [],
    }

    orders.forEach((order) => {
      if (groupedOrders[order.status]) {
        groupedOrders[order.status].push(order)
      } else {
        groupedOrders.pending.push(order)
      }
    })

    // Render orders for each status
    for (const [status, statusOrders] of Object.entries(groupedOrders)) {
      if (statusOrders.length > 0) {
        const container = document.querySelector(`.orders[data-status="${status}"]`)
        container.innerHTML = ""

        statusOrders.forEach((order) => {
          container.appendChild(createOrderCard(order))
        })
      }
    }
  }

  // Create order card
  function createOrderCard(order) {
    const card = document.createElement("div")
    card.className = "order-card"

    // Format timestamp
    const orderDate = new Date(order.timestamp)
    const formattedDate = orderDate.toLocaleString()

    // Get first 2 items to display
    const displayItems = order.items.slice(0, 2)
    const remainingItems = order.items.length - 2

    card.innerHTML = `
            <div class="order-header">
                <span class="order-number">Order #${order.id}</span>
                <span class="order-time">${formattedDate}</span>
            </div>
            <div class="order-details">
                <p><strong>Table:</strong> ${order.tableNumber}</p>
                <p><strong>Customer:</strong> ${order.customerName}</p>
            </div>
            <div class="order-items">
                ${displayItems
                  .map(
                    (item) => `
                    <div class="order-item">
                        <span>${item.name}</span>
                        <span>x${item.quantity}</span>
                    </div>
                `,
                  )
                  .join("")}
                ${
                  remainingItems > 0
                    ? `<div class="order-item">
                    <span>+ ${remainingItems} more item${remainingItems > 1 ? "s" : ""}</span>
                </div>`
                    : ""
                }
            </div>
            <div class="order-total">
                <p>Total: ₹${order.total.toFixed(2)}</p>
            </div>
            <div class="order-actions">
                <button class="view-btn" data-id="${order.id}">View Details</button>
            </div>
        `

    // Add event listener to view button
    card.querySelector(".view-btn").addEventListener("click", function () {
      const orderId = this.getAttribute("data-id")
      showOrderDetails(orderId)
    })

    return card
  }

  // Show order details
  function showOrderDetails(orderId) {
    const orders = JSON.parse(localStorage.getItem("restaurantOrders")) || []
    const order = orders.find((o) => o.id == orderId)

    if (!order) {
      alert("Order not found")
      return
    }

    currentOrderId = orderId

    // Format timestamp
    const orderDate = new Date(order.timestamp)
    const formattedDate = orderDate.toLocaleString()

    // Set order details
    detailOrderNumber.textContent = order.id
    detailTableNumber.textContent = order.tableNumber
    detailCustomerName.textContent = order.customerName
    detailTimestamp.textContent = formattedDate
    detailStatus.textContent = capitalizeFirstLetter(order.status)

    // Set order items
    detailItems.innerHTML = ""
    order.items.forEach((item) => {
      const itemElement = document.createElement("div")
      itemElement.className = "detail-item"
      itemElement.innerHTML = `
                <span>${item.name} x${item.quantity}</span>
                <span>₹${(item.price * item.quantity).toFixed(2)}</span>
            `
      detailItems.appendChild(itemElement)
    })

    // Set total
    detailTotal.textContent = `$${order.total.toFixed(2)}`

    // Show/hide action buttons based on status
    startPreparingBtn.style.display = order.status === "pending" ? "block" : "none"
    markReadyBtn.style.display = order.status === "preparing" ? "block" : "none"
    markDeliveredBtn.style.display = order.status === "ready" ? "block" : "none"

    // Show modal
    modal.style.display = "block"
  }

  // Capitalize first letter
  function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1)
  }

  // Close modal
  closeModal.addEventListener("click", () => {
    modal.style.display = "none"
    currentOrderId = null
  })

  // Close modal when clicking outside
  window.addEventListener("click", (event) => {
    if (event.target === modal) {
      modal.style.display = "none"
      currentOrderId = null
    }
  })

  // Action buttons event listeners
  startPreparingBtn.addEventListener("click", () => {
    updateOrderStatus("preparing")
  })

  markReadyBtn.addEventListener("click", () => {
    updateOrderStatus("ready")
  })

  markDeliveredBtn.addEventListener("click", () => {
    updateOrderStatus("delivered")
  })

  deleteOrderBtn.addEventListener("click", () => {
    deleteOrder()
  })

  // Update order status
  function updateOrderStatus(newStatus) {
    if (!currentOrderId) return

    const orders = JSON.parse(localStorage.getItem("restaurantOrders")) || []
    const orderIndex = orders.findIndex((o) => o.id == currentOrderId)

    if (orderIndex === -1) {
      alert("Order not found")
      return
    }

    orders[orderIndex].status = newStatus
    localStorage.setItem("restaurantOrders", JSON.stringify(orders))

    // Close modal and refresh orders
    modal.style.display = "none"
    currentOrderId = null
    loadOrders()
  }

  // Delete order
  function deleteOrder() {
    if (!currentOrderId) return

    if (!confirm("Are you sure you want to delete this order?")) {
      return
    }

    const orders = JSON.parse(localStorage.getItem("restaurantOrders")) || []
    const updatedOrders = orders.filter((o) => o.id != currentOrderId)

    localStorage.setItem("restaurantOrders", JSON.stringify(updatedOrders))

    // Close modal and refresh orders
    modal.style.display = "none"
    currentOrderId = null
    loadOrders()
  }
})


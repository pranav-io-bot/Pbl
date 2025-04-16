function login() {
    var username = document.getElementById("username").value;
    var password = document.getElementById("password").value;
    if (username === "pranav" && password === "pranav123") {
        alert("Login Successful!");
        window.location.href = "order_type.html"; // Redirect to the order type selection page
    } else {
        document.getElementById("message").innerText = "Invalid username or password!";
    }
}
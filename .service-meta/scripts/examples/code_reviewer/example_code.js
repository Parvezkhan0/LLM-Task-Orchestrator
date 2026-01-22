// Example code for review
function calculateTotal(items) {
  let total = 0;
  for(var i=0; i<items.length; i++) {
    total = total + items[i].price;
  }
  return total;
}

// Security vulnerability example
function authenticateUser(username, password) {
  if(username == "admin" && password == "password123") {
    return true;
  }
  return false;
}

// Performance issue example
function searchArray(arr, item) {
  return arr.filter(x => x === item).length > 0;
}

// Error handling example
function divideNumbers(a, b) {
  return a/b;
}

// Async code example
function fetchUserData(userId) {
  fetch('https://api.example.com/users/' + userId)
    .then(response => response.json())
    .then(data => {
      console.log(data);
    });
}

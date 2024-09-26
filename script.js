import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-app.js";
import {
  getDatabase,
  ref,
  get,
  update,
  remove,
  set,
  child,
} from "https://www.gstatic.com/firebasejs/10.13.1/firebase-database.js";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAPw2XrDvYMu49IiWJmEEUFL6O2Zb2kyIg",
  authDomain: "clinic-inventory-e77e6.firebaseapp.com",
  databaseURL: "https://clinic-inventory-e77e6-default-rtdb.firebaseio.com",
  projectId: "clinic-inventory-e77e6",
  storageBucket: "clinic-inventory-e77e6.appspot.com",
  messagingSenderId: "28860646838",
  appId: "1:28860646838:web:200b70eba27855ca712d17",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// Hardcoded login credentials
const hardcodedUser1 = "1";
const hardcodedPassword1 = "1";
const hardcodedUser2 = "2";
const hardcodedPassword2 = "2";
const hardcodedUser3 = "3";
const hardcodedPassword3 = "3";

// Dark Mode Toggle
function toggleDarkMode() {
  document.body.classList.toggle("dark-mode");
}

function setButtonLoading(button, isLoading) {
  if (!button) {
    console.error("Button element not found");
    return;
  }

  if (isLoading) {
    button.classList.add("loading");
    button.disabled = true;
  } else {
    button.classList.remove("loading");
    button.disabled = false;
  }
}

// Login function
function login() {
  const userId = document.getElementById("userId").value;
  const password = document.getElementById("password").value;
  const loginError = document.getElementById("loginError");
  const loginButton = document.querySelector('button[onclick="login()"]');

  // Add loading state to login button
  setButtonLoading(loginButton, true);

  setTimeout(() => {
    // Check for User 1 (Submit only)
    if (userId === hardcodedUser1 && password === hardcodedPassword1) {
      document.getElementById("loginSection").style.display = "none";
      document.getElementById("userSection").style.display = "block";
      loginError.textContent = "";
    } else if (userId === hardcodedUser3 && password === hardcodedPassword3) {
      window.location.href = "user-view.html";
    } // Check for User 2 (Admin)
    else if (userId === hardcodedUser2 && password === hardcodedPassword2) {
      document.getElementById("loginSection").style.display = "none";
      document.getElementById("adminSection").style.display = "block";
      loginError.textContent = "";
      fetchClinicData(); // Fetch and display clinic data for admin
      fetchPendingRequests();
      fetchApprovedItems(); // Fetch pending requests for approval
    } else {
      loginError.textContent = "Invalid login credentials. Please try again.";
    }
    // Remove loading state after processing
    setButtonLoading(loginButton, false);
  }, 1000); // Simulate server delay for demonstration
}
// Fetch all clinics for User 2 (Admin) and populate the dropdown
function fetchClinicData() {
  const clinicTableBody = document
    .getElementById("clinicTable")
    .querySelector("tbody");
  const furnitureSelect = document.getElementById("adminFurniture");
  const clinicDropdown = document.getElementById("adminClinic");
  const dbRef = ref(database);

  // Clear previous data
  clinicTableBody.innerHTML = "";
  furnitureSelect.innerHTML = "";
  clinicDropdown.innerHTML = ""; // Clear clinic dropdown

  // Fetch all clinics from Firebase
  get(child(dbRef, "clinics"))
    .then((snapshot) => {
      if (snapshot.exists()) {
        const clinicsData = snapshot.val();

        // Populate the clinic dropdown with all available clinics from Firebase
        for (let clinic in clinicsData) {
          let option = document.createElement("option");
          option.value = clinic;
          option.textContent = clinic;
          clinicDropdown.appendChild(option);
        }

        // Fetch and display data for the first clinic in the dropdown by default
        if (clinicDropdown.options.length > 0) {
          fetchClinicInventory(clinicDropdown.value); // Fetch inventory for default selected clinic
        }
      } else {
        console.log("No clinics found in Firebase.");
      }
    })
    .catch((error) => {
      console.error("Error fetching clinics: ", error);
    });
  // In the fetchClinicData function, after populating the dropdown
  clinicDropdown.addEventListener("change", function () {
    fetchClinicInventory(this.value); // Fetch inventory for the selected clinic
  });
}

// Fetch pending requests for User 2 (Admin)
function fetchPendingRequests() {
  const pendingTableBody = document
    .getElementById("pendingRequestsTable")
    .querySelector("tbody");
  const dbRef = ref(database, "pendingRequests");

  // Clear previous pending requests
  pendingTableBody.innerHTML = "";

  // Fetch all pending requests from Firebase
  get(dbRef)
    .then((snapshot) => {
      if (snapshot.exists()) {
        let data = snapshot.val();

        // Iterate over the pending requests
        for (let requestId in data) {
          const request = data[requestId];
          let row = `
            <tr>
              <td>${request.clinic}</td>
              <td>${request.furniture}</td>
              <td>${request.quantity}</td>
              <td>
                <button class="approve" onclick="approveRequest('${requestId}', '${request.clinic}', '${request.furniture}', ${request.quantity})">Approve</button>
                <button class="reject" onclick="rejectRequest('${requestId}')">Reject</button>
              </td>
            </tr>
          `;
          pendingTableBody.innerHTML += row;
        }
      } else {
        console.log("No pending requests found.");
        pendingTableBody.innerHTML =
          "<tr><td colspan='4'>No pending requests.</td></tr>";
      }
    })
    .catch((error) => {
      console.error("Error fetching pending requests: ", error);
    });
}

function fetchApprovedItems() {
  const approvedTableBody = document
    .getElementById("approvedItemsTable")
    .querySelector("tbody");
  const dbRef = ref(database, "approvedItems");

  approvedTableBody.innerHTML = "";

  get(dbRef)
    .then((snapshot) => {
      if (snapshot.exists()) {
        let data = snapshot.val();
        for (let itemId in data) {
          const item = data[itemId];
          let commentsHtml = "";

          if (item.comments && item.comments.length > 0) {
            item.comments.forEach((comment, index) => {
              commentsHtml += `
                <div class="comment">
                  <p class="comment-text" id="comment-text-${itemId}-${index}">${comment}</p>
                  <textarea class="comment-edit" id="comment-edit-${itemId}-${index}" style="display:none;">${comment}</textarea>
                  <button onclick="toggleCommentEdit('${itemId}', ${index})" id="edit-btn-${itemId}-${index}">Edit</button>
                  <button onclick="saveComment('${itemId}', ${index})" id="save-btn-${itemId}-${index}" style="display:none;">Save</button>
                </div>
              `;
            });
          }

          commentsHtml += `
            <div class="new-comment">
              <textarea class="comment-edit" id="comment-edit-${itemId}-new"></textarea>
              <button onclick="addNewComment('${itemId}')" id="add-btn-${itemId}">Add Comment</button>
            </div>
          `;

          let row = `
            <tr>
              <td>${item.clinic}</td>
              <td>${item.furniture}</td>
              <td>
                <span id="quantity-display-${itemId}">${item.quantity}</span>
                <input type="number" id="quantity-edit-${itemId}" value="${
            item.quantity
          }" style="display:none;">
                <button onclick="toggleQuantityEdit('${itemId}')" id="edit-quantity-btn-${itemId}">Edit</button>
                <button onclick="saveQuantity('${itemId}')" id="save-quantity-btn-${itemId}" style="display:none;">Save</button>
              </td>
              <td>${new Date(item.approvalDate).toLocaleDateString()}</td>
              <td>
                <div class="comment-section">
                  ${commentsHtml}
                </div>
              </td>
              <td>
                <button class="approve" onclick="approveSending('${itemId}', '${
            item.clinic
          }', '${item.furniture}', ${item.quantity})">Send</button>
                <button class="reject" onclick="rejectSending('${itemId}')">Reject</button>
              </td>
            </tr>
          `;
          approvedTableBody.innerHTML += row;
        }
      } else {
        approvedTableBody.innerHTML =
          "<tr><td colspan='6'>No approved items waiting to be sent.</td></tr>";
      }
    })
    .catch((error) => {
      console.error("Error fetching approved items: ", error);
    });
}

function toggleQuantityEdit(itemId) {
  const quantityDisplay = document.getElementById(`quantity-display-${itemId}`);
  const quantityEdit = document.getElementById(`quantity-edit-${itemId}`);
  const editButton = document.getElementById(`edit-quantity-btn-${itemId}`);
  const saveButton = document.getElementById(`save-quantity-btn-${itemId}`);

  quantityDisplay.style.display = "none";
  quantityEdit.style.display = "inline";
  editButton.style.display = "none";
  saveButton.style.display = "inline";
}

function saveQuantity(itemId) {
  const quantityDisplay = document.getElementById(`quantity-display-${itemId}`);
  const quantityEdit = document.getElementById(`quantity-edit-${itemId}`);
  const editButton = document.getElementById(`edit-quantity-btn-${itemId}`);
  const saveButton = document.getElementById(`save-quantity-btn-${itemId}`);

  const newQuantity = parseInt(quantityEdit.value);
  if (isNaN(newQuantity) || newQuantity < 1) {
    alert("Please enter a valid quantity (a positive number).");
    return;
  }

  const quantityRef = ref(database, `approvedItems/${itemId}/quantity`);

  set(quantityRef, newQuantity)
    .then(() => {
      quantityDisplay.textContent = newQuantity;
      quantityDisplay.style.display = "inline";
      quantityEdit.style.display = "none";
      editButton.style.display = "inline";
      saveButton.style.display = "none";
      alert("Quantity updated successfully.");
    })
    .catch((error) => {
      console.error("Error updating quantity: ", error);
      alert("Failed to update quantity. Please try again.");
    });
}

function toggleCommentEdit(itemId, index) {
  const commentText = document.getElementById(
    `comment-text-${itemId}-${index}`
  );
  const commentEdit = document.getElementById(
    `comment-edit-${itemId}-${index}`
  );
  const editButton = document.getElementById(`edit-btn-${itemId}-${index}`);
  const saveButton = document.getElementById(`save-btn-${itemId}-${index}`);

  if (commentText && commentEdit && editButton && saveButton) {
    commentText.style.display = "none";
    commentEdit.style.display = "block";
    editButton.style.display = "none";
    saveButton.style.display = "inline-block";
  } else {
    console.error("One or more elements not found for toggling comment edit");
  }
}

function addNewComment(itemId) {
  const commentTextarea = document.getElementById(`comment-edit-${itemId}-new`);
  if (!commentTextarea) {
    console.error(`Textarea not found for item ${itemId}`);
    return;
  }

  const commentText = commentTextarea.value.trim();
  if (!commentText) {
    alert("Please enter a comment before adding.");
    return;
  }

  const commentRef = ref(database, `approvedItems/${itemId}/comments`);

  get(commentRef).then((snapshot) => {
    let comments = snapshot.val() || [];
    comments.push(commentText);

    set(commentRef, comments)
      .then(() => {
        alert("Comment added successfully.");
        fetchApprovedItems(); // Refresh the list to show the new comment
      })
      .catch((error) => {
        console.error("Error adding new comment: ", error);
        alert("Failed to add comment. Please try again.");
      });
  });
}

function saveComment(itemId, index) {
  const commentText = document.getElementById(
    `comment-text-${itemId}-${index}`
  );
  const commentEdit = document.getElementById(
    `comment-edit-${itemId}-${index}`
  );
  const editButton = document.getElementById(`edit-btn-${itemId}-${index}`);
  const saveButton = document.getElementById(`save-btn-${itemId}-${index}`);

  if (!commentText || !commentEdit || !editButton || !saveButton) {
    console.error("One or more elements not found for saving comment");
    return;
  }

  const commentValue = commentEdit.value.trim();
  const commentRef = ref(database, `approvedItems/${itemId}/comments/${index}`);

  set(commentRef, commentValue)
    .then(() => {
      commentText.textContent = commentValue;
      commentText.style.display = "block";
      commentEdit.style.display = "none";
      editButton.style.display = "inline-block";
      saveButton.style.display = "none";
      alert("Comment updated successfully.");
    })
    .catch((error) => {
      console.error("Error updating comment: ", error);
      alert("Failed to update comment. Please try again.");
    });
}

function saveNewComment(itemId) {
  const newCommentEdit = document.getElementById(`comment-edit-${itemId}-new`);
  const addButton = document.getElementById(`add-btn-${itemId}`);
  const saveNewButton = document.getElementById(`save-new-btn-${itemId}`);

  const commentValue = newCommentEdit.value.trim();
  if (!commentValue) {
    alert("Please enter a comment before saving.");
    return;
  }

  const commentRef = ref(database, `approvedItems/${itemId}/comments`);

  get(commentRef).then((snapshot) => {
    let comments = snapshot.val() || [];
    comments.push(commentValue);

    set(commentRef, comments)
      .then(() => {
        newCommentEdit.value = "";
        newCommentEdit.style.display = "none";
        addButton.style.display = "inline-block";
        saveNewButton.style.display = "none";
        alert("New comment added successfully.");
        fetchApprovedItems(); // Refresh the list to show the new comment
      })
      .catch((error) => {
        console.error("Error adding new comment: ", error);
        alert("Failed to add new comment. Please try again.");
      });
  });
}
// Fetch and display the selected clinic's inventory - UPDATED FUNCTION
// Modify fetchClinicInventory to use the new refreshClinicTable function
function fetchClinicInventory(clinic) {
  const clinicNameElement = document.getElementById("clinic-name");
  const clinicTableBody = document
    .getElementById("clinicTable")
    .querySelector("tbody");
  const adminFurnitureSelect = document.getElementById("adminFurniture");
  const dbRef = ref(database);

  // Update the clinic name in the heading
  clinicNameElement.textContent = clinic;

  get(child(dbRef, "clinics/" + clinic))
    .then((snapshot) => {
      if (snapshot.exists()) {
        let data = snapshot.val();
        clinicTableBody.innerHTML = ""; // Clear the table
        adminFurnitureSelect.innerHTML = ""; // Clear the dropdown

        // Add a default option to the dropdown
        let defaultOption = document.createElement("option");
        defaultOption.value = "";
        defaultOption.textContent = "Select an asset";
        adminFurnitureSelect.appendChild(defaultOption);

        // Populate the table and dropdown with the clinic's inventory data
        for (let item in data) {
          let quantity = data[item]?.quantity || "N/A";

          // Add to table
          let row = `<tr><td data-item="${item}">${item}</td><td>${quantity}</td></tr>`;
          clinicTableBody.innerHTML += row;

          // Add to dropdown
          let option = document.createElement("option");
          option.value = item;
          option.textContent = item;
          adminFurnitureSelect.appendChild(option);
        }
      } else {
        clinicTableBody.innerHTML =
          "<tr><td colspan='2'>No data available for this clinic.</td></tr>";
        adminFurnitureSelect.innerHTML =
          "<option value=''>No assets available</option>";
      }
    })
    .catch((error) => {
      console.error("Error fetching clinic data: ", error);
    });
}

// Add event listener to update quantity when asset is selected
document
  .getElementById("adminFurniture")
  .addEventListener("change", function () {
    const clinic = document.getElementById("adminClinic").value;
    const selectedAsset = this.value;
    const quantityInput = document.getElementById("adminQuantity");

    if (selectedAsset) {
      const assetRef = ref(database, `clinics/${clinic}/${selectedAsset}`);
      get(assetRef)
        .then((snapshot) => {
          if (snapshot.exists()) {
            const data = snapshot.val();
            quantityInput.value = data.quantity || "";
          } else {
            quantityInput.value = "";
          }
        })
        .catch((error) => {
          console.error("Error fetching asset data: ", error);
        });
    } else {
      quantityInput.value = "";
    }
  });
function refreshClinicTable(clinic) {
  const clinicTableBody = document
    .getElementById("clinicTable")
    .querySelector("tbody");
  const dbRef = ref(database);

  get(child(dbRef, "clinics/" + clinic))
    .then((snapshot) => {
      if (snapshot.exists()) {
        let data = snapshot.val();
        clinicTableBody.innerHTML = ""; // Clear the table

        // Repopulate the table with updated data
        for (let item in data) {
          let quantity = data[item]?.quantity || "N/A";
          let row = `<tr><td data-item="${item}">${item}</td><td>${quantity}</td></tr>`;
          clinicTableBody.innerHTML += row;
        }
      } else {
        clinicTableBody.innerHTML =
          "<tr><td colspan='2'>No data available for this clinic.</td></tr>";
      }
    })
    .catch((error) => {
      console.error("Error refreshing clinic data: ", error);
    });
}

function approveRequest(requestId, clinic, furniture, quantity) {
  const requestRef = ref(database, "pendingRequests/" + requestId);
  const approvedRef = ref(database, "approvedItems/" + requestId);

  // Move the request to approvedItems
  get(requestRef).then((snapshot) => {
    if (snapshot.exists()) {
      const requestData = snapshot.val();
      requestData.approvalDate = new Date().toISOString();

      set(approvedRef, requestData)
        .then(() => {
          // Remove the request from pendingRequests after approval
          remove(requestRef).then(() => {
            alert(
              "Request approved and moved to 'Approved Items Waiting to be Sent'."
            );
            fetchPendingRequests(); // Refresh the pending requests list
            fetchApprovedItems(); // Refresh the approved items list
          });
        })
        .catch((error) => {
          console.error("Error approving request: ", error);
        });
    }
  });
}

// Update approveSending function to use the current quantity
function approveSending(itemId, clinic, furniture) {
  const approvedRef = ref(database, "approvedItems/" + itemId);
  const inventoryRef = ref(database, "clinics/" + clinic + "/" + furniture);

  // First, get the item details including quantity and comments
  get(approvedRef).then((snapshot) => {
    if (snapshot.exists()) {
      const approvedItem = snapshot.val();
      const quantity = approvedItem.quantity;
      const comments = approvedItem.comments || [];

      // Add the item to the clinic's inventory
      get(inventoryRef).then((snapshot) => {
        let existingQuantity = snapshot.val()?.quantity || 0;
        let newQuantity = parseInt(existingQuantity) + parseInt(quantity);

        set(inventoryRef, { quantity: newQuantity, comments: comments })
          .then(() => {
            // Remove the item from approvedItems after sending
            remove(approvedRef).then(() => {
              alert(
                "Item approved for sending and added to the clinic inventory."
              );
              fetchApprovedItems(); // Refresh the approved items list
              refreshClinicTable(clinic); // Refresh the clinic inventory table
            });
          })
          .catch((error) => {
            console.error("Error approving sending: ", error);
          });
      });
    }
  });
}

function rejectSending(itemId) {
  const approvedRef = ref(database, "approvedItems/" + itemId);

  // Remove the item from approvedItems
  remove(approvedRef)
    .then(() => {
      alert("Item rejected for sending and removed from approved items.");
      fetchApprovedItems(); // Refresh the approved items list
    })
    .catch((error) => {
      console.error("Error rejecting sending: ", error);
    });
}

// Reject a request (Remove from pending requests)
function rejectRequest(requestId) {
  const requestRef = ref(database, "pendingRequests/" + requestId);

  // Remove the request from pendingRequests
  remove(requestRef)
    .then(() => {
      alert("Request rejected and removed from pending requests.");
      fetchPendingRequests(); // Refresh the pending requests list
    })
    .catch((error) => {
      console.error("Error rejecting request: ", error);
    });
}

// Add item for User 1 (Submit only)
function addItem() {
  const clinic = document.getElementById("userClinic").value;
  const furniture = document.getElementById("furniture").value;
  const quantity = document.getElementById("quantity").value;
  const addButton = document.querySelector('button[onclick="addItem()"]');

  // Ensure fields are filled
  if (!furniture || !quantity) {
    alert("Please fill in both the furniture item and quantity.");
    return;
  }

  // Add loading state to the button
  setButtonLoading(addButton, true);

  // Create a unique ID for the request
  const requestId = new Date().getTime(); // Unique ID based on timestamp

  // Reference to the Firebase pendingRequests database
  const pendingRef = ref(database, "pendingRequests/" + requestId);

  // Set the request in Firebase pendingRequests
  set(pendingRef, {
    clinic: clinic,
    furniture: furniture,
    quantity: quantity,
    requestId: requestId,
    status: "pending", // Status of the request is initially "pending"
  })
    .then(() => {
      alert("Request submitted successfully. Awaiting approval from Admin.");
      // Clear form fields after successful submission
      document.getElementById("furniture").value = "";
      document.getElementById("quantity").value = "";
    })
    .catch((error) => {
      console.error("Error submitting request: ", error);
    })
    .finally(() => {
      // Remove loading state after completion
      setButtonLoading(addButton, false);
    });
}

function adminUpdateData() {
  const clinic = document.getElementById("adminClinic").value;
  const furniture = document.getElementById("adminFurniture").value;
  const quantity = document.getElementById("adminQuantity").value;
  const updateButton = document.querySelector(
    'button[onclick="confirmUpdate()"]'
  );

  if (!updateButton) {
    console.error("Update button not found");
    return;
  }

  if (!furniture || !quantity) {
    alert("Please select an item and provide a quantity.");
    return;
  }

  setButtonLoading(updateButton, true);

  const inventoryRef = ref(database, "clinics/" + clinic + "/" + furniture);
  update(inventoryRef, { quantity: quantity })
    .then(() => {
      alert("Data updated successfully.");
      fetchClinicInventory(clinic); // Refresh the entire table and dropdown
    })
    .catch((error) => {
      console.error("Error updating data: ", error);
      alert("An error occurred while updating the data. Please try again.");
    })
    .finally(() => {
      setButtonLoading(updateButton, false);
    });
}

function adminDeleteData() {
  const clinic = document.getElementById("adminClinic").value;
  const furniture = document.getElementById("adminFurniture").value;
  const deleteButton = document.querySelector(
    'button[onclick="confirmDelete()"]'
  );

  // Add loading state to delete button
  setButtonLoading(deleteButton, true);

  const inventoryRef = ref(database, "clinics/" + clinic + "/" + furniture);
  remove(inventoryRef)
    .then(() => {
      alert("Item deleted successfully.");
      fetchClinicInventory(clinic); // Refresh data display and dropdown
    })
    .catch((error) => {
      console.error("Error deleting data: ", error);
    })
    .finally(() => {
      // Remove loading state after processing
      setButtonLoading(deleteButton, false);
    });
}

function adminAddData() {
  const clinic = document.getElementById("adminClinic").value;
  const newFurniture = document.getElementById("newFurniture").value;
  const newQuantity = document.getElementById("newQuantity").value;
  const addButton = document.querySelector('button[onclick="adminAddData()"]');

  // Input validation
  if (!newFurniture || !newQuantity) {
    alert("Please fill in both the furniture item and quantity.");
    return;
  }

  // Add loading state to add button
  setButtonLoading(addButton, true);

  const inventoryRef = ref(database, "clinics/" + clinic + "/" + newFurniture);
  set(inventoryRef, { quantity: newQuantity })
    .then(() => {
      alert("New item added successfully.");
      fetchClinicInventory(clinic); // Refresh data display
    })
    .catch((error) => {
      console.error("Error adding new item: ", error);
    })
    .finally(() => {
      setButtonLoading(addButton, false);
    });
}

function convertToClinicCSV(data, clinicName) {
  let csvContent = "Clinic,Item,Quantity\n";

  for (let item in data) {
    let quantity = data[item]?.quantity || "N/A";
    csvContent += `${clinicName},${item},${quantity}\n`;
  }

  return csvContent;
}

function downloadCurrentClinic() {
  const clinic = document.getElementById("adminClinic").value;
  const dbRef = ref(database);

  get(child(dbRef, "clinics/" + clinic))
    .then((snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const csvContent =
          "data:text/csv;charset=utf-8," + convertToClinicCSV(data, clinic);
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", clinic + "_inventory.csv");
        document.body.appendChild(link);
        link.click();
      }
    })
    .catch((error) => {
      console.error("Error downloading data: ", error);
    });
}

// Function to toggle collapsible sections
function toggleSection(button) {
  const section = button.parentElement.nextElementSibling;
  section.classList.toggle("show");

  // Change arrow direction
  if (section.classList.contains("show")) {
    button.textContent = "⮟";
  } else {
    button.textContent = "⮝";
  }
}

function confirmUpdate() {
  const clinic = document.getElementById("adminClinic").value;
  const furniture = document.getElementById("adminFurniture").value;
  const quantity = document.getElementById("adminQuantity").value;

  if (!furniture || !quantity) {
    alert("Please select an item and provide a quantity.");
    return;
  }

  if (
    confirm(
      `Are you sure you want to update ${furniture} to ${quantity} in ${clinic}?`
    )
  ) {
    adminUpdateData();
  }
}

function confirmDelete() {
  const clinic = document.getElementById("adminClinic").value;
  const furniture = document.getElementById("adminFurniture").value;

  if (!furniture) {
    alert("Please select an item to delete.");
    return;
  }

  if (confirm(`Are you sure you want to delete ${furniture} from ${clinic}?`)) {
    adminDeleteData();
  }
}
// Exported window functions
window.toggleDarkMode = toggleDarkMode;
window.login = login;
window.fetchClinicData = fetchClinicData;
window.fetchPendingRequests = fetchPendingRequests;
window.approveRequest = approveRequest;
window.rejectRequest = rejectRequest;
window.adminUpdateData = adminUpdateData;
window.adminDeleteData = adminDeleteData;
window.adminAddData = adminAddData;
window.downloadCurrentClinic = downloadCurrentClinic;
window.addItem = addItem;
window.fetchClinicInventory = fetchClinicInventory;
window.toggleSection = toggleSection;
window.confirmUpdate = confirmUpdate;
window.confirmDelete = confirmDelete;
window.refreshClinicTable = refreshClinicTable;
window.fetchApprovedItems = fetchApprovedItems;
window.approveSending = approveSending;
window.rejectSending = rejectSending;
window.saveComment = saveComment;
window.toggleCommentEdit = toggleCommentEdit;

window.saveNewComment = saveNewComment;
window.addNewComment = addNewComment;
window.toggleQuantityEdit = toggleQuantityEdit;
window.saveQuantity = saveQuantity;
window.toggleCommentEdit = toggleCommentEdit;

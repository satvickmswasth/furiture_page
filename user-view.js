import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-app.js";
import {
  getDatabase,
  ref,
  get,
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

function userFetchClinicData() {
  const clinicDropdown = document.getElementById("userViewClinic");
  const dbRef = ref(database);

  get(child(dbRef, "clinics"))
    .then((snapshot) => {
      if (snapshot.exists()) {
        const clinicsData = snapshot.val();
        for (let clinic in clinicsData) {
          let option = document.createElement("option");
          option.value = clinic;
          option.textContent = clinic;
          clinicDropdown.appendChild(option);
        }
        if (clinicDropdown.options.length > 0) {
          userFetchClinicInventory(clinicDropdown.value);
        }
      } else {
        console.log("No clinics found in Firebase.");
      }
    })
    .catch((error) => {
      console.error("Error fetching clinics: ", error);
    });
}

function userFetchClinicInventory(clinic) {
  const clinicNameElement = document.getElementById("clinic-name");
  const clinicTableBody = document
    .getElementById("clinicTable")
    .querySelector("tbody");
  const dbRef = ref(database);

  clinicNameElement.textContent = clinic;
  clinicTableBody.innerHTML = "";

  get(child(dbRef, "clinics/" + clinic))
    .then((snapshot) => {
      if (snapshot.exists()) {
        let data = snapshot.val();
        for (let item in data) {
          let quantity = data[item]?.quantity || "N/A";
          let row = `<tr><td>${item}</td><td>${quantity}</td></tr>`;
          clinicTableBody.innerHTML += row;
        }
      } else {
        clinicTableBody.innerHTML =
          "<tr><td colspan='2'>No data available for this clinic.</td></tr>";
      }
    })
    .catch((error) => {
      console.error("Error fetching clinic data: ", error);
    });
}

function userFetchPendingRequests() {
  const pendingTableBody = document
    .getElementById("pendingRequestsTable")
    .querySelector("tbody");
  const dbRef = ref(database, "pendingRequests");

  pendingTableBody.innerHTML = "";

  get(dbRef)
    .then((snapshot) => {
      if (snapshot.exists()) {
        let data = snapshot.val();
        for (let requestId in data) {
          const request = data[requestId];
          let row = `
            <tr>
              <td>${request.clinic}</td>
              <td>${request.furniture}</td>
              <td>${request.quantity}</td>
              <td>Pending</td>
            </tr>
          `;
          pendingTableBody.innerHTML += row;
        }
      } else {
        pendingTableBody.innerHTML =
          "<tr><td colspan='4'>No pending requests.</td></tr>";
      }
    })
    .catch((error) => {
      console.error("Error fetching pending requests: ", error);
    });
}

function userFetchApprovedItems() {
  const approvedTableBody = document.getElementById("approvedItemsTable").querySelector("tbody");
  const dbRef = ref(database, "approvedItems");

  approvedTableBody.innerHTML = "";

  get(dbRef)
    .then((snapshot) => {
      if (snapshot.exists()) {
        let data = snapshot.val();
        let uniqueItems = new Set();
        for (let itemId in data) {
          const item = data[itemId];
          const itemKey = `${item.clinic}-${item.furniture}-${item.quantity}-${item.approvalDate}`;
          if (uniqueItems.has(itemKey)) continue;
          uniqueItems.add(itemKey);

          let commentsHtml = '';
          
          if (item.comments && item.comments.length > 0) {
            commentsHtml += '<ul class="comment-list">';
            item.comments.forEach((comment, index) => {
              commentsHtml += `
                <li class="comment">
                  <p class="comment-text">${comment}</p>
                </li>
              `;
            });
            commentsHtml += '</ul>';
          }
          
          commentsHtml += `
            <div class="new-comment">
              <textarea class="comment-edit" id="comment-edit-${itemId}-new" placeholder="Add a new comment"></textarea>
              <button onclick="userAddNewComment('${itemId}')">Add Comment</button>
            </div>
          `;

          let row = `
            <tr>
              <td>${item.clinic}</td>
              <td>${item.furniture}</td>
              <td>${item.quantity}</td>
              <td>${new Date(item.approvalDate).toLocaleDateString()}</td>
              <td>Pending</td>
              <td>
                <div class="comment-section">
                  ${commentsHtml}
                </div>
              </td>
            </tr>
          `;
          approvedTableBody.innerHTML += row;
        }
      } else {
        approvedTableBody.innerHTML = "<tr><td colspan='6'>No approved items waiting to be sent.</td></tr>";
      }
    })
    .catch((error) => {
      console.error("Error fetching approved items: ", error);
    });
}

function userAddNewComment(itemId) {
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
        userFetchApprovedItems(); // Refresh the list to show the new comment
      })
      .catch((error) => {
        console.error("Error adding new comment: ", error);
        alert("Failed to add comment. Please try again.");
      });
  });
}

function userToggleSection(button) {
  const section = button.parentElement.nextElementSibling;
  section.classList.toggle("show");
  button.textContent = section.classList.contains("show") ? "⮟" : "⮝";
}

function userChangeLanguage(lang) {
  // Implement language change logic here
  console.log("Language changed to:", lang);
}

function userToggleDarkMode() {
  document.body.classList.toggle("dark-mode");
}

function userSearchInInventory() {
  const input = document.getElementById("searchInventory");
  const filter = input.value.toUpperCase();
  const table = document.getElementById("clinicTable");
  const tr = table.getElementsByTagName("tr");

  for (let i = 1; i < tr.length; i++) {
    const td = tr[i].getElementsByTagName("td")[0];
    if (td) {
      const txtValue = td.textContent || td.innerText;
      if (txtValue.toUpperCase().indexOf(filter) > -1) {
        tr[i].style.display = "";
      } else {
        tr[i].style.display = "none";
      }
    }
  }
}

function userFilterClinics() {
  const input = document.querySelector("#clinicIdSearch5");
  const filter = input.value.trim().toUpperCase();
  const select = document.querySelector("#userViewClinic");
  const options = select.getElementsByTagName("option");
  let foundCount = 0;

  for (let i = 0; i < options.length; i++) {
    const txtValue = (options[i].textContent || options[i].innerText).toUpperCase();
    if (filter === "" || txtValue.indexOf(filter) > -1) {
      options[i].style.display = "";
      foundCount++;
    } else {
      options[i].style.display = "none";
    }
  }

  const maxSize = 5;
  select.size = foundCount > maxSize ? maxSize : foundCount;
  if (foundCount === 1) {
    select.size = 2;
  }
}

function userUpdateClinicSearch() {
  const select = document.querySelector("#userViewClinic");
  const selectedClinicId = select.value;
  document.getElementById("clinicIdSearch5").value = selectedClinicId;
  select.size = 1; // Set the size to 1 to close the dropdown
}

// Initialize the page
document.addEventListener("DOMContentLoaded", function() {
  userFetchClinicData();
  userFetchPendingRequests();
  userFetchApprovedItems();

  const searchInput = document.getElementById("clinicIdSearch5");
  if (searchInput) {
    searchInput.addEventListener("input", userFilterClinics);
  }

  const select = document.querySelector("#userViewClinic");
  if (select) {
    select.addEventListener("change", userUpdateClinicSearch);
  }
});
// Function to set up event listeners
function setupEventListeners() {
  const adminFurnitureSelect = document.getElementById("adminFurniture");
  if (adminFurnitureSelect) {
    adminFurnitureSelect.addEventListener("change", function() {
      const clinic = document.getElementById("adminClinic").value;
      const selectedAsset = this.value;
      const quantityInput = document.getElementById("adminQuantity");

      if (selectedAsset) {
        const assetRef = ref(database, `clinics/${clinic}/${selectedAsset}`);
        get(assetRef).then((snapshot) => {
          if (snapshot.exists()) {
            const data = snapshot.val();
            quantityInput.value = data.quantity || "";
          } else {
            quantityInput.value = "";
          }
        }).catch((error) => {
          console.error("Error fetching asset data: ", error);
        });
      } else {
        quantityInput.value = "";
      }
    });
  } else {
    console.warn("Admin furniture select element not found");
  }
}

// Export functions for use in HTML
window.userFetchClinicInventory = userFetchClinicInventory;
window.userSearchInInventory = userSearchInInventory;
window.userToggleSection = userToggleSection;
window.userChangeLanguage = userChangeLanguage;
window.userToggleDarkMode = userToggleDarkMode;
window.userAddNewComment = userAddNewComment;
window.userFilterClinics = userFilterClinics;
window.userUpdateClinicSearch = userUpdateClinicSearch;
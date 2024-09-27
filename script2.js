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

// Load environment variables
require('dotenv').config();

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.FIREBASE_DATABASE_URL,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// Function to fetch clinics and download each clinic as a separate CSV in a zip file
function downloadClinicsAsZip() {
  const dbRef = ref(database, 'clinics');

  // Fetch clinic data
  get(dbRef)
    .then((snapshot) => {
      if (snapshot.exists()) {
        const clinicsData = snapshot.val();
        const zip = new JSZip(); // Create a new zip file instance

        // Loop through each clinic
        for (let clinic in clinicsData) {
          let csvContent = "Furniture,Quantity\n"; // CSV header for each clinic

          // Loop through each furniture in the clinic and append to CSV content
          for (let furniture in clinicsData[clinic]) {
            let quantity = clinicsData[clinic][furniture].quantity || "N/A";
            csvContent += `${furniture},${quantity}\n`;
          }

          // Add clinic's CSV data to the zip file
          zip.file(`${clinic}_data.csv`, csvContent);
        }

        // Generate the zip file and trigger download
        zip.generateAsync({ type: "blob" }).then((content) => {
          const link = document.createElement("a");
          link.href = URL.createObjectURL(content);
          link.download = "clinics_data.zip";
          link.click();
        });
      } else {
        console.log("No clinics found in Firebase.");
      }
    })
    .catch((error) => {
      console.error("Error fetching clinics: ", error);
    });
}

function filterClinicIds() {
  const input = document.querySelector("#clinicIdSearch");
  const filter = input.value.trim().toUpperCase();
  const select = document.querySelector("#adminClinic");
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

document.addEventListener("DOMContentLoaded", function () {
  const searchInput = document.getElementById("clinicIdSearch");
  searchInput.addEventListener("input", filterClinicIds);

  const select = document.querySelector("#adminClinic");
  select.addEventListener("change", updateClinicSearchField);
});

function updateClinicSearchField() {
  const select = document.querySelector("#adminClinic");
  const selectedClinicId = select.value;
  document.getElementById("clinicIdSearch").value = selectedClinicId;
  select.size = 1; // Set the size to 1 to close the dropdown
}

function filterClinicIds2() {
  const input = document.querySelector("#clinicIdSearch2");
  const filter = input.value.trim().toUpperCase();
  const select = document.querySelector("#userClinic");
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

document.addEventListener("DOMContentLoaded", function () {
  const searchInput = document.getElementById("clinicIdSearch2");
  searchInput.addEventListener("input", filterClinicIds2);

  const select = document.querySelector("#userClinic");
  select.addEventListener("change", updateClinicSearchField2);
});

function updateClinicSearchField2() {
  const select = document.querySelector("#userClinic");
  const selectedClinicId = select.value;
  document.getElementById("clinicIdSearch2").value = selectedClinicId;
  select.size = 1; // Set the size to 1 to close the dropdown
}

function searchInInventory() {
  const input = document.getElementById('searchInventory');
  const filter = input.value.toUpperCase();
  const table = document.getElementById('clinicTable');
  const tr = table.getElementsByTagName('tr');

  for (let i = 0; i < tr.length; i++) {
    const td = tr[i].getElementsByTagName('td')[0];
    if (td) {
      const txtValue = td.textContent || td.innerText;
      if (txtValue.toUpperCase().indexOf(filter) > -1) {
        tr[i].style.display = '';
      } else {
        tr[i].style.display = 'none';
      }
    }
  }
}

// Make sure this function is accessible globally
window.searchInInventory = searchInInventory;

// Add button to download clinics as a zip file
document.getElementById("downloadClinicsButton").addEventListener("click", downloadClinicsAsZip);

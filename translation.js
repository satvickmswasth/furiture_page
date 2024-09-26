// Language translations object
const translations = {
    en: {
      login: "Login",
      submitFurniture: "Submit Furniture Data",
      selectClinic: "Select Clinic:",
      furnitureItem: "Furniture Item:",
      quantity: "Quantity:",
      addItem: "Add Item",
      viewUpdateClinics: "Admin - View and Update Clinics",
      clinicInventory: "Clinic Inventory",
      searchInventory: "Search Inventory:",
      prevPage: "Previous",
      nextPage: "Next",
      downloadClinic: "Download Current Clinic",
      modifyItem: "Modify Existing Item",
      updateItem: "Update",
      deleteItem: "Delete",
      addNewItem: "Add New Item",
      footerText: "Made with ♥ by M-Swasth Team",
    },
    hi: {
      login: "लॉग इन करें",
      submitFurniture: "फर्नीचर डेटा जमा करें",
      selectClinic: "क्लिनिक का चयन करें:",
      furnitureItem: "फर्नीचर का आइटम:",
      quantity: "मात्रा:",
      addItem: "आइटम जोड़ें",
      viewUpdateClinics: "प्रशासन - क्लिनिक देखें और अपडेट करें",
      clinicInventory: "क्लिनिक सूची",
      searchInventory: "इन्वेंट्री खोजें:",
      prevPage: "पिछला",
      nextPage: "अगला",
      downloadClinic: "वर्तमान क्लिनिक डाउनलोड करें",
      modifyItem: "मौजूदा आइटम संशोधित करें",
      updateItem: "अपडेट करें",
      deleteItem: "हटाएं",
      addNewItem: "नया आइटम जोड़ें",
      footerText: "♥ द्वारा बनाया गया M-Swasth टीम",
    },
    bn: {
      login: "লগ ইন করুন",
      submitFurniture: "আসবাবপত্র ডেটা জমা দিন",
      selectClinic: "ক্লিনিক নির্বাচন করুন:",
      furnitureItem: "আসবাবপত্র আইটেম:",
      quantity: "পরিমাণ:",
      addItem: "আইটেম যোগ করুন",
      viewUpdateClinics: "অ্যাডমিন - ক্লিনিক দেখুন এবং আপডেট করুন",
      clinicInventory: "ক্লিনিক ইনভেন্টরি",
      searchInventory: "ইনভেন্টরি অনুসন্ধান করুন:",
      prevPage: "পূর্ববর্তী",
      nextPage: "পরবর্তী",
      downloadClinic: "বর্তমান ক্লিনিক ডাউনলোড করুন",
      modifyItem: "বিদ্যমান আইটেম সংশোধন করুন",
      updateItem: "আপডেট করুন",
      deleteItem: "মুছে ফেলুন",
      addNewItem: "নতুন আইটেম যোগ করুন",
      footerText: "♥ দ্বারা তৈরি M-Swasth দল",
    },
  };
  
  // Function to change language
  function changeLanguage(lang) {
    document.querySelectorAll("[data-lang]").forEach((element) => {
      const key = element.getAttribute("data-lang");
      element.textContent = translations[lang][key] || element.textContent;
    });
  }
  window.changeLanguage = changeLanguage;
  let currentPage = 1;
  const rowsPerPage = 5; // You can adjust this number as needed
  
  function showPage(page) {
    const table = document.getElementById('clinicTable');
    const rows = table.getElementsByTagName('tr');
    const startIndex = (page - 1) * rowsPerPage + 1; // +1 to skip the header row
    const endIndex = startIndex + rowsPerPage;
  
    for (let i = 1; i < rows.length; i++) {
      if (i >= startIndex && i < endIndex) {
        rows[i].style.display = '';
      } else {
        rows[i].style.display = 'none';
      }
    }
  
    document.getElementById('pageIndicator').textContent = `Page ${page}`;
  }
  
  function previousPage() {
    if (currentPage > 1) {
      currentPage--;
      showPage(currentPage);
    }
  }
  
  function nextPage() {
    const table = document.getElementById('clinicTable');
    const rows = table.getElementsByTagName('tr');
    const maxPage = Math.ceil((rows.length - 1) / rowsPerPage);
  
    if (currentPage < maxPage) {
      currentPage++;
      showPage(currentPage);
    }
  }
  
  // Make sure these functions are accessible globally
  window.previousPage = previousPage;
  window.nextPage = nextPage;
  
  // Initial page load
  showPage(currentPage);
    
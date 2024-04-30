const books = [];
const RENDER_EVENT = "render_book";
const SAVED_EVENT = "saved_book";
const STORAGE_KEY = "BOOK_APPS2";

// Fungsi Megenerate ID //
function generateId() {
  return +new Date();
}

// Fungsi mengumpulkan buku yang akan disimpan kedalam localStorage //
function generateBookObject(id, title, author, year, isComplete) {
  return {
    id,
    title,
    author,
    year,
    isComplete,
  };
}

// Cari buku berdasarkan title buku //

// Sebuah fungsi untuk memastikan storage tersedia //
function isStorageExist() {
  if (typeof Storage == undefined) {
    alert("browser kamu tidak mendukung local Storage");
    return false;
  } else {
    return true;
  }
}

// Sebuah fungsi untuk menyimpan data buku yang telah dibuat //
function saveData() {
  if (isStorageExist()) {
    const parsed = JSON.stringify(books);
    localStorage.setItem(STORAGE_KEY, parsed);
    document.dispatchEvent(new Event(SAVED_EVENT));
  }
}

// Sebuah fungsi untuk meload data buku yang tersimpan didalam storage //
function loadDataFromStorage() {
  const serializedData = localStorage.getItem(STORAGE_KEY);
  let data = JSON.parse(serializedData);

  if (data !== null) {
    for (const book of data) {
      books.push(book);
    }
  }
  document.dispatchEvent(new Event(RENDER_EVENT));
}

function dateToNumber(date) {
  const dateObject = new Date(date);
  const parseYear = JSON.parse(dateObject.getFullYear());
  return parseYear;
}

document.addEventListener("DOMContentLoaded", function () {
  const submitFormBook = document.getElementById("form-book");
  submitFormBook.addEventListener("submit", function (event) {
    event.preventDefault();
    addBook();
    closeModal();
    resetForm();
  });

  if (isStorageExist()) {
    loadDataFromStorage();
  }
});

function resetForm() {
  document.getElementById("title").value = "";
  document.getElementById("author").value = "";
  document.getElementById("date").value = "";
}

function addBook() {
  const title = document.getElementById("title").value;
  const author = document.getElementById("author").value;
  const date = document.getElementById("date").value;
  const formattedDate = dateToNumber(date);

  const existingBook = books.find((book) => book.title === title && book.author === author && book.year === formattedDate);

  if (existingBook) {
    alert("Buku dengan judul, pengarang, dan tahun yang sama sudah ada dalam daftar.");
    resetForm();
    return;
  }

  const generateID = generateId();
  const bookObject = generateBookObject(generateID, title, author, formattedDate, false);
  books.push(bookObject);
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function makeBook(bookObject) {
  const { id, title, author, year, isComplete } = bookObject;

  const judulBuku = document.createElement("h4");
  judulBuku.classList.add("card-title");
  judulBuku.innerText = title;

  const namaPenulis = document.createElement("p");
  namaPenulis.classList.add("card-author");
  namaPenulis.innerText = author;

  const tanggal = document.createElement("h6");
  tanggal.innerText = year;

  const infoWrapper = document.createElement("div");
  infoWrapper.classList.add("bookInfo");
  infoWrapper.append(judulBuku, namaPenulis, tanggal);

  const barInfo = document.createElement("div");
  barInfo.classList.add("infoBar");

  const imgItem = document.createElement("img");
  const randomImg = Math.floor(Math.random() * 5) + 1;
  imgItem.src = `./images/bookFace/${randomImg}.jpg`;
  imgItem.alt = `${randomImg}.jpg`;

  const deleteWrapper = document.createElement("div");
  deleteWrapper.classList.add("deleteBtn");

  const imgDelete = document.createElement("img");
  imgDelete.src = `./images/close.png`;
  deleteWrapper.appendChild(imgDelete);

  imgDelete.addEventListener("click", function () {
    removeBookFromCompleted(id);
  });

  const cardWrapper = document.createElement("div");
  cardWrapper.classList.add("card");
  cardWrapper.dataset.aos = "fade-up";

  const bookActionWrapper = document.createElement("div");
  bookActionWrapper.classList.add("bookAction");

  const btnDone = document.createElement("button");
  btnDone.classList.add("bookBtn");
  btnDone.innerText = "Done";
  btnDone.addEventListener("click", function () {
    addBookToCompleted(id);
  });

  const btnUndo = document.createElement("button");
  btnUndo.classList.add("undoBtn");
  btnUndo.innerText = "Undo";
  btnUndo.addEventListener("click", function () {
    undoBookFromCompleted(id);
  });

  if (!isComplete) {
    bookActionWrapper.appendChild(btnDone);
  } else {
    bookActionWrapper.appendChild(btnUndo);
  }

  barInfo.appendChild(infoWrapper);
  barInfo.appendChild(bookActionWrapper);

  cardWrapper.appendChild(deleteWrapper);
  cardWrapper.appendChild(imgItem);
  cardWrapper.appendChild(barInfo);

  return cardWrapper;
}

// Fungsi untuk menutup modal
function showModal() {
  const formAdd = document.querySelector(".add-book");
  const overlay = document.querySelector(".overlay");

  overlay.classList.remove("hidden");
  formAdd.classList.remove("hidden");
}

function closeModal() {
  const formAdd = document.querySelector(".add-book");
  const overlay = document.querySelector(".overlay");
  resetForm();
  overlay.classList.add("hidden");
  formAdd.classList.add("hidden");
}

function addBookToCompleted(bookId) {
  const bookTarget = findBook(bookId);
  if (bookTarget == null) return;

  bookTarget.isComplete = true;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}
// Function menghapus buku //

function removeBookFromCompleted(bookId) {
  const bookTarget = findBookIndex(bookId);

  if (bookTarget === -1) return;
  books.splice(bookTarget, 1);
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function findBookIndex(bookId) {
  for (const index in books) {
    if (books[index].id === bookId) {
      return index;
    }
  }
  return -1;
}

function findBook(bookId) {
  for (const bookItem of books) {
    if (bookItem.id === bookId) {
      return bookItem;
    }
  }
  return null;
}

function undoBookFromCompleted(bookId) {
  const bookTarget = findBook(bookId);
  if (bookTarget == null) return;

  bookTarget.isComplete = false;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

document.addEventListener(RENDER_EVENT, function () {
  const unFinished = document.getElementsByClassName("card-wrapper-unFinished")[0];
  const finished = document.getElementsByClassName("card-wrapper-finished")[0];

  unFinished.innerHTML = "";
  finished.innerHTML = "";

  const addedBooks = new Set();

  for (const bookItem of books) {
    const bookElement = makeBook(bookItem);
    if (bookItem.isComplete && !addedBooks.has(bookItem.id)) {
      finished.appendChild(bookElement);
      addedBooks.add(bookItem.id);
    } else if (!bookItem.isComplete) {
      unFinished.appendChild(bookElement);
    }
  }
});

const searchInput = document.querySelector(".cariInput");
searchInput.addEventListener("input", (e) => {
  const containerBuku = document.querySelectorAll(".card");
  const judulBuku = document.querySelectorAll(".card-title");
  const penulis = document.querySelectorAll(".card-author");
  const value = e.target.value.toLowerCase();

  for (let i = 0; i < containerBuku.length; i++) {
    let isVisible = judulBuku[i].innerText.toLowerCase().includes(value) || penulis[i].innerText.toLowerCase().includes(value);
    containerBuku[i].classList.toggle("hidden", !isVisible);
  }
});

let myLibrary = readStorage() || [];
const CARD = document.querySelector('.card-content');
const FORM = document.querySelector('.add-book-form');
const LIST = document.querySelector('.list-container');

window.addEventListener('load', function (e) {
	if (!localStorage.getItem("LIBRARY")) {
		let firstBook = new Book('Marijn Haverbeke', '448', 'Read', 'Eloquent JavaScript');
		myLibrary.push(firstBook);
		render();
		save();
		displayAll();
	} else if (localStorage.getItem("LIBRARY")) {
		render();
		displayAll();
	}	
})

function readStorage() {
	if(!localStorage.getItem("LIBRARY")) return false
	if(JSON.parse(localStorage.getItem("LIBRARY")).length == 0) return false;
	let currentStorage = JSON.parse(localStorage.getItem("LIBRARY")).map(object => {
		const {author, pages, status, title, id} = object;
		const book = new Book(author, pages, status, title, id);
		return book;
	});
	return currentStorage;
}

function generateId() {
	if (localStorage.getItem("LIBRARY") === null || undefined) return 1;
	if (JSON.parse(localStorage.getItem("LIBRARY")).length === 0) return 1;
	const bookList = JSON.parse(localStorage.getItem("LIBRARY"));
	const  lastBook = bookList[bookList.length -1];
	const id = parseInt(lastBook.id) + 1;
	return id;
}

function save() {
	localStorage.setItem("LIBRARY", JSON.stringify(myLibrary));
}

function displayAll() {
	myLibrary.forEach(book => {
		document.querySelector('.book-list').appendChild(createBook(book));
	})
}

function addBook(book) {
	document.querySelector('.book-list').appendChild(createBook(book));
}

function Book(author, pages, status, title, id) {
	this.author = author;
	this.pages = pages;
	this.status = status;
	this.title = title;
	this.id = id || generateId();
};

Book.prototype.toggleStatus = function() {
	if (this.status == "Read") return this.status = "Not Read";
	return this.status = "Read";
};

function render() {
	const list = document.querySelector('.rendered-list');
	list.innerHTML = "";
	myLibrary.forEach(book => {
		const element = document.createElement('li');
		element.innerText = `${book.title}`;
		list.appendChild(element);
	});
}

function createBook(book) {
	const div = document.createElement('div');
	div.classList.add('book');
	[div.dataset.author,
	 div.dataset.pages,
	 div.dataset.status,
	 div.dataset.title,
	 div.dataset.id] = Object.values(book);
	const info = bookInfo(book);
	const footer = bookFooter(book.status);
	div.appendChild(info);
	div.appendChild(footer);
	return div;
}

function bookInfo(book) {
	const div = document.createElement('div');
	div.classList.add('info')
	div.innerHTML = `
		<div>
			<p>Title</p>
			<p>${book.title}</p>
		</div>
		<div>
			<p>Author</p>
			<p>${book.author}</p>
		</div>
		<div>
			<p>Pages</p>
			<p>${book.pages}</p>
		</div>
	`;
	return div;
}

function bookFooter(status) {
	const div = document.createElement('div');
	div.classList.add('footer');
	if (status == 'Read') {
	  div.innerHTML = `
		  <a class="btn status-btn read" href="#">Read</a>
		  <a class="btn delete-btn" href="#"><i class="icon fas fa-trash-alt"></i></a> `;
	  return div
	}
	div.innerHTML = `
		<a class="btn status-btn not-read" href="#">Not Read</a>
		<a class="btn delete-btn" href="#"><i class="icon fas fa-trash-alt"></i></a>`;
	return div;
}

function _delete(book) {
	book.remove();
	removeItem(parseInt(book.dataset.id));
}

function removeItem (id) {
	myLibrary = myLibrary.filter(book => book.id !== id);
}

function show(element) {
	element.style.display = 'flex';
}

function hide (element) {
	element.style.display = 'none';
}

function isEmptyString (element) {
	return element === '';
}

function toggleStatusBtn(button) {
	if (button.classList.contains('read')) {
		button.classList.replace('read', 'not-read');
		button.innerText = 'Not Read';
	} else if (button.classList.contains('not-read')) {
		button.classList.replace('not-read', 'read');
		button.innerText = 'Read';
	}
}

CARD.addEventListener('click', function(e) {
	if(e.target.classList.contains('add-book-btn')) {
		show(FORM);
		hide(LIST);	
	}
})

FORM.addEventListener('submit', function(e) {
	e.preventDefault();
	const title = document.querySelector('.title').value;
	const author = document.querySelector('.author').value;
	const pages = document.querySelector('.pages').value;
	const status = document.querySelector('.status').value;
	if ([title, author, pages].some(isEmptyString)) {
		return alert('Missing Fields');
	};
	const book = new Book(author, pages, status, title);
	myLibrary.push(book);
	addBook(book);
	FORM.reset();
	show(LIST);
	hide(FORM);
	save();	
	render();
}) 

document.querySelector('.go-back-btn').addEventListener('click', function(e) {
	FORM.reset();
	show(LIST);
	hide(FORM);	
})

document.querySelector('.book-list').addEventListener('click', function(e) {
	e.preventDefault();
	if (e.target.classList.contains('delete-btn')) {
		const book = e.target.parentElement.parentElement;
		_delete(book);
		save();
		render();
	} else if (e.target.classList.contains('icon')) {
		const book = e.target.parentElement.parentElement.parentElement;
		_delete(book);
		save(); 
		render();
	} else if (e.target.classList.contains('status-btn')) {
		const book = e.target.parentElement.parentElement;
		const id = parseInt(book.dataset.id);
		myLibrary.forEach(book => {
			if (book.id === id) {
				book.toggleStatus();
			}
		})
		save();
  		toggleStatusBtn(e.target);
	}
})

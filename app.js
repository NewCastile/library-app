const cardContent = document.querySelector('.card-content');
const forms = document.querySelectorAll('.add-book-form');
const bookList = document.querySelector('.book-list');
const bookItems = document.querySelector('.rendered-list');
const goBackButtons = document.querySelectorAll('.go-back-btn');
const overlay = document.querySelector('.bg-overlay');

window.addEventListener('load', function (e) {
	if (!sessionStorage.getItem("LIBRARY")) {
		let firstBook = new Book('Eloquent JavaScript', 'Marijn Haverbeke', '448', 'Read');
		myLibrary.push(firstBook);
		render();
		save();
	} else if (sessionStorage.getItem("LIBRARY")) {
		render();
	}	
})

function readStorage() {
	if(!sessionStorage.getItem("LIBRARY")) return false
	if(JSON.parse(sessionStorage.getItem("LIBRARY")).length == 0) return false;
	let currentStorage = JSON.parse(sessionStorage.getItem("LIBRARY")).map(object => {
		const {title, author, pages, status, id} = object;
		const book = new Book(title, author, pages, status, id);
		return book;
	});
	return currentStorage;
}

function save() {
	sessionStorage.setItem("LIBRARY", JSON.stringify(myLibrary));
}

function render() {
    let bookElement = new BookElement()
	bookList.innerHTML = "";
	bookItems.innerHTML = "";
	myLibrary.forEach(book => {
		bookList.appendChild(bookElement.create(book));
		bookElement.createItem(book)
	})
}

class Book {
	constructor(title, author, pages, status, id) {
		this.author = author;
		this.pages = pages;
		this.status = status;
		this.title = title;
		this.id = id || this.generateId();
	}
	generateId() {
		if (sessionStorage.getItem("LIBRARY") === null || undefined) return 1;
		if (JSON.parse(sessionStorage.getItem("LIBRARY")).length === 0) return 1;
		const bookList = JSON.parse(sessionStorage.getItem("LIBRARY"));
		const  lastBook = bookList[bookList.length -1];
		const id = parseInt(lastBook.id) + 1;
		return id;
	}
	toggleStatus() {
		if (this.status == "Read") return this.status = "Not Read";
		return this.status = "Read";
	}
}

class Display {
    show(element) {
        element.style.display = "flex";
    }
    hide(element) {
        element.style.display = "none";
    }
    close(formElement) {
        formElement.reset();
        this.hide(formElement);
        if (formElement.classList.contains('pop-up-form')) return overlay.classList.toggle('active');
        this.show(bookItems.parentElement);
    }
}


class BookElement {
    create(book) { 
        const div = document.createElement('div');
        div.classList.add('book');
        [div.dataset.title, 
            div.dataset.author,
            div.dataset.pages,
            div.dataset.status,
            div.dataset.id] = Object.values(book);
        const info = this.bookInfo(book);
        const footer = this.bookFooter(book.status);
        div.appendChild(info);
        div.appendChild(footer);
        return div;
    }
    createItem(book) {	
        const item = document.createElement('li');
        item.innerText = `${book.title}`;
        bookItems.appendChild(item);
    }
    $delete(book) {
        book.remove();
	    this.deleteItem(parseInt(book.dataset.id));
    }
    deleteItem(id) {
        bookItems.innerHTML = "";
        myLibrary = myLibrary.filter(book => book.id !== id);
        myLibrary.forEach(book => {
            this.createItem(book)
        })
    }
    bookInfo(book) {
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
    bookFooter(status) {
        const div = document.createElement('div');
        div.classList.add('footer');
        if (status == 'Read') {
            div.innerHTML = `
            <button class="btn status-btn read">Read</button>
            <button class="btn delete-btn"><i class="icon fas fa-trash-alt"></i></button>`;
            return div
        }
        div.innerHTML = `
        <button class="btn status-btn not-read" >Not Read</button>
        <button class="btn delete-btn"><i class="icon fas fa-trash-alt"></i></button>`;
        return div;
    }
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

function getFormValues(form) {
	let inputs = form.elements;
	inputs = Array.from(inputs);
	inputs = inputs.filter(input => input.type != "submit")
	inputs = inputs.map(input => input.value);
	return inputs
  }

//DOM EVENTS
forms.forEach(form => {
	form.addEventListener('submit', function(e) {
		e.preventDefault();
        
		let values = getFormValues(form);
		if ([...values].some(isEmptyString)) {
			return alert('Missing Fields');
		};
		let book = new Book(...values);
		myLibrary.push(book);
		save();	
		render();
		display.close(form);
	}) 
})

goBackButtons.forEach(button => {
	button.addEventListener('click', function(e) {
		e.preventDefault();;
		let form = document.querySelector(button.dataset.targetForm);
		display.close(form);
	})
})

cardContent.addEventListener('click', function(e) {
	if(e.target.classList.contains('add-book-btn')) {
		let form = document.querySelector(e.target.dataset.targetForm);
		display.show(form);
        display.hide(bookItems.parentElement);
	}
})

document.querySelector('.book-list').addEventListener('click', function(e) {
	e.preventDefault();
	let bookElement = new BookElement()
	if (e.target.classList.contains('delete-btn')) {
		const book = e.target.parentElement.parentElement;
		bookElement.$delete(book);
		save();
		render();
	} else if (e.target.classList.contains('icon')) {
		const book = e.target.parentElement.parentElement.parentElement;
		bookElement.$delete(book);
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

document.querySelector('.pop-up-btn').addEventListener('click', function(e) {
	e.preventDefault;
	let display = new Display();
    let form = document.querySelector(e.target.dataset.targetForm);
	display.show(form);
	overlay.classList.toggle('active');
})

//LIBRARY
let myLibrary = readStorage() || [];
let display = new Display();;